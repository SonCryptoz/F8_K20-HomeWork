import { showToast } from "../../components/toaster.js";
import { openContextMenu } from "../../components/contextMenu.js";
import { openModal, closeModal } from "../../components/modal.js";
import { fetchData } from "../../services/spotifyAPI.js";
import { navigateTo, getQueryParams } from "../../utils/router.js";

// ============================================
// XỬ LÝ MENU NGỮ CẢNH (RIGHT CLICK CONTEXT MENU) TẠI SIDEBAR
// Hàm này sẽ kiểm tra xem người dùng đang click chuột phải vào nghệ sĩ, album hay playlist
// Từ đó hiển thị các tùy chọn (menu item) tương ứng
// ============================================
export const handleSidebarContextMenu = (e, item) => {
    const itemType = item.dataset.itemType;
    
    // --------------------------------------------------------
    // TRƯỜNG HỢP 1: NGƯỜI DÙNG CLICK CHUỘT PHẢI VÀO NGHỆ SĨ (ARTIST)
    // --------------------------------------------------------
    if (itemType === "artist") {
        e.preventDefault();
        e.stopPropagation();
        const artistId = item.dataset.itemId;
        const isFollowing = item.dataset.isFollowing === "true";
        const isPinned = item.dataset.isPinned === "true";

        openContextMenu({
            x: e.clientX,
            y: e.clientY,
            items: [
                {
                    label: isFollowing ? "Unfollow" : "Follow",
                    icon: isFollowing
                        ? `<svg viewBox="0 0 16 16" class="fill-sp-bg-base"><path d="M2.47 2.47a.75.75 0 0 1 1.06 0L8 6.94l4.47-4.47a.75.75 0 1 1 1.06 1.06L9.06 8l4.47 4.47a.75.75 0 1 1-1.06 1.06L8 9.06l-4.47 4.47a.75.75 0 0 1-1.06-1.06L6.94 8 2.47 3.53a.75.75 0 0 1 0-1.06z"/></svg>`
                        : `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/></svg>`,
                    action: async () => {
                        try {
                            if (isFollowing) {
                                const artistName = item.querySelector(".sidebar__playlist-title")?.innerText || "this artist";
                                openModal({
                                    title: `Unfollow from Your Library?`,
                                    content: `<p class="text-[14px]">This will unfollow <span class="font-bold">${artistName}</span> and remove them from Your Library.</p>`,
                                    footer: `
                                        <button id="modal-cancel-unfollow" class="px-6 py-3 cursor-pointer rounded-full font-bold text-white hover:scale-105 active:scale-95 transition-transform bg-transparent">Cancel</button>
                                        <button id="modal-confirm-unfollow" class="px-6 py-3 cursor-pointer rounded-full font-bold text-white bg-sp-bg-base hover:scale-105 active:scale-95 transition-transform">Unfollow</button>
                                    `
                                });

                                document.getElementById("modal-cancel-unfollow").onclick = closeModal;
                                document.getElementById("modal-confirm-unfollow").onclick = async () => {
                                    closeModal();
                                    try {
                                        const res = await fetchData.delete(
                                            `/artists/${artistId}/follow`,
                                        );
                                        if (res) {
                                            showToast(
                                                "Artist unfollowed",
                                                "info",
                                            );
                                            window.dispatchEvent(
                                                new CustomEvent(
                                                    "artist-unfollowed",
                                                    { detail: { artistId } },
                                                ),
                                            );
                                        }
                                    } catch (error) {
                                        console.error(error);
                                    }
                                };
                            } else {
                                const res = await fetchData.post(
                                    `/artists/${artistId}/follow`,
                                );
                                if (res) {
                                    showToast(
                                        "Artist followed",
                                        "success",
                                    );
                                    const artistObj = {
                                        id: artistId,
                                        name: item.querySelector(".sidebar__playlist-title")?.innerText || "Artist",
                                        image_url: item.querySelector("img")?.src || "",
                                        is_pinned: isPinned,
                                        is_following: true
                                    };
                                    window.dispatchEvent(
                                        new CustomEvent(
                                            "artist-followed",
                                            { detail: { artist: artistObj } },
                                        ),
                                    );
                                }
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    },
                },
                {
                    label: "Don't play this artist",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M3.965 2.904a6.5 6.5 0 0 1 9.131 9.131zm-1.061 1.06 9.131 9.132a6.5 6.5 0 0 1-9.131-9.131z"/></svg>`,
                    action: () => {},
                },
                {
                    label: isPinned
                        ? `<span style="color:#1ed760">Unpin artist</span>`
                        : "Pin artist",
                    icon: isPinned
                        ? `<svg viewBox="0 0 16 16" class="fill-sp-bg-base"><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>`
                        : `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>`,
                    action: () => {
                        window.dispatchEvent(
                            new CustomEvent("artist-toggled-pin", {
                                detail: {
                                    artistId,
                                    isPinned: !isPinned,
                                },
                            }),
                        );
                    },
                },
                { divider: true },
                {
                    label: "Go to artist radio",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M5.624 3.886A4.75 4.75 0 0 0 3.25 8c0 1.758.955 3.293 2.375 4.114l.75-1.3a3.249 3.249 0 0 1 0-5.63l-.75-1.298zm4.001 1.299.75-1.3A4.75 4.75 0 0 1 12.75 8a4.75 4.75 0 0 1-2.375 4.114l-.75-1.3a3.249 3.249 0 0 0 0-5.63zM8 6.545a1.455 1.455 0 1 0 0 2.91 1.455 1.455 0 0 0 0-2.91"></path>
                                <path d="M4 1.07A8 8 0 0 0 0 8a8 8 0 0 0 4 6.93l.75-1.3A6.5 6.5 0 0 1 1.5 8a6.5 6.5 0 0 1 3.25-5.63zm7.25 1.3.75-1.3A8 8 0 0 1 16 8a8 8 0 0 1-3.999 6.93l-.75-1.3A6.5 6.5 0 0 0 14.5 8a6.5 6.5 0 0 0-3.25-5.63"></path>
                            </svg>`,
                    action: () => {},
                },
                {
                    label: "Report",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M4.069.967h7.855L15.98 8l-4.057 7.034H4.069L.01 8zm.866 1.5L1.743 8l3.192 5.534h6.122L14.25 8l-3.192-5.533z"></path>
                                <path d="M7.246 9V4h1.5v5zm0 3.025v-1.5h1.5v1.5z"></path>
                            </svg>`,
                    action: () => {},
                },
                {
                    label: "Share",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M1 5.75A.75.75 0 0 1 1.75 5H4v1.5H2.5v8h11v-8H12V5h2.25a.75.75 0 0 1 .75.75v9.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75z"></path>
                                <path d="M8 9.576a.75.75 0 0 0 .75-.75V2.903l1.454 1.454a.75.75 0 0 0 1.06-1.06L8 .03 4.735 3.296a.75.75 0 0 0 1.06 1.061L7.25 2.903v5.923c0 .414.336.75.75.75"></path>
                            </svg>`,
                    children: [
                        {
                            label: "Copy link to artist",
                            action: () => {
                                showToast(
                                    "Link copied to clipboard",
                                    "success",
                                );
                            },
                        },
                    ],
                },
                { divider: true },
                {
                    label: "Open in Desktop app",
                    icon: `<svg viewBox="0 0 24 24" class="fill-sp-text-subdued"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
                    action: () => {},
                },
            ],
        });
    } else if (
        itemType === "playlist" &&
        item.dataset.likedSongs !== "true"
    ) {
        // --------------------------------------------------------
        // TRƯỜNG HỢP 2: NGƯỜI DÙNG CLICK CHUỘT PHẢI VÀO PLAYLIST (Bỏ qua Liked Songs)
        // --------------------------------------------------------
        e.preventDefault();
        e.stopPropagation();

        const playlistId = item.dataset.itemId;
        const isPinned = item.dataset.isPinned === "true";
        const isFollowing = item.dataset.isFollowing === "true";

        // Tùy chọn dành cho playlist của chính mình tạo ra
        const myPlaylistItems = [
                {
                    label: "Add to queue",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M16 15H2v-1.5h14zm0-4.5H2V9h14zm-8.034-6A5.5 5.5 0 0 1 7.187 6H13.5a2.5 2.5 0 0 0 0-5H7.966c.159.474.255.978.278 1.5H13.5a1 1 0 1 1 0 2zM2 2V0h1.5v2h2v1.5h-2v2H2v-2H0V2z"></path>
                            </svg>`,
                    action: () => {},
                },
                {
                    label: "Remove from profile",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M1.5 8a6.5 6.5 0 1 1 11.395 4.277 3.5 3.5 0 0 0-1.163-1.088l-1.523-.88a.285.285 0 0 1-.076-.428l.086-.104v-.001c.549-.654.962-1.449 1.02-2.422.03-.526-.055-1.074-.165-1.395a3.2 3.2 0 0 0-.671-1.154 3.26 3.26 0 0 0-4.806 0 3.2 3.2 0 0 0-.672 1.154c-.109.32-.195.87-.163 1.395.057.973.47 1.768 1.018 2.422l.087.105a.285.285 0 0 1-.076.428l-1.523.88a3.5 3.5 0 0 0-1.163 1.088A6.48 6.48 0 0 1 1.5 8m2.74 5.302c.173-.334.44-.62.778-.814l1.523-.88A1.784 1.784 0 0 0 7.02 8.92l-.088-.105-.002-.002c-.399-.476-.637-.975-.671-1.548a2.7 2.7 0 0 1 .087-.824 1.7 1.7 0 0 1 .357-.623 1.76 1.76 0 0 1 2.594 0q.232.255.357.623a2.7 2.7 0 0 1 .087.824c-.034.573-.272 1.072-.671 1.548l-.002.002-.088.105c-.709.85-.48 2.135.479 2.688l1.523.88c.338.195.605.48.779.814A6.47 6.47 0 0 1 8 14.5a6.47 6.47 0 0 1-3.76-1.198"></path>
                            </svg>`,
                    action: () => {},
                },
                { divider: true },
                {
                    label: "Edit details",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M11.838.714a2.438 2.438 0 0 1 3.448 3.448l-9.841 9.841c-.358.358-.79.633-1.267.806l-3.173 1.146a.75.75 0 0 1-.96-.96l1.146-3.173c.173-.476.448-.909.806-1.267l9.84-9.84zm2.387 1.06a.94.94 0 0 0-1.327 0l-9.84 9.842a1.95 1.95 0 0 0-.456.716L2 14.002l1.669-.604a1.95 1.95 0 0 0 .716-.455l9.841-9.841a.94.94 0 0 0 0-1.327z"></path>
                            </svg>`,
                    action: () => {},
                },
                {
                    label: "Delete",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8"></path>
                                <path d="M12 8.75H4v-1.5h8z"></path>
                            </svg>`,
                    action: () => {
                        const playlistName =
                            item.querySelector(
                                ".sidebar__playlist-title",
                            )?.innerText || "this playlist";
                        openModal({
                            title: `Delete from Your Library?`,
                            content: `<p class="text-[14px]">This will delete <span class="font-bold">${playlistName}</span> from Your Library.</p>`,
                            footer: `
                                <button id="modal-cancel-delete" class="px-6 py-3 rounded-full cursor-pointer font-bold text-white hover:scale-105 active:scale-95 transition-transform bg-transparent">Cancel</button>
                                <button id="modal-confirm-delete" class="px-6 py-3 rounded-full cursor-pointer font-bold text-white bg-red-500 hover:scale-105 active:scale-95 transition-transform">Delete</button>
                            `,
                        });

                        document.getElementById(
                            "modal-cancel-delete",
                        ).onclick = closeModal;
                        document.getElementById(
                            "modal-confirm-delete",
                        ).onclick = async () => {
                            closeModal();
                            try {
                                const res = await fetchData.delete(
                                    `/playlists/${playlistId}`,
                                );
                                if (res) {
                                    showToast(
                                        "Playlist deleted",
                                        "info",
                                    );
                                    window.dispatchEvent(
                                        new CustomEvent(
                                            "playlist-deleted",
                                            { detail: { playlistId } },
                                        ),
                                    );
                                    const params = getQueryParams();
                                    if ((window.location.pathname === "/my-playlist" || window.location.pathname === "/playlist") && params.id === playlistId) {
                                        navigateTo("/");
                                    }
                                }
                            } catch (error) {
                                console.error(error);
                            }
                        };
                    },
                },
                { divider: true },
                {
                    label: "Create playlist",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M2 0v2H0v1.5h2v2h1.5v-2h2V2h-2V0zm11.5 2.5H8.244A5.5 5.5 0 0 0 7.966 1H15v11.75A2.75 2.75 0 1 1 12.25 10h1.25zm0 9h-1.25a1.25 1.25 0 1 0 1.25 1.25zM4 8.107a5.5 5.5 0 0 0 1.5-.593v5.236A2.75 2.75 0 1 1 2.75 10H4zM4 11.5H2.75A1.25 1.25 0 1 0 4 12.75z"></path>
                            </svg>`,
                    action: () => {},
                },
                {
                    label: "Create folder",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/></svg>`,
                    action: () => {},
                },
                { divider: true },
                {
                    label: "Make private",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M4 4a4 4 0 1 1 8 0v3h1.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25v-5.5C1 7.784 1.784 7 2.75 7H4zm1.5 3h5V4a2.5 2.5 0 0 0-5 0zM2.75 8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25z"></path>
                            </svg>`,
                    action: () => {},
                },
                {
                    label: "Invite collaborators",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M4.765 1.423c-.42.459-.713.992-.903 1.554-.144.421-.264 1.173-.22 1.894.077 1.321.638 2.408 1.399 3.316v.002l.083.098c.611.293 1.16.696 1.621 1.183a2.24 2.24 0 0 0-.426-2.092l-.127-.153-.002-.001c-.612-.73-.997-1.52-1.051-2.442-.032-.54.066-1.097.143-1.323a2.85 2.85 0 0 1 .589-1.022 2.89 2.89 0 0 1 4.258 0c.261.284.456.628.59 1.022.076.226.175.783.143 1.323-.055.921-.44 1.712-1.052 2.442l-.002.001-.127.153a2.25 2.25 0 0 0 .603 3.39l2.209 1.275a3.25 3.25 0 0 1 1.605 2.457h-5.99a5.5 5.5 0 0 1-.594 1.5h8.259l-.184-1.665a4.75 4.75 0 0 0-2.346-3.591l-2.209-1.275a.75.75 0 0 1-.201-1.13l.126-.152h.001c.76-.909 1.32-1.995 1.399-3.316.043-.721-.077-1.473-.22-1.894a4.5 4.5 0 0 0-.644-1.24v-.002h-.002a4.388 4.388 0 0 0-6.728-.312M2 12.5v-2h1.5v2h2V14h-2v2H2v-2H0v-1.5z"></path>
                            </svg>`,
                    action: () => {},
                },
                {
                    label: "Exclude from your taste profile",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8"></path>
                                <path d="M11.005 4.995a.75.75 0 0 1 0 1.06L9.061 8l1.944 1.945a.75.75 0 1 1-1.06 1.06L8 9.061l-1.945 1.944a.75.75 0 1 1-1.06-1.06L6.939 8 4.995 6.055a.75.75 0 1 1 1.06-1.06L8 6.939l1.945-1.944a.75.75 0 0 1 1.06 0"></path>
                            </svg>`,
                    action: () => {},
                },
                { divider: true },
                {
                    label: "Move to folder",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v11.5C0 15.216.784 16 1.75 16h12.5A1.75 1.75 0 0 0 16 14.25v-9.5A1.75 1.75 0 0 0 14.25 3H7.82l-.65-1.125A1.75 1.75 0 0 0 5.655 1zM1.5 2.75a.25.25 0 0 1 .25-.25h3.905a.25.25 0 0 1 .216.125L6.954 4.5h7.296a.25.25 0 0 1 .25.25v9.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25z"></path>
                            </svg>`,
                    children: [
                        { label: "New folder", action: () => {} },
                    ],
                },
                {
                    label: isPinned
                        ? `<span style="color:#1ed760">Unpin playlist</span>`
                        : "Pin playlist",
                    icon: isPinned
                        ? `<svg viewBox="0 0 16 16" class="fill-sp-bg-base"><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>`
                        : `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>`,
                    action: () => {
                        window.dispatchEvent(
                            new CustomEvent("playlist-toggled-pin", {
                                detail: {
                                    playlistId,
                                    isPinned: !isPinned,
                                },
                            }),
                        );
                    },
                },
                { divider: true },
                {
                    label: "Share",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M1 5.75A.75.75 0 0 1 1.75 5H4v1.5H2.5v8h11v-8H12V5h2.25a.75.75 0 0 1 .75.75v9.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75z"></path><path d="M8 9.576a.75.75 0 0 0 .75-.75V2.903l1.454 1.454a.75.75 0 0 0 1.06-1.06L8 .03 4.735 3.296a.75.75 0 0 0 1.06 1.061L7.25 2.903v5.923c0 .414.336.75.75.75"></path></svg>`,
                    children: [
                        {
                            label: "Copy link to playlist",
                            action: () => {
                                showToast(
                                    "Link copied to clipboard",
                                    "success",
                                );
                            },
                        },
                    ],
                },
            ];
        
        // Tùy chọn dành cho playlist của người khác mà mình đang theo dõi (Followed)
        const followedPlaylistItems = [
                {
                    label: "Add to queue",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M16 15H2v-1.5h14zm0-4.5H2V9h14zm-8.034-6A5.5 5.5 0 0 1 7.187 6H13.5a2.5 2.5 0 0 0 0-5H7.966c.159.474.255.978.278 1.5H13.5a1 1 0 1 1 0 2zM2 2V0h1.5v2h2v1.5h-2v2H2v-2H0V2z"></path></svg>`,
                    action: () => {},
                },
                { divider: true },
                {
                    label: "Add to profile",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M1.5 8a6.5 6.5 0 1 1 11.395 4.277 3.5 3.5 0 0 0-1.163-1.088l-1.523-.88a.285.285 0 0 1-.076-.428l.086-.104v-.001c.549-.654.962-1.449 1.02-2.422.03-.526-.055-1.074-.165-1.395a3.2 3.2 0 0 0-.671-1.154 3.26 3.26 0 0 0-4.806 0 3.2 3.2 0 0 0-.672 1.154c-.109.32-.195.87-.163 1.395.057.973.47 1.768 1.018 2.422l.087.105a.285.285 0 0 1-.076.428l-1.523.88a3.5 3.5 0 0 0-1.163 1.088A6.48 6.48 0 0 1 1.5 8m2.74 5.302c.173-.334.44-.62.778-.814l1.523-.88A1.784 1.784 0 0 0 7.02 8.92l-.088-.105-.002-.002c-.399-.476-.637-.975-.671-1.548a2.7 2.7 0 0 1 .087-.824 1.7 1.7 0 0 1 .357-.623 1.76 1.76 0 0 1 2.594 0q.232.255.357.623a2.7 2.7 0 0 1 .087.824c-.034.573-.272 1.072-.671 1.548l-.002.002-.088.105c-.709.85-.48 2.135.479 2.688l1.523.88c.338.195.605.48.779.814A6.47 6.47 0 0 1 8 14.5a6.47 6.47 0 0 1-3.76-1.198"></path></svg>`,
                    action: () => {},
                },
                { divider: true },
                {
                    label: "Report",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M4.069.967h7.855L15.98 8l-4.057 7.034H4.069L.01 8zm.866 1.5L1.743 8l3.192 5.534h6.122L14.25 8l-3.192-5.533z"></path><path d="M7.246 9V4h1.5v5zm0 3.025v-1.5h1.5v1.5z"></path></svg>`,
                    action: () => {},
                },
                {
                    label: `Remove from Your Library`,
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-bg-base"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path><path d="M12 8.75H4v-1.5h8z"></path></svg>`,
                    action: () => {
                        const playlistName = item.querySelector(".sidebar__playlist-title")?.innerText || "this playlist";
                        openModal({
                            title: `Remove from Your Library?`,
                            content: `<p class="text-[14px]">This will remove <span class="font-bold">${playlistName}</span> from Your Library.</p>`,
                            footer: `
                                <button id="modal-cancel-unfollow-pl" class="px-6 py-3 rounded-full font-bold text-white hover:scale-105 active:scale-95 transition-transform bg-transparent">Cancel</button>
                                <button id="modal-confirm-unfollow-pl" class="px-6 py-3 rounded-full font-bold text-white bg-sp-bg-base hover:scale-105 active:scale-95 transition-transform">Remove</button>
                            `
                        });

                        document.getElementById("modal-cancel-unfollow-pl").onclick = closeModal;
                        document.getElementById("modal-confirm-unfollow-pl").onclick = async () => {
                            closeModal();
                            try {
                                const res = await fetchData.delete(`/playlists/${playlistId}/follow`);
                                if (res) {
                                    showToast("Playlist removed from Library", "info");
                                    window.dispatchEvent(new CustomEvent("playlist-unfollowed", { detail: { playlistId } }));
                                }
                            } catch (error) {
                                console.error(error);
                            }
                        };
                    },
                },
                { divider: true },
                {
                    label: "Create playlist",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M2 0v2H0v1.5h2v2h1.5v-2h2V2h-2V0zm11.5 2.5H8.244A5.5 5.5 0 0 0 7.966 1H15v11.75A2.75 2.75 0 1 1 12.25 10h1.25zm0 9h-1.25a1.25 1.25 0 1 0 1.25 1.25zM4 8.107a5.5 5.5 0 0 0 1.5-.593v5.236A2.75 2.75 0 1 1 2.75 10H4zM4 11.5H2.75A1.25 1.25 0 1 0 4 12.75z"></path></svg>`,
                    action: () => {},
                },
                {
                    label: "Create folder",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/></svg>`,
                    action: () => {},
                },
                { divider: true },
                {
                    label: "Exclude from your taste profile",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8"></path><path d="M11.005 4.995a.75.75 0 0 1 0 1.06L9.061 8l1.944 1.945a.75.75 0 1 1-1.06 1.06L8 9.061l-1.945 1.944a.75.75 0 1 1-1.06-1.06L6.939 8 4.995 6.055a.75.75 0 1 1 1.06-1.06L8 6.939l1.945-1.944a.75.75 0 0 1 1.06 0"></path></svg>`,
                    action: () => {},
                },
                { divider: true },
                {
                    label: "Move to folder",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v11.5C0 15.216.784 16 1.75 16h12.5A1.75 1.75 0 0 0 16 14.25v-9.5A1.75 1.75 0 0 0 14.25 3H7.82l-.65-1.125A1.75 1.75 0 0 0 5.655 1zM1.5 2.75a.25.25 0 0 1 .25-.25h3.905a.25.25 0 0 1 .216.125L6.954 4.5h7.296a.25.25 0 0 1 .25.25v9.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25z"></path></svg>`,
                    children: [{ label: "New folder", action: () => {} }],
                },
                {
                    label: isPinned ? `<span style="color:#1ed760">Unpin playlist</span>` : "Pin playlist",
                    icon: isPinned ? `<svg viewBox="0 0 16 16" class="fill-sp-bg-base"><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>` : `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>`,
                    action: () => {
                        window.dispatchEvent(
                            new CustomEvent("playlist-toggled-pin", {
                                detail: {
                                    playlistId,
                                    isPinned: !isPinned,
                                },
                            })
                        );
                    },
                },
                { divider: true },
                {
                    label: "Share",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M1 5.75A.75.75 0 0 1 1.75 5H4v1.5H2.5v8h11v-8H12V5h2.25a.75.75 0 0 1 .75.75v9.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75z"></path><path d="M8 9.576a.75.75 0 0 0 .75-.75V2.903l1.454 1.454a.75.75 0 0 0 1.06-1.06L8 .03 4.735 3.296a.75.75 0 0 0 1.06 1.061L7.25 2.903v5.923c0 .414.336.75.75.75"></path></svg>`,
                    children: [
                        {
                            label: "Copy link to playlist",
                            action: () => {
                                showToast("Link copied to clipboard", "success");
                            },
                        },
                    ],
                },
            ];

        openContextMenu({
            x: e.clientX,
            y: e.clientY,
            items: isFollowing ? followedPlaylistItems : myPlaylistItems,
        });
    } else if (itemType === "album") {
        // --------------------------------------------------------
        // TRƯỜNG HỢP 3: NGƯỜI DÙNG CLICK CHUỘT PHẢI VÀO ALBUM
        // --------------------------------------------------------
        e.preventDefault();
        e.stopPropagation();

        const albumId = item.dataset.itemId;
        const isPinned = item.dataset.isPinned === "true";
        // Lấy trạng thái isLiked từ thuộc tính data-is-liked, nếu không tồn tại thì mặc định là true (vì album hiện ở sidebar nghĩa là đã được thêm vào thư viện)
        const isLiked = item.dataset.isLiked !== "false";

        openContextMenu({
            x: e.clientX,
            y: e.clientY,
            items: [
                {
                    label: isLiked ? "Remove from Your Library" : "Add to Your Library",
                    icon: isLiked
                        ? `<svg viewBox="0 0 16 16" class="fill-sp-bg-base"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m11.748-1.97a.75.75 0 0 0-1.06-1.06l-4.47 4.47-1.405-1.406a.75.75 0 1 0-1.061 1.06l2.466 2.467 5.53-5.53z"></path></svg>`
                        : `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued">
                                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8"></path>
                                <path d="M11.75 8a.75.75 0 0 1-.75.75H8.75V11a.75.75 0 0 1-1.5 0V8.75H5a.75.75 0 0 1 0-1.5h2.25V5a.75.75 0 0 1 1.5 0v2.25H11a.75.75 0 0 1 .75.75"></path>
                            </svg>`,
                    action: async () => {
                        try {
                            if (isLiked) {
                                const albumName = item.querySelector(".sidebar__playlist-title")?.innerText || "this album";
                                openModal({
                                    title: `Remove from Your Library?`,
                                    content: `<p class="text-[14px]">This will remove <span class="font-bold">${albumName}</span> from Your Library.</p>`,
                                    footer: `
                                        <button id="modal-cancel-remove" class="px-6 py-3 cursor-pointer rounded-full font-bold text-white hover:scale-105 active:scale-95 transition-transform bg-transparent">Cancel</button>
                                        <button id="modal-confirm-remove" class="px-6 py-3 rounded-full cursor-pointer font-bold text-white bg-sp-bg-base hover:scale-105 active:scale-95 transition-transform">Remove</button>
                                    `
                                });

                                document.getElementById("modal-cancel-remove").onclick = closeModal;
                                document.getElementById("modal-confirm-remove").onclick = async () => {
                                    closeModal();
                                    try {
                                        const res = await fetchData.delete(`/albums/${albumId}/like`);
                                        if (res) {
                                            showToast("Album removed from Your Library", "info");
                                            window.dispatchEvent(new CustomEvent("album-unliked", { detail: { albumId } }));
                                        }
                                    } catch (error) {
                                        console.error(error);
                                    }
                                };
                            } else {
                                const res = await fetchData.post(`/albums/${albumId}/like`);
                                if (res) {
                                    showToast("Album added to Your Library", "success");
                                    const subtitle = item.querySelector(".text-sp-text-subdued")?.innerText || "";
                                    let artistName = "Artist";
                                    if (subtitle.includes("•")) {
                                        artistName = subtitle.split("•")[1].trim();
                                    }
                                    const albumObj = {
                                        id: albumId,
                                        title: item.querySelector(".sidebar__playlist-title")?.innerText || "Album",
                                        artist_name: artistName,
                                        image_url: item.querySelector("img")?.src || "",
                                        is_pinned: isPinned,
                                        is_liked: true
                                    };
                                    window.dispatchEvent(new CustomEvent("album-liked", { detail: { album: albumObj } }));
                                }
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }
                },
                { divider: true },
                {
                    label: "Add to queue",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M16 15H2v-1.5h14zm0-4.5H2V9h14zm-8.034-6A5.5 5.5 0 0 1 7.187 6H13.5a2.5 2.5 0 0 0 0-5H7.966c.159.474.255.978.278 1.5H13.5a1 1 0 1 1 0 2zM2 2V0h1.5v2h2v1.5h-2v2H2v-2H0V2z"></path></svg>`,
                    action: () => {}
                },
                { divider: true },
                {
                    label: isPinned ? `<span style="color:#1ed760">Unpin album</span>` : "Pin album",
                    icon: isPinned
                        ? `<svg viewBox="0 0 16 16" class="fill-sp-bg-base"><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>`
                        : `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z"/></svg>`,
                    action: () => {
                        window.dispatchEvent(new CustomEvent("album-toggled-pin", { detail: { albumId, isPinned: !isPinned } }));
                    }
                },
                { divider: true },
                {
                    label: "Add to playlist",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z"/></svg>`,
                    children: [
                        { label: "Create playlist", action: () => {} }
                    ]
                },
                { divider: true },
                {
                    label: "Share",
                    icon: `<svg viewBox="0 0 16 16" class="fill-sp-text-subdued"><path d="M1 5.75A.75.75 0 0 1 1.75 5H4v1.5H2.5v8h11v-8H12V5h2.25a.75.75 0 0 1 .75.75v9.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75z"></path><path d="M8 9.576a.75.75 0 0 0 .75-.75V2.903l1.454 1.454a.75.75 0 0 0 1.06-1.06L8 .03 4.735 3.296a.75.75 0 0 0 1.06 1.061L7.25 2.903v5.923c0 .414.336.75.75.75"></path></svg>`,
                    children: [
                        { label: "Copy Album Link", action: () => { showToast("Link copied to clipboard", "success"); } }
                    ]
                },
                { divider: true },
                {
                    label: "Open in Desktop app",
                    icon: `<svg viewBox="0 0 24 24" class="fill-sp-text-subdued"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
                    action: () => {}
                }
            ]
        });
    }
};
