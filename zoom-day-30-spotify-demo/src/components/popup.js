import { loginPage } from "../services/redirectLogin.js";
import { fetchData } from "../services/spotifyAPI.js";
import { showToast } from "./toaster.js";
import { navigateTo } from "../utils/router.js";

// ============================================
// BIỂU TƯỢNG (ICONS)
// ============================================
export const POPUP_ICONS = {
    addCircle: `<svg viewBox="0 0 16 16" class="fill-current" style="width: 16px; height: 16px;"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8.75-4.75a.75.75 0 0 0-1.5 0v4H3.25a.75.75 0 0 0 0 1.5h4v4a.75.75 0 0 0 1.5 0v-4h4a.75.75 0 0 0 0-1.5h-4v-4z"/></svg>`,
    checkedCircle: `<svg viewBox="0 0 16 16" style="width: 16px; height: 16px;"><circle cx="8" cy="8" r="8" fill="#1ed760"/><path d="M12.207 5.793a1 1 0 0 0-1.414-1.414L6.5 8.672 5.207 7.379a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l5-5z" fill="#000"/></svg>`,
    search: `<svg viewBox="0 0 16 16" class="fill-current text-sp-text-subdued shrink-0" style="width: 16px; height: 16px;"><path d="M7 1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5zM.25 7a6.75 6.75 0 1 1 12.096 4.12l3.184 3.185a.75.75 0 1 1-1.06 1.06L11.285 12.18A6.75 6.75 0 0 1 .25 7z"/></svg>`,
    plus: `<svg viewBox="0 0 16 16" class="fill-current text-white shrink-0" style="width: 16px; height: 16px;"><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/></svg>`,
    pin: `<svg viewBox="0 0 16 16" class="fill-[#1ed760] shrink-0" style="width: 16px; height: 16px;" data-tooltip="Pinned"><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>`,
    musicNote: `<svg viewBox="0 0 24 24" class="fill-current text-sp-text-subdued" style="width: 16px; height: 16px;"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"></path></svg>`,
    likedIcon: `<div class="w-10 h-10 rounded flex items-center justify-center shadow" style="background: linear-gradient(135deg, #450af5, #c4efd9);"><svg viewBox="0 0 15 15" class="fill-white w-4 h-4"><path d="M8 3.5c1.2-1.7 3.5-2 4.8-.8 1.3 1.2 1.4 3.2.2 4.6L8 13 3 7.3C1.8 5.9 1.9 3.9 3.2 2.7 4.5 1.5 6.8 1.8 8 3.5z"/></svg></div>`,
    close: `<svg viewBox="0 0 16 16" class="fill-current text-sp-text-subdued hover:text-white shrink-0 cursor-pointer transition-colors" style="width: 16px; height: 16px;"><path d="M1.47 1.47a.75.75 0 0 1 1.06 0L8 6.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L9.06 8l5.47 5.47a.75.75 0 1 1-1.06 1.06L8 9.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L6.94 8 1.47 2.53a.75.75 0 0 1 0-1.06z"/></svg>`,
};

// ============================================
// BỘ QUẢN LÝ TRẠNG THÁI (STATE MANAGER)
// ============================================
class TrackStateManager {
    constructor() {
        this.cache = new Map(); // Lưu trữ theo cấu trúc: ID bài hát -> Danh sách ID của các playlist chứa bài hát đó
        this.userId = null;
        this.load();
    }

    init(userId) {
        if (this.userId !== userId) {
            this.userId = userId;
            this.load();
        }
    }

    get storageKey() {
        return this.userId ? `sp_track_state_${this.userId}` : "sp_track_state";
    }

    load() {
        try {
            this.cache.clear();
            const data = JSON.parse(
                localStorage.getItem(this.storageKey) || "{}",
            );
            Object.entries(data).forEach(([trackId, pIds]) =>
                this.cache.set(trackId, new Set(pIds)),
            );
        } catch (e) {}
    }

