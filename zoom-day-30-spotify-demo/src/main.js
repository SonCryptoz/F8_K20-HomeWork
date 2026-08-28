import { attachTrackLikePopup, trackState } from "./components/popup.js";
import { showToast } from "./components/toaster.js";
import { renderHeaderAuth } from "./layouts/Header/HeaderAuth.js";
import { getCurrentUser } from "./services/auth.js";
import { renderSidebarAuth } from "./layouts/Sidebar/SidebarAuth.js";
import { initBottomNav } from "./layouts/BottomNav/BottomNav.js";
import { renderHomePage, initHomePage } from "./layouts/Main/Main.js";
import { MainLoading } from "./layouts/Main/MainLoading.js";
import { TrackLoading } from "./layouts/Main/TrackLoading.js";
import { ArtistLoading } from "./layouts/Main/ArtistLoading.js";
import { AlbumLoading } from "./layouts/Main/AlbumLoading.js";
import { PlaylistLoading } from "./layouts/Main/PlaylistLoading.js";
import { AppLayout } from "./layouts/App/App.js";
import { PageLoader } from "./components/loader.js";
import { initTooltip } from "./components/tooltip.js";
import { registerRoute, initRouter, router } from "./utils/router.js";

import { renderTrackPage, initTrackPage } from "./pages/Track/script.js";
import { renderArtistPage, initArtistPage } from "./pages/Artist/script.js";
import { renderAlbumPage, initAlbumPage } from "./pages/Album/script.js";
import {
    renderPlaylistPage,
    initPlaylistPage,
} from "./pages/Playlist/script.js";
import {
    renderMyPlaylistPage,
    initMyPlaylistPage,
} from "./pages/MyPlaylist/script.js";
import { MyPlaylistLoading } from "./layouts/Main/MyPlaylistLoading.js";
import {
    renderCollectionPage,
    initCollectionPage,
} from "./pages/Collection/script.js";
import { initHeaderSearch } from "./layouts/Header/HeaderSearch.js";
import { player } from "./layouts/Player/PlayerManager.js";

// ============================================
// ĐĂNG KÝ CÁC ĐỊA CHỈ ĐƯỜNG DẪN (ROUTING)
// ============================================
// Mỗi route gồm 3 phần: render (dựng HTML), init (gắn sự kiện), loading (skeleton hiện tạm trong lúc chờ render)

// Đăng ký trang chủ
registerRoute("/", {
    render: renderHomePage,
    init: initHomePage,
    loading: () => MainLoading(),
});

// Đăng ký trang chi tiết bài hát
registerRoute("/track", {
    render: renderTrackPage,
    init: initTrackPage,
    loading: () => TrackLoading(),
});

registerRoute("/artist", {
    render: renderArtistPage,
    init: initArtistPage,
    loading: () => ArtistLoading(),
});

registerRoute("/album", {
    render: renderAlbumPage,
    init: initAlbumPage,
    loading: () => AlbumLoading(),
});

registerRoute("/playlist", {
    render: renderPlaylistPage,
    init: initPlaylistPage,
    loading: () => PlaylistLoading(),
});

registerRoute("/my-playlist", {
    render: renderMyPlaylistPage,
    init: initMyPlaylistPage,
    loading: () => MyPlaylistLoading(),
});

registerRoute("/collection", {
    render: renderCollectionPage,
    init: initCollectionPage,
    loading: () => PlaylistLoading(),
});

// ============================================
// XỬ LÝ SỰ KIỆN KHI TẢI TRANG HOÀN TẤT
// ============================================
// Lắng nghe sự kiện khi toàn bộ HTML đã tải xong, để hiện các thông báo (toast) đang chờ
document.addEventListener("DOMContentLoaded", () => {
    const pending = sessionStorage.getItem("pending_toast");

    if (pending) {
        const { message, type } = JSON.parse(pending);
        showToast(message, type, 1000);
        sessionStorage.clear(); // Xóa toàn bộ sessionStorage sau khi đã hiện toast (không chỉ xóa riêng key này)
    }
});

// ============================================
// HÀM KHỞI TẠO ỨNG DỤNG CHÍNH (APP INITIALIZATION)
// ============================================
const initApp = async () => {
    const appEl = document.querySelector("#app");
    if (!appEl) return; // Không có root element thì dừng luôn, không làm gì cả

    // Hiển thị loader toàn trang (skeleton/spinner chung) trong khi kiểm tra auth
    appEl.innerHTML = PageLoader();

    // Kiểm tra user đang đăng nhập hay chưa (gọi API/session)
    const user = await getCurrentUser();

    // Render App Shell: khung layout chính gồm Header + Sidebar + Player + vùng #page-content còn rỗng
    // (nội dung từng trang cụ thể sẽ được router render vào #page-content sau)
    appEl.innerHTML = AppLayout();

    // Khởi tạo Player: gắn các phần tử DOM (audio element, thanh progress, nút điều khiển...) cho player instance
    player.initDOM();
    // Gán player ra global window để MỌI trang (Album/Artist/Playlist/Collection/Track...) đều truy cập được qua window.player
    window.player = player;

    // Nếu đã đăng nhập -> khởi tạo các state gắn với riêng user này
    if (user) {
        // Khởi tạo trackState theo user.id (cache "bài hát nào đã like / nằm trong playlist nào", namespace theo từng user)
        // PHẢI chạy TRƯỚC player.init() để khi player gọi syncUI() thì cache đã sẵn sàng
        trackState.init(user.id);
        // Khởi tạo player theo user.id (VD: khôi phục bài đang nghe dở, volume đã lưu... riêng cho user này)
        player.init(user.id);
    }

    // Render trạng thái đăng nhập cho Header (avatar/nút login) và Sidebar (menu library...)
    renderHeaderAuth(user);
    initHeaderSearch();
    renderSidebarAuth(user);
    initBottomNav(user);

    // Khởi tạo nút Like cho track đang phát ở thanh Player dưới cùng (dùng chung component popup như mọi trang khác)
    attachTrackLikePopup(".track-like-btn", {}, user);

    // Khởi tạo hệ thống Tooltip dùng chung toàn app (data-tooltip attribute)
    initTooltip();

    // Khởi tạo Router: lắng nghe sự kiện popstate (back/forward) và click vào các thẻ có data-link (điều hướng SPA không reload trang)
    initRouter();

    // Render nội dung trang hiện tại dựa theo URL đang có (khớp với route đã đăng ký ở trên)
    await router(user);
};

// Chạy hàm khởi tạo app ngay khi file được load (entry point của toàn bộ ứng dụng)
initApp();