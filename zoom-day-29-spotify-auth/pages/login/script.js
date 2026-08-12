const BASE_URL = "https://spotify.f8team.dev/api";

const loginForm = document.querySelector("#login-form");

const submitBtn = document.querySelector("#login-form #login-button");
const loginText = document.querySelector("#login-form #login-text");
const loginLoading = document.querySelector("#login-form #login-loading");

const fetchData = async (url = "", method = "GET", data = {}) => {
    const result =
        method === "GET"
            ? await fetch(url, {
                  headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                          "access_token",
                      )}`,
                  },
              })
            : await fetch(url, {
                  method,
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
              });

    return result.json();
};

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    loginText.classList.add("hidden");
    loginLoading.classList.remove("hidden");

    try {
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        const response = await fetchData(
            `${BASE_URL}/auth/login`,
            "POST",
            data,
        );

        if (response.message === "Login successful") {
            localStorage.setItem("access_token", response.access_token);
            localStorage.setItem("refresh_token", response.refresh_token);
            location.href = "../../index.html";
            return;
        }

        alert(response?.error?.message || "Login failed");
    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    } finally {
        submitBtn.disabled = false;
        loginText.classList.remove("hidden");
        loginLoading.classList.add("hidden");
    }
});

// * Kiểm tra nếu user đăng nhập rồi thì không cho vào trang này
fetchData(`${BASE_URL}/users/me`).then((data) => {
    if (data.user) {
        location.href = "./index.html";
    }
});
