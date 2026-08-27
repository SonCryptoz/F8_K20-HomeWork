import { loginPage } from "../../services/redirectLogin";
import { attachTrackLikePopup } from "../../components/popup";
import { navigateTo } from "../../utils/router";
import { fetchData } from "../../services/spotifyAPI";
import { showToast } from "../../components/toaster";

// * Init events cho Artist page
// ============================================
// KHỞI TẠO CÁC SỰ KIỆN CHO TRANG ARTIST
// ============================================
export const initArtistPage = (user) => {
    // Icon Play/Pause dùng cho nút to (nút chính của trang artist)
    const BIG_PLAY_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px; margin-left: 2px;"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/></svg>`;
    const BIG_PAUSE_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px;"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

    const playBtn = document.querySelector("#artist-play-btn"); // Nút Play to của trang artist (phát top tracks)
    const shuffleBtn = document.querySelector("#artist-shuffle-btn"); // Nút bật/tắt shuffle

    // Chỉ xử lý nếu trang có nút Play hoặc Shuffle
    if (playBtn || shuffleBtn) {
        // Hàm đồng bộ UI với trạng thái thực tế của player, gọi lại mỗi khi có event "player-state-changed"
        const updateUI = () => {
            // --- Cập nhật icon nút Play to ---
            if (playBtn) {
                const currentArtistId = new URLSearchParams(
                    window.location.search,
                ).get("id"); // Lấy artistId từ URL (đọc trực tiếp mỗi lần update, không cache như albumId ở trang Album)

                // Kiểm tra bài đang phát trong player có phải thuộc artist này không
                const isThisArtistPlaying =
                    window.player &&
                    window.player.queue[window.player.currentIndex]
                        ?.artistId === currentArtistId;

                if (isThisArtistPlaying && window.player.isPlaying) {
                    playBtn.innerHTML = BIG_PAUSE_ICON; // Artist này đang phát -> hiện Pause
                    playBtn.dataset.tooltip = "Pause";
                } else {
                    playBtn.innerHTML = BIG_PLAY_ICON; // Không phát hoặc đang phát artist khác -> hiện Play
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

            // --- Cập nhật danh sách "Popular tracks" (top tracks của artist) ---
            if (window.player) {
                const activeTrackId =
                    window.player.queue[window.player.currentIndex]?.id;
                const isPlaying = window.player.isPlaying;

                const EQUALIZER_SVG = `<img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" style="width: 14px; height: 14px;" />`; // GIF hiệu ứng khi track đang phát
                const ROW_PLAY_ICON = `<svg viewBox="0 0 24 24" class="fill-current w-4 h-4"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/></svg>`;
                const ROW_PAUSE_ICON = `<svg viewBox="0 0 24 24" class="fill-current w-4 h-4"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

                try {
                    // Duyệt từng dòng trong danh sách "Popular" của artist
                    document
                        .querySelectorAll(".popular-item")
                        .forEach((item, index) => {
                            const trackId = item.dataset.trackId;
                            const indexDiv = item.children[0]; // Ô số thứ tự / equalizer
                            const playBtn = item.children[1]; // Nút play riêng của dòng (trùng tên biến playBtn ngoài, nhưng scope riêng trong forEach nên không xung đột)
                            const titleLink = item.querySelector("a"); // Link tên bài hát

                            if (!titleLink) return; // Bỏ qua nếu DOM không đúng cấu trúc

                            // Reset về trạng thái mặc định trước khi xét active
                            titleLink.classList.remove("text-[#1ed760]");
                            titleLink.classList.add("text-white");
                            indexDiv.innerHTML = index + 1;
                            indexDiv.classList.remove("text-[#1ed760]");
                            indexDiv.classList.add("text-sp-text-subdued");
                            playBtn.innerHTML = ROW_PLAY_ICON;

                            if (trackId == activeTrackId) {
                                // Đây là track đang active trong player
                                titleLink.classList.remove("text-white");
                                titleLink.classList.add("text-[#1ed760]");

                                if (isPlaying) {
                                    // Đang phát -> hiện equalizer + nút Pause
                                    indexDiv.innerHTML = EQUALIZER_SVG;
                                    playBtn.innerHTML = ROW_PAUSE_ICON;
                                } else {
                                    // Đang pause -> vẫn giữ số thứ tự nhưng tô xanh, nút Play
                                    indexDiv.classList.add("text-[#1ed760]");
                                    indexDiv.classList.remove(
                                        "text-sp-text-subdued",
                                    );
                                    playBtn.innerHTML = ROW_PLAY_ICON;
                                }
                            }
                        });
                } catch (e) {
                    console.error("Error updating popular items:", e);
                }

                // --- Cập nhật hiệu ứng hover-play cho các card Album/Discography ---
                try {
                    const activeAlbumId =
                        window.player.queue[window.player.currentIndex]
                            ?.albumId;

                    // Duyệt qua từng card album hiển thị trên trang artist (phần "Discography"/"Popular releases")
                    document
                        .querySelectorAll("[data-album-id]")
                        .forEach((card) => {
                            const albumId = card.dataset.albumId;
                            const btnContainer =
                                card.querySelector(".absolute"); // Khối chứa nút play, mặc định ẩn, chỉ hiện khi hover hoặc khi đang phát
                            const playBtn = card.querySelector(
                                "#playlist__play-btn",
                            );
                            if (!btnContainer || !playBtn) return;

                            // Reset về trạng thái ẩn + icon Play mặc định
                            btnContainer.classList.remove(
                                "opacity-100",
                                "translate-y-0",
                            );
                            btnContainer.classList.add("translate-y-2");
                            playBtn.innerHTML = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 22px; height: 22px; margin-left: 2px;"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/></svg>`;

                            // Nếu album này đang phát -> ghim nút play luôn hiển thị (không cần hover) và đổi thành icon Pause
                            if (
                                albumId == activeAlbumId &&
                                window.player.isPlaying
                            ) {
                                btnContainer.classList.remove("translate-y-2");
                                btnContainer.classList.add(
                                    "opacity-100",
                                    "translate-y-0",
                                );
                                playBtn.innerHTML = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 22px; height: 22px;"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;
                            }
                        });
                } catch (e) {} // Nuốt lỗi âm thầm, chỉ để không crash toàn trang nếu cấu trúc card thay đổi
            }
        };

        // Chạy update UI ngay lúc khởi tạo trang
        updateUI();

        // Chống đăng ký trùng listener nếu initArtistPage bị gọi lại nhiều lần (VD điều hướng qua lại giữa các trang)
        if (window._artistPlayStateListener) {
            window.removeEventListener(
                "player-state-changed",
                window._artistPlayStateListener,
            );
        }
        window._artistPlayStateListener = updateUI;
        window.addEventListener("player-state-changed", updateUI); // Lắng nghe mỗi khi trạng thái player thay đổi

        // --- Xử lý click nút Play to ---
        if (playBtn) {
            playBtn.addEventListener("click", () => {
                if (!window.currentTracksData || !window.player) return; // Chưa có dữ liệu top-tracks thì không làm gì

                const currentArtistId = new URLSearchParams(
                    window.location.search,
                ).get("id");
                const isThisArtistPlaying =
                    window.player.queue[window.player.currentIndex]
                        ?.artistId === currentArtistId;

                if (isThisArtistPlaying) {
                    // Artist này đang active -> chỉ toggle play/pause
                    window.player.togglePlay();
                } else {
                    // Chưa active -> nạp toàn bộ top-tracks của artist vào queue và phát từ đầu
                    const artistId = new URLSearchParams(
                        window.location.search,
                    ).get("id");
                    window.player.playQueue(
                        window.currentTracksData.map((t) => ({
                            ...t,
                            artistId,
                        })),
                    ); // Gắn artistId vào từng track để so sánh "artist nào đang phát"
                }
            });
        }

        // --- Xử lý click nút Shuffle ---
        if (shuffleBtn) {
            shuffleBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.player) {
                    window.player.toggleShuffle();
                    // Cập nhật UI ngay lập tức, không chờ event player-state-changed (đề phòng event không bắn kịp)
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
    // XỬ LÝ FOLLOW / UNFOLLOW ARTIST
    // ============================================
    const followArtist = document.querySelector("#artist-follow-btn"); // Nút Follow/Following

    // Cập nhật text + trạng thái data-following của nút Follow
    const updateArtistFollowUI = (isFollowing) => {
        if (followArtist) {
            followArtist.innerText = isFollowing ? "Following" : "Follow";
            followArtist.dataset.following = isFollowing.toString();
        }
    };

    if (followArtist) {
        followArtist.onclick = async () => {
            if (!user) {
                loginPage(); // Chưa đăng nhập -> chuyển sang trang login
                return;
            }

            const isFollowing = followArtist.dataset.following === "true";
            const artistId = followArtist.dataset.artistId;
            const artistName = followArtist.dataset.artistName;
            const artistImage = followArtist.dataset.artistImage;

            const newIsFollowing = !isFollowing;
            // Optimistic UI: đổi giao diện ngay, chưa cần biết API thành công hay chưa
            updateArtistFollowUI(newIsFollowing);

            try {
                if (newIsFollowing) {
                    // Gọi API follow
                    await fetchData.post(`/artists/${artistId}/follow`);
                    showToast("Followed artist", "success");
                    // Bắn event để các UI khác (sidebar...) đồng bộ theo
                    window.dispatchEvent(
                        new CustomEvent("artist-followed", {
                            detail: {
                                artist: {
                                    id: artistId,
                                    name: artistName,
                                    image_url: artistImage,
                                    is_pinned: false,
                                    is_following: true,
                                },
                            },
                        }),
                    );
                } else {
                    // Gọi API unfollow
                    await fetchData.delete(`/artists/${artistId}/follow`);
                    showToast("Unfollowed artist", "info");
                    window.dispatchEvent(
                        new CustomEvent("artist-unfollowed", {
                            detail: { artistId },
                        }),
                    );
                }
            } catch (err) {
                // Lỗi -> rollback UI về trạng thái cũ
                updateArtistFollowUI(isFollowing);
                showToast("An error occurred", "error");
                console.error(err);
            }
            // Lưu ý: không có "isFetching" chống double-click như trang Album (khác biệt nhỏ so với logic Like ở trang Album)
        };
    }

    // Lắng nghe event follow/unfollow bắn từ nơi khác (VD sidebar) để đồng bộ lại nút Follow trên trang này
    window.addEventListener("artist-followed", (e) => {
        if (followArtist) {
            const artistId = followArtist.dataset.artistId;
            if (
                e.detail.artist &&
                String(e.detail.artist.id) === String(artistId)
            ) {
                updateArtistFollowUI(true);
            } else if (
                e.detail.artistId &&
                String(e.detail.artistId) === String(artistId)
            ) {
                updateArtistFollowUI(true);
            }
        }
    });

    window.addEventListener("artist-unfollowed", (e) => {
        if (followArtist) {
            const artistId = followArtist.dataset.artistId;
            if (String(e.detail.artistId) === String(artistId)) {
                updateArtistFollowUI(false);
            }
        }
    });

    // ============================================
    // PHÁT TỪNG BÀI TRONG DANH SÁCH "POPULAR" CỦA ARTIST
    // ============================================
    const playTracks = document.querySelectorAll("#track__play-btn"); // Các nút play nhỏ trên từng dòng track popular
    playTracks.forEach((playTrack) => {
        playTrack.addEventListener("click", (e) => {
            e.stopPropagation(); // Chặn nổi bọt để không kích hoạt sự kiện click của dòng cha (nếu có)
            const trackItem = playTrack.closest(".popular-item");
            if (trackItem && window.player && window.currentTracksData) {
                const trackId = trackItem.dataset.trackId;
                const currentId =
                    window.player.queue[window.player.currentIndex]?.id;

                if (currentId == trackId) {
                    // Track này đang active -> chỉ toggle play/pause
                    window.player.togglePlay();
                } else {
                    // Track khác -> tìm vị trí track trong danh sách top-tracks hiện tại
                    const startIndex = window.currentTracksData.findIndex(
                        (t) => t.id == trackId || t.track_id == trackId,
                    );
                    const artistId = new URLSearchParams(
                        window.location.search,
                    ).get("id");
                    // Nạp lại toàn bộ queue từ top-tracks của artist, phát bắt đầu từ track được chọn
                    // Lưu ý: nếu startIndex = -1 (không tìm thấy) thì fallback về 0 thay vì bỏ qua
                    window.player.playQueue(
                        window.currentTracksData.map((t) => ({
                            ...t,
                            artistId,
                        })),
                        startIndex >= 0 ? startIndex : 0,
                    );
                }
            }
        });
    });

    // Gắn sẵn popup "like bài hát" cho tất cả nút .track-like-btn trong trang (dùng chung component popup)
    attachTrackLikePopup(".track-like-btn", {}, user);

    // ============================================
    // ĐIỀU HƯỚNG SANG TRANG ALBUM KHI CLICK VÀO CARD ALBUM
    // ============================================
    const albums = document.querySelectorAll("[data-album-id]"); // Các card album trong phần Discography/Popular releases
    albums.forEach((item) => {
        item.addEventListener("click", () => {
            const albumId = item.dataset.albumId;
            if (albumId) navigateTo(`/album?id=${albumId}`); // Click vào card (ngoài nút play) -> chuyển sang trang chi tiết Album
        });
    });

    // ============================================
    // PHÁT TOÀN BỘ ALBUM TỪ NÚT PLAY TRÊN CARD (KHÔNG CẦN VÀO TRANG ALBUM)
    // ============================================
    const playAlbums = document.querySelectorAll("#playlist__play-btn"); // Nút play hiện khi hover trên từng card album
    playAlbums.forEach((playAlbum) => {
        playAlbum.onclick = (e) => {
            e.stopPropagation(); // Chặn không cho kích hoạt luôn sự kiện click navigate của card cha ở trên
            const card = playAlbum.closest("[data-album-id]");
            if (card && window.player && window.allTracksData) {
                const albumId = card.dataset.albumId;
                const activeAlbumId =
                    window.player.queue[window.player.currentIndex]?.albumId;

                if (albumId == activeAlbumId) {
                    // Album này đang active -> chỉ toggle play/pause
                    window.player.togglePlay();
                } else {
                    // Lọc ra các track thuộc album này từ danh sách toàn bộ track đã tải (window.allTracksData)
                    // Khác với trang Album/track-popular: ở đây dùng allTracksData (toàn bộ) thay vì currentTracksData (chỉ của 1 danh sách)
                    const albumTracks = window.allTracksData.filter(
                        (t) => t.album_id == albumId || t.albumId == albumId,
                    );
                    if (albumTracks.length > 0) {
                        window.player.playQueue(
                            albumTracks.map((t) => ({ ...t, albumId })),
                        ); // Phát toàn bộ track của album từ đầu
                    }
                }
            }
        };
    });
};