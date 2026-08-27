// Số lượng toast tối đa được hiển thị cùng một lúc trên màn hình
const MAX_TOASTS = 3;
// Lưu trữ các toast đang hiển thị để dễ dàng quản lý (bao gồm phần tử DOM và bộ đếm thời gian)
const activeToasts = new Map();

// Hàm lấy thẻ chứa các toast, nếu chưa có sẽ tự động tạo mới và gắn vào body
function getToastContainer() {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        // Vị trí hiển thị ở góc trên bên phải màn hình
        container.className =
            "fixed top-20 right-34 z-[9999] flex flex-col gap-2 pointer-events-none items-end";
        document.body.appendChild(container);
    }
    return container;
}

// Hàm xử lý việc ẩn và xóa toast khỏi giao diện cũng như bộ nhớ tạm
function removeToast(container, toast, message) {
    // Thêm hiệu ứng trượt xuống và mờ dần trước khi xóa
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-4", "opacity-0");

    // Đợi hiệu ứng CSS hoàn tất (300ms) rồi mới gỡ thẻ khỏi DOM
    setTimeout(() => {
        if (container.contains(toast)) {
            container.removeChild(toast);
        }
        activeToasts.delete(message);
    }, 300);
}

// Hàm chính để hiển thị một thông báo toast mới
export function showToast(message, type = "default", duration = 3000) {
    const container = getToastContainer();

    // Kiểm tra xem thông báo này có đang được hiển thị hay không
    // Nếu có, chỉ cần làm mới lại thời gian hiển thị thay vì tạo thêm một thông báo trùng lặp
    if (activeToasts.has(message)) {
        const existing = activeToasts.get(message);
        clearTimeout(existing.timeoutId);
        existing.timeoutId = setTimeout(
            () => removeToast(container, existing.toast, message),
            duration,
        );
        return;
    }

    // Nếu số lượng thông báo vượt quá mức cho phép, tự động xóa thông báo cũ nhất
    if (container.children.length >= MAX_TOASTS) {
        const oldest = container.firstElementChild;
        if (oldest) {
            const oldestMessage = [...activeToasts.entries()].find(
                ([, v]) => v.toast === oldest,
            )?.[0];
            if (oldestMessage) {
                clearTimeout(activeToasts.get(oldestMessage).timeoutId);
                removeToast(container, oldest, oldestMessage);
            }
        }
    }

    const toast = document.createElement("div");

    // Lựa chọn màu sắc dựa theo loại thông báo
    let colors = "bg-[#e91429] text-white";
    if (type === "success") colors = "bg-[#1ed760] text-black";
    if (type === "error") colors = "bg-[#e22134] text-white";
    if (type === "info") colors = "bg-[#2e77d0] text-white";
    if (type === "default") colors = "bg-[#2e77d0] text-white";

    // Cấu hình giao diện và hiệu ứng cho toast
    toast.className = `
        ${colors} 
        font-bold text-[14px] 
        px-6 py-3 rounded-[8px]
        shadow-lg
        transition-all duration-300 ease-out
        translate-y-8 opacity-0
        pointer-events-auto
        text-center
        max-w-[400px]
    `;

    toast.textContent = message;
    container.appendChild(toast);

    // Kích hoạt hiệu ứng xuất hiện sau khi phần tử đã được gắn vào DOM
    requestAnimationFrame(() => {
        setTimeout(() => {
            toast.classList.remove("translate-y-8", "opacity-0");
            toast.classList.add("translate-y-0", "opacity-100");
        }, 10);
    });

    // Thiết lập bộ đếm thời gian để tự động ẩn thông báo
    const timeoutId = setTimeout(
        () => removeToast(container, toast, message),
        duration,
    );

    // Lưu lại thông tin toast để quản lý
    activeToasts.set(message, { toast, timeoutId });
}
