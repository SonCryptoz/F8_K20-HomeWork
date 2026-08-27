import { openModal, closeModal } from "../../components/modal";

// * Render profile
const renderProfile = (data, user) => {
    user.innerHTML = `
                        <!-- Avatar -->
                        <div class="flex items-center gap-3">
                            <img
                                src=${data.avatar_url || "https://i.pravatar.cc/100?img=12"}
                                alt="User avatar"
                                class="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                            />

                            <!-- Username -->
                            <div class="hidden text-right sm:block">
                                <p class="text-sm font-semibold">
                                    ${data.display_name || data.username || "User"}
                                </p>
                            </div>
                        </div>

                        <!-- Logout -->
                        <button
                            id="logout-button"
                            type="button"
                            class="rounded-full cursor-pointer border border-white/10 px-4 py-2.5 text-sm font-semibold text-neutral-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                        >
                            Log out
                        </button>
    `;
};

// * Check user to render
export const renderHeaderAuth = (user) => {
    const guest = document.querySelector("#guest-actions");
    const userActions = document.querySelector("#user-actions");

    if (!guest || !userActions) return;

    if (!user) {
        guest.classList.remove("hidden");
        userActions.classList.add("hidden");
        return;
    }

    guest.classList.add("hidden");
    userActions.classList.remove("hidden");

    renderProfile(user, userActions);

    const logout = document.querySelector("#logout-button");

    if (logout) {
        logout.addEventListener("click", () => {
            openModal({
                title: "Are you sure to log out?",
                content: "",
                footer: `
                    <button id="modal-cancel-btn" class="text-white font-bold cursor-pointer hover:scale-105 transition-transform">Cancel</button>
                    <button id="modal-logout-btn" class="text-white bg-red-500 cursor-pointer font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">Log out</button>
                `,
            });

            const cancelBtn = document.getElementById("modal-cancel-btn");
            const logoutBtn = document.getElementById("modal-logout-btn");

            if (cancelBtn) {
                cancelBtn.addEventListener("click", closeModal);
            }

            if (logoutBtn) {
                logoutBtn.addEventListener("click", () => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    location.href = "/";
                });
            }
        });
    }
};
