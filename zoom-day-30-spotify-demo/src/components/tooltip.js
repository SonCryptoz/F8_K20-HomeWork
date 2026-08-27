// Hàm khởi tạo và quản lý Tooltip dùng chung cho toàn bộ dự án
export function initTooltip() {
    // Tìm kiếm thẻ hiển thị tooltip trong giao diện
    let tooltipEl = document.getElementById("global-tooltip");
    
    // Nếu chưa tồn tại thì tạo mới một thẻ div và thiết lập các thuộc tính giao diện
    if (!tooltipEl) {
        tooltipEl = document.createElement("div");
        tooltipEl.id = "global-tooltip";
        // Cấu hình giao diện chuẩn cho tooltip (màu nền tối, chữ trắng, bo góc, bóng mờ)
        tooltipEl.className = "fixed px-3 py-1.5 bg-[#282828] text-white text-[14px] font-medium rounded-md shadow-lg pointer-events-none transition-opacity duration-200 opacity-0 whitespace-nowrap tracking-wide";
        // Gắn thêm các định dạng trực tiếp để đảm bảo hiển thị trên cùng
        tooltipEl.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.3)";
        tooltipEl.style.zIndex = "10000";
        document.body.appendChild(tooltipEl);
    }

    // Biến lưu trữ phần tử hiện tại và observer để theo dõi sự thay đổi thuộc tính
    let currentTarget = null;
    let observer = null;

    // Khoảng cách an toàn giữa tooltip và phần tử được trỏ chuột vào
    const margin = 10;

    // Hàm cập nhật vị trí và nội dung tooltip
    const updateTooltip = (target) => {
        const title = target.getAttribute("data-tooltip");
        if (!title) {
            tooltipEl.classList.remove("opacity-100");
            tooltipEl.classList.add("opacity-0");
            return;
        }

        tooltipEl.textContent = title;
        tooltipEl.style.display = "block";
        
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();
        
        let top = rect.top - tooltipRect.height - margin;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

        if (top < 0) {
            top = rect.bottom + margin;
        }
        
        if (left < margin) {
            left = margin;
        } else if (left + tooltipRect.width > window.innerWidth - margin) {
            left = window.innerWidth - tooltipRect.width - margin;
        }

        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;
        
        requestAnimationFrame(() => {
            tooltipEl.classList.remove("opacity-0");
            tooltipEl.classList.add("opacity-100");
        });
    };

    // Hàm xử lý hiển thị tooltip khi di chuột vào phần tử
    const showTooltip = (e) => {
        const target = e.target.closest("[data-tooltip]");
        if (!target) return;

        // Nếu di chuột sang phần tử khác, làm mới observer
        if (currentTarget !== target) {
            if (observer) observer.disconnect();
            currentTarget = target;
            
            // Lắng nghe sự thay đổi của thuộc tính data-tooltip (để cập nhật ngay lập tức khi toggle)
            observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "attributes" && mutation.attributeName === "data-tooltip") {
                        updateTooltip(target);
                    }
                });
            });
            observer.observe(target, { attributes: true, attributeFilter: ["data-tooltip"] });
        }

        updateTooltip(target);
    };

    // Hàm xử lý ẩn tooltip khi di chuột ra ngoài hoặc click
    const hideTooltip = (e) => {
        const target = e.target.closest("[data-tooltip]");
        if (!target) {
            tooltipEl.classList.remove("opacity-100");
            tooltipEl.classList.add("opacity-0");
            if (observer) {
                observer.disconnect();
                observer = null;
                currentTarget = null;
            }
            return;
        }
        tooltipEl.classList.remove("opacity-100");
        tooltipEl.classList.add("opacity-0");
        if (observer) {
            observer.disconnect();
            observer = null;
            currentTarget = null;
        }
    };

    // Lắng nghe các sự kiện toàn cục để kích hoạt ẩn/hiện tooltip
    document.addEventListener("mouseover", showTooltip);
    document.addEventListener("mouseout", hideTooltip);
    
    // Ẩn tooltip khi click, NGOẠI TRỪ các nút button (vì các nút toggle cần giữ tooltip để hiển thị trạng thái mới)
    document.addEventListener("click", (e) => {
        const target = e.target.closest("[data-tooltip]");
        if (target && (target.tagName === "BUTTON" || target.closest("button"))) {
            // Không ẩn tooltip khi bấm vào nút toggle (ví dụ: Play/Pause, Shuffle, Like)
            return;
        }
        hideTooltip(e);
    });
}

