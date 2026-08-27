export const Sidebar = () => {
    return `
        <aside class="sidebar shrink-0 hidden md:flex flex-col overflow-hidden md:w-18 md:min-w-18 lg:w-105 lg:min-w-105">
            
            <!-- HEADER: Thư viện + Nút Tạo Playlist -->
            <div class="sidebar__header mb-2 flex items-center justify-between md:justify-center lg:justify-between" style="padding: 16px 16px 8px 16px;">
                <!-- Library Title -->
                <button class="sidebar__title hidden lg:flex items-center gap-3 text-white transition-colors">
                    <span class="font-bold text-white text-base">Your Library</span>
                </button>

                <!-- Create Button -->
                <button class="sidebar__create-btn group flex items-center gap-2 text-sp-text-subdued cursor-pointer bg-[#1f1f1f] rounded-full transition-all hover:scale-105 md:p-2 lg:py-2 lg:px-4" id="create-playlist-btn" data-tooltip="Create playlist">
                    <svg viewBox="0 0 16 16" class="fill-current group-hover:text-white transition-all" style="width: 16px; height: 16px;">
                        <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/>
                    </svg>
                    <span class="font-bold text-white text-sm hidden lg:inline">Create</span>
                </button>
            </div>

            <!-- FILTER PILLS: Playlists / Artists / Albums -->
            <div class="sidebar__filters hidden lg:flex items-center gap-2 px-4 mb-2" id="sidebar-filters-container">
            </div>

            <!-- SEARCH & RECENTS SUB-BAR -->
            <div class="sidebar__sub-bar hidden lg:flex items-center justify-between px-4 mb-2 h-9" id="sidebar-sub-bar">
                <!-- Search Container -->
                <div class="relative flex items-center" id="sidebar-search-container">
                    <!-- Icon Search Button (khi đóng) -->
                    <button id="sidebar-search-toggle-btn" class="w-8 h-8 rounded-full flex items-center justify-center text-sp-text-subdued hover:text-white hover:bg-sp-highlight cursor-pointer transition-colors" data-tooltip="Search in Your Library">
                        <svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M7 1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5zM.25 7a6.75 6.75 0 1 1 12.096 4.12l3.184 3.185a.75.75 0 1 1-1.06 1.06L11.285 12.18A6.75 6.75 0 0 1 .25 7z"/></svg>
                    </button>

                    <!-- Expanded Search Input Box (Animation mở rộng từ trái sang phải) -->
                    <div id="sidebar-search-box" class="hidden items-center bg-sp-search-bg rounded px-2 py-1 gap-2 transition-all duration-300 ease-out origin-left border border-transparent focus-within:border-white/20" style="width: 210px;">
                        <svg viewBox="0 0 16 16" class="fill-sp-text-subdued w-4 h-4 shrink-0"><path d="M7 1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5zM.25 7a6.75 6.75 0 1 1 12.096 4.12l3.184 3.185a.75.75 0 1 1-1.06 1.06L11.285 12.18A6.75 6.75 0 0 1 .25 7z"/></svg>
                        <input type="text" id="sidebar-search-input" class="bg-transparent text-white text-sm outline-none border-none w-full placeholder:text-sp-text-muted" placeholder="Search in Your Library" autocomplete="off" />
                        <button id="sidebar-search-clear-btn" class="hidden text-sp-text-subdued hover:text-white cursor-pointer shrink-0">
                            <svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M2.47 2.47a.75.75 0 0 1 1.06 0L8 6.94l4.47-4.47a.75.75 0 1 1 1.06 1.06L9.06 8l4.47 4.47a.75.75 0 1 1-1.06 1.06L8 9.06l-4.47 4.47a.75.75 0 0 1-1.06-1.06L6.94 8 2.47 3.53a.75.75 0 0 1 0-1.06z"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Recents Sort Wrapper with Dropdown Menu -->
                <div class="relative" id="sidebar-sort-wrapper">
                    <button class="flex items-center gap-1.5 text-sp-text-subdued hover:text-white text-sm font-medium cursor-pointer transition-all px-2 py-1 rounded hover:scale-105" id="sidebar-recents-btn">
                        <span id="sidebar-sort-label">Recents</span>
                        <span id="sidebar-view-icon" class="flex items-center">
                            <svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M15 14.5H5V13h10v1.5zm0-5.75H5v-1.5h10v1.5zM15 3H5V1.5h10V3zM3 3H1V1.5h2V3zm0 5.75H1v-1.5h2v1.5zM3 14.5H1V13h2v1.5z"/></svg>
                        </span>
                    </button>

                    <!-- Dropdown Sort Menu -->
                    <div id="sidebar-sort-menu" class="hidden absolute right-0 top-full mt-2 bg-sp-highlight text-white rounded-lg shadow-2xl p-1.5 z-50 min-w-50 border border-white/5">
                    </div>
                </div>
            </div>

            <!-- CONTENT: Danh sách Library của người dùng -->
            <div class="sidebar__content sidebar__library-list flex-1 overflow-y-auto" style="padding: 0 8px 8px 8px;" id="sidebar-playlists-container">
            </div>
        </aside>
    `;
};
