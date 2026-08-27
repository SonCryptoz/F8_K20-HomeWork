// Hàm khởi tạo và lấy modal container
function getModalContainer() {
    let container = document.getElementById("modal-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "modal-container";

        // Container chính bọc toàn màn hình (ẩn mặc định)
        container.className =
            "fixed inset-0 z-[10000] hidden items-center justify-center pointer-events-none p-4";

        // Lớp phủ đen nhạt (Overlay)
        const overlay = document.createElement("div");
        overlay.id = "modal-overlay";
        overlay.className =
            "absolute inset-0 bg-black/70 opacity-0 transition-opacity duration-200 pointer-events-auto cursor-pointer";

        // Hộp thoại Modal (Box)
        const modalBox = document.createElement("div");
        modalBox.id = "modal-box";
        modalBox.className =
            "relative z-10 w-full max-w-[480px] bg-[#282828] rounded-[8px] shadow-2xl scale-95 opacity-0 transition-all duration-200 pointer-events-auto flex flex-col max-h-[90vh]";

        container.appendChild(overlay);
        container.appendChild(modalBox);
        document.body.appendChild(container);

        // Lắng nghe sự kiện click ra ngoài để đóng modal
        overlay.addEventListener("click", closeModal);

        // Lắng nghe phím Esc để đóng modal
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeModal();
        });
    }
    return container;
}

export function openModal({ title = "", content = null, footer = null }) {
    const container = getModalContainer();
    const modalBox = document.getElementById("modal-box");
    const overlay = document.getElementById("modal-overlay");

    // Dựng cấu trúc HTML bên trong modal
    modalBox.innerHTML = `
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#3e3e3e]">
            <h2 class="text-white text-xl font-bold">${title}</h2>
            <button id="modal-close-btn" class="text-sp-text-muted hover:text-white transition-colors rounded-full cursor-pointer p-2 hover:bg-[#3e3e3e]" data-tooltip="Close">
                <svg viewBox="0 0 16 16" class="fill-current w-5 h-5"><path d="M1.47 1.47a.75.75 0 0 1 1.06 0L8 6.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L9.06 8l5.47 5.47a.75.75 0 1 1-1.06 1.06L8 9.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L6.94 8 1.47 2.53a.75.75 0 0 1 0-1.06z"></path></svg>
            </button>
        </div>
        
        <!-- Body -->
        ${
            content
                ? `
                    <div class="px-6 py-4 overflow-y-auto text-white" style="scrollbar-width: thin;">
                        ${content}
                    </div>
                `
                : ""
        }
        
        <!-- Footer -->
        ${
            footer
                ? `
        <div class="px-6 py-4 border-t border-[#3e3e3e] flex justify-end gap-3">
            ${footer}
        </div>
        `
                : ""
        }
    `;

    const closeBtn = document.getElementById("modal-close-btn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // Đổi display từ 'hidden' sang 'flex' để modal xuất hiện trong luồng DOM
    container.classList.remove("hidden");
    container.classList.add("flex");

    // Kích hoạt hiệu ứng (transition) sau khi DOM đã render xong
    requestAnimationFrame(() => {
        setTimeout(() => {
            overlay.classList.remove("opacity-0");
            overlay.classList.add("opacity-100");

            modalBox.classList.remove("scale-95", "opacity-0");
            modalBox.classList.add("scale-100", "opacity-100");
        }, 10);
    });
}

/**
 * Đóng Modal đang mở
 */
export function closeModal() {
    const container = document.getElementById("modal-container");
    const modalBox = document.getElementById("modal-box");
    const overlay = document.getElementById("modal-overlay");

    if (!container || container.classList.contains("hidden")) return;

    // Chạy hiệu ứng thu nhỏ và mờ dần
    overlay.classList.remove("opacity-100");
    overlay.classList.add("opacity-0");

    modalBox.classList.remove("scale-100", "opacity-100");
    modalBox.classList.add("scale-95", "opacity-0");

    // Sau khi animation kết thúc (200ms), ẩn hoàn toàn khỏi màn hình
    setTimeout(() => {
        container.classList.remove("flex");
        container.classList.add("hidden");
        modalBox.innerHTML = ""; // Xóa sạch nội dung bên trong để giải phóng bộ nhớ
    }, 200);
}
