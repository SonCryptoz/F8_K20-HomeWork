import { getQueryParams } from "../../utils/router.js";
import { showToast } from "../../components/toaster.js";
import { fetchData } from "../../services/spotifyAPI.js";
import { handleSidebarContextMenu } from "./SidebarContextMenu.js";

// ============================================
// CẬP NHẬT GIAO DIỆN PHẦN TỬ ĐANG ĐƯỢC CHỌN (ACTIVE ITEM)
// Hàm này so sánh URL hiện tại với thuộc tính của từng phần tử ở sidebar (Playlist / Artist / Album / Liked Songs)
// để bôi đậm và làm nổi bật phần tử mà người dùng đang xem
// ============================================
export const updateActiveSidebarItem = () => {
    const path = window.location.pathname;
    const params = getQueryParams();
    const activeId = params.id;
    const items = document.querySelectorAll(".sidebar__playlist-item");

    items.forEach((item) => {
        const id = item.dataset.itemId || item.dataset.playlistId;
        const type = item.dataset.itemType || "playlist";
        const isLikedSongs =
            item.dataset.likedSongs === "true" || id === "liked_songs";
        let isMatchingRoute = false;

        if (path === "/collection" && isLikedSongs) {
            isMatchingRoute = true;
        } else if (
            (path === "/playlist" || path === "/my-playlist") &&
            type === "playlist" &&
            !isLikedSongs
        ) {
            isMatchingRoute = Boolean(
                activeId && String(id) === String(activeId),
            );
        } else if (path === "/artist" && type === "artist") {
            isMatchingRoute = Boolean(
                activeId && String(id) === String(activeId),
            );
        } else if (path === "/album" && type === "album") {
            isMatchingRoute = Boolean(
                activeId && String(id) === String(activeId),
            );
        }

        const isActive = isMatchingRoute;

        item.dataset.tooltipActive = isActive ? "true" : "false";

        const titleEl = item.querySelector(".sidebar__playlist-title");

        if (isActive) {
            item.classList.add("bg-sp-highlight");
            item.classList.remove("hover:bg-[#1f1f1f]");
            if (titleEl) {
                titleEl.classList.add("text-sp-bg-base");
                titleEl.classList.remove("text-white");
            }
        } else {
            item.classList.remove("bg-sp-highlight", "bg-[#282828]");
            item.classList.add("hover:bg-[#1f1f1f]");
            if (titleEl) {
                titleEl.classList.remove("text-sp-bg-base");
                titleEl.classList.add("text-white");
            }
        }
    });
};

export const syncActiveSidebarPlaylist = () => {
    updateActiveSidebarItem();
};

// ============================================
// CHUẨN HÓA DỮ LIỆU ĐẦU VÀO (NORMALIZE ITEM)
// Chuyển đổi dữ liệu thô của Playlist, Artist, Album từ API về chung một cấu trúc chuẩn (Props)
// Giúp cho hàm render dùng chung dễ dàng xử lý mà không cần quan tâm đến kiểu dữ liệu gốc
// ============================================
const normalizeItem = (item, type, user, currentActiveId) => {
    const path = window.location.pathname;
    const params = getQueryParams();

    let title = "";
    let category = "";
    let subtitle = "";
    let isLikedSongs = false;
    let isRounded = false;
    let imageUrl = "";

    if (type === "playlist") {
        isLikedSongs = item.name === "Liked Songs" || item.id === "liked_songs";
        title = item.name;
        category = "Playlist";
        const authorName =
            item.user_display_name ||
            item.user_username ||
            user?.display_name ||
            user?.username ||
            "You";
        const ownerText = isLikedSongs
            ? `${item.total_tracks || 0} songs`
            : authorName;
        subtitle = `Playlist • ${ownerText}`;
        imageUrl = item.image_url;
    } else if (type === "artist") {
        title = item.name;
        category = "Artist";
        subtitle = "Artist";
        isRounded = true;
        imageUrl = item.image_url;
    } else if (type === "album") {
        title = item.title;
        category = "Album";
        subtitle = `Album • ${item.artist_name || "Artist"}`;
        imageUrl =
            item.cover_image_url || item.image_url || item.artist_image_url;
    }

    const activeId =
        currentActiveId !== null
            ? currentActiveId
            : path === `/${type}`
              ? params.id
              : null;

    let isActive = false;
    let url = `/${type}?id=${item.id}`;

    if (type === "playlist") {
        if (isLikedSongs) {
            url = "/collection";
        } else if (!item.is_following) {
            url = `/my-playlist?id=${item.id}`;
        }
    }

    if (path === "/collection" && isLikedSongs) {
        isActive = true;
    } else if (!isLikedSongs) {
        // If current path matches the generated url's path, check ID
        if (path === url.split("?")[0]) {
            isActive = Boolean(
                activeId && String(item.id) === String(activeId),
            );
        }
    }

    const titleColor = isActive ? "text-sp-bg-base" : "text-white";

    return {
        id: item.id,
        type,
        url,
        title,
        category,
        subtitle,
        imageUrl,
        isLikedSongs,
        isRounded,
        isActive,
        titleColor,
        isPinned:
            isLikedSongs || item.is_pinned === true || item.is_pinned === 1,
        isFollowing: item.is_following === true || item.is_following === 1,
        isLiked: item.is_liked === true || item.is_liked === 1,
    };
};

