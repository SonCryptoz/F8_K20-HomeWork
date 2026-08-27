import { renderErrorCard } from "../../components/errorCard";
import { fetchData } from "../../services/spotifyAPI";
import { navigateTo } from "../../utils/router";
import { showToast } from "../../components/toaster.js";

// ============================================
// HÀM HIỂN THỊ THẺ THÔNG TIN (CARD VIEW)
// Hàm này tạo HTML cho các thẻ đại diện cho bài hát, album, nghệ sĩ, hoặc playlist
// ============================================
const renderCard = (item, type) => {
    // Cấu hình ánh xạ dữ liệu (mapping) để lấy đúng trường tiêu đề, hình ảnh và phụ đề tùy theo từng loại (bài hát, album, nghệ sĩ, playlist)
    const config = {
        tracks: {
            title: item.title,
            image: item.image_url,
            subtitle: item.artist_name || "",
        },
        albums: {
            title: item.title,
            image: item.cover_image_url,
            subtitle: item.artist_name || "",
        },
        artists: {
            title: item.name,
            image: item.image_url,
            subtitle: "Artist",
        },
        playlists: {
            title: item.name,
            image: item.image_url,
            subtitle: item.description || item.user_display_name || "",
        },
    };

    const { title, image, subtitle } = config[type] || {};

    return `
        <div class="card cursor-pointer group rounded-lg p-2 sm:p-3 hover:bg-sp-bg-highlight transition-colors min-w-0" data-type="${type}" data-id="${item.id}">
            <!-- Card Image -->
            <div class="card__img-wrapper relative mb-2 sm:mb-3">
                <div class="card__img flex items-center justify-center bg-[#333] w-full aspect-square ${type === "artists" ? "rounded-full" : "rounded-md"} shadow-[0_4px_12px_rgba(0,0,0,0.4)] overflow-hidden">
                    ${
                        image
                            ? `<img src="${image}" alt="${title}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`
                            : ""
                    }
                    <svg viewBox="0 0 24 24" class="fill-white/30 w-7 h-7 sm:w-8 sm:h-8 ${image ? "hidden" : ""}">
                        <path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/>
                    </svg>
                </div>

                <!-- Play Button -->
                <button
                    class="card__play-btn flex bg-sp-bg-base items-center justify-center cursor-pointer hover:scale-105 hover:bg-sp-bg-highlight transition-all absolute bottom-2 right-2 w-9 h-9 sm:w-11 sm:h-11 rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.3)] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                    data-tooltip="Play ${title}"
                >
                    <svg viewBox="0 0 24 24" class="fill-black w-4 h-4 sm:w-5.5 sm:h-5.5">
                        <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path>
                    </svg>
                </button>
            </div>

            <!-- Card Info -->
            <p class="card__name text-white font-bold truncate text-xs sm:text-sm" data-tooltip="${title}">
                ${title}
            </p>

            <p class="card__subtitle text-sp-text-subdued line-clamp-2 text-xs sm:text-[13px] mt-1">
                ${subtitle}
            </p>
        </div>
    `;
};

// ============================================
// HÀM HIỂN THỊ TỪNG PHÂN MỤC (SECTIONS)
// Hàm này bọc các danh sách thẻ (card) thành từng phân mục có tiêu đề và nút cuộn (slider)
// ============================================
const renderSection = (title, cardsHtml, sectionId) => {
    return `
        <section class="section mb-6 sm:mb-8" id="${sectionId}">
            <!-- Header -->
            <div class="section__header flex items-center justify-between mb-3 sm:mb-4">
                <h2 class="section__title text-white font-bold hover:underline cursor-pointer text-lg sm:text-xl lg:text-[22px] truncate">
                    ${title}
                </h2>
            </div>

            <!-- Slider -->
            <div class="section__slider-wrapper relative group/slider">

                <!-- Previous -->
                <button
                    type="button"
                    class="section__slider-btn section__slider-btn--prev hidden sm:flex items-center justify-center absolute z-10 left-1 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-sp-bg-highlight hover:bg-sp-bg-press hover:scale-105 transition-all opacity-0 group-hover/slider:opacity-100"
                    data-section="${sectionId}"
                    aria-label="Previous"
                >
                    <svg viewBox="0 0 24 24" class="fill-white w-4 h-4 lg:w-5 lg:h-5">
                        <path d="M15.5 4.5 8 12l7.5 7.5-1.5 1.5-9-9 9-9z"/>
                    </svg>
                </button>

                <!-- Cards -->
                <div
                    class="cards-slider flex overflow-hidden"
                    data-slider="${sectionId}"
                >
                    ${cardsHtml}
                </div>

                <!-- Next -->
                <button
                    type="button"
                    class="section__slider-btn section__slider-btn--next hidden sm:flex items-center justify-center absolute z-10 right-1 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-sp-bg-highlight hover:bg-sp-bg-press hover:scale-105 transition-all opacity-0 group-hover/slider:opacity-100"
                    data-section="${sectionId}"
                    aria-label="Next"
                >
                    <svg viewBox="0 0 24 24" class="fill-white w-4 h-4 lg:w-5 lg:h-5">
                        <path d="m8.5 4.5 7.5 7.5-7.5 7.5 1.5 1.5 9-9-9-9z"/>
                    </svg>
                </button>
            </div>
        </section>
    `;
};

// ============================================
// XỬ LÝ SỰ KIỆN PHÁT NHẠC (PLAY SONG)
// Gắn sự kiện click cho các nút Play trên từng thẻ để phát bài hát hoặc toàn bộ playlist/album tương ứng
// ============================================
const playSong = () => {
    const playBtns = document.querySelectorAll(".card__play-btn");

    playBtns.forEach((playBtn) => {
        playBtn.onclick = async (e) => {
            e.stopPropagation();
            // Kiểm tra nếu trình phát nhạc chưa được khởi tạo thì dừng xử lý
            if (!window.player) return;
            const card = playBtn.closest(".card");
            if (!card) return;

            const type = card.dataset.type;
            const id = card.dataset.id;

            // Lấy thông tin bài hát hiện tại đang được phát từ hàng đợi (queue) của player
            const currentTrack =
                window.player.queue[window.player.currentIndex];
            let isThisItemPlaying = false;
            if (currentTrack) {
                if (type === "playlists" && currentTrack.playlistId == id)
                    isThisItemPlaying = true;
                else if (type === "albums" && currentTrack.albumId == id)
                    isThisItemPlaying = true;
                else if (type === "artists" && currentTrack.artistId == id)
                    isThisItemPlaying = true;
                else if (type === "tracks" && currentTrack.id == id)
                    isThisItemPlaying = true;
            }

            if (isThisItemPlaying) {
                // Nếu người dùng click vào nút Play của chính mục đang phát, thực hiện Pause/Play tiếp (toggle)
                window.player.togglePlay();
            } else {
                // Nếu click vào một mục khác chưa được phát, tiến hành gọi API để lấy danh sách bài hát của mục đó và đưa vào hàng đợi
                try {
                    let tracks = [];
                    let startIndex = 0;
                    if (type === "playlists") {
                        const res = await fetchData.get(
                            `/playlists/${id}/tracks`,
                        );
                        tracks = (res.tracks || []).map((t) => ({
                            ...t,
                            playlistId: id,
                        }));
                    } else if (type === "albums") {
                        const res = await fetchData.get(
                            "/tracks?offset=0&limit=50",
                        );
                        const allTracks = res.tracks || [];
                        tracks = allTracks
                            .filter((t) => t.album_id == id)
                            .map((t) => ({ ...t, albumId: id }));
                    } else if (type === "artists") {
                        const res = await fetchData.get(
                            "/tracks?offset=0&limit=50",
                        );
                        const allTracks = res.tracks || [];
                        tracks = allTracks
                            .filter((t) => t.artist_id == id)
                            .map((t) => ({ ...t, artistId: id }));
                    } else if (type === "tracks") {
                        const res = await fetchData.get(
                            "/tracks/trending?limit=20",
                        );
                        const trendingTracks = res.tracks || [];
                        tracks = trendingTracks.map((t) => ({ ...t }));
                        startIndex = tracks.findIndex((t) => t.id == id);
                        if (startIndex < 0) startIndex = 0;
                    }

                    if (tracks.length > 0) {
                        window.player.playQueue(tracks, startIndex);
                    } else {
                        showToast("No tracks available", "info");
                    }
                } catch (err) {
                    console.error("Failed to play", err);
                    showToast("Failed to play", "error");
                }
            }
        };
    });
};

// ============================================
// CẬP NHẬT TRẠNG THÁI NÚT CUỘN (SLIDER BUTTONS)
// Ẩn/hiện nút mũi tên trái phải tùy thuộc vào vị trí cuộn hiện tại của danh sách
// ============================================
const updateSliderBtns = (slider, prev, next) => {
    // Tính toán chiều rộng tối đa có thể cuộn được (tổng chiều rộng trừ đi phần đang hiển thị)
    const maxScroll = slider.scrollWidth - slider.clientWidth;

    prev.hidden = slider.scrollLeft <= 0;

    next.hidden = slider.scrollLeft >= maxScroll - 1;

    if (maxScroll < 0) {
        prev.hidden = true;
        next.hidden = true;
    }
};

// ============================================
// KHỞI TẠO CHỨC NĂNG CUỘN (INIT SLIDERS)
// Thiết lập tính năng lướt ngang mượt mà cho các danh sách có quá nhiều phần tử
// ============================================
const initSliders = () => {
    document.querySelectorAll(".section__slider-wrapper").forEach((wrapper) => {
        const slider = wrapper.querySelector(".cards-slider");

        const prev = wrapper.querySelector(".section__slider-btn--prev");
        const next = wrapper.querySelector(".section__slider-btn--next");

        if (!slider || !prev || !next) return;

        const getScrollAmount = () => {
            return slider.clientWidth;
        };

        prev.addEventListener("click", () => {
            slider.scrollBy({
                left: -getScrollAmount(),
                behavior: "smooth",
            });
        });

        next.addEventListener("click", () => {
            slider.scrollBy({
                left: getScrollAmount(),
                behavior: "smooth",
            });
        });

        slider.addEventListener("scroll", () => {
            updateSliderBtns(slider, prev, next);
        });
        updateSliderBtns(slider, prev, next);
    });
};

// ============================================
// XỬ LÝ CHUYỂN TRANG KHI CLICK VÀO THẺ (CARD NAVIGATION)
// Gắn sự kiện ủy quyền (event delegation) để khi bấm vào thẻ sẽ chuyển hướng sang trang chi tiết tương ứng
// ============================================
const initCardNavigation = () => {
    const pageContent = document.querySelector("#page-content");
    if (!pageContent) return;

    pageContent.addEventListener("click", (e) => {
        const card = e.target.closest(".card");
        if (!card) return;

        // Bỏ qua chuyển trang nếu người dùng bấm thẳng vào nút Play màu xanh
        if (e.target.closest(".card__play-btn")) return;

        const type = card.dataset.type;
        const id = card.dataset.id;
        if (!type || !id) return;

        const routes = {
            tracks: "track",
            artists: "artist",
            albums: "album",
            playlists: "playlist",
        };

        const page = routes[type];
        if (!page) return;

        navigateTo(`/${page}?id=${id}`);
    });
};

// ============================================
// KHỞI TẠO GIAO DIỆN CHÍNH (MAIN VIEW)
// Tải dữ liệu từ API và render toàn bộ nội dung của trang chủ vào vùng #page-content
// ============================================
export const renderHomePage = async () => {
    const main = document.querySelector("#page-content");

    if (!main) return;

    // Định nghĩa các loại nội dung sẽ được tải về và hiển thị trên trang chủ
    const type = ["tracks", "artists", "albums", "playlists"];

    const title = [
        "Today's biggest hits",
        "Trending artists",
        "Popular albums",
        "All playlists",
    ];

    const sections = [
        "section-tracks",
        "section-artists",
        "section-albums",
        "section-playlists",
    ];

    try {
        // Gọi song song (parallel) nhiều API cùng lúc để tối ưu thời gian tải trang, sử dụng Promise.allSettled để tránh sập toàn bộ trang nếu có 1 API bị lỗi
        const data = await Promise.allSettled([
            fetchData.get("/tracks/trending?limit=20"),
            fetchData.get("/artists/trending?limit=20"),
            fetchData.get("/albums/popular?limit=20"),
            fetchData.get("/playlists?limit=20&offset=0"),
        ]);

        const sectionData = data.map((d, index) => {
            if (d.status !== "fulfilled") {
                return renderErrorCard(`Can not load ${type[index]}`);
            }

            const items = d.value?.[type[index]] ?? [];

            if (!items.length) {
                return renderErrorCard("Empty data");
            }

            return items.map((item) => renderCard(item, type[index])).join("");
        });

        main.innerHTML = `
            <div
                class="main-view__content p-4 sm:p-6 pb-24 sm:pb-6"
            >
                ${sectionData
                    .map((html, index) =>
                        renderSection(title[index], html, sections[index]),
                    )
                    .join("")}
            </div>
        `;

        playSong();
        initSliders();
    } catch (error) {
        console.log(error.message);

        main.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <p class="text-sp-text-subdued">
                    Something went wrong.
                </p>
            </div>
        `;
    }
};

