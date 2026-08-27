import { navigateTo } from "../../utils/router.js";

/**
 * Mobile Library Overlay – Full-screen overlay hiện danh sách thư viện khi bấm tab Library trên mobile
 * Component riêng, không ảnh hưởng tới DOM/ID của sidebar desktop
 */

// SVG Icons
const ICONS = {
    close: `<svg viewBox="0 0 16 16" class="fill-current w-5 h-5"><path d="M2.47 2.47a.75.75 0 0 1 1.06 0L8 6.94l4.47-4.47a.75.75 0 1 1 1.06 1.06L9.06 8l4.47 4.47a.75.75 0 1 1-1.06 1.06L8 9.06l-4.47 4.47a.75.75 0 0 1-1.06-1.06L6.94 8 2.47 3.53a.75.75 0 0 1 0-1.06z"/></svg>`,
    plus: `<svg viewBox="0 0 16 16" class="fill-current" style="width: 16px; height: 16px;"><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/></svg>`,
    likedSongsHeart: `<svg viewBox="0 0 15 15" class="fill-white" style="width: 18px; height: 18px;"><path d="M8 3.5c1.2-1.7 3.5-2 4.8-.8 1.3 1.2 1.4 3.2.2 4.6L8 13 3 7.3C1.8 5.9 1.9 3.9 3.2 2.7 4.5 1.5 6.8 1.8 8 3.5z"/></svg>`,
    musicNote: `<svg viewBox="0 0 24 24" class="fill-white/30" style="width: 18px; height: 18px;"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"></path></svg>`,
};

/**
 * Render 1 item trong overlay library (dạng default_list)
 */
const renderOverlayItem = (item) => {
    const type = item._type || "playlist";
    const isLikedSongs = item.name === "Liked Songs" || item.id === "liked_songs";
    const isRounded = type === "artist";
    const roundedClass = isRounded ? "rounded-full" : "rounded";

    let title = item.name || item.title || "";
    let subtitle = "";
    let imageUrl = item.image_url || item.cover_image_url || "";
    let url = `/${type}?id=${item.id}`;

    if (type === "playlist") {
        subtitle = `Playlist`;
        if (isLikedSongs) {
            subtitle = `${item.total_tracks || 0} songs`;
            url = "/collection";
        } else if (!item.is_following) {
            url = `/my-playlist?id=${item.id}`;
        }
    } else if (type === "artist") {
        subtitle = "Artist";
    } else if (type === "album") {
        title = item.title || item.name || "";
        subtitle = `Album • ${item.artist_name || "Artist"}`;
        imageUrl = item.cover_image_url || item.image_url || item.artist_image_url || "";
    }

    // Render thumbnail
    let thumbnailHTML = "";
    if (isLikedSongs) {
        thumbnailHTML = `
            <div class="w-12 h-12 ${roundedClass} flex items-center justify-center shrink-0 overflow-hidden shadow" style="background: linear-gradient(135deg, #450af5, #c4efd9);">
                ${ICONS.likedSongsHeart}
            </div>`;
    } else if (imageUrl) {
        thumbnailHTML = `
            <div class="w-12 h-12 ${roundedClass} bg-sp-highlight flex items-center justify-center shrink-0 overflow-hidden shadow">
                <img src="${imageUrl}" alt="${title}" class="w-full h-full object-cover" />
            </div>`;
    } else {
        thumbnailHTML = `
            <div class="w-12 h-12 ${roundedClass} bg-sp-highlight flex items-center justify-center shrink-0 overflow-hidden shadow">
                ${isRounded 
                    ? `<span class="font-medium text-sm text-sp-text-subdued">${title?.charAt(0) ?? "A"}</span>` 
                    : ICONS.musicNote}
            </div>`;
    }

    return `
        <a href="${url}" data-link
           class="mobile-library-item flex items-center gap-3 p-3 rounded-md hover:bg-[#1f1f1f] transition-colors cursor-pointer"
           data-item-type="${type}"
           data-item-id="${item.id}">
            ${thumbnailHTML}
            <div class="flex-1 min-w-0">
                <p class="font-medium text-base text-white truncate">${title}</p>
                <p class="text-sm text-sp-text-subdued truncate mt-0.5">${subtitle}</p>
            </div>
        </a>
    `;
};