// ============================================
// HIỂN THỊ ẢNH ĐẠI DIỆN (RENDER THUMBNAIL)
// Hàm hỗ trợ render ảnh cho các phần tử, tự động xử lý các trường hợp đặc biệt:
// - Playlist Liked Songs (Gradient màu đặc trưng)
// - Nghệ sĩ (Ảnh bo tròn hoàn toàn)
// - Fallback Icon (Hiển thị chữ cái đầu hoặc icon mặc định nếu không có ảnh)
// ============================================
const renderThumbnail = (props, sizeClass = "w-12 h-12", iconSize = "18px") => {
    const roundedClass = props.isRounded ? "rounded-full" : "rounded";

    if (props.isLikedSongs) {
        return `
            <div class="relative ${sizeClass} ${roundedClass} bg-sp-highlight flex items-center justify-center shrink-0 overflow-hidden shadow">
                <div class="w-full h-full flex items-center justify-center" style="background: linear-gradient(135deg, #450af5, #c4efd9);">
                    <svg viewBox="0 0 15 15" class="fill-white" style="width: ${iconSize}; height: ${iconSize};"><path d="M8 3.5c1.2-1.7 3.5-2 4.8-.8 1.3 1.2 1.4 3.2.2 4.6L8 13 3 7.3C1.8 5.9 1.9 3.9 3.2 2.7 4.5 1.5 6.8 1.8 8 3.5z"/></svg>
                </div>
            </div>
        `;
    }

    if (props.imageUrl) {
        return `
            <div class="relative ${sizeClass} ${roundedClass} bg-sp-highlight flex items-center justify-center shrink-0 overflow-hidden shadow">
                <img src="${props.imageUrl}" alt="${props.title}" class="w-full h-full object-cover" />
            </div>
        `;
    }

    // Nếu không có ảnh, hiển thị icon mặc định hoặc chữ cái đầu tiên của tên
    return `
        <div class="relative ${sizeClass} ${roundedClass} bg-sp-highlight flex items-center justify-center shrink-0 overflow-hidden shadow">
            ${
                props.isRounded
                    ? `<span class="font-medium text-sm text-sp-text-subdued">${props.title?.charAt(0) ?? "A"}</span>`
                    : `<svg viewBox="0 0 24 24" class="fill-white/30" style="width: ${iconSize}; height: ${iconSize};">
                        <path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"></path>
                       </svg>`
            }
        </div>
    `;
};

