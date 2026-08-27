import { player } from "../../layouts/Player/PlayerManager.js";
import { fetchData } from "../../services/spotifyAPI.js";
import { showToast } from "../../components/toaster.js";
import { getQueryParams } from "../../utils/router.js";
import { openModal, closeModal } from "../../components/modal";
import { navigateTo } from "../../utils/router";
import { attachTrackLikePopup } from "../../components/popup";
import { loginPage } from "../../services/redirectLogin";

// * Init events cho Playlist page
// ============================================
// KHỞI TẠO CÁC SỰ KIỆN CHO TRANG PLAYLIST (playlist của người khác / playlist follow, không phải MyPlaylist do user tự tạo)
// ============================================
export const initPlaylistPage = (user) => {
    const { id: currentPlaylistId } = getQueryParams(); // Lấy playlistId 1 lần từ URL, dùng chung cho cả file

    // Icon Public/Private dùng cho nút toggle visibility (khác bộ icon globe/lock so với 2 trang trước)
    const ICONS = {
        globe: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 28px; height: 28px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
        lock: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 28px; height: 28px;"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`,
    };

    // ============================================
    // TOGGLE PUBLIC / PRIVATE (chỉ đổi trạng thái hiển thị, khác nút Follow bên dưới)
    // ============================================
    const visibilityBtn = document.querySelector("#playlist-visibility-btn"); // Chỉ hiện với playlist do chính user sở hữu
    if (visibilityBtn) {
        let isFetchingVisibility = false; // Cờ chống double-click gọi API 2 lần
        visibilityBtn.onclick = async () => {
            if (!user) {
                loginPage();
                return;
            }
            if (isFetchingVisibility) return;
            isFetchingVisibility = true;

            const isPublic = visibilityBtn.getAttribute("data-public") === "1";
            const newIsPublic = !isPublic;

            // Optimistic UI: đổi icon, tooltip, và label "Public/Private Playlist" ngay lập tức
            visibilityBtn.setAttribute("data-public", newIsPublic ? "1" : "0");
            visibilityBtn.dataset.tooltip = newIsPublic
                ? "Make private"
                : "Make public";
            visibilityBtn.innerHTML = newIsPublic ? ICONS.globe : ICONS.lock;

            const typeLabel = document.querySelector("#playlist-type");
            if (typeLabel) {
                typeLabel.textContent = newIsPublic
                    ? "Public Playlist"
                    : "Private Playlist";
            }

            try {
                const { id: playlistId } = getQueryParams(); // Lấy lại id (dù đã có currentPlaylistId ở scope ngoài)
                await fetchData.put(`/playlists/${playlistId}`, {
                    is_public: newIsPublic,
                });
                showToast(
                    `Playlist made ${newIsPublic ? "public" : "private"}`,
                    "success",
                );
            } catch (err) {
                // Lỗi -> rollback lại toàn bộ UI (icon, tooltip, label) về trạng thái cũ
                visibilityBtn.setAttribute("data-public", isPublic ? "1" : "0");
                visibilityBtn.dataset.tooltip = isPublic
                    ? "Make private"
                    : "Make public";
                visibilityBtn.innerHTML = isPublic ? ICONS.globe : ICONS.lock;
                if (typeLabel) {
                    typeLabel.textContent = isPublic
                        ? "Public Playlist"
                        : "Private Playlist";
                }
                showToast("Failed to update playlist visibility", "error");
                console.error(err);
            } finally {
                isFetchingVisibility = false;
            }
        };
    }

    const addBtn = document.querySelector("#playlist-add-btn"); // Icon dấu "+" nhỏ để save playlist vào Library (thường ở mini-player hoặc card)
    // Icon riêng cho trạng thái Follow: dấu "+" (chưa follow) và dấu "check" xanh (đã follow)
    const ICONS_FOLLOW = {
        add: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 32px; height: 32px;"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/><path d="M12.75 7.5h-1.5v3.75H7.5v1.5h3.75v3.75h1.5v-3.75h3.75v-1.5h-3.75V7.5z"/></svg>`,
        check: `<svg viewBox="0 0 24 24" class="fill-[#1ed760]" style="width: 32px; height: 32px;"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.808 14.331l-4.521-4.522 1.061-1.06 3.46 3.46 7.46-7.46 1.061 1.06-8.521 8.522z"/></svg>`,
    };

    // ============================================
    // TOGGLE FOLLOW / UNFOLLOW PLAYLIST (tương đương "Like" ở trang Album, "Follow" ở trang Artist)
    // ============================================
    const followBtn = document.querySelector("#playlist-follow-btn"); // Nút "Follow"/"Following" dạng chữ, viền
    let isFetchingFollow = false; // Cờ chống double-click, riêng biệt với isFetchingVisibility ở trên

    // Đồng bộ UI cho CẢ 2 nút: followBtn (dạng text) và addBtn (dạng icon +/check)
    // -> vì cùng 1 trạng thái follow nhưng hiển thị ở 2 nơi khác nhau trên giao diện
    const updatePlaylistFollowUI = (isFollowing) => {
        if (followBtn) {
            followBtn.setAttribute(
                "data-following",
                isFollowing ? "true" : "false",
            );
            followBtn.dataset.tooltip = isFollowing
                ? "Unfollow playlist"
                : "Follow playlist";
            followBtn.textContent = isFollowing ? "Following" : "Follow";
            if (isFollowing) {
                followBtn.classList.remove("border-white/50");
                followBtn.classList.add("border-white"); // Đã follow -> viền đậm hơn
            } else {
                followBtn.classList.add("border-white/50");
                followBtn.classList.remove("border-white");
            }
        }

        if (addBtn) {
            addBtn.innerHTML = isFollowing
                ? ICONS_FOLLOW.check
                : ICONS_FOLLOW.add;
            addBtn.dataset.tooltip = isFollowing
                ? "Remove from Your Library"
                : "Save to Your Library";
            if (isFollowing) {
                addBtn.classList.remove(
                    "text-sp-text-subdued",
                    "hover:text-white",
                );
            } else {
                addBtn.classList.add(
                    "text-sp-text-subdued",
                    "hover:text-white",
                );
            }
        }
    };

    // Xử lý toggle Follow, dùng chung cho cả followBtn và addBtn (2 nút cùng gọi 1 hàm)
    const handleFollowToggle = async () => {
        if (!user) {
            loginPage();
            return;
        }
        if (isFetchingFollow) return;
        isFetchingFollow = true;

        const isFollowing = followBtn
            ? followBtn.getAttribute("data-following") === "true"
            : false;
        const newIsFollowing = !isFollowing;

        // Optimistic UI: đổi cả 2 nút ngay lập tức
        updatePlaylistFollowUI(newIsFollowing);

        try {
            const { id: playlistId } = getQueryParams();

            if (newIsFollowing) {
                await fetchData.post(`/playlists/${playlistId}/follow`);
                showToast("Saved to Your Library", "success");
                // Lấy thông tin playlist trực tiếp từ DOM hiện tại (tên, người tạo, ảnh cover) để bắn kèm vào event
                // -> nơi khác (VD Sidebar) không cần gọi lại API mà vẫn có đủ dữ liệu để hiển thị ngay
                const playlistObj = {
                    id: playlistId,
                    name:
                        document
                            .querySelector("#playlist-name")
                            ?.textContent.trim() || "Playlist",
                    user_display_name:
                        document
                            .querySelector("#playlist-creator")
                            ?.textContent.trim() || "User",
                    image_url:
                        document.querySelector(".playlist-hero__cover img")
                            ?.src || null,
                    is_following: true,
                    type: "playlist",
                    is_pinned: false,
                };
                window.dispatchEvent(
                    new CustomEvent("playlist-followed", {
                        detail: { playlist: playlistObj },
                    }),
                );
            } else {
                await fetchData.delete(`/playlists/${playlistId}/follow`);
                showToast("Removed from Your Library", "info");
                window.dispatchEvent(
                    new CustomEvent("playlist-unfollowed", {
                        detail: { playlistId },
                    }),
                );
            }
        } catch (err) {
            // Lỗi -> rollback UI về trạng thái cũ
            updatePlaylistFollowUI(isFollowing);
            showToast("Failed to update playlist status", "error");
            // Lưu ý: thiếu console.error(err) so với các chỗ catch khác trong cùng file (không log lỗi ra console)
        } finally {
            isFetchingFollow = false;
        }
    };

    if (followBtn) followBtn.onclick = handleFollowToggle;
    if (addBtn) addBtn.onclick = handleFollowToggle; // Cả 2 nút dùng chung 1 handler

    // ============================================
    // NÚT PLAY / SHUFFLE TO CỦA PLAYLIST
    // ============================================
    const playBtn = document.querySelector("#playlist-play-btn");
    const shuffleBtn = document.querySelector("#playlist-shuffle-btn");

    if (playBtn || shuffleBtn) {
        const BIG_PLAY_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px; margin-left: 2px;"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/></svg>`;
        const BIG_PAUSE_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px;"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

        // Hàm đồng bộ UI với trạng thái player, dùng currentPlaylistId (lấy 1 lần ở đầu hàm) để so sánh
        const updateUI = () => {
            if (playBtn) {
                const isThisPlaylistPlaying =
                    window.player &&
                    window.player.queue[window.player.currentIndex]
                        ?.playlistId === currentPlaylistId;
                if (isThisPlaylistPlaying && window.player.isPlaying) {
                    playBtn.innerHTML = BIG_PAUSE_ICON;
                    playBtn.dataset.tooltip = "Pause";
                } else {
                    playBtn.innerHTML = BIG_PLAY_ICON;
                    playBtn.dataset.tooltip = "Play";
                }
            }
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
            // Cập nhật từng dòng track trong danh sách bài hát (giống pattern các trang trước)
            if (window.player) {
                const activeTrackId =
                    window.player.queue[window.player.currentIndex]?.id;
                const isPlaying = window.player.isPlaying;
                const EQUALIZER_SVG = `<img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" style="width: 14px; height: 14px;" />`;
                const ROW_PLAY_ICON = `<svg viewBox="0 0 24 24" class="fill-current w-4 h-4"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/></svg>`;
                const ROW_PAUSE_ICON = `<svg viewBox="0 0 24 24" class="fill-current w-4 h-4"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

                try {
                    document
                        .querySelectorAll(".playlist-track-item")
                        .forEach((item, index) => {
                            const trackId = item.dataset.trackId;
                            const indexDiv = item.children[0];
                            const playBtnRow = item.children[1];
                            const titleLink = item.querySelector("a");

                            if (!titleLink) return;

                            titleLink.classList.remove("text-[#1ed760]");
                            titleLink.classList.add("text-white");
                            indexDiv.innerHTML = index + 1;
                            indexDiv.classList.remove("text-[#1ed760]");
                            indexDiv.classList.add("text-sp-text-subdued");
                            playBtnRow.innerHTML = ROW_PLAY_ICON;

                            // Lưu ý: giống MyPlaylist/Collection, chỉ so trackId — không kiểm tra playlistId
                            if (trackId == activeTrackId) {
                                titleLink.classList.remove("text-white");
                                titleLink.classList.add("text-[#1ed760]");

                                if (isPlaying) {
                                    indexDiv.innerHTML = EQUALIZER_SVG;
                                    playBtnRow.innerHTML = ROW_PAUSE_ICON;
                                } else {
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
                }
            }
        };

        updateUI();
        // Chống trùng listener qua các lần init (giống mọi trang khác trong bộ 5 file)
        if (window._playlistPlayStateListener) {
            window.removeEventListener(
                "player-state-changed",
                window._playlistPlayStateListener,
            );
        }
        window._playlistPlayStateListener = updateUI;
        window.addEventListener("player-state-changed", updateUI);

        if (playBtn) {
            playBtn.onclick = (e) => {
                e.stopPropagation();
                if (!window.currentTracksData || !window.player) return;
                const isThisPlaylistPlaying =
                    window.player.queue[window.player.currentIndex]
                        ?.playlistId === currentPlaylistId;
                if (isThisPlaylistPlaying) {
                    window.player.togglePlay();
                } else {
                    window.player.playQueue(
                        window.currentTracksData.map((t) => ({
                            ...t,
                            playlistId: currentPlaylistId,
                        })),
                    );
                }
            };
        }

        if (shuffleBtn) {
            shuffleBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.player) {
                    window.player.toggleShuffle();
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
    // PHÁT TỪNG BÀI TRONG DANH SÁCH TRACK CỦA PLAYLIST
    // ============================================
    const playTracks = document.querySelectorAll("#playlist__track__play-btn");
    playTracks.forEach((playTrack) => {
        const trackItem = playTrack.closest(".playlist-track-item");

        // Logic dùng chung cho click nút play và double-click cả dòng (pattern giống hệt 3 trang trước)
        const playLogic = () => {
            if (trackItem && window.player && window.currentTracksData) {
                const trackId = trackItem.dataset.trackId;
                const currentId =
                    window.player.queue[window.player.currentIndex]?.id;

                if (currentId == trackId) {
                    window.player.togglePlay();
                } else {
                    const startIndex = window.currentTracksData.findIndex(
                        (t) => t.id == trackId || t.track_id == trackId,
                    );
                    if (startIndex >= 0) {
                        window.player.playQueue(
                            window.currentTracksData.map((t) => ({
                                ...t,
                                playlistId: currentPlaylistId,
                            })),
                            startIndex,
                        );
                    }
                }
            }
        };

        playTrack.onclick = (e) => {
            e.stopPropagation();
            playLogic();
        };

        if (trackItem) {
            trackItem.ondblclick = (e) => {
                e.preventDefault();
                const selection = window.getSelection();
                if (selection) selection.removeAllRanges();
                playLogic();
            };
        }
    });

    // ============================================
    // ĐỒNG BỘ VỚI EVENT TỪ SIDEBAR (follow/unfollow playlist từ nơi khác)
    // ============================================
    window.addEventListener("playlist-followed", (e) => {
        if (
            e.detail.playlist &&
            String(e.detail.playlist.id) === String(currentPlaylistId)
        ) {
            updatePlaylistFollowUI(true);
        } else if (
            e.detail.playlistId &&
            String(e.detail.playlistId) === String(currentPlaylistId)
        ) {
            updatePlaylistFollowUI(true);
        }
    });

    window.addEventListener("playlist-unfollowed", (e) => {
        if (String(e.detail.playlistId) === String(currentPlaylistId)) {
            updatePlaylistFollowUI(false);
        }
    });
    // Lưu ý: 2 listener này KHÔNG có cơ chế gỡ bỏ (remove) trước khi add lại như các trang khác
    // (không dùng window._xxxListener pattern) -> nếu initPlaylistPage được gọi lại nhiều lần
    // sẽ có nguy cơ đăng ký trùng listener, khác với cách làm nhất quán ở các file trước

    // ============================================
    // XÓA PLAYLIST (dùng modal xác nhận qua import tĩnh, không phải import động như MyPlaylist)
    // ============================================
    const deleteBtn = document.querySelector("#playlist-delete-btn"); // Chỉ hiện với playlist do user sở hữu
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            if (!user) {
                loginPage();
                return;
            }

            const playlistName =
                document.querySelector("#playlist-name")?.textContent?.trim() ||
                "Playlist";

            // Mở modal xác nhận xóa, hiện kèm tên playlist
            openModal({
                title: "Delete from Your Library?",
                content: `
                    <p class="text-sm text-sp-text-subdued">
                        This will delete <strong class="text-white">${playlistName}</strong> from Your Library.
                    </p>
                `,
                footer: `
                    <button id="modal-cancel-btn" class="text-white font-bold cursor-pointer hover:scale-105 transition-transform px-4 py-2">
                        Cancel
                    </button>
                    <button id="modal-delete-confirm-btn" class="bg-red-500 text-white cursor-pointer font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
                        Delete
                    </button>
                `,
            });

            const cancelBtn = document.getElementById("modal-cancel-btn");
            const confirmBtn = document.getElementById(
                "modal-delete-confirm-btn",
            );

            if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
            if (confirmBtn) {
                confirmBtn.addEventListener("click", async () => {
                    closeModal();
                    try {
                        const { id: playlistId } = getQueryParams();
                        await fetchData.delete(`/playlists/${playlistId}`);
                        localStorage.removeItem("custom_cover_" + playlistId); // Dọn flag cover tùy chỉnh, dù trang này thường không phải chủ sở hữu tạo cover riêng
                        showToast("Playlist deleted", "info");
                        window.dispatchEvent(
                            new CustomEvent("playlist-deleted", {
                                detail: { playlistId },
                            }),
                        );
                        navigateTo("/"); // Xóa xong -> về trang chủ
                    } catch (err) {
                        showToast("Failed to delete playlist", "error");
                        console.error(err);
                    }
                });
            }
        });
    }

    // Gắn sẵn popup "like bài hát" cho các nút .track-like-btn trong trang
    attachTrackLikePopup(".track-like-btn", {}, user);
};