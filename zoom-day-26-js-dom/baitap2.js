const tab = document.querySelector("#tabs");
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
const tabHead = document.querySelector(".tab-head");
const tabContent = document.querySelector(".tab-content");

// Mặc định tab đầu tiên được active khi trang load.
tabBtns[0].classList.add("active");
tabPanels[0].classList.add("active");

let currentIndex = 0;
const lastIndex = tabPanels.length - 1;

const handleTab = (tabBtn, currentIndex) => {
    const activedBtn = tabHead.querySelector(".tab-btn.active");
    if (activedBtn) {
        activedBtn.classList.remove("active");
    }
    tabBtn.classList.add("active");

    const activedTab = tabContent.querySelector(".tab-panel.active");
    if (activedTab) {
        activedTab.classList.remove("active");
    }
    tabPanels[currentIndex].classList.add("active");
};

tabBtns.forEach((tabBtn, index) => {
    tabBtn.addEventListener("click", () => {
        currentIndex = index;
        handleTab(tabBtn, currentIndex);
    });
});

// TODO: Điều khiển bàn phím:

// Khi focus vào vùng tabs (click vào tab button hoặc vùng nội dung tabs), lắng nghe sự kiện keydown.

// Phím mũi tên Trái (ArrowLeft): chuyển đến tab trước đó. Nếu đang ở tab đầu, chuyển vòng về tab cuối.

// Phím mũi tên Phải (ArrowRight): chuyển đến tab tiếp theo. Nếu đang ở tab cuối, chuyển vòng về tab đầu.

// Khi blur khỏi vùng tabs, gỡ bỏ listener keydown.

const handleKeydown = (e) => {
    if (e.code === "ArrowLeft") {
        if (currentIndex === 0) {
            currentIndex = lastIndex;
        } else {
            currentIndex--;
        }
    } else if (e.code === "ArrowRight") {
        if (currentIndex === lastIndex) {
            currentIndex = 0;
        } else {
            currentIndex++;
        }
    } else {
        return;
    }
    handleTab(tabBtns[currentIndex], currentIndex);
    tabBtns[currentIndex].focus();
};

// Gắn tabindex vì keydown chỉ hoạt động khi có phần tử bên trong đang được focus.
tab.tabIndex = 0;

tab.addEventListener("focusin", () => {
    tab.addEventListener("keydown", handleKeydown);
});

tab.addEventListener("focusout", () => {
    tab.removeEventListener("keydown", handleKeydown);
});