// ============================================
// HÀM RENDER DÙNG CHUNG CHO TẤT CẢ PHẦN TỬ THƯ VIỆN
// Nhận vào dữ liệu đã chuẩn hóa (Props) và tạo HTML tùy theo một trong bốn chế độ xem:
// 1. Compact list: Chỉ hiện chữ, không ảnh
// 2. Default list: Ảnh 48x48 + Tên + Phụ đề
// 3. Compact grid: Dạng lưới nhỏ, chỉ có ảnh
// 4. Default grid: Dạng lưới lớn, ảnh to + nút Play + Tên
// ============================================
export const renderLibraryItem = (props, viewMode = "default_list") => {
    // -------------------------------------------------------------
    // GIAO DIỆN 1 (LAYOUT 1): Danh sách rút gọn (Compact list) - Chỉ hiển thị tên và thể loại, không có ảnh đại diện
    // -------------------------------------------------------------
    if (viewMode === "compact_list") {
        return `
            <a href="${props.url}" data-link 
               data-item-type="${props.type}"
               data-item-id="${props.id}"
               data-playlist-id="${props.id}"
               data-liked-songs="${props.isLikedSongs}"
               data-is-pinned="${props.isPinned}"
               data-is-following="${props.isFollowing}"
               data-is-liked="${props.isLiked}"
               class="sidebar__playlist-item flex items-center px-3 py-2.5 rounded-md ${
                   props.isActive ? "bg-sp-highlight" : "hover:bg-[#1f1f1f]"
               } transition-colors cursor-pointer group mb-0.5">
                <p class="truncate text-sm font-medium flex items-center gap-2">
                    ${props.isPinned ? `<svg viewBox="0 0 16 16" class="fill-sp-bg-base shrink-0" style="width: 12px; height: 12px;"><title>Pinned</title><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>` : ""}
                    <span class="sidebar__playlist-title ${props.titleColor}">${props.title}</span>
                    <span class="text-sp-text-subdued font-normal"> • ${props.category}</span>
                </p>
                <div class="ml-auto sidebar__active-icon hidden w-4 h-4 text-[#1ed760] shrink-0">
                    <svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.683 3.29V2.86L2.817 6.15zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"/></svg>
                </div>
            </a>
        `;
    }

    // -------------------------------------------------------------
    // GIAO DIỆN 3 (LAYOUT 3): Lưới rút gọn (Compact grid) - Chỉ hiển thị ảnh đại diện, khi hover sẽ hiện tooltip nổi bên phải
    // -------------------------------------------------------------
    if (viewMode === "compact_grid") {
        const roundedClass = props.isRounded ? "rounded-full" : "rounded-md";
        return `
            <a href="${props.url}" data-link 
               data-item-type="${props.type}"
               data-item-id="${props.id}"
               data-playlist-id="${props.id}"
               data-liked-songs="${props.isLikedSongs}"
               data-is-pinned="${props.isPinned}"
               data-is-following="${props.isFollowing}"
               data-is-liked="${props.isLiked}"
               data-tooltip-title="${props.title}"
               data-tooltip-subtitle="${props.subtitle}"
               data-tooltip-active="${props.isActive}"
               class="sidebar__playlist-item sidebar__compact-grid-card relative flex items-center justify-center p-1.5 rounded-md ${
                   props.isActive ? "bg-sp-highlight" : "hover:bg-[#1f1f1f]"
               } transition-colors cursor-pointer group aspect-square w-full">
                
                <div class="relative w-full h-full ${roundedClass} bg-sp-highlight flex items-center justify-center overflow-hidden shadow-sm pointer-events-none">
                    ${
                        props.isLikedSongs
                            ? `<div class="w-full h-full flex items-center justify-center" style="background: linear-gradient(135deg, #450af5, #c4efd9);">
                                <svg viewBox="0 0 15 15" class="fill-white w-8 h-8"><path d="M8 3.5c1.2-1.7 3.5-2 4.8-.8 1.3 1.2 1.4 3.2.2 4.6L8 13 3 7.3C1.8 5.9 1.9 3.9 3.2 2.7 4.5 1.5 6.8 1.8 8 3.5z"/></svg>
                               </div>`
                            : props.imageUrl
                              ? `<img src="${props.imageUrl}" alt="${props.title}" class="w-full h-full object-cover" />`
                              : props.isRounded
                                ? `<span class="font-medium text-lg text-sp-text-subdued">${props.title?.charAt(0) ?? "A"}</span>`
                                : `<svg viewBox="0 0 24 24" class="fill-white/30 w-8 h-8"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"></path></svg>`
                    }
                    </div></a>`;
    }

    // -------------------------------------------------------------
    // GIAO DIỆN 4 (LAYOUT 4): Lưới mặc định (Default grid) - Ảnh to, có nút Play màu xanh khi hover và tên kích thước lớn
    // -------------------------------------------------------------
    if (viewMode === "default_grid") {
        const roundedClass = props.isRounded ? "rounded-full" : "rounded-md";
        return `
            <a href="${props.url}" data-link 
               data-item-type="${props.type}"
               data-item-id="${props.id}"
               data-playlist-id="${props.id}"
               data-liked-songs="${props.isLikedSongs}"
               data-is-pinned="${props.isPinned}"
               data-is-following="${props.isFollowing}"
               data-is-liked="${props.isLiked}"
               class="sidebar__playlist-item flex flex-col p-2 rounded-md ${
                   props.isActive ? "bg-sp-highlight" : "hover:bg-[#1f1f1f]"
               } transition-colors cursor-pointer group">
                
                <div class="relative w-full aspect-square ${roundedClass} bg-sp-highlight flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
                    ${
                        props.isLikedSongs
                            ? `<div class="w-full h-full flex items-center justify-center" style="background: linear-gradient(135deg, #450af5, #c4efd9);">
                                <svg viewBox="0 0 15 15" class="fill-white w-8 h-8"><path d="M8 3.5c1.2-1.7 3.5-2 4.8-.8 1.3 1.2 1.4 3.2.2 4.6L8 13 3 7.3C1.8 5.9 1.9 3.9 3.2 2.7 4.5 1.5 6.8 1.8 8 3.5z"/></svg>
                               </div>`
                            : props.imageUrl
                              ? `<img src="${props.imageUrl}" alt="${props.title}" class="w-full h-full object-cover" />`
                              : props.isRounded
                                ? `<span class="font-medium text-xl text-sp-text-subdued">${props.title?.charAt(0) ?? "A"}</span>`
                                : `<svg viewBox="0 0 24 24" class="fill-white/30 w-8 h-8"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"></path></svg>`
                    }

                    <!-- Nút Play tròn màu xanh lá đặc trưng của Spotify xuất hiện khi Hover (kèm hiệu ứng trượt lên & hiện dần mượt mà tương tự như ở Main) -->
                    <button class="sidebar-play-btn absolute right-2.5 bottom-2.5 w-12 h-12 rounded-full bg-sp-bg-base flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.3)] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 hover:bg-sp-bg-highlight active:scale-95 transition-all duration-300 ease-out cursor-pointer"
                            data-item-type="${props.type}"
                            data-item-id="${props.id}"
                            data-tooltip="Play ${props.title}">
                        <svg viewBox="0 0 24 24" class="fill-black w-6 h-6 ml-0.5">
                            <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/>
                        </svg>
                    </button>
                </div>

                <div class="w-full min-w-0 mt-2">
                    <p class="sidebar__playlist-title font-medium text-[14px] truncate ${props.titleColor}">${props.title}</p>
                    <div class="flex items-center text-[13px] gap-1 text-sp-text-subdued truncate mt-0.5 font-normal">
                        ${props.isPinned ? `<svg viewBox="0 0 16 16" class="fill-sp-bg-base shrink-0" style="width: 12px; height: 12px;"><title>Pinned</title><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>` : ""}
                        <span class="truncate">${props.subtitle}</span>
                    </div>
            </div>
            <div class="ml-auto sidebar__active-icon hidden w-4 h-4 text-[#1ed760] shrink-0" style="margin-right: 8px;">
                <svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.683 3.29V2.86L2.817 6.15zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"/></svg>
            </div>
        </a>
        `;
    }

    // -------------------------------------------------------------
    // GIAO DIỆN 2 (LAYOUT 2): Danh sách mặc định (Default list) - Ảnh 48x48, tên, phụ đề và có nút play đè lên ảnh khi hover
    // -------------------------------------------------------------
    return `
        <a href="${props.url}" data-link 
           data-item-type="${props.type}"
           data-item-id="${props.id}"
           data-playlist-id="${props.id}"
           data-liked-songs="${props.isLikedSongs}"
           data-is-pinned="${props.isPinned}"
           data-is-following="${props.isFollowing}"
               data-is-liked="${props.isLiked}"
           class="sidebar__playlist-item flex items-center gap-3 p-2 rounded-md ${
               props.isActive ? "bg-sp-highlight" : "hover:bg-[#1f1f1f]"
           } transition-colors cursor-pointer group mb-1">
            
            <div class="relative">
                ${renderThumbnail(props, "w-12 h-12", "18px")}

                <div class="absolute inset-0 bg-black/50 ${
                    props.isRounded ? "rounded-full" : "rounded"
                } flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="sidebar-play-btn text-white hover:scale-110 active:scale-95 transition-transform cursor-pointer drop-shadow-md"
                            data-item-type="${props.type}"
                            data-item-id="${props.id}"
                            data-tooltip="Play ${props.title}">
                        <svg viewBox="0 0 24 24" class="fill-white" style="width: 22px; height: 22px;">
                            <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="flex-1 min-w-0">
                <p class="sidebar__playlist-title font-medium text-base truncate ${props.titleColor}">${props.title}</p>
                <div class="flex items-center text-sm gap-1 text-sp-text-subdued truncate mt-0.5">
                    ${props.isPinned ? `<svg viewBox="0 0 16 16" class="fill-sp-bg-base shrink-0" style="width: 12px; height: 12px;"><title>Pinned</title><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>` : ""}
                    <span>${props.subtitle}</span>
                </div>
            </div>
            <div class="ml-auto sidebar__active-icon hidden w-4 h-4 text-[#1ed760] shrink-0" style="margin-right: 8px;">
                <svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.683 3.29V2.86L2.817 6.15zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"/></svg>
            </div>
        </a>
    `;
};

// =========================================================================
// CÁC HÀM XUẤT (EXPORT) TƯƠNG THÍCH
// Tận dụng hàm dùng chung renderLibraryItem để xuất riêng các hàm tạo Playlist, Artist, Album với đầu vào thô
// =========================================================================
export const renderPlaylistItem = (
    p,
    user,
    currentActiveId = null,
    viewMode = "default_list",
) => {
    const props = normalizeItem(p, "playlist", user, currentActiveId);
    return renderLibraryItem(props, viewMode);
};

export const renderArtistItem = (
    a,
    currentActiveId = null,
    viewMode = "default_list",
) => {
    const props = normalizeItem(a, "artist", null, currentActiveId);
    return renderLibraryItem(props, viewMode);
};

export const renderAlbumItem = (
    al,
    currentActiveId = null,
    viewMode = "default_list",
) => {
    const props = normalizeItem(al, "album", null, currentActiveId);
    return renderLibraryItem(props, viewMode);
};

// ============================================
// ĐĂNG KÝ SỰ KIỆN CHO CÁC PHẦN TỬ TRONG THƯ VIỆN
// Bao gồm:
// - Bấm chuột trái để chọn/highlight phần tử
// - Bấm chuột phải để mở menu ngữ cảnh
// - Bấm vào nút Play để phát nhạc
// - Hover vào giao diện lưới rút gọn để hiển thị tooltip nổi
// ============================================
export const attachPlaylistEvents = (container) => {
    // --------------------------------------------------------
    // Cập nhật giao diện khi bấm chọn (Active state)
    // --------------------------------------------------------
    container.querySelectorAll(".sidebar__playlist-item").forEach((item) => {
        item.onclick = () => {
            const items = container.querySelectorAll(".sidebar__playlist-item");
            items.forEach((it) => {
                it.classList.remove("bg-sp-highlight");
                it.classList.add("hover:bg-[#1f1f1f]");
                it.dataset.tooltipActive = "false";
                const t = it.querySelector(".sidebar__playlist-title");
                if (t) {
                    t.classList.remove("text-sp-bg-base");
                    t.classList.add("text-white");
                }
            });
            item.classList.add("bg-sp-highlight");
            item.classList.remove("hover:bg-[#1f1f1f]");
            item.dataset.tooltipActive = "true";
            const activeTitle = item.querySelector(".sidebar__playlist-title");
            if (activeTitle) {
                activeTitle.classList.add("text-sp-bg-base");
                activeTitle.classList.remove("text-white");
            }
        };

        // --------------------------------------------------------
        // Hiển thị menu ngữ cảnh khi click chuột phải
        // --------------------------------------------------------
        item.oncontextmenu = (e) => {
            handleSidebarContextMenu(e, item);
        };
    });

    // --------------------------------------------------------
    // Hàm đồng bộ trạng thái phát nhạc (Được gọi từ bên ngoài khi có sự thay đổi từ player)
    // Cập nhật lại màu chữ, icon nhấp nháy, và icon Play/Pause cho phù hợp
    // --------------------------------------------------------
    window.updateSidebarPlayState = () => {
        if (!window.player) return;
        const currentTrack = window.player.queue[window.player.currentIndex];
        const isPlaying = window.player.isPlaying;

        document
            .querySelectorAll(
                ".sidebar__playlist-item, .sidebar__compact-grid-card",
            )
            .forEach((item) => {
                const id = item.dataset.itemId || item.dataset.playlistId;
                const type = item.dataset.itemType || "playlist";
                const isLikedSongs =
                    item.dataset.likedSongs === "true" || id === "liked_songs";

                let isThisItemPlaying = false;
                if (currentTrack) {
                    if (
                        isLikedSongs &&
                        currentTrack.playlistId === "liked_songs"
                    )
                        isThisItemPlaying = true;
                    else if (
                        type === "playlist" &&
                        !isLikedSongs &&
                        currentTrack.playlistId === id
                    )
                        isThisItemPlaying = true;
                    else if (type === "album" && currentTrack.albumId == id)
                        isThisItemPlaying = true;
                    else if (type === "artist" && currentTrack.artistId == id)
                        isThisItemPlaying = true;
                }

                const title = item.querySelector(".sidebar__playlist-title");
                const playBtn = item.querySelector(".sidebar-play-btn");
                const activeIcon = item.querySelector(".sidebar__active-icon");

                const isGridPlayBtn =
                    playBtn && playBtn.classList.contains("bg-sp-bg-base");
                const iconFill = isGridPlayBtn ? "fill-black" : "fill-white";
                const PLAY_ICON = `<svg viewBox="0 0 24 24" class="${iconFill}" style="width: 22px; height: 22px; ${isGridPlayBtn ? "margin-left: 2px;" : ""}"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/></svg>`;
                const PAUSE_ICON = `<svg viewBox="0 0 24 24" class="${iconFill}" style="width: 22px; height: 22px;"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

                if (isThisItemPlaying) {
                    if (title) {
                        title.classList.add("text-[#1ed760]");
                        title.classList.remove("text-white", "text-sp-bg-base");
                    }
                    if (activeIcon && !isGridPlayBtn) {
                        if (isPlaying) {
                            activeIcon.classList.remove("hidden");
                            activeIcon.classList.add("flex");
                        } else {
                            activeIcon.classList.add("hidden");
                            activeIcon.classList.remove("flex");
                        }
                    }
                    if (playBtn) {
                        playBtn.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
                        const currentTooltip = playBtn.dataset.tooltip || "";
                        const titleMatch = currentTooltip.replace(
                            /^(Play|Pause)\s*/,
                            "",
                        );
                        playBtn.dataset.tooltip = isPlaying
                            ? `Pause ${titleMatch}`
                            : `Play ${titleMatch}`;

                        if (isGridPlayBtn) {
                            if (isPlaying) {
                                playBtn.classList.remove(
                                    "opacity-0",
                                    "translate-y-2",
                                    "group-hover:opacity-100",
                                    "group-hover:translate-y-0",
                                );
                                playBtn.classList.add(
                                    "opacity-100",
                                    "translate-y-0",
                                );
                            } else {
                                playBtn.classList.add(
                                    "opacity-0",
                                    "translate-y-2",
                                    "group-hover:opacity-100",
                                    "group-hover:translate-y-0",
                                );
                                playBtn.classList.remove(
                                    "opacity-100",
                                    "translate-y-0",
                                );
                            }
                        }
                    }
                } else {
                    if (title) {
                        title.classList.remove("text-[#1ed760]");
                        if (item.dataset.tooltipActive !== "true") {
                            title.classList.add("text-white");
                            title.classList.remove("text-sp-bg-base");
                        } else {
                            title.classList.add("text-sp-bg-base");
                            title.classList.remove("text-white");
                        }
                    }
                    if (activeIcon) {
                        activeIcon.classList.add("hidden");
                        activeIcon.classList.remove("flex");
                    }
                    if (playBtn) {
                        playBtn.innerHTML = PLAY_ICON;
                        const currentTooltip = playBtn.dataset.tooltip || "";
                        const titleMatch = currentTooltip.replace(
                            /^(Play|Pause)\s*/,
                            "",
                        );
                        playBtn.dataset.tooltip = `Play ${titleMatch}`;

                        if (isGridPlayBtn) {
                            playBtn.classList.add(
                                "opacity-0",
                                "translate-y-2",
                                "group-hover:opacity-100",
                                "group-hover:translate-y-0",
                            );
                            playBtn.classList.remove(
                                "opacity-100",
                                "translate-y-0",
                            );
                        }
                    }
                }
            });
    };

    if (window._sidebarPlayStateListener) {
        window.removeEventListener(
            "player-state-changed",
            window._sidebarPlayStateListener,
        );
    }
    window._sidebarPlayStateListener = window.updateSidebarPlayState;
    window.addEventListener(
        "player-state-changed",
        window.updateSidebarPlayState,
    );
    window.updateSidebarPlayState();

    // --------------------------------------------------------
    // Xử lý sự kiện khi bấm vào nút Play trên từng phần tử
    // Tự động phân loại (Album, Nghệ sĩ, Playlist, Liked Songs) để gọi API lấy danh sách bài hát tương ứng
    // --------------------------------------------------------
    container.querySelectorAll(".sidebar-play-btn").forEach((btn) => {
        btn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!window.player) return;
            const itemId = btn.dataset.itemId;
            const itemType = btn.dataset.itemType || "playlist";
            const row = btn.closest(
                ".sidebar__playlist-item, .sidebar__compact-grid-card",
            );
            const isLikedSongs =
                row &&
                (row.dataset.likedSongs === "true" || itemId === "liked_songs");

            const currentTrack =
                window.player.queue[window.player.currentIndex];
            let isThisItemPlaying = false;

            if (currentTrack) {
                if (isLikedSongs && currentTrack.playlistId === "liked_songs")
                    isThisItemPlaying = true;
                else if (
                    itemType === "playlist" &&
                    !isLikedSongs &&
                    currentTrack.playlistId === itemId
                )
                    isThisItemPlaying = true;
                else if (itemType === "album" && currentTrack.albumId == itemId)
                    isThisItemPlaying = true;
                else if (
                    itemType === "artist" &&
                    currentTrack.artistId == itemId
                )
                    isThisItemPlaying = true;
            }

            if (isThisItemPlaying) {
                window.player.togglePlay();
            } else {
                try {
                    let tracks = [];
                    if (isLikedSongs) {
                        const res = await fetchData.auth("/me/tracks/liked");
                        tracks = Array.isArray(res)
                            ? res
                            : res?.tracks || res?.data || [];
                        tracks = tracks.map((t) => ({
                            ...t,
                            playlistId: "liked_songs",
                        }));
                    } else if (itemType === "playlist") {
                        const res = await fetchData.get(
                            `/playlists/${itemId}/tracks`,
                        );
                        tracks = res.tracks || [];

                        const isMyPlaylist =
                            !isLikedSongs &&
                            row?.dataset.isFollowing === "false";
                        if (isMyPlaylist) {
                            tracks.reverse();
                        }

                        tracks = tracks.map((t) => ({
                            ...t,
                            playlistId: itemId,
                        }));
                    } else if (itemType === "album" || itemType === "artist") {
                        const res = await fetchData.get(
                            "/tracks?offset=0&limit=50",
                        );
                        const allTracks = res.tracks || [];
                        if (itemType === "album") {
                            tracks = allTracks.filter(
                                (t) => t.album_id == itemId,
                            );
                            tracks = tracks.map((t) => ({
                                ...t,
                                albumId: itemId,
                            }));
                        } else {
                            tracks = allTracks.filter(
                                (t) => t.artist_id == itemId,
                            );
                            tracks = tracks.map((t) => ({
                                ...t,
                                artistId: itemId,
                            }));
                        }
                    }
                    if (tracks.length > 0) {
                        window.player.playQueue(tracks);
                    } else {
                        showToast("No tracks available", "info");
                    }
                } catch (err) {
                    console.error("Failed to play from sidebar", err);
                    showToast("Failed to play", "error");
                }
            }
        };
    });

    // --------------------------------------------------------
    // Khởi tạo giao diện và logic hiển thị Tooltip trôi nổi (Floating Tooltip) dành riêng cho chế độ xem Lưới rút gọn (Compact Grid)
    // --------------------------------------------------------
    let tooltipEl = document.querySelector("#sidebar-compact-tooltip");
    if (!tooltipEl) {
        tooltipEl = document.createElement("div");
        tooltipEl.id = "sidebar-compact-tooltip";
        tooltipEl.className =
            "pointer-events-none fixed z-[99999] flex flex-col bg-[#282828] text-white px-3.5 py-2 rounded-md shadow-2xl border border-white/10 whitespace-nowrap opacity-0 scale-95 transition-all duration-200 ease-out";
        document.body.appendChild(tooltipEl);
    }

    const hideTooltip = () => {
        if (tooltipEl) {
            tooltipEl.classList.remove("opacity-100", "scale-100");
            tooltipEl.classList.add("opacity-0", "scale-95");
        }
    };

    container
        .querySelectorAll(".sidebar__compact-grid-card")
        .forEach((card) => {
            card.onmouseenter = () => {
                const title = card.dataset.tooltipTitle;
                const subtitle = card.dataset.tooltipSubtitle;
                const isActive = card.dataset.tooltipActive === "true";
                const isPinned = card.dataset.isPinned === "true";

                // Kiểm tra xem phần tử hiện tại có đang được phát hay không để tô màu chữ xanh lá cây và hiện icon loa
                const id = card.dataset.itemId || card.dataset.playlistId;
                const type = card.dataset.itemType || "playlist";
                const isLikedSongs =
                    card.dataset.likedSongs === "true" || id === "liked_songs";
                let isThisItemPlaying = false;

                if (window.player) {
                    const currentTrack =
                        window.player.queue[window.player.currentIndex];
                    if (currentTrack) {
                        if (
                            isLikedSongs &&
                            currentTrack.playlistId === "liked_songs"
                        )
                            isThisItemPlaying = true;
                        else if (
                            type === "playlist" &&
                            !isLikedSongs &&
                            currentTrack.playlistId === id
                        )
                            isThisItemPlaying = true;
                        else if (type === "album" && currentTrack.albumId == id)
                            isThisItemPlaying = true;
                        else if (
                            type === "artist" &&
                            currentTrack.artistId == id
                        )
                            isThisItemPlaying = true;
                    }
                }

                const titleColor =
                    isThisItemPlaying || isActive
                        ? "text-[#1ed760]"
                        : "text-white";

                const PLAY_ICON = `<svg viewBox="0 0 16 16" class="fill-[#1ed760] w-4 h-4 ml-auto shrink-0"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.683 3.29V2.86L2.817 6.15zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"/></svg>`;

                if (!title) return;

                tooltipEl.innerHTML = `
                <div class="flex items-center justify-between gap-3">
                    <p class="font-medium text-[15px] truncate ${titleColor}">${title}</p>
                    ${isThisItemPlaying ? PLAY_ICON : ""}
                </div>
                <div class="flex items-center text-[13px] gap-1.25 text-sp-text-subdued truncate mt-0.5 font-medium">
                    ${isPinned ? `<svg viewBox="0 0 16 16" class="fill-sp-bg-base shrink-0" style="width: 12px; height: 12px;"><title>Pinned</title><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>` : ""}
                    <span>${subtitle || ""}</span>
                </div>
            `;

                const rect = card.getBoundingClientRect();
                const top = rect.top + rect.height / 2;
                const left = rect.right + 10;

                tooltipEl.style.top = `${top}px`;
                tooltipEl.style.left = `${left}px`;
                tooltipEl.style.transform = "translateY(-50%)";

                requestAnimationFrame(() => {
                    tooltipEl.classList.remove("opacity-0", "scale-95");
                    tooltipEl.classList.add("opacity-100", "scale-100");
                });
            };
            card.onmouseleave = hideTooltip;
        });

    container.onscroll = hideTooltip;
};
