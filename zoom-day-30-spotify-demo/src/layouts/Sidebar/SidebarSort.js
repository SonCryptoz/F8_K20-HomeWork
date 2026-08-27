// Map tên hiển thị các kiểu sắp xếp
export const SORT_LABELS = {
    recents: "Recents",
    recently_added: "Recently Added",
    alphabetical: "Alphabetical",
    creator: "Creator",
};

// Map Icon của 4 chế độ hiển thị
export const VIEW_ICONS = {
    compact_list: `<svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M15 13H1v-1.5h14V13zm0-4.25H1v-1.5h14v1.5zM15 4.5H1V3h14v1.5z"/></svg>`,
    default_list: `<svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M15 14.5H5V13h10v1.5zm0-5.75H5v-1.5h10v1.5zM15 3H5V1.5h10V3zM3 3H1V1.5h2V3zm0 5.75H1v-1.5h2v1.5zM3 14.5H1V13h2v1.5z"/></svg>`,
    compact_grid: `<svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M1 1h3v3H1zm0 5.5h3v3H1zM4 12H1v3h3zM6.5 1h3v3h-3zm3 5.5h-3v3h3zm-3 5.5h3v3h-3zM15 1h-3v3h3zm-3 5.5h3v3h-3zm3 5.5h-3v3h3z"></path></svg>`,
    default_grid: `<svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M1 1h6v6H1V1zm8 0h6v6H9V1zm-8 8h6v6H1V9zm8 0h6v6H9V9z"/></svg>`,
};

const CHECK_ICON = `<svg viewBox="0 0 16 16" class="fill-current w-4 h-4 text-sp-bg-base shrink-0"><path d="M15.53 2.47a.75.75 0 0 1 0 1.06L4.907 14.153.47 9.716a.75.75 0 0 1 1.06-1.06l3.377 3.376L14.47 2.47a.75.75 0 0 1 1.06 0z"></path></svg>`;

/**
 * Hàm sắp xếp danh sách items (Liked Songs luôn ở đầu)
 */
export const sortLibraryItems = (items, sortType = "recents") => {
    const list = [...items];
    const liked = list.filter(
        (it) =>
            it.name === "Liked Songs" ||
            it.id === "liked_songs" ||
            it.is_pinned,
    );
    const rest = list.filter(
        (it) =>
            it.name !== "Liked Songs" &&
            it.id !== "liked_songs" &&
            !it.is_pinned,
    );

    if (sortType === "recently_added") {
        rest.sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        );
    } else if (sortType === "alphabetical") {
        rest.sort((a, b) => {
            const nameA = (a.name || a.artist_name || a.title || "").toLowerCase();
            const nameB = (b.name || b.artist_name || b.title || "").toLowerCase();
            return nameA.localeCompare(nameB);
        });
    } else if (sortType === "creator") {
        rest.sort((a, b) => {
            const creatorA = (
                a.user_display_name ||
                a.user_username ||
                a.artist_name ||
                a.name ||
                "You"
            ).toLowerCase();
            const creatorB = (
                b.user_display_name ||
                b.user_username ||
                b.artist_name ||
                b.name ||
                "You"
            ).toLowerCase();
            return creatorA.localeCompare(creatorB);
        });
    }

    // Đảm bảo Liked Songs luôn nằm đầu tiên trong danh sách ghim
    liked.sort((a, b) => {
        const isAbsoluteLikedA = a.name === "Liked Songs" || a.id === "liked_songs";
        const isAbsoluteLikedB = b.name === "Liked Songs" || b.id === "liked_songs";
        if (isAbsoluteLikedA && !isAbsoluteLikedB) return -1;
        if (!isAbsoluteLikedA && isAbsoluteLikedB) return 1;
        return 0;
    });

    return [...liked, ...rest];
};

/**
 * Khởi tạo menu Sort và View Mode cho Sidebar
 */
