import { MobileLibraryOverlay, initMobileLibraryOverlay } from "./MobileLibraryOverlay.js";

/**
 * Bottom Tab Bar – Thanh điều hướng dưới cùng cho mobile (<768px)
 * Chỉ hiện trên mobile, ẩn từ tablet trở lên (md:hidden)
 * Gồm 3 tab: Home / Search / Library
 */

const ICONS = {
    home: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 24px; height: 24px;"><path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33z"/></svg>`,
    search: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 24px; height: 24px;"><path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z"/></svg>`,
    library: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 24px; height: 24px;"><path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"/></svg>`,
};

/**
 * Render HTML cho Bottom Nav + Mobile Library Overlay
 */
export const BottomNav = () => {
    return `
        ${MobileLibraryOverlay()}
        
        <nav id="mobile-bottom-nav" class="fixed bottom-0 left-0 right-0 z-50 bg-linear-to-t from-black via-black/95 to-transparent md:hidden" style="padding-bottom: env(safe-area-inset-bottom, 0px);">
            <div class="flex items-center justify-around px-4 py-2 bg-sp-base/90 backdrop-blur-md border-t border-white/5">
                <!-- Tab Home -->
                <a href="/" data-link id="mobile-tab-home" class="mobile-tab flex flex-col items-center gap-1 py-1 px-3 text-sp-text-subdued hover:text-white transition-colors cursor-pointer">
                    ${ICONS.home}
                    <span class="text-[10px] font-medium">Home</span>
                </a>

                <!-- Tab Search -->
                <button id="mobile-tab-search" class="mobile-tab flex flex-col items-center gap-1 py-1 px-3 text-sp-text-subdued hover:text-white transition-colors cursor-pointer">
                    ${ICONS.search}
                    <span class="text-[10px] font-medium">Search</span>
                </button>

                <!-- Tab Library -->
                <button id="mobile-tab-library" class="mobile-tab flex flex-col items-center gap-1 py-1 px-3 text-sp-text-subdued hover:text-white transition-colors cursor-pointer">
                    ${ICONS.library}
                    <span class="text-[10px] font-medium">Library</span>
                </button>
            </div>
        </nav>
    `;
};

/**
 * Khởi tạo sự kiện cho Bottom Nav
 */
export const initBottomNav = (user) => {
    const tabSearch = document.querySelector("#mobile-tab-search");
    const tabLibrary = document.querySelector("#mobile-tab-library");

    // Tab Search: focus vào search input ở header
    if (tabSearch) {
        tabSearch.onclick = () => {
            const searchInput = document.querySelector("#search-input");
            if (searchInput) {
                searchInput.focus();
                // Scroll lên đầu trang để thấy search bar
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        };
    }

    // Tab Library: mở overlay
    if (tabLibrary) {
        tabLibrary.onclick = () => {
            if (window._mobileLibrary) {
                window._mobileLibrary.open();
            }
        };
    }

    // Khởi tạo overlay
    initMobileLibraryOverlay(user);

    // Highlight active tab dựa trên URL hiện tại
    const updateActiveTab = () => {
        const path = window.location.pathname;
        const tabs = document.querySelectorAll(".mobile-tab");
        tabs.forEach(tab => {
            tab.classList.remove("text-white");
            tab.classList.add("text-sp-text-subdued");
        });

        const homeTab = document.querySelector("#mobile-tab-home");
        if (path === "/" && homeTab) {
            homeTab.classList.add("text-white");
            homeTab.classList.remove("text-sp-text-subdued");
        }
    };

    updateActiveTab();
    window.addEventListener("popstate", updateActiveTab);
    window.addEventListener("locationchange", updateActiveTab);
};
