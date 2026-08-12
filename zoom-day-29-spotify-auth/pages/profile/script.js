const BASE_URL = "https://spotify.f8team.dev/api";

const profile = document.querySelector("#profile");

const fetchData = async (url, refresh = false) => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    const response = await fetch(url, {
        method: refresh ? "POST" : "GET",
        headers: {
            Authorization: `Bearer ${refresh ? refreshToken : accessToken}`,
        },
    });

    return response.json();
};

const renderProfile = (data) => {
    profile.innerHTML = `
            <section
                class="rounded-2xl border border-white/10 bg-[#181818] p-6 md:p-8"
            >
                <div class="flex flex-col items-center gap-6 sm:flex-row">
                    <!-- Avatar -->

                    <img
                        src=${data.user.avatar_url || "https://i.pravatar.cc/300?img=12"}
                        alt=${data.user.username}
                        class="h-32 w-32 rounded-full object-cover"
                    />

                    <!-- User information -->

                    <div class="min-w-0 text-center sm:text-left">
                        <p class="text-sm font-medium text-neutral-500">
                            Profile
                        </p>

                        <h1 class="mt-1 text-3xl font-bold">${data.user.display_name}</h1>

                        <p class="mt-1 text-neutral-400">@${data.user.username}</p>

                        <p
                            class="mt-4 max-w-lg text-sm leading-6 text-neutral-400"
                        >
                            Following ${data.stats?.following ?? 0}
                        </p>
                    </div>
                </div>
            </section>

            <!-- USER DATA -->

            <section class="mt-8">
                <h2 class="mb-4 text-xl font-bold">Account information</h2>

                <div
                    class="divide-y divide-white/10 rounded-xl border border-white/10 bg-[#181818]"
                >
                    <!-- ID -->

                    <div
                        class="flex items-center justify-between gap-4 px-5 py-4"
                    >
                        <span class="text-sm text-neutral-500"> ID </span>

                        <span class="text-sm font-medium"> ${data.user.id} </span>
                    </div>

                    <!-- Username -->

                    <div
                        class="flex items-center justify-between gap-4 px-5 py-4"
                    >
                        <span class="text-sm text-neutral-500"> Username </span>

                        <span class="text-sm font-medium"> ${data.user.username} </span>
                    </div>

                    <!-- Email -->

                    <div
                        class="flex items-center justify-between gap-4 px-5 py-4"
                    >
                        <span class="text-sm text-neutral-500"> Email </span>

                        <span class="truncate text-sm font-medium">
                            ${data.user.email}
                        </span>
                    </div>

                    <!-- Created -->

                    <div
                        class="flex items-center justify-between gap-4 px-5 py-4"
                    >
                        <span class="text-sm text-neutral-500">
                            Created at
                        </span>

                        <span class="text-sm font-medium"> ${new Date(
                            data.user.created_at,
                        )
                            .toString()
                            .split(" ")
                            .slice(0, 5)
                            .join(" ")} </span>
                    </div>
                </div>
            </section>
        `;
};

// * Refresh Token và kiểm tra nếu user chưa đăng nhập thì không cho vào trang này
const checkProfile = async () => {
    try {
        let data = await fetchData(`${BASE_URL}/users/me`);
        if (data?.error) {
            const newToken = await fetchData(
                `${BASE_URL}/auth/refresh-token`,
                true,
            );

            if (!newToken?.access_token) {
                localStorage.clear();
                location.href = "../login";
                return;
            }

            localStorage.setItem("access_token", newToken.access_token);

            data = await fetchData(`${BASE_URL}/users/me`);
        }
        if (!data?.user) {
            localStorage.clear();
            location.href = "../login";
            return;
        }

        renderProfile(data);
    } catch (error) {
        console.log(error.message);
        localStorage.clear();
        location.href = "../login";
    }
};

checkProfile();

const logout = document.querySelector("#logout-button");

if (logout) {
    logout.addEventListener("click", () => {
        if (confirm("Are you sure to logout?")) {
            localStorage.clear();
            location.href = "../login";
        }
    });
}
