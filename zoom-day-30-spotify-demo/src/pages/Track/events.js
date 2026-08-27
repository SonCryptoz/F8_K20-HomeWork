import { player } from "../../layouts/Player/PlayerManager.js";
import { openContextMenu } from "../../components/contextMenu";
import { loginPage } from "../../services/redirectLogin";
import {
    attachTrackLikePopup,
    PlaylistAPI,
    trackState,
} from "../../components/popup";
import { showToast } from "../../components/toaster";

// * Init events cho Track page
// ============================================
// KHỞI TẠO CÁC SỰ KIỆN CHO TRANG TRACK (trang chi tiết 1 bài hát riêng lẻ)
// ============================================
export const initTrackPage = (user) => {
    // ============================================
    // NÚT PLAY CỦA BÀI HÁT NÀY
    // ============================================
    const playBtn = document.querySelector("#track-play-btn");
    if (playBtn) {
        const BIG_PLAY_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px; margin-left: 2px;"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/></svg>`;
        const BIG_PAUSE_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px;"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

        // Hàm đồng bộ icon nút Play/Pause với trạng thái player thật
        const updateBtn = () => {
            if (!window.currentTrackData) return; // Chưa có dữ liệu track hiện tại thì bỏ qua

            const currentTrackId = player.queue[player.currentIndex]?.id;
            // Check theo cả .id lẫn .track_id vì dữ liệu track có thể dùng tên field khác nhau tùy nguồn (API khác nhau)
            const isCurrentTrack =
                currentTrackId == window.currentTrackData.id ||
                currentTrackId == window.currentTrackData.track_id;

            if (isCurrentTrack && player.isPlaying) {
                playBtn.innerHTML = BIG_PAUSE_ICON; // Bài này đang phát -> hiện Pause
                playBtn.dataset.tooltip = "Pause";
            } else {
                playBtn.innerHTML = BIG_PLAY_ICON; // Không phát hoặc đang phát bài khác -> hiện Play
                playBtn.dataset.tooltip = "Play";
            }
        };

        // Đồng bộ UI ngay khi vào trang
        updateBtn();

        // Chống đăng ký trùng listener khi initTrackPage được gọi lại nhiều lần (pattern giống mọi trang khác)
        if (window._trackPlayStateListener) {
            window.removeEventListener(
                "player-state-changed",
                window._trackPlayStateListener,
            );
        }
        window._trackPlayStateListener = updateBtn;
        window.addEventListener("player-state-changed", updateBtn); // Lắng nghe mỗi khi trạng thái player đổi

        playBtn.addEventListener("click", () => {
            if (!window.currentTrackData) return;

            const currentTrackId = player.queue[player.currentIndex]?.id;
            const isCurrentTrack =
                currentTrackId != null &&
                (currentTrackId == window.currentTrackData.id ||
                    currentTrackId == window.currentTrackData.track_id);    

            if (isCurrentTrack) {
                // Đang là bài này -> chỉ toggle play/pause
                player.togglePlay();
            } else {
                // Đang là bài khác hoặc chưa phát gì -> phát bài này từ đầu
                // -> trang Track không nạp cả album/playlist vào queue, chỉ phát đúng 1 bài này
                player.playTrack(window.currentTrackData);
            }
        });
    }

    // Gắn sẵn nút Like (trái tim) cho bài hát, dùng chung component popup như mọi trang khác
    attachTrackLikePopup(".track-like-btn", {}, user);

    // ============================================
    // NÚT "..." (MORE OPTIONS) -> MỞ CONTEXT MENU: THÊM VÀO PLAYLIST / LIKE
    // ============================================
    const moreBtn = document.querySelector("#track-more-btn");
    if (moreBtn) {
        moreBtn.addEventListener("click", async () => {
            if (!user) return loginPage(); // Chưa đăng nhập -> chuyển sang trang login, không mở menu

            const rect = moreBtn.getBoundingClientRect(); // Lấy vị trí nút để định vị context menu ngay bên dưới

            const trackAddBtn = document.querySelector("#track-add-btn");
            if (!trackAddBtn) return; // Không có phần tử chứa data track thì không mở menu được

            const trackId = trackAddBtn.dataset.trackId;
            const trackImageUrl = trackAddBtn.dataset.trackImage;

            // Lấy trạng thái "đã nằm trong playlist nào" từ cache cục bộ (trackState) — không gọi API mỗi lần mở menu
            const cachedSet = trackState.get(trackId);
            // Kiểm tra đã like (Liked Songs) chưa: check cả key cố định "liked_songs" lẫn ID thật của playlist Liked Songs (nếu có)
            // -> vì có thể trackState lưu theo 1 trong 2 dạng tùy thời điểm cache được tạo
            const isServerLiked =
                cachedSet.has("liked_songs") ||
                (PlaylistAPI.likedSongsId &&
                    cachedSet.has(PlaylistAPI.likedSongsId));

            // Gọi API lấy danh sách toàn bộ playlist của user (để hiện trong menu "Add to playlist")
            const playlists = await PlaylistAPI.fetchAll();

            // Tạo danh sách item con cho menu "Add to playlist", loại bỏ riêng playlist Liked Songs (xử lý riêng bên dưới)
            const playlistItems = playlists
                .filter((p) => !p.isLikedSongs)
                .map((pl) => {
                    const isTrackInPlaylist = trackState
                        .get(trackId)
                        .has(pl.id);
                    return {
                        // Nếu bài hát đã có trong playlist này -> tô tên màu xanh + hiện icon dấu check
                        label: isTrackInPlaylist
                            ? `<span style="color: #1ed760">${pl.name}</span>`
                            : pl.name,
                        icon: isTrackInPlaylist
                            ? `<svg viewBox="0 0 16 16" class="fill-sp-bg-base"><path d="M13.707 4.293a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L6 10.086l6.293-6.293a1 1 0 0 1 1.414 0z"/></svg>`
                            : "",
                        // Click vào 1 playlist trong menu -> toggle thêm/xóa bài hát khỏi playlist đó
                        action: async () => {
                            try {
                                if (isTrackInPlaylist) {
                                    // Đã có -> gọi API xóa khỏi playlist
                                    await PlaylistAPI.removeTrack(
                                        pl.id,
                                        trackId,
                                        false,
                                    );
                                    const cached = new Set(
                                        trackState.get(trackId),
                                    );
                                    cached.delete(pl.id);
                                    trackState.update(
                                        trackId,
                                        Array.from(cached),
                                        trackImageUrl,
                                    ); // Cập nhật lại cache cục bộ
                                    showToast(`Removed from ${pl.name}`);
                                } else {
                                    // Chưa có -> gọi API thêm vào playlist
                                    await PlaylistAPI.addTrack(
                                        pl.id,
                                        trackId,
                                        false,
                                    );
                                    const cached = new Set(
                                        trackState.get(trackId),
                                    );
                                    cached.add(pl.id);
                                    trackState.update(
                                        trackId,
                                        Array.from(cached),
                                        trackImageUrl,
                                    );
                                    showToast(`Added to ${pl.name}`, "success");
                                }
                            } catch (err) {
                                showToast("An error occurred", "error");
                                // Lưu ý: không console.error(err), và cũng không rollback lại trạng thái nếu lỗi
                                // (khác với các trang khác luôn có Optimistic UI + rollback khi like/follow lỗi)
                            }
                        },
                    };
                });

            // Mở context menu ngay dưới nút "..."
            openContextMenu({
                x: rect.left,
                y: rect.bottom + 8,
                items: [
                    {
                        icon: `<svg viewBox="0 0 16 16"><path fill="currentColor" d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75"></path></svg>`, // Icon dấu "+"
                        label: "Add to playlist",
                        // Menu con: danh sách playlist để thêm/xóa track; nếu user chưa có playlist nào thì hiện dòng thông báo (không có action)
                        children:
                            playlistItems.length > 0
                                ? playlistItems
                                : [
                                      {
                                          label: "No playlists available",
                                          action: () => {},
                                      },
                                  ],
                    },
                    {
                        icon: `<img src="https://misc.scdn.co/liked-songs/liked-songs-64.jpg" width="16" height="16">`, // Icon ảnh cover mặc định của Liked Songs
                        label: isServerLiked
                            ? "Remove from your Liked Songs"
                            : "Save to your Liked Songs",
                        // Click -> toggle like/unlike bài hát này (xử lý riêng, tách biệt hoàn toàn với logic add/remove playlist thường ở trên)
                        action: async () => {
                            try {
                                if (isServerLiked) {
                                    await PlaylistAPI.removeTrack(
                                        "liked_songs",
                                        trackId,
                                        true,
                                    );
                                    const cached = new Set(
                                        trackState.get(trackId),
                                    );
                                    cached.delete("liked_songs");
                                    // Nếu server có ID thật riêng cho playlist Liked Songs (khác chuỗi cố định) thì xóa luôn cả 2 dạng để đồng bộ cache
                                    if (
                                        PlaylistAPI.likedSongsId &&
                                        PlaylistAPI.likedSongsId !==
                                            "liked_songs"
                                    ) {
                                        cached.delete(PlaylistAPI.likedSongsId);
                                    }
                                    trackState.update(
                                        trackId,
                                        Array.from(cached),
                                    );
                                    showToast("Removed from Liked Songs");
                                } else {
                                    await PlaylistAPI.addTrack(
                                        "liked_songs",
                                        trackId,
                                        true,
                                    );
                                    const cached = new Set(
                                        trackState.get(trackId),
                                    );
                                    cached.add("liked_songs");

                                    // if (
                                    //     PlaylistAPI.likedSongsId &&
                                    //     PlaylistAPI.likedSongsId !==
                                    //         "liked_songs"
                                    // ) {
                                    //     cached.delete(PlaylistAPI.likedSongsId);
                                    // }
                                    trackState.update(
                                        trackId,
                                        Array.from(cached),
                                    );
                                    showToast(
                                        "Added to Liked Songs",
                                        "success",
                                    );
                                }
                            } catch (err) {
                                showToast("An error occurred", "error");
                            }
                        },
                    },
                ],
            });
        });
    }
};