export const initSidebarSort = ({
    currentSort = "recents",
    currentView = "default_list",
    onSortChange,
    onViewChange,
}) => {
    const recentsBtn = document.querySelector("#sidebar-recents-btn");
    const sortMenu = document.querySelector("#sidebar-sort-menu");
    const sortWrapper = document.querySelector("#sidebar-sort-wrapper");
    const sortLabel = document.querySelector("#sidebar-sort-label");
    const viewIconContainer = document.querySelector("#sidebar-view-icon");

    if (!recentsBtn || !sortMenu) return;

    // Cập nhật label & icon trên nút trigger
    const updateTriggerUI = () => {
        if (sortLabel)
            sortLabel.textContent = SORT_LABELS[currentSort] || "Recents";
        if (viewIconContainer)
            viewIconContainer.innerHTML =
                VIEW_ICONS[currentView] || VIEW_ICONS.default_list;
    };

    // Render HTML nội dung của Dropdown Menu
    const renderMenuHTML = () => {
        sortMenu.innerHTML = `
            <!-- Section 1: Sort by -->
            <div class="text-[11px] font-bold text-sp-text-subdued px-3 pt-2 pb-1 tracking-wider select-none">
                Sort by
            </div>
            
            <div class="flex flex-col gap-0.5">
                <button class="sidebar__sort-option w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded hover:bg-[#3e3e3e] cursor-pointer transition-colors ${
                    currentSort === "recents" ? "text-sp-bg-base" : "text-white"
                }" data-sort="recents">
                    <span>Recents</span>
                    ${currentSort === "recents" ? CHECK_ICON : ""}
                </button>

                <button class="sidebar__sort-option w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded hover:bg-[#3e3e3e] cursor-pointer transition-colors ${
                    currentSort === "recently_added"
                        ? "text-sp-bg-base"
                        : "text-white"
                }" data-sort="recently_added">
                    <span>Recently Added</span>
                    ${currentSort === "recently_added" ? CHECK_ICON : ""}
                </button>

                <button class="sidebar__sort-option w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded hover:bg-[#3e3e3e] cursor-pointer transition-colors ${
                    currentSort === "alphabetical"
                        ? "text-sp-bg-base"
                        : "text-white"
                }" data-sort="alphabetical">
                    <span>Alphabetical</span>
                    ${currentSort === "alphabetical" ? CHECK_ICON : ""}
                </button>

                <button class="sidebar__sort-option w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded hover:bg-[#3e3e3e] cursor-pointer transition-colors ${
                    currentSort === "creator" ? "text-sp-bg-base" : "text-white"
                }" data-sort="creator">
                    <span>Creator</span>
                    ${currentSort === "creator" ? CHECK_ICON : ""}
                </button>
            </div>

            <!-- Divider -->
            <div class="border-t border-white/10 my-1.5"></div>

            <!-- Section 2: View as -->
            <div class="text-[11px] font-bold text-sp-text-subdued px-3 pt-1 pb-1 tracking-wider select-none">
                View as
            </div>

            <div class="flex items-center justify-between px-1 py-1 gap-1">
                <button class="sidebar__view-option flex-1 flex items-center justify-center p-2 rounded cursor-pointer transition-colors ${
                    currentView === "compact_list"
                        ? "bg-[#3e3e3e] text-sp-bg-base"
                        : "text-sp-text-subdued hover:text-white hover:bg-[#333]"
                }" data-view="compact_list" data-tooltip="Compact list">
                    ${VIEW_ICONS.compact_list}
                </button>

                <button class="sidebar__view-option flex-1 flex items-center justify-center p-2 rounded cursor-pointer transition-colors ${
                    currentView === "default_list"
                        ? "bg-[#3e3e3e] text-sp-bg-base"
                        : "text-sp-text-subdued hover:text-white hover:bg-[#333]"
                }" data-view="default_list" data-tooltip="Default list">
                    ${VIEW_ICONS.default_list}
                </button>

                <button class="sidebar__view-option flex-1 flex items-center justify-center p-2 rounded cursor-pointer transition-colors ${
                    currentView === "compact_grid"
                        ? "bg-[#3e3e3e] text-sp-bg-base"
                        : "text-sp-text-subdued hover:text-white hover:bg-[#333]"
                }" data-view="compact_grid" data-tooltip="Compact grid">
                    ${VIEW_ICONS.compact_grid}
                </button>

                <button class="sidebar__view-option flex-1 flex items-center justify-center p-2 rounded cursor-pointer transition-colors ${
                    currentView === "default_grid"
                        ? "bg-[#3e3e3e] text-sp-bg-base"
                        : "text-sp-text-subdued hover:text-white hover:bg-[#333]"
                }" data-view="default_grid" data-tooltip="Default grid">
                    ${VIEW_ICONS.default_grid}
                </button>
            </div>
        `;

        // Gắn sự kiện chọn kiểu sắp xếp (Sort by)
        sortMenu.querySelectorAll(".sidebar__sort-option").forEach((opt) => {
            opt.onclick = (e) => {
                e.stopPropagation();
                const sortKey = opt.dataset.sort;
                currentSort = sortKey;
                updateTriggerUI();
                renderMenuHTML();
                if (onSortChange) onSortChange(currentSort);
            };
        });

        // Gắn sự kiện chọn chế độ xem (View as)
        sortMenu.querySelectorAll(".sidebar__view-option").forEach((opt) => {
            opt.onclick = (e) => {
                e.stopPropagation();
                const viewKey = opt.dataset.view;
                currentView = viewKey;
                updateTriggerUI();
                renderMenuHTML();
                if (onViewChange) onViewChange(currentView);
            };
        });
    };

    const openMenu = () => {
        renderMenuHTML();
        sortMenu.classList.remove("hidden");
    };

    const closeMenu = () => {
        sortMenu.classList.add("hidden");
    };

    // Toggle menu khi click nút trigger
    recentsBtn.onclick = (e) => {
        e.stopPropagation();
        const isHidden = sortMenu.classList.contains("hidden");
        if (isHidden) {
            openMenu();
        } else {
            closeMenu();
        }
    };

    // Đóng khi click ngoài
    document.addEventListener("click", (e) => {
        if (sortWrapper && !sortWrapper.contains(e.target)) {
            closeMenu();
        }
    });

    // Đóng khi ấn Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeMenu();
        }
    });

    updateTriggerUI();
};
