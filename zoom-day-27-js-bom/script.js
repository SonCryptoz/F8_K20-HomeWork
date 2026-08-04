const fingerprintData = {};

const render = () => {
    // TODO: Vị trí người dùng (tọa độ)
    const lct = document.querySelector("#location");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            lct.innerHTML = `
            <span>X: ${position.coords.latitude}</span>
            <br>
            <span>Y: ${position.coords.longitude}</span>
        `;
            fingerprintData.latitude = position.coords.latitude;
            fingerprintData.longitude = position.coords.longitude;

            history.replaceState(fingerprintData, "", "./");
        },
        (error) => {
            console.error("Lỗi:", error.message);
            lct.textContent = "Không thể lấy vị trí.";
        },
    );

    // TODO: Trạng thái online

    const online = document.querySelector("#online");
    fingerprintData.online = navigator.onLine;

    const updateOnlineStatus = () => {
        online.innerHTML = navigator.onLine
            ? `
        <span class="green">Online</span>
    `
            : `
        <span class="red">Offline</span>
    `;
    };

    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // TODO: Tên trình duyệt
    const browser = document.querySelector("#browser");
    const a = navigator.userAgent;
    let browserName = "";

    switch (true) {
        case a.includes("Edg"):
            browserName = "Microsoft Edge";
            break;
        case a.includes("Chrome"):
            browserName = "Google Chrome";
            break;
        case a.includes("Firefox"):
            browserName = "Mozilla Firefox";
            break;
        case a.includes("Safari"):
            browserName = "Safari";
            break;
        default:
            browserName = "Unknown browser";
    }

    fingerprintData.browser = browserName;
    browser.innerHTML = `<span>${browserName}</span>`;

    // TODO: Tên hệ điều hành
    const os = document.querySelector("#os");
    const plt = navigator.platform;
    let platform = "";

    switch (true) {
        case plt.includes("Win"):
            platform = "Windows";
            break;
        case plt.includes("Mac"):
            platform = "macOS";
            break;
        case plt.includes("Linux"):
            platform = "Linux";
            break;
        default:
            platform = "Unknown browser";
    }

    fingerprintData.os = platform;
    os.innerHTML = `<span>${platform}</span>`;

    // TODO: Danh sách ngôn ngữ hiện tại
    const languages = document.querySelector("#languages");

    const langHTML = navigator.languages
        .map((language) => {
            return `<span class="lang-item">${language}</span>`;
        })
        .join("");

    fingerprintData.languages = navigator.languages;
    languages.innerHTML = `<span class="lang-wr">${langHTML}</span>`;

    // TODO: Kích thước màn hình
    const scr = document.querySelector("#screen");

    scr.innerHTML = `
    <span>Chiều cao: ${screen.height}</span>
    <br>
    <span>Chiều rộng: ${screen.width}</span>
`;

    fingerprintData.screen = {
        width: screen.width,
        height: screen.height,
    };
    // TODO: Hướng màn hình
    const orient = document.querySelector("#orientation");

    const updateOrientation = () => {
        browser.innerHTML = `<span>${browserName}</span>`;

        orient.textContent = screen.orientation.type.includes("landscape")
            ? "Màn hình ngang"
            : "Màn hình dọc";

        scr.innerHTML = `
        <span>Chiều cao: ${screen.height}</span>
        <br>
        <span>Chiều rộng: ${screen.width}</span>
    `;

        fingerprintData.orientation = orient.textContent;
    };

    updateOrientation();

    screen.orientation.addEventListener("change", updateOrientation);
};

render();

// TODO: Điều hướng fingerprinting

const header = document.querySelector(".header");

const fingerprintLink = document.querySelector(".nav__links span");
fingerprintLink.style = "cursor: pointer";

const infoPanel = document.querySelector(".info-panel");
const fingerprintPanel = document.querySelector(".fingerprint-panel");
const fingerprintContent = document.querySelector(
    ".fingerprint-panel #fingerprint",
);
const backBtn = document.querySelector(".fingerprint-panel #backBtn");

const renderFingerprint = (data) => {
    fingerprintContent.textContent = `
                                        ${data.latitude ?? "N/A"} |
                                        ${data.longitude ?? "N/A"} |
                                        ${data.online ? "Online" : "Offline"} |
                                        ${data.browser} |
                                        ${data.os} |
                                        ${data.languages.join("|")} |
                                        ${data.screen.width}x${data.screen.height} |
                                        ${data.orientation}
                                    `;
};

fingerprintLink.addEventListener("click", () => {
    header.hidden = true;

    history.pushState(fingerprintData, "", "?page=fingerprint");

    infoPanel.hidden = true;
    fingerprintPanel.hidden = false;

    renderFingerprint(history.state);
});

const params = new URLSearchParams(location.search);

if (params.get("page") === "fingerprint") {
    header.hidden = true;

    infoPanel.hidden = true;
    fingerprintPanel.hidden = false;
    renderFingerprint(history.state);
} else {
    infoPanel.hidden = false;
    fingerprintPanel.hidden = true;
}

backBtn.addEventListener("click", () => {
    history.back();
});

window.addEventListener("popstate", (e) => {
    if (location.pathname.includes("fg-printing")) {
        infoPanel.hidden = true;
        fingerprintPanel.hidden = false;

        header.hidden = true;

        renderFingerprint(e.state);
    } else {
        infoPanel.hidden = false;
        fingerprintPanel.hidden = true;

        header.hidden = false;
    }
});
