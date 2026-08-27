import { fetchData } from "../../services/spotifyAPI.js";
import { navigateTo } from "../../utils/router.js";

let searchTimer = null;

// ============================================
// GỢI Ý TÌM KIẾM (TRENDING SEARCHES KHI FOCUS)
// ============================================
const renderTrendingSearches = async (container, searchInput, clearBtn) => {
    try {
        container.classList.remove("hidden");
        container.innerHTML = `
            <div class="py-6 text-center text-sp-text-subdued text-sm animate-pulse">
                Loading trending searches...
            </div>
        `;

        const res = await fetchData.get("/search/trending?limit=10");
        const trendingList = res?.trending_searches ?? [];

        if (!trendingList.length) {
            container.innerHTML = `
                <div class="py-4 text-center text-sp-text-subdued text-sm">
                    No trending searches available
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="flex flex-col gap-2">
                <p class="text-xs font-bold uppercase text-sp-text-subdued px-2 mb-1">Trending Searches</p>
                <div class="flex flex-col gap-1">
                    ${trendingList
                        .map((item) => {
                            const keyword =
                                typeof item === "string" ? item : "";
                            return `
                                <div class="trending-item flex items-center gap-3 p-2 rounded hover:bg-[#3e3e3e] cursor-pointer transition-colors"
                                    data-keyword="${keyword}">
                                    <div class="w-8 h-8 rounded bg-[#333] flex items-center justify-center shrink-0">
                                        <svg viewBox="0 0 24 24" class="fill-sp-text-subdued w-4 h-4 hover:fill-white transition-colors">
                                            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                                        </svg>
                                    </div>
                                    <span class="text-white font-medium text-sm w-full h-10 flex items-center truncate hover:text-sp-bg-base transition-colors">
                                        ${keyword}
                                    </span>
                                </div>
                            `;
                        })
                        .join("")}
                </div>
            </div>
        `;

        // Click vào gợi ý -> điền vào ô input và thực hiện tìm kiếm
        container.querySelectorAll(".trending-item").forEach((item) => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                const keyword = item.dataset.keyword;
                if (!keyword) return;

                searchInput.value = keyword;
                if (clearBtn) clearBtn.classList.remove("hidden");
                performSearch(keyword, container);
            });
        });
    } catch (error) {
        console.error("Trending searches error:", error);
        container.innerHTML = `
            <div class="py-4 text-center text-sp-text-subdued text-sm">
                Could not load trending searches
            </div>
        `;
    }
};

