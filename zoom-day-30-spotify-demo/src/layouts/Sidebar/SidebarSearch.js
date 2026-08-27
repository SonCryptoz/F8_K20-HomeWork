export const initSidebarSearch = ({ onSearchChange }) => {
    const searchToggleBtn = document.querySelector("#sidebar-search-toggle-btn");
    const searchBox = document.querySelector("#sidebar-search-box");
    const searchInput = document.querySelector("#sidebar-search-input");
    const searchClearBtn = document.querySelector("#sidebar-search-clear-btn");
    const searchContainer = document.querySelector("#sidebar-search-container");

    if (!searchToggleBtn || !searchBox || !searchInput) return;

    let currentKeyword = "";

    // Mở ô search với animation từ trái sang phải
    const openSearch = () => {
        searchToggleBtn.classList.add("hidden");
        searchBox.classList.remove("hidden");
        searchBox.classList.add("flex");

        searchBox.style.width = "0px";
        searchBox.style.opacity = "0";
        requestAnimationFrame(() => {
            searchBox.style.transition =
                "width 0.25s cubic-bezier(0.3, 0, 0, 1), opacity 0.2s ease";
            searchBox.style.width = "210px";
            searchBox.style.opacity = "1";
            searchInput.focus();
        });
    };

    // Đóng ô search
    const closeSearch = () => {
        if (currentKeyword.trim() !== "") return; // Nếu có chữ thì không đóng

        searchBox.style.width = "0px";
        searchBox.style.opacity = "0";
        setTimeout(() => {
            searchBox.classList.remove("flex");
            searchBox.classList.add("hidden");
            searchToggleBtn.classList.remove("hidden");
            searchBox.style.width = "210px";
            searchBox.style.opacity = "1";
        }, 250);
    };

    // Click mở search
    searchToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openSearch();
    });

    // Nhập từ khóa
    searchInput.addEventListener("input", (e) => {
        currentKeyword = e.target.value;
        if (searchClearBtn) {
            searchClearBtn.classList.toggle(
                "hidden",
                currentKeyword.length === 0,
            );
        }
        onSearchChange(currentKeyword);
    });

    // Nút Xóa từ khóa (Clear X)
    if (searchClearBtn) {
        searchClearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            searchInput.value = "";
            currentKeyword = "";
            searchClearBtn.classList.add("hidden");
            searchInput.focus();
            onSearchChange("");
        });
    }

    // Click ra ngoài để thu nhỏ lại (nếu ô input trống)
    document.addEventListener("click", (e) => {
        if (searchContainer && !searchContainer.contains(e.target)) {
            closeSearch();
        }
    });

    // Phím Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (currentKeyword) {
                searchInput.value = "";
                currentKeyword = "";
                if (searchClearBtn) searchClearBtn.classList.add("hidden");
                onSearchChange("");
            } else {
                closeSearch();
            }
        }
    });
};
