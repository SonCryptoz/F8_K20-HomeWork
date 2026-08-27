import { loginPage } from "../../services/redirectLogin.js";
import { fetchData } from "../../services/spotifyAPI.js";
import { navigateTo } from "../../utils/router.js";
import { showToast } from "../../components/toaster.js";
import { renderSidebarFilters } from "./SidebarFilters.js";
import { initSidebarSearch } from "./SidebarSearch.js";
import { initSidebarSort, sortLibraryItems } from "./SidebarSort.js";
import {
    renderPlaylistItem,
    renderArtistItem,
    renderAlbumItem,
    attachPlaylistEvents,
    syncActiveSidebarPlaylist,
    updateActiveSidebarItem,
} from "./SidebarPlaylists.js";

// * Hàm sắp xếp danh sách playlist: "Liked Songs" luôn ưu tiên số 1, sau đó đến các playlist đã ghim
const sortPlaylists = (list) => {
    return [...list].sort((a, b) => {
        const isAbsoluteLikedA = a.name === "Liked Songs" || a.id === "liked_songs";
        const isAbsoluteLikedB = b.name === "Liked Songs" || b.id === "liked_songs";
        
        if (isAbsoluteLikedA && !isAbsoluteLikedB) return -1;
        if (!isAbsoluteLikedA && isAbsoluteLikedB) return 1;
        
        const isPinnedA = a.is_pinned === true || a.is_pinned === 1;
        const isPinnedB = b.is_pinned === true || b.is_pinned === 1;

        if (isPinnedA && !isPinnedB) return -1;
        if (!isPinnedA && isPinnedB) return 1;
        
        return 0;
    });
};

/**
 * Controller chính quản lý trạng thái và luồng dữ liệu Sidebar
 */
const getPinnedKey = (user) => user ? `spotify_pinned_playlists_${user.id}` : getPinnedKey(user);