// ============================================
// TÌM KIẾM KHI NHẬP TỪ KHÓA
// ============================================
const performSearch = async (keyword, container) => {
    try {
        container.classList.remove("hidden");
        container.innerHTML = `
            <div class="py-6 text-center text-sp-text-subdued text-sm animate-pulse">
                Searching for "${keyword}"...
            </div>
        `;

        const res = await fetchData.get(
            `/search?q=${encodeURIComponent(keyword)}&type=all&limit=20&offset=0`,
        );

        const tracks = res?.results?.tracks ?? [];
        const artists = res?.results?.artists ?? [];
        const albums = res?.results?.albums ?? [];
        const playlists = res?.results?.playlists ?? [];

        if (
            !tracks.length &&
            !artists.length &&
            !albums.length &&
            !playlists.length
        ) {
            container.innerHTML = `
                <div class="py-6 text-center text-sp-text-subdued text-sm">
                    No results found for "<span class="text-white">${keyword}</span>"
                </div>
            `;
            return;
        }

        const FALLBACK_ICONS = {
            track: `<svg viewBox="0 0 24 24" class="fill-white/30 w-5 h-5"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
            album: `<svg viewBox="0 0 24 24" class="fill-white/30 w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>`,
            playlist: `<svg viewBox="0 0 24 24" class="fill-white/30 w-5 h-5"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/></svg>`,
        };

        function renderSearchSection(label, items, getConfig) {
            if (!items.length) return "";

            return `
                <div>
                    <p class="text-xs font-bold uppercase text-sp-text-subdued px-2 mb-1">${label}</p>
                    <div class="flex flex-col gap-1">
                        ${items
                            .map((item) => {
                                const {
                                    url,
                                    imageUrl,
                                    title,
                                    subtitle,
                                    rounded,
                                    fallbackIcon,
                                } = getConfig(item);
                                return `
                                    <div class="search-item flex items-center gap-3 p-2 rounded hover:bg-[#3e3e3e] cursor-pointer transition-colors"
                                        data-url="${url}">
                                        <div class="w-10 h-10 ${rounded ? "rounded-full" : "rounded"} bg-[#333] shrink-0 overflow-hidden flex items-center justify-center">
                                            ${
                                                imageUrl
                                                    ? `<img src="${imageUrl}" class="w-full h-full object-cover" />`
                                                    : fallbackIcon
                                            }
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-white font-semibold text-sm truncate">${title}</p>
                                            <p class="text-sp-text-subdued text-xs truncate">${subtitle}</p>
                                        </div>
                                    </div>
                                `;
                            })
                            .join("")}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="flex flex-col gap-3">
                ${renderSearchSection("Songs", tracks, (t) => ({
                    url: `/track?id=${t.id}`,
                    imageUrl: t.image_url || t.album_cover_image_url,
                    title: t.title,
                    subtitle: t.artist_name || "Song",
                    rounded: false,
                    fallbackIcon: FALLBACK_ICONS.track,
                }))}

                ${renderSearchSection("Artists", artists, (a) => ({
                    url: `/artist?id=${a.id}`,
                    imageUrl: a.image_url,
                    title: a.title,
                    subtitle: "Artist",
                    rounded: true,
                    fallbackIcon: `<span class="font-bold text-sm text-sp-text-subdued">${a.title?.charAt(0) ?? "A"}</span>`,
                }))}

                ${renderSearchSection("Albums", albums, (al) => ({
                    url: `/album?id=${al.id}`,
                    imageUrl: al.cover_image_url || al.image_url || al.artist_image_url,
                    title: al.title,
                    subtitle: al.artist_name || "Album",
                    rounded: false,
                    fallbackIcon: FALLBACK_ICONS.album,
                }))}

                ${renderSearchSection("Playlists", playlists, (p) => ({
                    url: `/playlist?id=${p.id}`,
                    imageUrl: p.image_url,
                    title: p.title,
                    subtitle: p.user_display_name || p.user_username || "Playlist",
                    rounded: false,
                    fallbackIcon: FALLBACK_ICONS.playlist,
                }))}
            </div>
        `;

        // Click vào kết quả chuyển trang và ẩn dropdown
        container.querySelectorAll(".search-item").forEach((item) => {
            item.addEventListener("click", () => {
                const url = item.dataset.url;
                if (url) {
                    navigateTo(url);
                    container.classList.add("hidden");
                }
            });
        });
    } catch (error) {
        console.error("Search error:", error);
        container.innerHTML = `
            <div class="py-4 text-center text-red-400 text-sm">
                Error while searching. Try again.
            </div>
        `;
    }
};

export const initHeaderSearch = () => {
    const searchInput = document.querySelector("#search-input");
    const searchDropdown = document.querySelector("#search-dropdown");
    const clearBtn = document.querySelector("#search-clear-btn");
    const wrapper = document.querySelector("#header-search-wrapper");

    if (!searchInput || !searchDropdown) return;

    // Đóng dropdown
    const closeDropdown = () => {
        searchDropdown.classList.add("hidden");
    };

    // Mở dropdown
    const openDropdown = () => {
        searchDropdown.classList.remove("hidden");
    };

    // Focus vào ô search
    searchInput.addEventListener("focus", () => {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            // Chưa nhập gì -> Hiển thị danh sách gợi ý trending
            renderTrendingSearches(searchDropdown, searchInput, clearBtn);
        } else {
            // Đã có từ khóa -> Mở lại kết quả tìm kiếm
            openDropdown();
        }
    });

    // Lắng nghe khi gõ vào ô tìm kiếm
    searchInput.addEventListener("input", (e) => {
        const keyword = e.target.value.trim();

        // Hiện / ẩn nút xóa nhanh
        if (clearBtn) {
            clearBtn.classList.toggle("hidden", keyword.length === 0);
        }

        clearTimeout(searchTimer);

        if (!keyword) {
            // Nếu xóa hết chữ -> quay lại hiển thị gợi ý trending
            renderTrendingSearches(searchDropdown, searchInput, clearBtn);
            return;
        }

        // Hiện trạng thái đang tìm kiếm
        openDropdown();
        searchDropdown.innerHTML = `
            <div class="py-6 text-center text-sp-text-subdued text-sm animate-pulse">
                Searching for "${keyword}"...
            </div>
        `;

        // Debounce 500ms trước khi gọi API tìm kiếm
        searchTimer = setTimeout(async () => {
            await performSearch(keyword, searchDropdown);
        }, 500);
    });

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            searchInput.value = "";
            clearBtn.classList.add("hidden");
            searchInput.focus();
            renderTrendingSearches(searchDropdown, searchInput, clearBtn);
        });
    }

    // Đóng dropdown khi click ra ngoài hoặc bấm phím Esc
    document.addEventListener("click", (e) => {
        if (wrapper && !wrapper.contains(e.target)) {
            closeDropdown();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDropdown();
    });
};
