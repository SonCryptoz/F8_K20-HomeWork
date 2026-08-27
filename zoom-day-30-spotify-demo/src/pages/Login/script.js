import { showToast } from "../../components/toaster";
import { fetchData } from "../../services/spotifyAPI";

const loginForm = document.querySelector("#login-form");

const submitBtn = document.querySelector("#login-form #login-button");
const loginText = document.querySelector("#login-form #login-text");
const loginLoading = document.querySelector("#login-form #login-loading");

const email = document.querySelector("#login-form #email");
const password = document.querySelector("#login-form #password");

const emptyEmail = document.querySelector("#login-form #empty-email");
const emptyPassword = document.querySelector("#login-form #empty-password");

const togglePasswordBtn = document.querySelector(
    "#login-form #toggle-password",
);
const eyeOpen = document.querySelector("#login-form #eye-open");
const eyeClosed = document.querySelector("#login-form #eye-closed");

const validateField = (input, emptyEl) => {
    const isEmpty = input.value.trim() === "";
    emptyEl.hidden = !isEmpty;
    input.classList.toggle("border-[#eb5262]", isEmpty);
    input.classList.toggle("focus:border-[#eb5262]", isEmpty);
    input.classList.toggle("focus:border-white", !isEmpty);
    return !isEmpty;
};

email.addEventListener("input", () => validateField(email, emptyEmail));
password.addEventListener("input", () =>
    validateField(password, emptyPassword),
);

togglePasswordBtn.addEventListener("click", () => {
    const isPassword = password.type === "password";

    password.type = isPassword ? "text" : "password";
    eyeOpen.classList.toggle("hidden", !isPassword);
    eyeClosed.classList.toggle("hidden", isPassword);
});

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isEmailValid = validateField(email, emptyEmail);
    const isPasswordValid = validateField(password, emptyPassword);

    if (!isEmailValid || !isPasswordValid) {
        return;
    }

    submitBtn.disabled = true;
    loginText.hidden = true;
    loginLoading.hidden = false;

    try {
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        const response = await fetchData.post("/auth/login", data);

        if (response?.error) {
            showToast(response?.error.message, "error");
            return;
        }

        if (response?.message === "Login successful") {
            localStorage.setItem("access_token", response.access_token);
            localStorage.setItem("refresh_token", response.refresh_token);
            sessionStorage.setItem(
                "pending_toast",
                JSON.stringify({
                    message: response?.message,
                    type: "success",
                }),
            );
            location.href = "/";
            return;
        }
    } catch (error) {
        console.error(error.message);
    } finally {
        submitBtn.disabled = false;
        loginText.hidden = false;
        loginLoading.hidden = true;
    }
});

// * Kiểm tra nếu user đăng nhập rồi thì không cho vào trang này
fetchData.auth("/users/me").then((data) => {
    if (data.user) {
        location.href = "/";
    }
});