    save() {
        try {
            const obj = Object.fromEntries(
                Array.from(this.cache.entries())
                    .filter(([_, pIds]) => pIds.size > 0)
                    .map(([tId, pIds]) => [tId, Array.from(pIds)]),
            );
            localStorage.setItem(this.storageKey, JSON.stringify(obj));
        } catch (e) {}
    }

    get(trackId) {
        return this.cache.get(trackId) || new Set();
    }

    update(trackId, playlistIds, trackImageUrl = null) {
        const oldSet = this.cache.get(trackId) || new Set();
        const newSet = new Set(playlistIds);

        // So sánh để phát hiện có sự thay đổi (thêm/xóa playlist), từ đó kích hoạt sự kiện cập nhật số lượng bài hát ở thanh Sidebar theo thời gian thực
        newSet.forEach((id) => {
            if (!oldSet.has(id)) {
                window.dispatchEvent(
                    new CustomEvent("playlist-track-count-change", {
                        detail: {
                            playlistId: id,
                            trackId,
                            delta: 1,
                            trackImageUrl,
                        },
                    }),
                );
            }
        });
        oldSet.forEach((id) => {
            if (!newSet.has(id)) {
                window.dispatchEvent(
                    new CustomEvent("playlist-track-count-change", {
                        detail: { playlistId: id, trackId, delta: -1 },
                    }),
                );
            }
        });

        this.cache.set(trackId, newSet);
        this.save();
        this.syncUI(trackId, true);
    }

    isActive(trackId) {
        const cached = this.get(trackId);
        return cached.size > 0;
    }

    removePlaylist(playlistId) {
        for (const [trackId, pIds] of this.cache.entries()) {
            if (pIds.has(playlistId)) {
                pIds.delete(playlistId);
                this.syncUI(trackId);
            }
        }
        this.save();
    }

    syncUI(trackId, isUserAction = false) {
        const active = this.isActive(trackId);
        document
            .querySelectorAll(`.track-like-btn[data-track-id="${trackId}"]`)
            .forEach((btn) => {
                btn.setAttribute("data-liked", active ? "true" : "false");
                btn.dataset.tooltip = active ? "Change playlist" : "Add to Liked Songs";
                btn.innerHTML = active
                    ? POPUP_ICONS.checkedCircle
                    : POPUP_ICONS.addCircle;
            });

        // Xóa phần tử khỏi danh sách hiển thị một cách mượt mà nếu người dùng vừa bỏ yêu thích bài hát (chỉ áp dụng khi người dùng chủ động thao tác)
        if (isUserAction) {
            const pathname = window.location.pathname;
            const searchParams = new URLSearchParams(window.location.search);
            const currentPlId =
                pathname === "/collection" ? "liked_songs" : null;

            if (currentPlId) {
                const trackPlaylists = this.get(trackId);
                // Nếu bài hát không còn nằm trong playlist hiện tại đang xem, thực hiện hiệu ứng trượt và xóa dòng đó
                if (!trackPlaylists.has(currentPlId)) {
                    const btn = document.querySelector(
                        `.track-like-btn[data-track-id="${trackId}"]`,
                    );
                    const row = btn
                        ? btn.closest(
                              ".collection-track-item, .playlist-track-item",
                          )
                        : null;
                    if (row) {
                        row.style.opacity = "0";
                        row.style.transform = "translateX(-20px)";
                        setTimeout(() => {
                            row.remove();
                            this.updateListHeader(pathname);
                        }, 300);
                    }
                }
            }
        }
    }