/**
 * Render HTML cho overlay
 */
export const MobileLibraryOverlay = () => {
    return `
        <div id="mobile-library-overlay" class="fixed inset-0 z-60 bg-sp-base flex flex-col md:hidden translate-y-full transition-transform duration-300 ease-out">
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 shrink-0">
                <h2 class="text-white text-lg font-bold">Your Library</h2>
                <div class="flex items-center gap-2">
                    <!-- Create playlist button -->
                    <button id="mobile-create-playlist-btn" class="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-sp-text-subdued hover:text-white hover:scale-105 transition-all cursor-pointer" data-tooltip="Create playlist">
                        ${ICONS.plus}
                    </button>
                    <!-- Close button -->
                    <button id="mobile-library-close-btn" class="w-10 h-10 rounded-full flex items-center justify-center text-sp-text-subdued hover:text-white cursor-pointer transition-colors">
                        ${ICONS.close}
                    </button>
                </div>
            </div>

            <!-- List container -->
            <div id="mobile-library-list" class="flex-1 overflow-y-auto px-2 pb-20">
                <div class="py-6 px-4 text-center text-sp-text-subdued text-sm">
                    <p>Loading...</p>
                </div>
            </div>
        </div>
    `;
};

/**
 * Khởi tạo sự kiện cho overlay
 */
export const initMobileLibraryOverlay = (user) => {
    const overlay = document.querySelector("#mobile-library-overlay");
    const closeBtn = document.querySelector("#mobile-library-close-btn");
    const listContainer = document.querySelector("#mobile-library-list");
    const createBtn = document.querySelector("#mobile-create-playlist-btn");

    if (!overlay) return;

    // Store data from sidebar
    let libraryData = { playlists: [], artists: [], albums: [], user: null };

    // Hàm mở overlay
    const openOverlay = () => {
        overlay.classList.remove("translate-y-full");
        overlay.classList.add("translate-y-0");
        document.body.style.overflow = "hidden";
    };

    // Hàm đóng overlay
    const closeOverlay = () => {
        overlay.classList.remove("translate-y-0");
        overlay.classList.add("translate-y-full");
        document.body.style.overflow = "";
    };

    // Expose open/close cho BottomNav
    window._mobileLibrary = { open: openOverlay, close: closeOverlay };

    // Close button
    if (closeBtn) {
        closeBtn.onclick = closeOverlay;
    }

    // Render danh sách
    const renderOverlayList = () => {
        const { playlists, artists, albums } = libraryData;
        const allItems = [
            ...playlists.map(p => ({ ...p, _type: "playlist" })),
            ...artists.map(a => ({ ...a, _type: "artist" })),
            ...albums.map(al => ({ ...al, _type: "album" })),
        ];

        if (allItems.length > 0) {
            listContainer.innerHTML = allItems.map(renderOverlayItem).join("");
        } else {
            listContainer.innerHTML = `
                <div class="py-6 px-4 text-center text-sp-text-subdued text-sm">
                    <p>No items in your library yet.</p>
                </div>
            `;
        }

        // Gắn sự kiện click điều hướng + đóng overlay
        listContainer.querySelectorAll(".mobile-library-item").forEach(item => {
            item.addEventListener("click", () => {
                closeOverlay();
            });
        });
    };

    // Lắng nghe data từ sidebar
    window.addEventListener("sidebar-library-data-updated", (e) => {
        libraryData = e.detail;
        renderOverlayList();
    });

    // Create playlist button
    if (createBtn) {
        createBtn.onclick = async () => {
            // Trigger click trên nút create của sidebar desktop (sử dụng lại logic đã có)
            const sidebarCreateBtn = document.querySelector("#create-playlist-btn");
            if (sidebarCreateBtn) {
                sidebarCreateBtn.click();
                closeOverlay();
            }
        };
    }
};
