// Map nhãn hiển thị cho các nút Filter
const FILTER_LABELS = {
    playlists: "Playlists",
    artists: "Artists",
    albums: "Albums",
};

export const renderSidebarFilters = ({
    container,
    currentFilter,
    onFilterChange,
}) => {
    if (!container) return;

    if (currentFilter === null) {
        // Trạng thái 1: Chưa chọn bộ lọc nào -> Hiển thị cả 3 nút nền tối
        container.innerHTML = `
            <button class="sidebar__filter-btn bg-sp-search-bg hover:bg-sp-search-hover text-white text-sm font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors" data-filter="playlists">
                Playlists
            </button>
            <button class="sidebar__filter-btn bg-sp-search-bg hover:bg-sp-search-hover text-white text-sm font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors" data-filter="artists">
                Artists
            </button>
            <button class="sidebar__filter-btn bg-sp-search-bg hover:bg-sp-search-hover text-white text-sm font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors" data-filter="albums">
                Albums
            </button>
        `;
    } else {
        // Trạng thái 2: Đang active 1 bộ lọc -> Hiển thị nút [X] tròn và nút filter nền trắng chữ đen
        container.innerHTML = `
            <button class="sidebar__filter-clear-btn w-8 h-8 rounded-full bg-sp-search-bg hover:bg-[#333] flex items-center justify-center text-white/70 hover:text-white cursor-pointer transition-colors shrink-0" data-tooltip="Clear filter" id="sidebar-clear-filter-btn">
                <svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M2.47 2.47a.75.75 0 0 1 1.06 0L8 6.94l4.47-4.47a.75.75 0 1 1 1.06 1.06L9.06 8l4.47 4.47a.75.75 0 1 1-1.06 1.06L8 9.06l-4.47 4.47a.75.75 0 0 1-1.06-1.06L6.94 8 2.47 3.53a.75.75 0 0 1 0-1.06z"/></svg>
            </button>
            <button class="sidebar__filter-btn bg-white text-black text-sm font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-colors" data-filter="${currentFilter}">
                ${FILTER_LABELS[currentFilter] || currentFilter}
            </button>
        `;
    }

    // Gắn sự kiện click cho các nút filter
    container.querySelectorAll(".sidebar__filter-btn").forEach((btn) => {
        btn.onclick = () => {
            const selected = btn.dataset.filter;
            const newFilter = currentFilter === selected ? null : selected;
            onFilterChange(newFilter);
        };
    });

    // Gắn sự kiện cho nút X clear filter
    const clearBtn = container.querySelector("#sidebar-clear-filter-btn");
    if (clearBtn) {
        clearBtn.onclick = () => {
            onFilterChange(null);
        };
    }
};