    updateListHeader(pathname) {
        if (pathname === "/collection") {
            const allRows = document.querySelectorAll(".collection-track-item");
            allRows.forEach((r, idx) => {
                const idxEl = r.querySelector(".w-8.text-sp-text-subdued");
                if (idxEl) idxEl.textContent = idx + 1;
            });

            const countMeta = document.querySelector(
                ".collection-hero__info .text-white\\/90",
            );
            if (countMeta) countMeta.textContent = `${allRows.length} songs`;

            if (allRows.length === 0) {
                const listEl = document.querySelector(
                    ".collection-tracks-list",
                );
                if (listEl) {
                    listEl.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-16 text-center">
                            <div class="w-16 h-16 rounded-full bg-sp-highlight flex items-center justify-center mb-4 text-sp-text-subdued">
                                <svg viewBox="0 0 24 24" class="fill-current w-8 h-8"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            </div>
                            <h3 class="text-white font-medium text-lg mb-1">Songs you like will appear here</h3>
                            <p class="text-sp-text-subdued text-sm max-w-sm">Save songs by tapping the heart or plus icon in the player or tracklists.</p>
                        </div>
                    `;
                }
            }
        } else if (pathname === "/playlist") {
            const allRows = document.querySelectorAll(".playlist-track-item");
            allRows.forEach((r, idx) => {
                const idxEl = r.querySelector(".w-8.text-sp-text-subdued");
                if (idxEl) idxEl.textContent = idx + 1;
            });

            const countMeta = document.querySelector("#playlist-tracks-meta");
            if (countMeta) {
                countMeta.textContent = `${allRows.length} songs`;
            }

            if (allRows.length === 0) {
                const listEl = document.querySelector(".playlist-tracks-list");
                if (listEl) {
                    listEl.innerHTML = `<p class="text-sp-text-subdued py-6 text-center">No songs available in this playlist.</p>`;
                }
            }
        }
    }
}
export const trackState = new TrackStateManager();

// ============================================
// CÁC HÀM TIỆN ÍCH CHO API (API HELPERS)
// ============================================
export const PlaylistAPI = {
    cachedPlaylists: null,
    likedSongsId: "liked_songs",

    async fetchAll(forceRefresh = false) {
        if (this.cachedPlaylists && !forceRefresh) return this.cachedPlaylists;
        try {
            const res = await fetchData.auth("/me/playlists");
            const raw = Array.isArray(res)
                ? res
                : res?.playlists || res?.data || [];

            const normalized = raw.map((p) => {
                const isLiked =
                    p.name === "Liked Songs" || p.id === "liked_songs";
                if (isLiked) this.likedSongsId = p.id;
                return {
                    ...p,
                    isLikedSongs: isLiked,
                    isPinned: isLiked || Boolean(p.is_pinned),
                };
            });

            if (!normalized.some((p) => p.isLikedSongs)) {
                normalized.unshift({
                    id: "liked_songs",
                    name: "Liked Songs",
                    isLikedSongs: true,
                    isPinned: true,
                });
            } else {
                normalized.sort((a, b) =>
                    a.isLikedSongs ? -1 : b.isLikedSongs ? 1 : 0,
                );
            }

            this.cachedPlaylists = normalized;
            return normalized;
        } catch (e) {
            return [
                {
                    id: "liked_songs",
                    name: "Liked Songs",
                    isLikedSongs: true,
                    isPinned: true,
                },
            ];
        }
    },

    async addTrack(playlistId, trackId, isLikedSongs) {
        if (
            isLikedSongs ||
            playlistId === this.likedSongsId ||
            playlistId === "liked_songs"
        ) {
            return await fetchData.post(`/tracks/${trackId}/like`);
        }
        return await fetchData.post(`/playlists/${playlistId}/tracks`, {
            track_id: trackId,
        });
    },

    async removeTrack(playlistId, trackId, isLikedSongs) {
        if (
            isLikedSongs ||
            playlistId === this.likedSongsId ||
            playlistId === "liked_songs"
        ) {
            return await fetchData.delete(`/tracks/${trackId}/like`);
        }
        return await fetchData.delete(
            `/playlists/${playlistId}/tracks/${trackId}`,
        );
    },
};

// Lắng nghe các sự kiện gửi từ thanh Sidebar để đồng bộ hóa và xóa bộ nhớ đệm của Popup khi cần thiết
window.addEventListener("sidebar-playlist-created", () => {
    PlaylistAPI.cachedPlaylists = null;
});
window.addEventListener("playlist-deleted", (e) => {
    PlaylistAPI.cachedPlaylists = null;
    if (e.detail && e.detail.playlistId) {
        trackState.removePlaylist(e.detail.playlistId);
    }
});
window.addEventListener("playlist-updated", (e) => {
    if (PlaylistAPI.cachedPlaylists) {
        const pl = PlaylistAPI.cachedPlaylists.find(
            (p) => p.id === e.detail.playlistId,
        );
        if (pl) {
            if (e.detail.name !== undefined) pl.name = e.detail.name;
            if (e.detail.image_url !== undefined)
                pl.image_url = e.detail.image_url;
        }
    }
});

// ============================================
// BỘ QUẢN LÝ HIỂN THỊ POPUP (POPUP MANAGER)
// ============================================
let activePopup = null;
let cleanupEvents = [];

function closePlaylistPopup() {
    if (activePopup) {
        activePopup.remove();
        activePopup = null;
    }
    cleanupEvents.forEach((fn) => fn());
    cleanupEvents = [];
}

export async function openPlaylistPopup({ anchorEl, track }) {
    closePlaylistPopup();

    let playlists = await PlaylistAPI.fetchAll();

    // Lấy trạng thái của bài hát từ bộ nhớ đệm, nếu bài hát đã được thả tim từ trước thì mặc định chọn playlist 'Liked Songs'
    let cached = trackState.get(track.id);
    if (cached.size === 0 && track.is_liked) {
        cached = new Set([PlaylistAPI.likedSongsId, "liked_songs"]);
    }

    const initialSelected = new Set(cached);
    const currentSelected = new Set(initialSelected);

    const hasChanges = () => {
        if (currentSelected.size !== initialSelected.size) return true;
        for (const id of currentSelected)
            if (!initialSelected.has(id)) return true;
        return false;
    };

    const renderList = () =>
        playlists
            .map((pl) => {
                const cover = pl.image_url
                    ? `<img src="${pl.image_url}" class="w-10 h-10 rounded object-cover shrink-0 shadow" />`
                    : `<div class="w-10 h-10 rounded bg-[#333] shrink-0 flex items-center justify-center shadow">${POPUP_ICONS.musicNote}</div>`;
                return `
        <div class="popup__item flex items-center justify-between p-2 rounded hover:bg-white/10 cursor-pointer group"
             data-id="${pl.id}" data-liked-item="${pl.isLikedSongs}" data-name="${pl.name.toLowerCase()}">
            <div class="flex items-center gap-3 pr-2">
                ${pl.isLikedSongs ? POPUP_ICONS.likedIcon : cover}
                <span class="text-white font-medium text-base truncate">${pl.name}</span>
            </div>
            <div class="flex items-center gap-3">
                ${pl.isPinned ? POPUP_ICONS.pin : ""}
                <div class="popup__checkbox flex items-center justify-center">
                    ${
                        currentSelected.has(pl.id) ||
                        (pl.isLikedSongs && currentSelected.has("liked_songs"))
                            ? `<span class="w-5 h-5 shrink-0 rounded-full bg-[#1ed760] flex items-center justify-center shadow"><svg viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-black"><path d="M13.707 4.293a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L6 10.086l6.293-6.293a1 1 0 0 1 1.414 0z"/></svg></span>`
                            : `<span class="w-5 h-5 shrink-0 rounded-full border border-[#727272] group-hover:border-white"></span>`
                    }
                </div>
            </div>
        </div>
    `;
            })
            .join("");

    const popup = document.createElement("div");
    popup.className =
        "playlist-popup fixed z-[100002] w-80 max-w-[90vw] bg-[#282828] text-white rounded-lg shadow-2xl select-none";

    const updateUI = () => {
        popup.querySelector("#popup-list").innerHTML = renderList();
        popup.querySelector("#popup-done-btn").className =
            `bg-white text-black font-medium text-[15px] px-6 py-2 rounded-full hover:scale-105 transition-all cursor-pointer ${hasChanges() ? "block" : "hidden"}`;

        // Khôi phục lại bộ lọc tìm kiếm nếu người dùng đang gõ tìm kiếm dở dang trước khi giao diện được cập nhật
        const q =
            popup.querySelector("#popup-search")?.value.toLowerCase().trim() ||
            "";
        if (q) {
            let hasVisible = false;
            popup.querySelectorAll(".popup__item").forEach((el) => {
                const isMatch = el.dataset.name.includes(q);
                el.style.display = isMatch ? "flex" : "none";
                if (isMatch) hasVisible = true;
            });
            if (!hasVisible) {
                const emptyMsg = document.createElement("div");
                emptyMsg.id = "popup-empty-msg";
                emptyMsg.className =
                    "text-center text-sp-text-subdued py-4 text-[15px]";
                emptyMsg.textContent = "No playlists found";
                popup.querySelector("#popup-list").appendChild(emptyMsg);
            }
        }
    };

    popup.innerHTML = `
    <div class="mx-4 mt-4 mb-2">
        <h3 class="font-semibold text-xs text-sp-text-subdued mb-3">Add to playlist</h3>
        <div class="bg-[#ffffff1a] flex items-center gap-2 rounded px-3 py-2.5 mb-3 focus-within:ring-1 focus-within:ring-white group relative">
            ${POPUP_ICONS.search}
            <input type="text" placeholder="Find a playlist" class="bg-transparent text-[15px] font-medium outline-none flex-1 placeholder:text-sp-text-subdued placeholder:font-normal pr-6" id="popup-search"/>
            <div id="popup-search-clear" class="absolute right-3 hidden items-center justify-center">
                ${POPUP_ICONS.close}
            </div>
        </div>
        <div class="flex items-center gap-4 text-sp-text-subdued font-medium text-[15px] py-3 px-2 hover:bg-white/10 rounded cursor-pointer mb-1" id="popup-new">
            <div class="flex items-center justify-center shrink-0 w-6">
                ${POPUP_ICONS.plus}
            </div>
            <span>New playlist</span>
        </div>
        <hr class="border-white/10 -mx-4 mb-2" />
        <div class="flex flex-col gap-1 max-h-64 overflow-y-auto" id="popup-list"></div>
        <hr class="border-white/10 -mx-4 mt-2 mb-2" />
        <div class="flex items-center justify-end gap-3 mt-1">
            <button class="font-medium text-[15px] px-4 py-2 hover:scale-105 cursor-pointer transition-all" id="popup-cancel-btn">Cancel</button>
            <button id="popup-done-btn">Done</button>
        </div>
    </div>
    `;
    document.body.appendChild(popup);
    activePopup = popup;
    updateUI();

    // Tính toán và định vị trí xuất hiện của Popup sao cho không bị tràn ra ngoài màn hình
    if (anchorEl) {
        const rect = anchorEl.getBoundingClientRect();
        let posX = rect.right - 320 < 16 ? rect.left : rect.right - 320;
        let posY =
            rect.bottom + 8 > window.innerHeight - 360
                ? Math.max(16, rect.top - 360)
                : rect.bottom + 8;
        popup.style.left = `${posX}px`;
        popup.style.top = `${posY}px`;
    } else {
        popup.style.left = "50%";
        popup.style.top = "50%";
        popup.style.transform = "translate(-50%, -50%)";
    }

    // Đăng ký các sự kiện tương tác của người dùng bên trong popup
    popup.addEventListener("click", async (e) => {
        const item = e.target.closest(".popup__item");
        if (item) {
            const id =
                item.dataset.likedItem === "true"
                    ? "liked_songs"
                    : item.dataset.id;
            if (currentSelected.has(id)) {
                currentSelected.delete(id);
            } else {
                currentSelected.add(id);
            }
            // Xử lý làm sạch bộ nhớ để phòng ngừa trường hợp ID cũ của playlist Liked Songs bị lưu lại gây ra lỗi
            if (
                id === "liked_songs" &&
                PlaylistAPI.likedSongsId !== "liked_songs"
            ) {
                currentSelected.delete(PlaylistAPI.likedSongsId);
                initialSelected.delete(PlaylistAPI.likedSongsId);
            }
            updateUI();
        }

        if (e.target.closest("#popup-new")) {
            const newIndex =
                playlists.filter((p) => !p.isLikedSongs).length + 1;
            const res = await fetchData.post("/playlists", {
                name: `My Playlist #${newIndex}`,
                is_public: 1,
            });
            const newPl = res?.playlist || res;

            if (newPl?.id) {
                showToast("Created Playlist", "success");

                // Cập nhật lại bộ nhớ đệm (cache) của danh sách playlist để lần mở popup tiếp theo hiển thị ngay lập tức
                PlaylistAPI.cachedPlaylists = null;

                closePlaylistPopup();

                // Phát sự kiện thông báo cho thanh Sidebar để tự động cập nhật danh sách mà không cần phải gọi API lấy dữ liệu lại
                window.dispatchEvent(
                    new CustomEvent("playlist-created", { detail: newPl }),
                );

                navigateTo(`/my-playlist?id=${newPl.id}`);
            }
        }

        if (e.target.closest("#popup-cancel-btn")) closePlaylistPopup();

        if (e.target.closest("#popup-done-btn")) {
            const added = [...currentSelected].filter(
                (x) => !initialSelected.has(x),
            );
            const removed = [...initialSelected].filter(
                (x) => !currentSelected.has(x),
            );

            for (const id of added) {
                await PlaylistAPI.addTrack(id, track.id, id === "liked_songs");
                window.dispatchEvent(
                    new CustomEvent("playlist-track-added", {
                        detail: { playlistId: id, trackId: track.id },
                    }),
                );
            }
            for (const id of removed) {
                await PlaylistAPI.removeTrack(
                    id,
                    track.id,
                    id === "liked_songs",
                );
            }

            const trackImageUrl =
                track.track_image_url ||
                track.album_cover_image_url ||
                track.image_url ||
                track.cover_image_url;
            trackState.update(
                track.id,
                Array.from(currentSelected),
                trackImageUrl,
            );

            const getPlaylistName = (id) => {
                if (id === "liked_songs") return "Liked Songs";
                const pl = playlists.find((p) => p.id === id);
                return pl ? pl.name : "Playlist";
            };

            if (added.length === 1 && removed.length === 0) {
                showToast(`Added to ${getPlaylistName(added[0])}`, "success");
            } else if (removed.length === 1 && added.length === 0) {
                showToast(
                    `Removed from ${getPlaylistName(removed[0])}`,
                    "info",
                );
            } else if (added.length > 0 || removed.length > 0) {
                showToast("Playlists updated", "success");
            }

            // Nếu người dùng bỏ tích chọn chính playlist mà họ đang xem, lập tức ẩn và xóa dòng bài hát đó khỏi giao diện
            const pathname = window.location.pathname;
            const searchParams = new URLSearchParams(window.location.search);
            if (pathname === "/playlist") {
                const currentPlId = searchParams.get("id");
                if (currentPlId && removed.includes(currentPlId)) {
                    const btn = document.querySelector(
                        `.track-like-btn[data-track-id="${track.id}"]`,
                    );
                    const row = btn
                        ? btn.closest(".playlist-track-item")
                        : null;
                    if (row) {
                        row.style.transition = "all 0.3s ease";
                        row.style.opacity = "0";
                        row.style.transform = "translateX(-20px)";
                        setTimeout(() => {
                            row.remove();
                            // Có thể thêm logic cập nhật lại số lượng bài hát hiển thị ở phần tiêu đề danh sách nếu cần thiết
                        }, 300);
                    }
                }
            }

            closePlaylistPopup();
        }
    });

    const searchInput = popup.querySelector("#popup-search");
    const searchClear = popup.querySelector("#popup-search-clear");

    searchInput.oninput = (e) => {
        const q = e.target.value.toLowerCase().trim();
        searchClear.style.display = q.length > 0 ? "flex" : "none";

        let hasVisible = false;
        popup.querySelectorAll(".popup__item").forEach((el) => {
            const isMatch = el.dataset.name.includes(q);
            el.style.display = isMatch ? "flex" : "none";
            if (isMatch) hasVisible = true;
        });

        let emptyMsg = popup.querySelector("#popup-empty-msg");
        if (!hasVisible) {
            if (!emptyMsg) {
                emptyMsg = document.createElement("div");
                emptyMsg.id = "popup-empty-msg";
                emptyMsg.className =
                    "text-center text-sp-text-subdued py-4 text-[15px]";
                emptyMsg.textContent = "No playlists found";
                popup.querySelector("#popup-list").appendChild(emptyMsg);
            }
        } else {
            if (emptyMsg) emptyMsg.remove();
        }
    };

    searchClear.onclick = () => {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
        searchInput.focus();
    };

    setTimeout(() => {
        const outside = (e) => {
            if (
                activePopup &&
                !activePopup.contains(e.target) &&
                !anchorEl?.contains(e.target)
            )
                closePlaylistPopup();
        };
        const key = (e) => {
            if (e.key === "Escape") closePlaylistPopup();
        };
        document.addEventListener("click", outside, true);
        document.addEventListener("keydown", key);
        cleanupEvents.push(
            () => document.removeEventListener("click", outside, true),
            () => document.removeEventListener("keydown", key),
        );
    }, 10);
}

