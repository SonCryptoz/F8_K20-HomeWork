const BASE_URL = "https://spotify.f8team.dev/api";

const registerForm = document.querySelector("#register-form");
const registerBtn = document.querySelector("#register-form #register-button");
const registerText = document.querySelector("#register-form #register-text");
const registerLoading = document.querySelector(
    "#register-form #register-loading",
);

const fetchData = async (url = "", method = "GET", data = {}) => {
    const result =
        method === "GET"
            ? await fetch(url)
            : await fetch(url, {
                  method,
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
              });

    return result.json();
};

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    registerBtn.disabled = true;
    registerText.classList.add("hidden");
    registerLoading.classList.remove("hidden");

    try {
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        const response = await fetchData(
            `${BASE_URL}/auth/register`,
            "POST",
            data,
        );

        if (response.message === "User registered successfully") {
            localStorage.setItem("access_token", response.access_token);

            localStorage.setItem("refresh_token", response.refresh_token);

            location.href = "./index.html";
            return;
        }

        // Validation error
        if (response?.error?.message === "Validation failed") {
            const details = response?.error?.details ?? [];

            alert(details.map((detail) => detail.message).join("\n\n"));

            return;
        }

        // Duplicate account hoặc lỗi khác
        alert(response?.error?.message || "Registration failed");
    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    } finally {
        registerBtn.disabled = false;
        registerText.classList.remove("hidden");
        registerLoading.classList.add("hidden");
    }
});