export const renderSidebarAuth = async (user) => {
    const createPlaylistBtn = document.querySelector("#create-playlist-btn");
    const filtersContainer = document.querySelector("#sidebar-filters-container");
    const listContainer = document.querySelector("#sidebar-playlists-container");
    const subBar = document.querySelector("#sidebar-sub-bar");

    if (!createPlaylistBtn || !listContainer) return;

    // Khi user CHƯA đăng nhập:
    if (!user) {
        if (filtersContainer) filtersContainer.innerHTML = "";
        if (subBar) subBar.classList.add("lg:hidden");
        listContainer.innerHTML = `
            <div class="py-6 px-4 text-center text-sp-text-subdued text-sm">
                <p>Log in to see your playlists.</p>
            </div>
        `;

        createPlaylistBtn.onclick = () => loginPage();
        return;
    }

    // State quản lý Thư viện (lấy từ localStorage để lưu trạng thái khi reload):
    let currentFilter = localStorage.getItem("spotify_sidebar_filter") || null; // null (Tất cả) | "playlists" | "artists" | "albums"
    let currentSort = localStorage.getItem("spotify_sidebar_sort") || "recents"; // "recents" | "recently_added" | "alphabetical" | "creator"
    let currentView = localStorage.getItem("spotify_sidebar_view") || "default_list"; // "compact_list" | "default_list" | "compact_grid" | "default_grid"
    let searchKeyword = "";
    let userPlaylists = [];
    let userArtists = [];
    let userAlbums = [];

    if (subBar) subBar.classList.remove("lg:hidden");

    // Lắng nghe popstate & locationchange để đồng bộ active item khi chuyển trang
    window.addEventListener("popstate", syncActiveSidebarPlaylist);
    window.addEventListener("locationchange", syncActiveSidebarPlaylist);

    // Lắng nghe sự kiện tạo playlist mới từ popup
    window.addEventListener("playlist-updated", (e) => {
        const { playlistId, name, image_url } = e.detail;
        if (userPlaylists) {
            const pl = userPlaylists.find(p => p.id === playlistId);
            if (pl) {
                if (name !== undefined) pl.name = name;
                if (image_url !== undefined) pl.image_url = image_url;
                renderList();
            }
        }
    });

    // Lắng nghe sự kiện tạo mới playlist ở Sidebar
    window.addEventListener("playlist-created", (e) => {
        const newPlaylist = e.detail;
        if (newPlaylist && userPlaylists) {
            const formatted = {
                ...newPlaylist,
                user_display_name: newPlaylist.user_display_name || user?.display_name || user?.username,
                user_username: newPlaylist.user_username || user?.username,
            };
            userPlaylists.push(formatted);
            userPlaylists = sortPlaylists(userPlaylists);
            renderList();
        }
    });

    // Lắng nghe sự kiện thêm/xóa bài hát để cập nhật số đếm ở Sidebar
    window.addEventListener("playlist-track-count-change", (e) => {
        const { playlistId, delta, trackImageUrl } = e.detail;
        if (userPlaylists) {
            const pl = userPlaylists.find(p => p.id === playlistId || (playlistId === "liked_songs" && p.name === "Liked Songs"));
            if (pl) {
                pl.total_tracks = Math.max(0, (pl.total_tracks || 0) + delta);
                
                const isCustomImage = localStorage.getItem('custom_cover_' + playlistId) === '1';

                // Cập nhật ảnh đại diện nếu đây là bài hát đầu tiên được thêm vào
                if (pl.total_tracks === 1 && delta === 1 && trackImageUrl && playlistId !== "liked_songs" && !pl.is_following && !isCustomImage) {
                    pl.image_url = trackImageUrl;
                    window.dispatchEvent(new CustomEvent("playlist-updated", { detail: { playlistId, image_url: trackImageUrl } }));
                    
                    // Gọi API lưu ảnh vào database vĩnh viễn
                    fetchData.put(`/playlists/${playlistId}`, {
                        image_url: trackImageUrl
                    }).catch(err => console.error("Failed to update playlist image:", err));
                }

                // Xóa ảnh đại diện (về placeholder) nếu bài hát cuối cùng bị xóa khỏi playlist
                if (pl.total_tracks === 0 && delta === -1 && playlistId !== "liked_songs" && !pl.is_following && !isCustomImage) {
                    pl.image_url = null;
                    window.dispatchEvent(new CustomEvent("playlist-updated", { detail: { playlistId, image_url: null } }));

                    // Cập nhật lên server
                    fetchData.put(`/playlists/${playlistId}`, {
                        image_url: ""
                    }).catch(err => console.error("Failed to clear playlist image:", err));
                }

                renderList();
            }
        }
    });

    // Lắng nghe sự kiện từ Artist Context Menu
    window.addEventListener("artist-followed", (e) => {
        if (userArtists && e.detail.artist) {
            const artist = e.detail.artist;
            if (!userArtists.find(a => String(a.id) === String(artist.id))) {
                userArtists.unshift(artist);
                renderList();
            }
        }
    });

    window.addEventListener("artist-unfollowed", (e) => {
        if (userArtists) {
            const artistId = String(e.detail.artistId);
            userArtists = userArtists.filter(a => String(a.id) !== artistId);
            
            // Xóa khỏi danh sách ghim (nếu có) để tránh rác localStorage và lỗi logic khi follow lại
            let pinned = JSON.parse(localStorage.getItem("spotify_pinned_artists") || "[]");
            if (pinned.includes(artistId)) {
                pinned = pinned.filter(id => id !== artistId);
                localStorage.setItem("spotify_pinned_artists", JSON.stringify(pinned));
            }
            
            renderList();
        }
    });

    window.addEventListener("artist-toggled-pin", (e) => {
        if (userArtists) {
            const artistId = String(e.detail.artistId);
            const artist = userArtists.find(a => String(a.id) === artistId);
            if (artist) {
                artist.is_pinned = e.detail.isPinned;
                
                // Xóa khỏi danh sách ghim (nếu có) để tránh rác localStorage và lỗi logic khi follow lại
                let pinned = JSON.parse(localStorage.getItem("spotify_pinned_artists") || "[]");
                if (artist.is_pinned) {
                    if (!pinned.includes(artistId)) pinned.push(artistId);
                } else {
                    pinned = pinned.filter(id => id !== artistId);
                }
                localStorage.setItem("spotify_pinned_artists", JSON.stringify(pinned));
                
                renderList();
            }
        }
    });

    // Lắng nghe sự kiện từ Playlist Context Menu
    window.addEventListener("playlist-followed", (e) => {
        if (userPlaylists && e.detail.playlist) {
            const playlist = e.detail.playlist;
            if (!userPlaylists.find(p => String(p.id) === String(playlist.id))) {
                userPlaylists.unshift(playlist);
                renderList();
            }
        }
    });

    window.addEventListener("playlist-deleted", (e) => {
        if (userPlaylists) {
            const playlistId = String(e.detail.playlistId);
            userPlaylists = userPlaylists.filter(p => String(p.id) !== playlistId);
            
            // Xóa khỏi danh sách ghim (nếu có) để tránh rác localStorage và lỗi logic khi follow lại
            let pinned = JSON.parse(localStorage.getItem(getPinnedKey(user)) || "[]");
            if (pinned.includes(playlistId)) {
                pinned = pinned.filter(id => id !== playlistId);
                localStorage.setItem(getPinnedKey(user), JSON.stringify(pinned));
            }
            
            renderList();
        }
    });

    window.addEventListener("playlist-unfollowed", (e) => {
        if (userPlaylists) {
            const playlistId = String(e.detail.playlistId);
            userPlaylists = userPlaylists.filter(p => String(p.id) !== playlistId);
            
            // Xóa khỏi danh sách ghim (nếu có) để tránh rác localStorage và lỗi logic khi follow lại
            let pinned = JSON.parse(localStorage.getItem(getPinnedKey(user)) || "[]");
            if (pinned.includes(playlistId)) {
                pinned = pinned.filter(id => id !== playlistId);
                localStorage.setItem(getPinnedKey(user), JSON.stringify(pinned));
            }
            
            renderList();
        }
    });

    window.addEventListener("playlist-toggled-pin", (e) => {
        if (userPlaylists) {
            const playlistId = String(e.detail.playlistId);
            const playlist = userPlaylists.find(p => String(p.id) === playlistId);
            if (playlist) {
                playlist.is_pinned = e.detail.isPinned;
                
                // Xóa khỏi danh sách ghim (nếu có) để tránh rác localStorage và lỗi logic khi follow lại
                let pinned = JSON.parse(localStorage.getItem(getPinnedKey(user)) || "[]");
                if (playlist.is_pinned) {
                    if (!pinned.includes(playlistId)) pinned.push(playlistId);
                } else {
                    pinned = pinned.filter(id => id !== playlistId);
                }
                localStorage.setItem(getPinnedKey(user), JSON.stringify(pinned));
                
                renderList();
            }
        }
    });

    // Lắng nghe sự kiện từ Album Context Menu
    window.addEventListener("album-liked", (e) => {
        if (userAlbums && e.detail.album) {
            const album = e.detail.album;
            if (!userAlbums.find(a => String(a.id) === String(album.id))) {
                userAlbums.unshift(album);
                renderList();
            }
        }
    });

    window.addEventListener("album-unliked", (e) => {
        if (userAlbums) {
            const albumId = String(e.detail.albumId);
            userAlbums = userAlbums.filter(a => String(a.id) !== albumId);
            
            // Xóa khỏi danh sách ghim (nếu có) để tránh rác localStorage và lỗi logic khi follow lại
            let pinned = JSON.parse(localStorage.getItem("spotify_pinned_albums") || "[]");
            if (pinned.includes(albumId)) {
                pinned = pinned.filter(id => id !== albumId);
                localStorage.setItem("spotify_pinned_albums", JSON.stringify(pinned));
            }
            
            renderList();
        }
    });

    window.addEventListener("album-toggled-pin", (e) => {
        if (userAlbums) {
            const albumId = String(e.detail.albumId);
            const album = userAlbums.find(a => String(a.id) === albumId);
            if (album) {
                album.is_pinned = e.detail.isPinned;
                
                // Xóa khỏi danh sách ghim (nếu có) để tránh rác localStorage và lỗi logic khi follow lại
                let pinned = JSON.parse(localStorage.getItem("spotify_pinned_albums") || "[]");
                if (album.is_pinned) {
                    if (!pinned.includes(albumId)) pinned.push(albumId);
                } else {
                    pinned = pinned.filter(id => id !== albumId);
                }
                localStorage.setItem("spotify_pinned_albums", JSON.stringify(pinned));
                
                renderList();
            }
        }
    });

    // ============================================
    // HÀM RENDER DANH SÁCH MỤC TRONG THƯ VIỆN
    // ============================================
    const renderList = () => {
        const q = searchKeyword.toLowerCase();

        // Chọn nguồn dữ liệu theo currentFilter
        let rawItems = [];
        if (currentFilter === "playlists") {
            rawItems = userPlaylists.map((p) => ({ ...p, _type: "playlist" }));
        } else if (currentFilter === "artists") {
            rawItems = userArtists.map((a) => ({ ...a, _type: "artist" }));
        } else if (currentFilter === "albums") {
            rawItems = userAlbums.map((al) => ({ ...al, _type: "album" }));
        } else {
            rawItems = [
                ...userPlaylists.map((p) => ({ ...p, _type: "playlist" })),
                ...userArtists.map((a) => ({ ...a, _type: "artist" })),
                ...userAlbums.map((al) => ({ ...al, _type: "album" })),
            ];
        }

        // Sắp xếp theo currentSort
        const sortedItems = sortLibraryItems(rawItems, currentSort);

        // Lọc theo searchKeyword
        const filteredItems = q
            ? sortedItems.filter((item) => {
                  const title = (item.name || item.title || "").toLowerCase();
                  const author = (item.artist_name || item.user_display_name || item.user_username || "").toLowerCase();
                  return title.includes(q) || author.includes(q);
              })
            : sortedItems;

        // Responsive: Trên tablet (md nhưng chưa lg), force compact_grid 1 cột cho sidebar 72px
        const isTablet = window.matchMedia("(min-width: 768px) and (max-width: 1023px)").matches;
        const effectiveView = isTablet ? "compact_grid" : currentView;

        // Thiết lập layout class theo effectiveView (content-start chống giãn dọc card khi ít item)
        if (effectiveView === "default_grid") {
            listContainer.className =
                "sidebar__content sidebar__library-list flex-1 overflow-y-auto grid grid-cols-2 p-2 content-start";
        } else if (effectiveView === "compact_grid") {
            // Tablet: 1 cột cho sidebar 72px; Desktop: 2 cột
            const gridCols = isTablet ? "grid-cols-1" : "grid-cols-2";
            listContainer.className =
                `sidebar__content sidebar__library-list flex-1 overflow-y-auto grid ${gridCols} p-2 content-start`;
        } else {
            listContainer.className =
                "sidebar__content sidebar__library-list flex-1 overflow-y-auto p-2";
        }

        // Render HTML
        if (filteredItems.length > 0) {
            listContainer.innerHTML = filteredItems
                .map((item) => {
                    if (item._type === "artist") {
                        return renderArtistItem(item, null, effectiveView);
                    }
                    if (item._type === "album") {
                        return renderAlbumItem(item, null, effectiveView);
                    }
                    return renderPlaylistItem(item, user, null, effectiveView);
                })
                .join("");
        } else {
            const emptyMsg = q
                ? `No results found for "${searchKeyword}"`
                : currentFilter === "playlists"
                  ? "No playlists yet."
                  : currentFilter === "artists"
                    ? "You aren't following any artists yet."
                    : currentFilter === "albums"
                      ? "You haven't liked any albums yet."
                      : "No items in your library yet.";

            listContainer.innerHTML = `
                <div class="col-span-full py-6 px-4 text-center text-sp-text-subdued text-sm">
                    <p>${emptyMsg}</p>
                </div>
            `;
        }

        attachPlaylistEvents(listContainer);
        updateActiveSidebarItem();

        // Dispatch event để MobileLibraryOverlay có thể đồng bộ dữ liệu
        window.dispatchEvent(new CustomEvent("sidebar-library-data-updated", {
            detail: { playlists: userPlaylists, artists: userArtists, albums: userAlbums, user }
        }));
    };

    // ============================================
    // KHỞI TẠO BỘ LỌC, TÌM KIẾM VÀ SẮP XẾP
    // ============================================
    const updateFilters = () => {
        renderSidebarFilters({
            container: filtersContainer,
            currentFilter,
            onFilterChange: (newFilter) => {
                currentFilter = newFilter;
                if (newFilter) {
                    localStorage.setItem("spotify_sidebar_filter", newFilter);
                } else {
                    localStorage.removeItem("spotify_sidebar_filter");
                }
                updateFilters();
                renderList();
            },
        });
    };

    initSidebarSearch({
        onSearchChange: (keyword) => {
            searchKeyword = keyword;
            renderList();
        },
    });

    initSidebarSort({
        currentSort,
        currentView,
        onSortChange: (newSort) => {
            currentSort = newSort;
            localStorage.setItem("spotify_sidebar_sort", newSort);
            renderList();
        },
        onViewChange: (newView) => {
            currentView = newView;
            localStorage.setItem("spotify_sidebar_view", newView);
            renderList();
        },
    });

    // ============================================
    // LẤY DỮ LIỆU TỪ CÁC API
    // ============================================
    try {
        const [playlistsRes, artistsRes, albumsRes, followedPlaylistsRes, likedTracksRes] = await Promise.allSettled([
            fetchData.auth("/me/playlists"),
            fetchData.auth("/me/following"),
            fetchData.auth("/me/albums/liked"),
            fetchData.auth("/me/playlists/followed"),
            fetchData.auth("/me/tracks/liked"),
        ]);

        if (playlistsRes.status === "fulfilled") {
            let rawPlaylists = playlistsRes.value?.playlists ?? [];
            
            // Lấy thêm playlist đã follow
            if (followedPlaylistsRes && followedPlaylistsRes.status === "fulfilled") {
                const rawFollowed = followedPlaylistsRes.value?.playlists || followedPlaylistsRes.value?.data || (Array.isArray(followedPlaylistsRes.value) ? followedPlaylistsRes.value : []);
                const followedOnly = rawFollowed.map(p => ({ ...p, is_following: true })); // Gắn cờ is_following
                rawPlaylists = [...rawPlaylists, ...followedOnly];
                
                // Loại bỏ trùng lặp nếu có (dựa vào id)
                const uniqueIds = new Set();
                rawPlaylists = rawPlaylists.filter(p => {
                    if (uniqueIds.has(String(p.id))) return false;
                    uniqueIds.add(String(p.id));
                    return true;
                });
            }

            const pinnedPlaylists = JSON.parse(localStorage.getItem(getPinnedKey(user)) || "[]");
            
            userPlaylists = rawPlaylists.map(p => ({ 
                ...p, 
                is_pinned: pinnedPlaylists.includes(String(p.id))
            }));
            
            // Lấy chính xác số lượng từ API liked tracks
            let likedCount = 0;
            if (likedTracksRes.status === "fulfilled") {
                const tracks = Array.isArray(likedTracksRes.value) ? likedTracksRes.value : (likedTracksRes.value?.tracks || likedTracksRes.value?.data || []);
                likedCount = tracks.length;
            }

            // Tìm xem Liked Songs đã có trong danh sách trả về chưa
            const likedPlaylist = userPlaylists.find(p => p.id === "liked_songs" || p.name === "Liked Songs");
            if (likedPlaylist) {
                likedPlaylist.total_tracks = likedCount;
            } else {
                // Nếu API không trả về, tự động mock và ghim lên đầu
                userPlaylists.unshift({
                    id: "liked_songs",
                    name: "Liked Songs",
                    is_pinned: true,
                    total_tracks: likedCount
                });
            }
            
            userPlaylists = sortPlaylists(userPlaylists);
        }

        if (artistsRes.status === "fulfilled") {
            const rawArtists = artistsRes.value?.artists || artistsRes.value?.data || (Array.isArray(artistsRes.value) ? artistsRes.value : []);
            const pinnedArtists = JSON.parse(localStorage.getItem("spotify_pinned_artists") || "[]");
            userArtists = rawArtists.map(a => ({ ...a, is_pinned: pinnedArtists.includes(String(a.id)), is_following: true }));
        }

        if (albumsRes.status === "fulfilled") {
            const rawAlbums = albumsRes.value?.albums || albumsRes.value?.data || (Array.isArray(albumsRes.value) ? albumsRes.value : []);
            const pinnedAlbums = JSON.parse(localStorage.getItem("spotify_pinned_albums") || "[]");
            userAlbums = rawAlbums.map(al => ({ ...al, is_pinned: pinnedAlbums.includes(String(al.id)), is_liked: true }));
        }

        updateFilters();
        renderList();
    } catch (error) {
        console.error("Error fetching library data:", error);
    }

    // ============================================
    // XỬ LÝ KHI BẤM NÚT TẠO PLAYLIST MỚI
    // ============================================
    createPlaylistBtn.onclick = async () => {
        try {
            const newIndex =
                userPlaylists.filter((p) => p.name !== "Liked Songs").length + 1;
            const res = await fetchData.post("/playlists", {
                name: `My Playlist #${newIndex}`,
                is_public: 1,
            });

            let newPlaylist = res?.playlist || res;
            if (newPlaylist?.id) {
                showToast("Created Playlist", "success");

                window.dispatchEvent(new Event("sidebar-playlist-created"));

                newPlaylist = {
                    ...newPlaylist,
                    user_display_name:
                        newPlaylist.user_display_name ||
                        user?.display_name ||
                        user?.username,
                    user_username: newPlaylist.user_username || user?.username,
                };

                userPlaylists = sortPlaylists([newPlaylist, ...userPlaylists]);
                renderList();

                navigateTo(`/my-playlist?id=${newPlaylist.id}`);
            }
        } catch (error) {
            console.error("Create playlist error:", error);
        }
    };
};
