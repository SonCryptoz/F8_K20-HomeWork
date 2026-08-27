import { attachTrackLikePopup } from "../../components/popup";
import { loginPage } from "../../services/redirectLogin";
import { fetchData } from "../../services/spotifyAPI";
import { showToast } from "../../components/toaster";
import { getQueryParams } from "../../utils/router";

// ============================================
// KHỞI TẠO CÁC SỰ KIỆN CHO TRANG ALBUM
// ============================================
export const initAlbumPage = (user) => {
    // Icon SVG dùng cho nút Play/Pause to (nút chính của album)
    const BIG_PLAY_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px; margin-left: 2px;"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/></svg>`;
    const BIG_PAUSE_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px;"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

    const playBtn = document.querySelector("#album-play-btn"); // Nút Play/Pause to của cả album
    const shuffleBtn = document.querySelector("#album-shuffle-btn"); // Nút bật/tắt shuffle
    const { id: albumId } = getQueryParams(); // Lấy albumId hiện tại từ URL

    // Chỉ chạy khối logic này nếu trang có ít nhất 1 trong 2 nút Play/Shuffle
    if (playBtn || shuffleBtn) {
        // Hàm đồng bộ giao diện với trạng thái thực tế của player (window.player)
        // Được gọi mỗi khi có sự kiện "player-state-changed" hoặc khi mới load trang
        const updateUI = () => {
            // --- Cập nhật icon nút Play to của album ---
            if (playBtn) {
                // Kiểm tra bài đang phát trong player có thuộc album này không
                const isThisAlbumPlaying =
                    window.player &&
                    window.player.queue[window.player.currentIndex]?.albumId ===
                        albumId;
                if (isThisAlbumPlaying && window.player.isPlaying) {
                    // Album này đang phát -> hiện icon Pause
                    playBtn.innerHTML = BIG_PAUSE_ICON;
                    playBtn.dataset.tooltip = "Pause";
                } else {
                    // Không phát hoặc đang phát album khác -> hiện icon Play
                    playBtn.innerHTML = BIG_PLAY_ICON;
                    playBtn.dataset.tooltip = "Play";
                }
            }

            // --- Cập nhật trạng thái nút Shuffle (đổi màu + tooltip) ---
            if (shuffleBtn && window.player) {
                if (window.player.isShuffle) {
                    shuffleBtn.classList.add("text-sp-bg-base"); // Bật shuffle -> tô màu xanh
                    shuffleBtn.classList.remove("text-sp-text-subdued");
                    shuffleBtn.dataset.tooltip = "Disable shuffle";
                } else {
                    shuffleBtn.classList.remove("text-sp-bg-base"); // Tắt shuffle -> màu xám mặc định
                    shuffleBtn.classList.add("text-sp-text-subdued");
                    shuffleBtn.dataset.tooltip = "Enable shuffle";
                }
            }

            // --- Cập nhật từng dòng bài hát trong danh sách track của album ---
            if (window.player) {
                const activeTrackId =
                    window.player.queue[window.player.currentIndex]?.id; // Track đang active trong queue
                const isPlaying = window.player.isPlaying;
                const EQUALIZER_SVG = `<img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" style="width: 14px; height: 14px;" />`; // GIF hiệu ứng âm thanh khi đang phát
                const ROW_PLAY_ICON = `<svg viewBox="0 0 24 24" class="fill-current w-4 h-4"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/></svg>`;
                const ROW_PAUSE_ICON = `<svg viewBox="0 0 24 24" class="fill-current w-4 h-4"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

                try {
                    // Duyệt qua tất cả dòng bài hát hiển thị trên trang
                    document
                        .querySelectorAll(".album-track-item")
                        .forEach((item, index) => {
                            const trackId = item.dataset.trackId;
                            const indexDiv = item.children[0]; // Ô hiển thị số thứ tự (hoặc equalizer)
                            const playBtnRow = item.children[1]; // Nút play riêng của từng dòng
                            const titleLink = item.querySelector("a"); // Link tên bài hát

                            if (!titleLink) return; // Bỏ qua nếu cấu trúc DOM không đúng như kỳ vọng

                            // Reset về trạng thái mặc định (chưa active) trước khi xét tiếp
                            titleLink.classList.remove("text-[#1ed760]");
                            titleLink.classList.add("text-white");
                            indexDiv.innerHTML = index + 1; // Hiện lại số thứ tự bài hát
                            indexDiv.classList.remove("text-[#1ed760]");
                            indexDiv.classList.add("text-sp-text-subdued");
                            playBtnRow.innerHTML = ROW_PLAY_ICON;

                            // Nếu đây chính là bài đang active trong player thì đổi giao diện
                            if (trackId == activeTrackId) {
                                titleLink.classList.remove("text-white");
                                titleLink.classList.add("text-[#1ed760]"); // Đổi màu tên bài -> xanh Spotify

                                if (isPlaying) {
                                    // Đang phát -> hiện icon equalizer động, nút row = Pause
                                    indexDiv.innerHTML = EQUALIZER_SVG;
                                    playBtnRow.innerHTML = ROW_PAUSE_ICON;
                                } else {
                                    // Đang pause -> vẫn giữ số thứ tự nhưng tô màu xanh, nút row = Play
                                    indexDiv.classList.add("text-[#1ed760]");
                                    indexDiv.classList.remove(
                                        "text-sp-text-subdued",
                                    );
                                    playBtnRow.innerHTML = ROW_PLAY_ICON;
                                }
                            }
                        });
                } catch (e) {
                    console.error(e); // Tránh crash toàn bộ UI nếu DOM bất thường
                }
            }
        };

        updateUI(); // Gọi ngay 1 lần khi khởi tạo trang để đồng bộ giao diện ban đầu

        // Tránh đăng ký trùng listener khi initAlbumPage được gọi lại nhiều lần (VD chuyển trang qua lại)
        if (window._albumPlayStateListener) {
            window.removeEventListener(
                "player-state-changed",
                window._albumPlayStateListener,
            );
        }
        window._albumPlayStateListener = updateUI;
        window.addEventListener("player-state-changed", updateUI); // Lắng nghe mỗi khi player đổi trạng thái (play/pause/chuyển bài...)

        // --- Xử lý click nút Play to của album ---
        if (playBtn) {
            playBtn.onclick = (e) => {
                e.stopPropagation();
                if (!window.currentTracksData || !window.player) return; // Chưa có dữ liệu track thì không làm gì

                const isThisAlbumPlaying =
                    window.player.queue[window.player.currentIndex]?.albumId ===
                    albumId;

                if (isThisAlbumPlaying) {
                    // Album này đang là album active -> chỉ cần toggle play/pause
                    window.player.togglePlay();
                } else {
                    // Album chưa active -> nạp toàn bộ track của album vào queue và phát từ đầu
                    const albumId = new URLSearchParams(
                        window.location.search,
                    ).get("id");
                    window.player.playQueue(
                        window.currentTracksData.map((t) => ({
                            ...t,
                            albumId, // Gắn albumId vào từng track để sau này so sánh "có phải album này đang phát không"
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
                    window.player.toggleShuffle(); // Đảo trạng thái shuffle trong player
                    // Cập nhật UI ngay lập tức (không chờ event player-state-changed)
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
    // XỬ LÝ LIKE / UNLIKE ALBUM
    // ============================================
    const likeBtn = document.querySelector("#album-like-btn"); // Nút trái tim like album
    const saveTrack = document.querySelector("#album-add-btn"); // Nút "Save to Library" (thường đi kèm chức năng tương tự like)

    // Hàm cập nhật giao diện 2 nút like/save theo trạng thái đã like hay chưa
    const updateAlbumButtonsUI = (isLiked) => {
        if (likeBtn) {
            likeBtn.setAttribute("data-liked", isLiked.toString()); // Lưu trạng thái vào data-attribute để đọc lại sau
            likeBtn.dataset.tooltip = isLiked
                ? "Remove from Your Library"
                : "Like this Album";
            if (isLiked) {
                likeBtn.classList.remove(
                    "text-sp-text-subdued",
                    "hover:text-white",
                );
                likeBtn.classList.add("text-sp-bg-base"); // Đã like -> tô màu xanh
            } else {
                likeBtn.classList.remove("text-sp-bg-base");
                likeBtn.classList.add(
                    "text-sp-text-subdued",
                    "hover:text-white",
                ); // Chưa like -> màu xám mặc định
            }
        }

        if (saveTrack) {
            saveTrack.dataset.tooltip = isLiked
                ? "Remove from Your Library"
                : "Save to Your Library";
            if (isLiked) {
                saveTrack.classList.remove(
                    "text-sp-text-subdued",
                    "hover:text-white",
                );
                saveTrack.classList.add("text-sp-bg-base");
            } else {
                saveTrack.classList.remove("text-sp-bg-base");
                saveTrack.classList.add(
                    "text-sp-text-subdued",
                    "hover:text-white",
                );
            }
        }
    };

    let isFetching = false; // Cờ chống spam click trong lúc đang gọi API

    // Xử lý toggle Like/Unlike, dùng kỹ thuật Optimistic UI:
    // -> Cập nhật giao diện ngay lập tức trước khi biết kết quả API,
    //    nếu API lỗi thì rollback lại giao diện như cũ
    const handleLikeToggle = async () => {
        if (!user) {
            loginPage(); // Chưa đăng nhập thì chuyển hướng sang trang login
            return;
        }
        if (isFetching) return; // Đang có request khác chạy thì bỏ qua, tránh double-click gọi 2 lần
        isFetching = true;

        const isLiked = likeBtn
            ? likeBtn.getAttribute("data-liked") === "true"
            : false;
        const newIsLiked = !isLiked; // Trạng thái mới sẽ là đảo ngược trạng thái hiện tại

        // Cập nhật UI ngay (chưa cần biết API có thành công hay không)
        updateAlbumButtonsUI(newIsLiked);

        try {
            if (newIsLiked) {
                // Gọi API thêm album vào thư viện (like)
                await fetchData.post(`/albums/${albumId}/like`);
                showToast("Album added to Your Library", "success");

                // Tạo object thông tin album để bắn event cho các phần khác của app (VD sidebar) cập nhật theo
                const albumObj = {
                    id: albumId,
                    title: likeBtn ? likeBtn.dataset.albumTitle : "Album",
                    artist_name: likeBtn
                        ? likeBtn.dataset.albumArtist
                        : "Artist",
                    image_url: likeBtn ? likeBtn.dataset.albumImage : "",
                    is_pinned: false,
                    is_liked: true,
                };
                window.dispatchEvent(
                    new CustomEvent("album-liked", {
                        detail: { album: albumObj },
                    }),
                );
            } else {
                // Gọi API bỏ like album
                await fetchData.delete(`/albums/${albumId}/like`);
                showToast("Album removed from Your Library", "info");
                window.dispatchEvent(
                    new CustomEvent("album-unliked", { detail: { albumId } }),
                );
            }
        } catch (err) {
            // API lỗi -> rollback UI về trạng thái cũ (trước khi optimistic update)
            updateAlbumButtonsUI(isLiked);
            showToast("An error occurred", "error");
            console.error(err);
        } finally {
            isFetching = false; // Mở khóa để cho phép click tiếp
        }
    };

    // Lắng nghe sự kiện "album-liked" phát ra từ nơi khác (VD: click like ở Sidebar/Context menu)
    // để đồng bộ lại UI của trang Album hiện tại (tránh lệch trạng thái giữa các thành phần UI)
    window.addEventListener("album-liked", (e) => {
        if (e.detail.album && String(e.detail.album.id) === String(albumId)) {
            updateAlbumButtonsUI(true);
        } else if (
            e.detail.albumId &&
            String(e.detail.albumId) === String(albumId)
        ) {
            updateAlbumButtonsUI(true);
        }
    });

    // Tương tự, đồng bộ khi có sự kiện unlike từ nơi khác
    window.addEventListener("album-unliked", (e) => {
        if (String(e.detail.albumId) === String(albumId)) {
            updateAlbumButtonsUI(false);
        }
    });

    // Gắn cùng 1 hàm xử lý cho cả nút Like và nút Save (2 nút có chức năng tương đương nhau)
    if (likeBtn) {
        likeBtn.onclick = handleLikeToggle;
    }
    if (saveTrack) {
        saveTrack.onclick = handleLikeToggle;
    }

    // ============================================
    // XỬ LÝ PLAY TỪNG BÀI HÁT TRONG DANH SÁCH TRACK CỦA ALBUM
    // ============================================
    const playTracks = document.querySelectorAll("#album__track__play-btn"); // Các nút play nhỏ trên từng dòng track
    playTracks.forEach((playTrack) => {
        const trackItem = playTrack.closest(".album-track-item"); // Dòng cha chứa nút play này

        // Logic dùng chung cho cả click nút play và double-click vào cả dòng
        const playLogic = () => {
            if (trackItem && window.player && window.currentTracksData) {
                const trackId = trackItem.dataset.trackId;
                const currentId =
                    window.player.queue[window.player.currentIndex]?.id;

                if (currentId == trackId) {
                    // Bài này đang là bài active trong player -> chỉ cần toggle play/pause
                    window.player.togglePlay();
                } else {
                    // Bài khác -> tìm vị trí bài hát trong danh sách track hiện tại
                    const startIndex = window.currentTracksData.findIndex(
                        (t) => t.id == trackId || t.track_id == trackId,
                    );
                    if (startIndex >= 0) {
                        // Nạp lại toàn bộ queue từ danh sách track của album, nhưng bắt đầu phát từ vị trí bài được chọn
                        const albumId = new URLSearchParams(
                            window.location.search,
                        ).get("id");
                        window.player.playQueue(
                            window.currentTracksData.map((t) => ({
                                ...t,
                                albumId, // Gắn albumId để đồng bộ với logic check "album nào đang phát" ở trên
                            })),
                            startIndex,
                        );
                    }
                }
            }
        };

        // Click vào nút play riêng của dòng -> chạy playLogic, chặn nổi bọt sự kiện lên dòng cha
        playTrack.onclick = (e) => {
            e.stopPropagation();
            playLogic();
        };

        // Double-click vào cả dòng track (không chỉ riêng nút play) cũng kích hoạt play
        if (trackItem) {
            trackItem.ondblclick = (e) => {
                e.preventDefault();
                // Khi double-click thường trình duyệt sẽ bôi đen (select) text -> cần xóa vùng chọn cho đẹp
                const selection = window.getSelection();
                if (selection) selection.removeAllRanges();
                playLogic();
            };
        }
    });

    // Gắn sẵn popup "like bài hát" cho tất cả nút có class .track-like-btn trong trang (dùng chung component popup)
    attachTrackLikePopup(".track-like-btn", {}, user);
};