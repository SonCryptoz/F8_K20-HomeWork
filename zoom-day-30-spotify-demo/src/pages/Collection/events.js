import { renderCollectionPage } from "./render.js";
import { getCurrentUser } from "../../services/auth.js";
import { attachTrackLikePopup } from "../../components/popup.js";

// ============================================
// KHỞI TẠO CÁC SỰ KIỆN CHO TRANG COLLECTION (Liked Songs)
// ============================================
export const initCollectionPage = (user) => {
    // Icon Play/Pause dùng cho nút to đầu trang
    const BIG_PLAY_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px; margin-left: 2px;"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/></svg>`;
    const BIG_PAUSE_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px;"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

    const playBtn = document.querySelector("#collection-play-btn"); // Nút Play to (phát toàn bộ Liked Songs)
    const shuffleBtn = document.querySelector("#collection-shuffle-btn"); // Nút bật/tắt shuffle

    // Chỉ xử lý nếu trang có nút Play hoặc Shuffle
    if (playBtn || shuffleBtn) {
        // Hàm đồng bộ UI với trạng thái player, gọi lại mỗi khi có event "player-state-changed"
        const updateUI = () => {
            // --- Cập nhật icon nút Play to ---
            if (playBtn) {
                // Trang Collection không có id riêng (albumId/artistId) để so sánh
                // -> dùng playlistId đặc biệt "liked_songs" để đánh dấu "đang phát danh sách Liked Songs"
                const isPlayingLiked =
                    window.player?.queue[window.player.currentIndex]
                        ?.playlistId === "liked_songs";

                if (isPlayingLiked && window.player.isPlaying) {
                    playBtn.innerHTML = BIG_PAUSE_ICON; // Đang phát Liked Songs -> hiện Pause
                    playBtn.dataset.tooltip = "Pause";
                } else {
                    playBtn.innerHTML = BIG_PLAY_ICON; // Không phát hoặc đang phát playlist khác -> hiện Play
                    playBtn.dataset.tooltip = "Play";
                }
            }

            // --- Cập nhật nút Shuffle ---
            if (shuffleBtn && window.player) {
                if (window.player.isShuffle) {
                    shuffleBtn.classList.add("text-sp-bg-base");
                    shuffleBtn.classList.remove("text-sp-text-subdued");
                    shuffleBtn.dataset.tooltip = "Disable shuffle";
                } else {
                    shuffleBtn.classList.remove("text-sp-bg-base");
                    shuffleBtn.classList.add("text-sp-text-subdued");
                    shuffleBtn.dataset.tooltip = "Enable shuffle";
                }
            }

            // --- Cập nhật từng dòng bài hát trong danh sách Liked Songs ---
            if (window.player) {
                const activeTrackId =
                    window.player.queue[window.player.currentIndex]?.id;
                const isPlaying = window.player.isPlaying;
                const EQUALIZER_SVG = `<img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" style="width: 14px; height: 14px;" />`; // GIF hiệu ứng khi đang phát
                const ROW_PLAY_ICON = `<svg viewBox="0 0 24 24" class="fill-current w-4 h-4"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/></svg>`;
                const ROW_PAUSE_ICON = `<svg viewBox="0 0 24 24" class="fill-current w-4 h-4"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

                try {
                    // Duyệt qua từng dòng track trong danh sách Liked Songs
                    document
                        .querySelectorAll(".collection-track-item")
                        .forEach((item, index) => {
                            const trackId = item.dataset.trackId;
                            const indexDiv = item.children[0]; // Ô số thứ tự / equalizer
                            const playBtnRow = item.children[1]; // Nút play riêng của dòng
                            const titleLink = item.querySelector("a"); // Link tên bài hát

                            if (!titleLink) return; // Bỏ qua nếu DOM không đúng cấu trúc

                            // Reset về trạng thái mặc định trước khi xét active
                            titleLink.classList.remove("text-[#1ed760]");
                            titleLink.classList.add("text-white");
                            indexDiv.innerHTML = index + 1;
                            indexDiv.classList.remove("text-[#1ed760]");
                            indexDiv.classList.add("text-sp-text-subdued");
                            playBtnRow.innerHTML = ROW_PLAY_ICON;

                            // Lưu ý: khác với trang Album/Artist, ở đây chỉ so sánh trackId, KHÔNG kiểm tra playlistId
                            // -> nếu 1 bài hát đang phát từ playlist khác nhưng trùng trackId, dòng này vẫn bị tô active nhầm
                            if (trackId == activeTrackId) {
                                titleLink.classList.remove("text-white");
                                titleLink.classList.add("text-[#1ed760]");

                                if (isPlaying) {
                                    // Đang phát -> hiện equalizer + nút Pause
                                    indexDiv.innerHTML = EQUALIZER_SVG;
                                    playBtnRow.innerHTML = ROW_PAUSE_ICON;
                                } else {
                                    // Đang pause -> giữ số thứ tự nhưng tô xanh, nút Play
                                    indexDiv.classList.add("text-[#1ed760]");
                                    indexDiv.classList.remove(
                                        "text-sp-text-subdued",
                                    );
                                    playBtnRow.innerHTML = ROW_PLAY_ICON;
                                }
                            }
                        });
                } catch (e) {
                    console.error(e);
                } // Tránh crash UI nếu DOM bất thường
            }
        };

        updateUI(); // Đồng bộ UI ngay khi khởi tạo trang

        // Chống đăng ký trùng listener khi initCollectionPage bị gọi lại nhiều lần
        // (VD: mỗi khi có bài hát mới được like, hàm này sẽ được gọi lại ở cuối file)
        if (window._collectionPlayStateListener) {
            window.removeEventListener(
                "player-state-changed",
                window._collectionPlayStateListener,
            );
        }
        window._collectionPlayStateListener = updateUI;
        window.addEventListener("player-state-changed", updateUI);

        // --- Xử lý click nút Play to ---
        if (playBtn) {
            playBtn.onclick = (e) => {
                e.stopPropagation();
                if (!window.currentTracksData || !window.player) return; // Chưa có dữ liệu Liked Songs thì không làm gì
                const isPlayingLiked =
                    window.player?.queue[window.player.currentIndex]
                        ?.playlistId === "liked_songs";
                if (isPlayingLiked) {
                    // Đang phát Liked Songs -> chỉ toggle play/pause
                    window.player.togglePlay();
                } else {
                    // Chưa phát -> nạp toàn bộ Liked Songs vào queue, gắn nhãn playlistId "liked_songs"
                    window.player.playQueue(
                        window.currentTracksData.map((t) => ({
                            ...t,
                            playlistId: "liked_songs",
                        })),
                    );
                }
            };
        }

        // --- Xử lý click nút Shuffle ---
        if (shuffleBtn) {
            shuffleBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.player) {
                    window.player.toggleShuffle();
                    // Cập nhật UI ngay lập tức, không chờ event player-state-changed
                    if (window.player.isShuffle) {
                        shuffleBtn.classList.add("text-sp-bg-base");
                        shuffleBtn.classList.remove("text-sp-text-subdued");
                        shuffleBtn.dataset.tooltip = "Disable shuffle";
                    } else {
                        shuffleBtn.classList.remove("text-sp-bg-base");
                        shuffleBtn.classList.add("text-sp-text-subdued");
                        shuffleBtn.dataset.tooltip = "Enable shuffle";
                    }
                }
            };
        }
    }

    // ============================================
    // GẮN SỰ KIỆN PLAY CHO TỪNG DÒNG TRACK (không cần chờ nút play to tồn tại)
    // ============================================
    document.querySelectorAll(".collection-track-item").forEach((item) => {
        const playBtnRow = item.children[1]; // Nút play riêng của từng dòng

        // Logic dùng chung cho cả click nút play và double-click cả dòng
        const playLogic = () => {
            if (window.player && window.currentTracksData) {
                const trackId = item.dataset.trackId;
                const currentTrack =
                    window.player.queue[window.player.currentIndex];
                const currentId = currentTrack?.id;
                const currentPlaylistId = currentTrack?.playlistId;

                // Khác với updateUI ở trên: chỗ này kiểm tra CẢ trackId LẪN playlistId
                // -> chỉ toggle play/pause nếu đúng track này VÀ đang phát từ playlist "liked_songs"
                if (
                    currentId == trackId &&
                    currentPlaylistId === "liked_songs"
                ) {
                    window.player.togglePlay();
                } else {
                    // Ngược lại -> tìm vị trí track trong danh sách Liked Songs rồi phát lại từ đó
                    const startIndex = window.currentTracksData.findIndex(
                        (t) => t.id == trackId || t.track_id == trackId,
                    );
                    if (startIndex >= 0) {
                        window.player.playQueue(
                            window.currentTracksData.map((t) => ({
                                ...t,
                                playlistId: "liked_songs",
                            })),
                            startIndex,
                        );
                    }
                }
            }
        };

        // Click vào nút play riêng của dòng
        if (playBtnRow) {
            playBtnRow.onclick = (e) => {
                e.stopPropagation();
                playLogic();
            };
        }

        // Double-click vào cả dòng cũng kích hoạt play
        item.ondblclick = (e) => {
            e.preventDefault();
            // Xóa vùng bôi đen text do double-click gây ra
            const selection = window.getSelection();
            if (selection) selection.removeAllRanges();
            playLogic();
        };
    });

    // Gắn sẵn popup "Add to playlist" & "Like song" cho các nút .track-like-btn
    attachTrackLikePopup(".track-like-btn", {}, user);

    // ============================================
    // TỰ ĐỘNG RENDER LẠI TRANG KHI CÓ BÀI HÁT MỚI ĐƯỢC LIKE (real-time)
    // ============================================
    window.addEventListener("playlist-track-added", async (e) => {
        // Chỉ xử lý nếu sự kiện liên quan tới "liked songs" (không phải playlist thường)
        if (
            e.detail?.type === "liked" ||
            e.detail?.playlistId === "liked_songs"
        ) {
            const pageContent = document.querySelector("#page-content");
            const currentUser = await getCurrentUser(); // Lấy lại user mới nhất (phòng trường hợp session thay đổi)

            // Chỉ render lại nếu user hợp lệ, có khung nội dung, và vẫn đang đứng ở trang /collection
            // (tránh trường hợp user đã chuyển sang trang khác nhưng event vẫn bắn tới)
            if (
                currentUser &&
                pageContent &&
                window.location.pathname === "/collection"
            ) {
                // Lưu lại vị trí cuộn hiện tại để khôi phục sau khi render lại
                const scrollPos = pageContent.scrollTop;

                // Render lại nội dung trang ngầm bên trong #page-content
                // (không dùng router điều hướng để tránh nháy/reload toàn bộ header + sidebar)
                await renderCollectionPage();
                initCollectionPage(currentUser); // Gọi lại chính hàm này để gắn lại toàn bộ event cho DOM mới vừa render

                // Khôi phục vị trí cuộn như cũ, tránh giật trang lên đầu sau khi có bài mới
                pageContent.scrollTop = scrollPos;
            }
        }
    });
};