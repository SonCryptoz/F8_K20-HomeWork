import { renderMyPlaylistPage } from "./render.js";
import { getCurrentUser } from "../../services/auth.js";
import { fetchData } from "../../services/spotifyAPI";
import { getQueryParams, navigateTo } from "../../utils/router";
import { attachTrackLikePopup } from "../../components/popup";
import { showToast } from "../../components/toaster.js";

// SVG Icons cho các nút chức năng (globe: public, lock: private, heart: liked, delete: xóa)
const ICONS = {
    globe: `<svg viewBox="0 0 16 16" class="fill-current" style="width: 20px; height: 20px;"><path d="M8.152 16H8a8 8 0 1 1 .152 0m-.41-14.202c-.226.273-.463.713-.677 1.323-.369 1.055-.626 2.496-.687 4.129h3.547c-.06-1.633-.318-3.074-.687-4.129-.213-.61-.45-1.05-.676-1.323-.194-.235-.326-.285-.385-.296h-.044c-.055.007-.19.052-.391.296M4.877 7.25c.062-1.771.34-3.386.773-4.624q.148-.427.329-.806a6.51 6.51 0 0 0-4.436 5.43zm-3.334 1.5a6.51 6.51 0 0 0 4.436 5.43 8 8 0 0 1-.33-.806c-.433-1.238-.71-2.853-.772-4.624zm4.835 0c.061 1.633.318 3.074.687 4.129.214.61.451 1.05.677 1.323.202.244.336.29.391.297l.044-.001c.06-.01.19-.061.385-.296.226-.273.463-.713.676-1.323.37-1.055.626-2.496.687-4.129zm5.048 0c-.061 1.771-.339 3.386-.772 4.624q-.123.353-.268.674a6.5 6.5 0 0 0 4.071-5.298zm3.031-1.5a6.51 6.51 0 0 0-4.071-5.298q.145.322.268.674c.433 1.238.711 2.853.772 4.624z"/></svg>`,
    lock: `<svg viewBox="0 0 16 16" class="fill-current" style="width: 20px; height: 20px;"><path d="M4 4a4 4 0 1 1 8 0v3h1.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25v-5.5C1 7.784 1.784 7 2.75 7H4zm1.5 3h5V4a2.5 2.5 0 0 0-5 0zM2.75 8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 32px; height: 32px;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    delete: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 28px; height: 28px;"><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>`,
};