// ============================================
// KHỞI TẠO SỰ KIỆN CHO CÁC NÚT (MAIN EVENT ATTACHMENT)
// ============================================
export function attachTrackLikePopup(
    selector = ".track-like-btn",
    options = {},
    user = null,
) {
    document.querySelectorAll(selector).forEach((btn) => {
        // Cập nhật giao diện của nút (icon trái tim) khi tải trang lần đầu dựa vào trạng thái hiện tại
        const trackId = btn.dataset.trackId;
        const isServerLiked = btn.getAttribute("data-liked") === "true";
        if (trackId) {
            if (isServerLiked && !trackState.isActive(trackId)) {
                const cached = new Set(trackState.get(trackId));
                cached.add("liked_songs");
                trackState.cache.set(trackId, cached);
            }
            trackState.syncUI(trackId, false);
        }

        // Xử lý sự kiện click khi người dùng bấm vào nút thích
        btn.onclick = async (e) => {
            e.stopPropagation();
            if (!user) return loginPage();

            const currentTrackId = btn.dataset.trackId;
            if (!currentTrackId) return;

            const isActive = btn.getAttribute("data-liked") === "true";

            if (!isActive) {
                // Nếu bài hát chưa được thích: Click lần đầu sẽ thao tác thích nhanh (thêm vào Liked Songs)
                btn.innerHTML = POPUP_ICONS.checkedCircle;
                btn.setAttribute("data-liked", "true");
                showToast("Added to Liked Songs", "success");

                await PlaylistAPI.addTrack("liked_songs", currentTrackId, true);

                const cached = new Set(trackState.get(currentTrackId));
                cached.add("liked_songs");
                // Dọn dẹp lại những ID rác trong bộ nhớ đệm nếu có
                if (
                    PlaylistAPI.likedSongsId &&
                    PlaylistAPI.likedSongsId !== "liked_songs"
                ) {
                    cached.delete(PlaylistAPI.likedSongsId);
                }
                trackState.update(currentTrackId, Array.from(cached));
                window.dispatchEvent(
                    new CustomEvent("playlist-track-added", {
                        detail: {
                            playlistId: "liked_songs",
                            trackId: currentTrackId,
                        },
                    }),
                );
            } else {
                // Nếu bài hát đã được thích: Click lần hai sẽ mở popup chi tiết để thêm hoặc xóa bài hát khỏi các playlist khác
                const trackImg =
                    btn.dataset.trackImage ||
                    btn.closest(".group")?.querySelector("img")?.src;
                openPlaylistPopup({
                    anchorEl: btn,
                    track: {
                        id: currentTrackId,
                        title: btn.dataset.trackTitle || "Track",
                        is_liked: true,
                        image_url: trackImg,
                    },
                });
            }
        };
    });
}