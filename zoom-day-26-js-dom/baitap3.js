const slides = [
    {
        id: 1,
        url: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        id: 2,
        url: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1203&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        id: 3,
        url: "https://images.unsplash.com/photo-1502657877623-f66bf489d236?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        id: 4,
        url: "https://plus.unsplash.com/premium_photo-1721652937934-9cc168ca5dbe?q=80&w=1165&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        id: 5,
        url: "https://images.unsplash.com/photo-1600073956897-4fc08a2b27d0?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
];

const slidesContainer = document.querySelector(".slides");
const slideShell = document.querySelector(".slideshow-shell");
const slideTitle = document.querySelector(".slideshow-title");
const dots = document.querySelector(".dots");

const html = slides
    .map((slide) => {
        return `
            <div class="slide-item" data-id="${slide.id}">
                <img src="${slide.url}" alt="slide ${slide.id}"/>
            </div>
        `;
    })
    .join("");

slidesContainer.innerHTML = `<div class="slide-inner">${html}</div>`;

dots.innerHTML = slides
    .map((_, index) => {
        return `
            <i class="dot" data-index="${index}"></i>
        `;
    })
    .join("");

const slideInner = slidesContainer.querySelector(".slide-inner");
const slideNav = document.querySelector(".slide-nav");
const slideItems = slidesContainer.querySelectorAll(".slide-item");

// Clone slide đầu tiên gắn cuối (cho Next loop)
const firstClone = slideItems[0].cloneNode(true);
slideInner.appendChild(firstClone);

// Clone slide cuối cùng gắn đầu (cho Prev loop)
const lastClone = slideItems[slideItems.length - 1].cloneNode(true);
slideInner.insertBefore(lastClone, slideInner.firstChild);

const totalSlides = [...slidesContainer.querySelectorAll(".slide-item")];

let currentSlideIndex = 1;
const lastSlideIndex = totalSlides.length - 1;

let timerSlide = null,
    isHover = false;

let isAnimating = false; // ngăn người dùng click liên tục

// Tính khoảng cách để trượt
const updateSlide = () => {
    const slideWidth = slideItems[0].getBoundingClientRect().width;
    const offset = slideWidth * currentSlideIndex * -1;
    slideInner.style.translate = `${offset}px`;

    slideTitle.innerHTML = `
                <h2>Slideshow</h2>
                <p>
                    <span>Slide</span>
                    <span>${realIndex() + 1}</span>
                    <span>/</span>
                    <span>${slides.length}</span>
                </p>`;
};

// Lấy index thực cho dot
const realIndex = () => {
    if (currentSlideIndex === lastSlideIndex) {
        return 0;
    }
    if (currentSlideIndex === 0) {
        return slides.length - 1;
    }
    return currentSlideIndex - 1;
};

// Cập nhật dot slide
const updateDots = () => {
    const getRealIndex = realIndex();
    dots.querySelectorAll(".dot").forEach((dot, index) => {
        dot.classList.toggle("active", index === getRealIndex);
    });
};

dots.querySelectorAll(".dot").forEach((dot, index) => {
    dot.addEventListener("click", () => {
        if (isAnimating || realIndex() === index) return;
        if (isHover) {
            clearInterval(timerSlide);
        }
        isAnimating = true;
        currentSlideIndex = index + 1;
        updateSlide();
        updateDots();
    });
});

// Lấy lại hiệu ứng sau khi animate slide cuối về đầu và ngược lại
const getTransitionBack = () => {
    // trick ép browser render ngay để khi về slide đầu thì mới thêm transition trở lại cho inner slide
    slideInner.offsetWidth;

    slideInner.style.transition = "translate 0.5s ease-in-out";
};

// Slide chạy tự động sau mỗi 3s
const autoSlide = () => {
    clearInterval(timerSlide);

    timerSlide = setInterval(() => {
        if (isAnimating) return;
        isAnimating = true;

        currentSlideIndex = Math.min(currentSlideIndex + 1, lastSlideIndex);

        updateSlide();
        updateDots();
    }, 3000);
};

autoSlide();

slideNav.addEventListener("click", (e) => {
    if (isAnimating) return;
    const button = e.target.closest("button");

    if (!button) return;

    if (button.classList.contains("next")) {
        currentSlideIndex = Math.min(currentSlideIndex + 1, lastSlideIndex);
    }

    if (button.classList.contains("prev")) {
        currentSlideIndex = Math.max(currentSlideIndex - 1, 0);
    }

    if (isHover) {
        clearInterval(timerSlide);
    }

    isAnimating = true;

    updateSlide();

    updateDots();
});

slideInner.addEventListener("transitionend", (e) => {
    if (currentSlideIndex === lastSlideIndex) {
        currentSlideIndex = 1;
    } else if (currentSlideIndex === 0) {
        currentSlideIndex = lastSlideIndex - 1;
    }

    slideInner.style.transition = "none";

    updateSlide();

    updateDots();

    getTransitionBack();

    isAnimating = false;
});

const next = document.querySelector(".next");
const prev = document.querySelector(".prev");

const handleSlideKeydown = (e) => {
    if (isAnimating) return;

    if (e.code === "ArrowLeft") {
        currentSlideIndex = Math.max(currentSlideIndex - 1, 0);
        prev.focus();
    } else if (e.code === "ArrowRight") {
        currentSlideIndex = Math.min(currentSlideIndex + 1, lastSlideIndex);
        next.focus();
    } else {
        return;
    }
    isAnimating = true;
    autoSlide();
    updateSlide();
    updateDots();
};

// Gắn tabindex vì keydown chỉ hoạt động khi có phần tử bên trong đang được focus.
slideShell.tabIndex = 1;

slideShell.addEventListener("focusin", () => {
    slideShell.addEventListener("keydown", handleSlideKeydown);
});

slideShell.addEventListener("focusout", () => {
    slideShell.removeEventListener("keydown", handleSlideKeydown);
});

// Khi hover chuột vào slider, dừng auto-play.
slideShell.addEventListener("mouseenter", () => {
    isHover = true;
    clearInterval(timerSlide);
});

// Khi rời chuột khỏi slider, tiếp tục auto-play.
slideShell.addEventListener("mouseleave", () => {
    isHover = false;
    autoSlide();
});

// Khởi tạo slide
(function () {
    slideInner.style.transition = "none";

    updateSlide();

    updateDots();

    getTransitionBack();
})();

// ! Yêu cầu có sự xung đột (trong code đã xử lý reset):
// - Hover vào slider thì dừng auto-play.
// - Click Prev/Next/Dot thì reset lại 3 giây.
// Do các nút đều nằm trong slider nên khi click vẫn đang ở trạng thái hover,
// auto-play đã bị dừng nên việc reset timer sẽ không có tác dụng cho đến khi
// chuột rời khỏi slider.