// * Init events cho Playlist page
// ============================================
// KHỞI TẠO CÁC SỰ KIỆN CHO TRANG MYPLAYLIST (playlist do user tự tạo, có thể chỉnh sửa/xóa)
// ============================================
export const initMyPlaylistPage = (user) => {
    const playlistId = getQueryParams().id;
    if (!playlistId) return; // Không có id trên URL thì không init gì cả

    // --- Lấy các phần tử DOM cho Modal chỉnh sửa playlist (đổi tên, ảnh cover, mô tả, public/private) ---
    const modal = document.getElementById("myplaylist-edit-modal");
    const titleEdit = document.getElementById("myplaylist-title-edit"); // Tiêu đề playlist (click vào để mở modal sửa tên)
    const coverEdit = document.getElementById("myplaylist-cover-edit-btn"); // Ảnh cover ngoài trang (click để mở modal đổi ảnh)
    const closeBtn = document.getElementById("myplaylist-edit-close");
    const saveBtn = document.getElementById("myplaylist-modal-save");
    const fileInput = document.getElementById("myplaylist-modal-file-input");
    const imgContainer = document.getElementById(
        "myplaylist-modal-img-container",
    );
    const visibilityBtn = document.getElementById(
        "myplaylist-modal-visibility",
    );
    const publicStatus = document.getElementById("myplaylist-public-status"); // Text hiển thị "Public/Private Playlist" ngoài trang
    const nameInput = document.getElementById("myplaylist-modal-name");
    const nameError = document.getElementById("myplaylist-name-error");

    let currentImageBase64 = null; // Ảnh preview (base64 hoặc URL cuối cùng) để cập nhật UI sau khi save
    let currentImageFile = null; // File ảnh thật sự để upload lên server

    // Validate tên playlist ngay khi gõ: không được để trống
    if (nameInput) {
        nameInput.oninput = (e) => {
            const val = e.target.value.trim();
            if (!val) {
                // Rỗng -> hiện lỗi, viền đỏ, disable nút Save
                if (nameError) nameError.style.display = "flex";
                nameInput.classList.remove(
                    "border-transparent",
                    "focus:border-white/50",
                );
                nameInput.classList.add(
                    "border-[#e91429]",
                    "focus:border-[#e91429]",
                );
                if (saveBtn) {
                    saveBtn.disabled = true;
                    saveBtn.classList.add("opacity-50", "cursor-not-allowed");
                }
            } else {
                // Hợp lệ -> ẩn lỗi, viền bình thường, cho phép Save
                if (nameError) nameError.style.display = "none";
                nameInput.classList.add(
                    "border-transparent",
                    "focus:border-white/50",
                );
                nameInput.classList.remove(
                    "border-[#e91429]",
                    "focus:border-[#e91429]",
                );
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.classList.remove(
                        "opacity-50",
                        "cursor-not-allowed",
                    );
                }
            }
        };
    }

    const descEdit = document.getElementById("playlist-description"); // Mô tả playlist ngoài trang (click để mở modal sửa mô tả)

    // Mở modal chỉnh sửa, "target" xác định nên focus vào phần nào sau khi mở
    // (VD: bấm vào cover -> mở modal + tự động mở file picker; bấm vào tên -> focus ô nhập tên)
    const openModal = (target) => {
        // Đồng bộ lại giá trị input trong modal = giá trị đang hiển thị ngoài trang (tránh hiện dữ liệu cũ từ lần mở trước)
        if (nameInput && titleEdit) {
            nameInput.value = titleEdit.innerText.trim();
            nameInput.dispatchEvent(new Event("input")); // Bắn lại event input để reset trạng thái lỗi/nút save cho đúng
        }
        const descInput = document.getElementById("myplaylist-modal-desc");
        if (descInput && descEdit) {
            descInput.value = descEdit.innerText.trim();
        }

        // Đồng bộ trạng thái nút Public/Private trong modal theo trạng thái hiện tại ngoài trang
        if (visibilityBtn && publicStatus) {
            const isCurrentlyPublic = publicStatus.innerText.includes("Public");
            if (isCurrentlyPublic) {
                visibilityBtn.setAttribute("data-public", "1");
                visibilityBtn.innerHTML = ICONS.lock + " Make private"; // Đang public -> nút hiện hành động chuyển sang private
            } else {
                visibilityBtn.setAttribute("data-public", "0");
                visibilityBtn.innerHTML = ICONS.globe + " Make public";
            }
        }

        modal.hidden = false;
        // Delay nhỏ để đảm bảo modal đã hiện ra trước khi focus/click (tránh lỗi focus khi phần tử chưa kịp render)
        setTimeout(() => {
            if (target === "cover") {
                if (fileInput) fileInput.click(); // Mở modal từ cover -> tự động bật file picker luôn
            } else if (target === "title") {
                const nameInput = document.getElementById(
                    "myplaylist-modal-name",
                );
                if (nameInput) nameInput.focus();
            } else if (target === "desc") {
                const descInput = document.getElementById(
                    "myplaylist-modal-desc",
                );
                if (descInput) descInput.focus();
            }
        }, 50);
    };

    // Đóng modal, reset state ảnh đã chọn (nếu user hủy thì không upload ảnh vừa chọn)
    const closeModal = () => {
        modal.hidden = true;
        currentImageBase64 = null;
        currentImageFile = null;
        // Ghi chú gốc: có thể revert lại ảnh preview về ảnh cũ nhưng để đơn giản thì chỉ cần reset state là đủ,
        // tránh trường hợp lỡ tay upload ảnh đã hủy
    };

    // Gắn sự kiện click để mở modal tương ứng theo từng phần tử ngoài trang
    if (titleEdit) titleEdit.onclick = () => openModal("title");
    if (coverEdit) coverEdit.onclick = () => openModal("cover");
    if (descEdit) {
        descEdit.style.cursor = "pointer";
        descEdit.dataset.tooltip = "Edit details";
        descEdit.onclick = () => openModal("desc");
    }
    if (closeBtn) closeBtn.onclick = closeModal;

    // Click vào vùng ảnh preview trong modal -> mở file picker để chọn ảnh mới
    if (imgContainer) {
        imgContainer.onclick = () => fileInput.click();
    }

    // Xử lý khi user chọn file ảnh mới
    if (fileInput) {
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                currentImageFile = file; // Lưu file thật để upload khi save
                const reader = new FileReader();
                reader.onload = (e) => {
                    const src = e.target.result; // base64 data URL để preview ngay, chưa upload
                    currentImageBase64 = src;
                    // Nếu chưa có thẻ <img> preview thì tạo mới, còn có rồi thì chỉ update src
                    if (!document.getElementById("myplaylist-modal-img")) {
                        imgContainer.innerHTML =
                            `<img src="${src}" alt="Cover" class="w-full h-full object-cover" id="myplaylist-modal-img" />` +
                            imgContainer.innerHTML;
                    } else {
                        document.getElementById("myplaylist-modal-img").src =
                            src;
                    }
                };
                reader.readAsDataURL(file); // Đọc file thành base64 để hiển thị preview tức thì (chưa cần gọi API)
            }
        };
    }

    // Toggle nút Public/Private trong modal (chỉ đổi state cục bộ, chưa gọi API - sẽ gửi lên khi bấm Save)
    if (visibilityBtn) {
        visibilityBtn.onclick = () => {
            const isPublic = visibilityBtn.getAttribute("data-public") === "1";
            if (isPublic) {
                visibilityBtn.setAttribute("data-public", "0");
                visibilityBtn.innerHTML = ICONS.globe + " Make public";
            } else {
                visibilityBtn.setAttribute("data-public", "1");
                visibilityBtn.innerHTML = ICONS.lock + " Make private";
            }
        };
    }

    // --- Xử lý Lưu thay đổi (Save) trong modal ---
    if (saveBtn) {
        saveBtn.onclick = async () => {
            // Khóa nút Save + đổi text "Saving..." để tránh double-submit, ẩn nút Close trong lúc lưu
            const originalText = saveBtn.innerText;
            saveBtn.disabled = true;
            saveBtn.innerText = "Saving...";
            saveBtn.classList.add("opacity-50", "cursor-not-allowed");
            if (closeBtn) closeBtn.style.display = "none";

            const newName = document
                .getElementById("myplaylist-modal-name")
                .value.trim();
            const newDesc = document
                .getElementById("myplaylist-modal-desc")
                .value.trim();
            const newIsPublic =
                visibilityBtn.getAttribute("data-public") === "1";

            const payload = {
                name: newName,
                description: newDesc,
                is_public: newIsPublic ? 1 : 0,
            };

            // Nếu có chọn ảnh cover mới -> upload ảnh TRƯỚC, lấy URL rồi mới gộp vào payload chung
            if (currentImageFile) {
                try {
                    const formData = new FormData();
                    formData.append("cover", currentImageFile);

                    const uploadRes = await fetchData.post(
                        `/upload/playlist/${playlistId}/cover`,
                        formData,
                    );
                    if (uploadRes && uploadRes.file && uploadRes.file.url) {
                        let finalUrl = uploadRes.file.url;
                        // Nếu server trả về URL tương đối (không có http) thì tự ghép thêm base URL của API
                        if (!finalUrl.startsWith("http")) {
                            const baseUrl =
                                import.meta.env.VITE_API_BASE_URL.replace(
                                    "/api",
                                    "",
                                );
                            finalUrl = baseUrl + finalUrl;
                        }
                        payload.image_url = finalUrl;
                        currentImageBase64 = finalUrl; // Dùng URL thật (không phải base64) để cập nhật UI sau khi save

                        // Đánh dấu playlist này có ảnh cover tùy chỉnh (lưu vào localStorage)
                        // -> để nơi khác biết không nên tự động revert ảnh cover về ảnh mặc định khi playlist bị xóa hết bài hát
                        localStorage.setItem("custom_cover_" + playlistId, "1");
                    }
                } catch (err) {
                    // Upload ảnh lỗi -> dừng luôn, không gọi API update thông tin playlist nữa
                    console.error("Upload error:", err);
                    showToast("Failed to upload image", "error");
                    saveBtn.disabled = false;
                    saveBtn.innerText = originalText;
                    saveBtn.classList.remove(
                        "opacity-50",
                        "cursor-not-allowed",
                    );
                    if (closeBtn) closeBtn.style.display = "";
                    return; // Dừng hàm tại đây, không tiếp tục xuống phần update bên dưới
                }
            }

            try {
                // Gọi API cập nhật thông tin playlist (tên, mô tả, public/private, và image_url nếu có upload)
                const res = await fetchData.put(
                    `/playlists/${playlistId}`,
                    payload,
                );

                showToast(res?.message, "success");

                // Cập nhật lại UI ngoài trang ngay, không cần load lại trang
                titleEdit.innerText = newName;
                if (publicStatus)
                    publicStatus.innerText = newIsPublic
                        ? "Public Playlist"
                        : "Private Playlist";

                const descEl = document.getElementById("playlist-description");
                if (descEl) {
                    descEl.innerText = newDesc;
                    // Có mô tả thì hiện, không có thì ẩn hẳn phần tử (tránh khoảng trắng thừa)
                    if (newDesc) {
                        descEl.style.display = "-webkit-box";
                    } else {
                        descEl.style.display = "none";
                    }
                }

                // Bắn event để Sidebar (và các nơi khác đang hiển thị playlist này) cập nhật theo tên/ảnh mới
                window.dispatchEvent(
                    new CustomEvent("playlist-updated", {
                        detail: {
                            playlistId: playlistId,
                            name: newName,
                            // Chỉ gửi image_url nếu thực sự có thay đổi ảnh (currentImageBase64 !== null), tránh ghi đè ảnh cũ bằng undefined
                            image_url:
                                currentImageBase64 !== null
                                    ? currentImageBase64
                                    : undefined,
                        },
                    }),
                );

                // Cập nhật ảnh cover hiển thị ngoài trang chính (không phải trong modal)
                if (currentImageBase64) {
                    if (!document.getElementById("myplaylist-cover-img")) {
                        coverEdit.innerHTML =
                            `<img src="${currentImageBase64}" class="w-full h-full object-cover" id="myplaylist-cover-img" />` +
                            coverEdit.innerHTML;
                    } else {
                        document.getElementById("myplaylist-cover-img").src =
                            currentImageBase64;
                    }
                }

                currentImageBase64 = null;
                currentImageFile = null;

                closeModal();
            } catch (error) {
                console.error(error);
                showToast("Failed to update playlist", "error");
            }

            // Mở khóa lại nút Save dù thành công hay thất bại (trừ trường hợp lỗi upload ảnh đã return sớm ở trên)
            saveBtn.disabled = false;
            saveBtn.innerText = originalText;
            saveBtn.classList.remove("opacity-50", "cursor-not-allowed");
            if (closeBtn) closeBtn.style.display = "";
        };
    }

    // --- Xóa Playlist ---
    const deleteBtn = document.getElementById("myplaylist-delete-btn");
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            // Import động component modal xác nhận (chỉ tải khi cần dùng tới, giảm bundle size ban đầu)
            import("../../components/modal.js").then(
                ({ openModal, closeModal }) => {
                    openModal({
                        title: `Delete from Your Library?`,
                        content: `<p class="text-[14px]">This will delete this playlist from Your Library.</p>`,
                        footer: `
                        <button id="modal-cancel-delete-mypl" class="px-6 py-3 rounded-full cursor-pointer font-bold text-white hover:scale-105 active:scale-95 transition-transform bg-transparent">Cancel</button>
                        <button id="modal-confirm-delete-mypl" class="px-6 py-3 rounded-full cursor-pointer font-bold text-white bg-red-500 hover:scale-105 active:scale-95 transition-transform">Delete</button>
                    `,
                    });
                    document.getElementById(
                        "modal-cancel-delete-mypl",
                    ).onclick = closeModal;
                    document.getElementById(
                        "modal-confirm-delete-mypl",
                    ).onclick = async () => {
                        closeModal();
                        try {
                            await fetchData.delete(`/playlists/${playlistId}`); // Gọi API xóa playlist
                            localStorage.removeItem(
                                "custom_cover_" + playlistId,
                            ); // Dọn luôn flag ảnh cover tùy chỉnh đã lưu trước đó
                            showToast("Playlist deleted", "info");
                            // Bắn event để Sidebar gỡ playlist này ra khỏi danh sách hiển thị
                            window.dispatchEvent(
                                new CustomEvent("playlist-deleted", {
                                    detail: { playlistId },
                                }),
                            );
                            navigateTo("/"); // Xóa xong -> điều hướng về trang chủ vì trang hiện tại không còn tồn tại nữa
                        } catch (error) {
                            console.error(error);
                        }
                    };
                },
            );
        };
    }

    // Gắn sẵn popup "Add to playlist" / "Like song" cho các bài hát trong danh sách
    attachTrackLikePopup(".track-like-btn", {}, user);

    // ============================================
    // NÚT PLAY / SHUFFLE TO CỦA PLAYLIST
    // ============================================
    const playBtn = document.querySelector("#playlist-play-btn");
    const shuffleBtn = document.querySelector("#my-playlist-shuffle-btn");

    if (playBtn || shuffleBtn) {
        // Khai báo lại icon Play/Pause trong scope này (trùng tên với icon global phía trên nhưng không dùng chung)
        const BIG_PLAY_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px; margin-left: 2px;"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/></svg>`;
        const BIG_PAUSE_ICON = `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px;"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;

        // Hàm đồng bộ UI với trạng thái player, dùng playlistId (lấy từ URL, dạng ID thật của playlist) để so sánh
        const updateUI = () => {
            if (playBtn) {
                const isThisPlaylistPlaying =
                    window.player &&
                    window.player.queue[window.player.currentIndex]
                        ?.playlistId === playlistId;
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
            // Cập nhật từng dòng track trong danh sách bài hát của playlist
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

                            // Reset mặc định trước khi xét active (giống 3 trang trước)
                            titleLink.classList.remove("text-[#1ed760]");
                            titleLink.classList.add("text-white");
                            indexDiv.innerHTML = index + 1;
                            indexDiv.classList.remove("text-[#1ed760]");
                            indexDiv.classList.add("text-sp-text-subdued");
                            playBtnRow.innerHTML = ROW_PLAY_ICON;

                            // Lưu ý: giống trang Collection, ở đây CHỈ so trackId, không kiểm tra playlistId
                            // -> nếu bài này đang phát từ playlist/album khác vẫn có thể bị tô active nhầm
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
        // Chống trùng listener khi hàm init được gọi lại (VD sau khi có track được thêm/xóa realtime)
        if (window._myplaylistPlayStateListener) {
            window.removeEventListener(
                "player-state-changed",
                window._myplaylistPlayStateListener,
            );
        }
        window._myplaylistPlayStateListener = updateUI;
        window.addEventListener("player-state-changed", updateUI);

        if (playBtn) {
            playBtn.onclick = (e) => {
                e.stopPropagation();
                if (!window.currentTracksData || !window.player) return;
                const isThisPlaylistPlaying =
                    window.player.queue[window.player.currentIndex]
                        ?.playlistId === playlistId;
                if (isThisPlaylistPlaying) {
                    window.player.togglePlay(); // Playlist này đang active -> chỉ toggle
                } else {
                    // Chưa active -> nạp toàn bộ track hiện tại vào queue, gắn playlistId thật (không phải chuỗi cố định như trang Collection)
                    window.player.playQueue(
                        window.currentTracksData.map((t) => ({
                            ...t,
                            playlistId: playlistId,
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
    const playTracks = document.querySelectorAll(
        "#myplaylist__track__play-btn",
    );
    playTracks.forEach((playTrack) => {
        const trackItem = playTrack.closest(".playlist-track-item");

        // Logic dùng chung cho click nút play và double-click cả dòng
        const playLogic = () => {
            if (trackItem && window.player && window.currentTracksData) {
                const trackId = trackItem.dataset.trackId;
                const currentId =
                    window.player.queue[window.player.currentIndex]?.id;

                // Lưu ý: chỉ so trackId, không check playlistId (giống updateUI ở trên, khác với trang Collection's playLogic)
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
                                playlistId: playlistId,
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
    // XỬ LÝ REALTIME KHI XÓA BÀI HÁT KHỎI PLAYLIST (không cần reload trang)
    // ============================================
    // Chống đăng ký trùng listener (playlist-track-count-change) qua các lần init
    if (window._myPlaylistTrackChangeListener) {
        window.removeEventListener(
            "playlist-track-count-change",
            window._myPlaylistTrackChangeListener,
        );
    }
    window._myPlaylistTrackChangeListener = (e) => {
        const { playlistId: pId, trackId, delta } = e.detail;
        // Chỉ xử lý nếu đúng playlist đang xem VÀ là hành động xóa (delta = -1)
        if (pId === playlistId && delta === -1) {
            const trackRow = document.querySelector(
                `.playlist-track-item[data-track-id="${trackId}"]`,
            );
            if (trackRow) {
                trackRow.remove(); // Xóa dòng track khỏi DOM ngay lập tức, không cần render lại cả trang

                // Đánh lại số thứ tự (index) cho các dòng còn lại sau khi xóa
                const currentRows = document.querySelectorAll(
                    ".playlist-track-item",
                );
                currentRows.forEach((row, idx) => {
                    const indexDiv = row.querySelector(".group-hover\\:hidden");
                    if (indexDiv) indexDiv.textContent = idx + 1;
                });

                // Cập nhật lại số lượng bài hát hiển thị ở phần header (VD "12 songs" -> "11 songs")
                const metaTextSpans = document.querySelectorAll(
                    ".playlist-hero__meta span.text-white\\/60",
                );
                const metaTextSpan = metaTextSpans[metaTextSpans.length - 1]; // Span cuối cùng là span chứa số lượng bài hát
                if (metaTextSpan) {
                    metaTextSpan.innerHTML = metaTextSpan.innerHTML.replace(
                        /\d+ songs/,
                        `${currentRows.length} songs`,
                    );
                }

                // Nếu xóa hết bài hát -> hiện thông báo playlist rỗng thay vì để danh sách trống trơn
                if (currentRows.length === 0) {
                    const listContainer = document.querySelector(
                        ".playlist-tracks-list",
                    );
                    if (listContainer) {
                        listContainer.innerHTML = `<p class="text-sp-text-subdued py-6 text-center">No songs available in this playlist.</p>`;
                    }
                }
            }
        }
    };
    window.addEventListener(
        "playlist-track-count-change",
        window._myPlaylistTrackChangeListener,
    );

    // ============================================
    // XỬ LÝ REALTIME KHI PLAYLIST ĐƯỢC CẬP NHẬT (tên/ảnh cover) TỪ NƠI KHÁC (VD Sidebar)
    // ============================================
    if (window._myPlaylistUpdateListener) {
        window.removeEventListener(
            "playlist-updated",
            window._myPlaylistUpdateListener,
        );
    }
    window._myPlaylistUpdateListener = (e) => {
        const { playlistId: pId, image_url } = e.detail;
        // Chỉ xử lý nếu đúng playlist đang xem và có thông tin ảnh mới gửi kèm
        if (pId === playlistId && image_url !== undefined) {
            // Cập nhật ảnh cover ngoài trang chính
            const coverImgContainer = document.getElementById(
                "myplaylist-cover-edit-btn",
            );
            if (coverImgContainer) {
                // Xóa ảnh/icon cũ trước khi chèn ảnh/icon mới (tránh chồng nhiều thẻ img)
                const existingImg = coverImgContainer.querySelector(
                    "img, svg:not(.fill-white)",
                );
                if (existingImg) existingImg.remove();

                const defaultIcon = `<svg viewBox="0 0 24 24" class="fill-sp-text-subdued w-16 h-16"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/></svg>`;
                // Có image_url thì hiện ảnh, không thì hiện icon mặc định (playlist chưa có cover)
                const imgElement = image_url
                    ? `<img src="${image_url}" alt="Playlist Cover" class="w-full h-full object-cover" id="myplaylist-cover-img" />`
                    : defaultIcon;
                coverImgContainer.insertAdjacentHTML("afterbegin", imgElement);
            }

            // Đồng thời cập nhật luôn ảnh preview trong modal (nếu đang mở/đã từng mở) để nhất quán
            const modalImgContainer = document.getElementById(
                "myplaylist-modal-img-container",
            );
            if (modalImgContainer) {
                const existingImg = modalImgContainer.querySelector(
                    "img, svg:not(.fill-white)",
                );
                if (existingImg) existingImg.remove();

                const defaultIcon = `<svg viewBox="0 0 24 24" class="fill-sp-text-subdued w-14 h-14"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/></svg>`;
                const imgElement = image_url
                    ? `<img src="${image_url}" alt="Cover" class="w-full h-full object-cover" id="myplaylist-modal-img" />`
                    : defaultIcon;
                modalImgContainer.insertAdjacentHTML("afterbegin", imgElement);
            }
        }
    };
    window.addEventListener(
        "playlist-updated",
        window._myPlaylistUpdateListener,
    );
};

// ============================================
// REALTIME: TỰ RENDER LẠI TRANG KHI CÓ BÀI HÁT MỚI ĐƯỢC THÊM VÀO PLAYLIST NÀY
// ============================================
// Đặt NGOÀI hàm initMyPlaylistPage -> chỉ đăng ký DUY NHẤT 1 LẦN khi file được import,
// khác với các listener khác trong bài (được đăng ký lại mỗi lần gọi initMyPlaylistPage)
window.addEventListener("playlist-track-added", async (e) => {
    const searchParams = new URLSearchParams(window.location.search);
    const currentId = searchParams.get("id");
    // Chỉ render lại nếu đang đứng đúng trang /my-playlist VÀ đúng playlist vừa được thêm bài
    if (
        window.location.pathname === "/my-playlist" &&
        e.detail.playlistId === currentId
    ) {
        const user = await getCurrentUser();
        await renderMyPlaylistPage(); // Render lại toàn bộ nội dung trang (khác Collection: không giữ scroll position ở đây)
        initMyPlaylistPage(user); // Gắn lại toàn bộ event cho DOM mới
    }
});