// ============================================
// ĐỒNG BỘ TRẠNG THÁI PHÁT NHẠC (UPDATE MAIN PLAY STATE)
// Lắng nghe trạng thái của trình phát nhạc để cập nhật giao diện nút Play/Pause trên các thẻ tương ứng
// ============================================
export const updateMainPlayState = () => {
    // Kiểm tra nếu trình phát nhạc chưa được khởi tạo thì dừng xử lý
    if (!window.player) return;
    const currentTrack = window.player.queue[window.player.currentIndex];
    const isPlaying = window.player.isPlaying;

    document.querySelectorAll(".card").forEach((card) => {
        const type = card.dataset.type;
        const id = card.dataset.id;

        let isThisItemPlaying = false;
        if (currentTrack) {
            if (type === "playlists" && currentTrack.playlistId == id)
                isThisItemPlaying = true;
            else if (type === "albums" && currentTrack.albumId == id)
                isThisItemPlaying = true;
            else if (type === "artists" && currentTrack.artistId == id)
                isThisItemPlaying = true;
            else if (type === "tracks" && currentTrack.id == id)
                isThisItemPlaying = true;
        }

        // Lấy phần tử nút Play của thẻ hiện tại để cập nhật icon và tooltip
        const playBtn = card.querySelector(".card__play-btn");
        if (!playBtn) return;

        const PLAY_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 22px; height: 22px;"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path></svg>`;
        const PAUSE_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 22px; height: 22px;"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

        if (isThisItemPlaying) {
            playBtn.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
            const currentTooltip = playBtn.dataset.tooltip || "";
            const titleMatch = currentTooltip.replace(/^(Play|Pause)\s*/, "");
            playBtn.dataset.tooltip = isPlaying
                ? "Pause " + titleMatch
                : "Play " + titleMatch;

            if (isPlaying) {
                playBtn.style.opacity = "1";
                playBtn.style.transform = "translateY(0)";
            } else {
                playBtn.style.opacity = "";
                playBtn.style.transform = "";
            }
        } else {
            playBtn.innerHTML = PLAY_ICON;
            const currentTooltip = playBtn.dataset.tooltip || "";
            const titleMatch = currentTooltip.replace(/^(Play|Pause)\s*/, "");
            playBtn.dataset.tooltip = "Play " + titleMatch;

            playBtn.style.opacity = "";
            playBtn.style.transform = "";
        }
    });
};

// ============================================
// KHỞI TẠO TRANG CHỦ (INIT HOME PAGE)
// Gọi các hàm thiết lập ban đầu và đăng ký các bộ lắng nghe sự kiện cần thiết khi trang chủ vừa được mở
// ============================================
export const initHomePage = () => {
    initCardNavigation();
    if (window._mainPlayStateListener) {
        window.removeEventListener(
            "player-state-changed",
            window._mainPlayStateListener,
        );
    }
    window._mainPlayStateListener = updateMainPlayState;
    window.addEventListener("player-state-changed", updateMainPlayState);
    updateMainPlayState();
};
