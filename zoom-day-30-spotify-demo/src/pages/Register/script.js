import { showToast } from "../../components/toaster";
import { fetchData } from "../../services/spotifyAPI";

const registerForm = document.querySelector("#register-form");

const submitBtn = document.querySelector("#register-form #register-button");
const registerText = document.querySelector("#register-form #register-text");
const registerLoading = document.querySelector(
    "#register-form #register-loading",
);

const email = document.querySelector("#register-form #email");
const password = document.querySelector("#register-form #password");
const username = document.querySelector("#register-form #username");
const displayName = document.querySelector("#register-form #display-name");
const country = document.querySelector("#register-form #country");
const bio = document.querySelector("#register-form #bio");
const bioCounter = document.querySelector("#register-form #bio-counter");

const emptyEmail = document.querySelector("#register-form #empty-email");
const emptyPassword = document.querySelector("#register-form #empty-password");
const emptyUsername = document.querySelector("#register-form #empty-username");
const emptyDisplayName = document.querySelector(
    "#register-form #empty-display-name",
);
const emptyCountry = document.querySelector("#register-form #empty-country");
const emptyBio = document.querySelector("#register-form #empty-bio");

const togglePasswordBtn = document.querySelector(
    "#register-form #toggle-password",
);
const eyeOpen = document.querySelector("#register-form #eye-open");
const eyeClosed = document.querySelector("#register-form #eye-closed");

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

username.addEventListener("input", () =>
    validateField(username, emptyUsername),
);

displayName.addEventListener("input", () =>
    validateField(displayName, emptyDisplayName),
);

country.addEventListener("change", () => validateField(country, emptyCountry));

bio.addEventListener("input", () => {
    bioCounter.textContent = `${bio.value.length}/60`;
    return validateField(bio, emptyBio);
});

togglePasswordBtn.addEventListener("click", () => {
    const isPassword = password.type === "password";

    password.type = isPassword ? "text" : "password";
    eyeOpen.classList.toggle("hidden", !isPassword);
    eyeClosed.classList.toggle("hidden", isPassword);
});

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isEmailValid = validateField(email, emptyEmail);
    const isPasswordValid = validateField(password, emptyPassword);
    const isUsernameValid = validateField(username, emptyUsername);
    const isDisplayNameValid = validateField(displayName, emptyDisplayName);
    const isCountryValid = validateField(country, emptyCountry);
    const isBioValid = validateField(bio, emptyBio);

    if (
        !isEmailValid ||
        !isPasswordValid ||
        !isUsernameValid ||
        !isDisplayNameValid ||
        !isCountryValid ||
        !isBioValid
    ) {
        return;
    }

    submitBtn.disabled = true;
    registerText.hidden = true;
    registerLoading.hidden = false;

    try {
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        const response = await fetchData.post("/auth/register", data);

        if (response?.error?.message) {
            if (Array.isArray(response?.error?.details)) {
                const details = response?.error?.details ?? [];
                const messages = details
                    .map((detail) => detail.message)
                    .join("\n\n");
                showToast(messages, "error", 5000);
            } else {
                showToast(response?.error?.message, "error");
            }
            return;
        }

        if (response?.message === "User registered successfully") {
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
        registerText.hidden = false;
        registerLoading.hidden = true;
    }
});
