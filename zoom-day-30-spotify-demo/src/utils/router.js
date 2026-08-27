import { getCurrentUser } from "../services/auth";

// Bảng đăng ký route: key = pathname, value = { render, init, loading }
const routes = {};

// Hàm lấy query params từ URL hiện tại
export const getQueryParams = () => {
    return Object.fromEntries(new URLSearchParams(window.location.search));
};

/**
 * Đăng ký một route mới
*/
export const registerRoute = (path, handler) => {
    routes[path] = handler;
};

/**
 * Chuyển trang
 */
export const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
    window.dispatchEvent(new Event("locationchange"));
};

/**
 * Router chính - đọc URL hiện tại và render nội dung tương ứng
 */
export const router = async () => {
    const path = window.location.pathname;

    // Tìm handler khớp với path, fallback về '/'
    const handler = routes[path] || routes["/"];

    if (!handler) {
        const pageContent = document.querySelector("#page-content");
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <p class="text-sp-text-subdued text-lg">404 - Page not found</p>
                </div>
            `;
        }
        return;
    }

    const pageContent = document.querySelector("#page-content");
    if (!pageContent) return;

    // Hiển thị skeleton loading
    if (handler.loading) {
        pageContent.innerHTML = handler.loading();
    }

    // Scroll lên đầu trang khi chuyển route
    pageContent.scrollTop = 0;

    // Gọi hàm render (fetch data + render HTML)
    await handler.render();

    // Gắn event listeners sau khi render xong (nếu có)
    if (handler.init) {
        handler.init(await getCurrentUser());
    }
};

/**
 * Khởi tạo Router - gọi 1 lần sau khi AppLayout đã render
 * Lắng nghe: popstate + click trên <a data-link>
 */
export const initRouter = () => {
    // Lắng nghe Back/Forward trên trình duyệt
    window.addEventListener("popstate", () => {
        router();
        window.dispatchEvent(new Event("locationchange"));
    });

    // Đánh chặn tất cả thẻ <a data-link> để điều hướng SPA
    document.body.addEventListener("click", (e) => {
        // Tìm thẻ <a> gần nhất có thuộc tính data-link
        const link = e.target.closest("[data-link]");
        if (!link) return;

        e.preventDefault();

        const href = link.getAttribute("href");
        if (!href) return;

        // Nếu URL hiện tại giống URL đích thì không làm gì
        if (href === window.location.pathname + window.location.search) return;

        navigateTo(href);
    });
};
