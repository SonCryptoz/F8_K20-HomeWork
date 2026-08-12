const BASE_URL = "https://spotify.f8team.dev/api";

const artistsSection = document.querySelector("#artists");
const albumsSection = document.querySelector("#albums");
const songsSection = document.querySelector("#songs");
const playlistsSection = document.querySelector("#playlists");

const guest = document.querySelector("#guest-actions");
const user = document.querySelector("#user-actions");

// * Hàm xử lý state chung
const getSectionStates = (section) => {
    return {
        loading: section.querySelector("[data-state='loading']"),
        error: section.querySelector("[data-state='error']"),
        empty: section.querySelector("[data-state='empty']"),
        data: section.querySelector("[data-state='data']"),
    };
};

const setLoading = (section) => {
    const states = getSectionStates(section);

    states.loading.classList.remove("hidden");
    states.error.classList.add("hidden");
    states.empty.classList.add("hidden");
    states.data.classList.add("hidden");
};

const setError = (section) => {
    const states = getSectionStates(section);

    states.loading.classList.add("hidden");
    states.error.classList.remove("hidden");
    states.empty.classList.add("hidden");
    states.data.classList.add("hidden");
};

const setEmpty = (section) => {
    const states = getSectionStates(section);

    states.loading.classList.add("hidden");
    states.error.classList.add("hidden");
    states.empty.classList.remove("hidden");
    states.data.classList.add("hidden");
};

const setData = (section) => {
    const states = getSectionStates(section);

    states.loading.classList.add("hidden");
    states.error.classList.add("hidden");
    states.empty.classList.add("hidden");
    states.data.classList.remove("hidden");
};

// * Render Artist
const renderArtists = (section, data) => {
    const inner = getSectionStates(section);
    inner.data.innerHTML = data
        .map((item) => {
            return `
            <article
                class="group rounded-xl bg-surface p-4 transition hover:bg-surface-hover"
            >
                <div
                    class="relative mx-auto aspect-square overflow-hidden rounded-full"
                >
                    <img
                        src="${
                            item.image_url ||
                            item.background_image_url ||
                            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500"
                        }"
                        alt="${item.name || "Artist"}"
                        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                </div>

                <div class="mt-4 flex items-center gap-1">
                    <h3 class="truncate font-semibold">
                        ${item.name || "Unknown Artist"}
                    </h3>

                    ${
                        item.is_verified
                            ? `
                                <svg
                                    class="h-4 w-4 shrink-0 text-primary"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M12 2l2.2 2.2 3.1-.1.9 3 2.7 1.5-1.5 2.7.1 3.1-3 .9-1.5 2.7-2.7-1.5-3.1.1-.9-3-2.7-1.5 1.5-2.7-.1-3.1 3-.9L12 2z"
                                    />

                                    <path
                                        d="M10.5 15.5l-2.5-2.5 1.4-1.4 1.1 1.1 4.1-4.1 1.4 1.4-5.5 5.5z"
                                        fill="black"
                                    />
                                </svg>
                            `
                            : ""
                    }
                </div>

                <p class="mt-1 text-sm text-neutral-500">
                    ${
                        item.monthly_listeners
                            ? `${Number(item.monthly_listeners).toLocaleString()} monthly listeners`
                            : "Artist"
                    }
                </p>

                ${
                    item.bio
                        ? `
                            <p class="mt-2 line-clamp-2 text-xs text-neutral-600">
                                ${item.bio}
                            </p>
                        `
                        : ""
                }

                <div class="mt-3">
                    <span
                        class="inline-flex rounded-full border border-white/10 px-2.5 py-1 text-xs text-neutral-400"
                    >
                        ${item.is_following ? "Following" : "Not following"}
                    </span>
                </div>
            </article>
        `;
        })
        .join("");
};

// * Render Albums
const renderAlbums = (section, data) => {
    const inner = getSectionStates(section);
    inner.data.innerHTML = data
        .map((item) => {
            const releaseYear = item.release_date
                ? new Date(item.release_date).getFullYear()
                : null;

            return `
            <article
                class="group rounded-xl bg-surface p-4 transition hover:bg-surface-hover"
            >
                <div
                    class="relative aspect-square overflow-hidden rounded-lg"
                >
                    <img
                        src="${
                            item.cover_image_url ||
                            "https://images.unsplash.com/photo-1619983081563-430f63602796?w=500"
                        }"
                        alt="${item.title || "Album cover"}"
                        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <button
                        type="button"
                        class="absolute bottom-3 right-3 flex h-11 w-11 translate-y-3 items-center justify-center rounded-full bg-primary text-black opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            class="h-6 w-6 fill-current"
                        >
                           <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path>
                        </svg>
                    </button>
                </div>

                <h3 class="mt-4 truncate font-semibold">
                    ${item.title || "Unknown Album"}
                </h3>

                <p
                    class="mt-1 truncate text-sm text-neutral-500"
                >
                    ${item.artist_name || "Unknown Artist"}
                    ${releaseYear ? ` · ${releaseYear}` : ""}
                </p>

                <div
                    class="mt-2 flex items-center gap-2 text-xs text-neutral-500"
                >
                    ${
                        item.total_tracks != null
                            ? `<span>${item.total_tracks} tracks</span>`
                            : ""
                    }

                </div>

                ${
                    item.is_liked
                        ? `
                            <span
                                class="mt-3 inline-block text-xs font-medium text-primary"
                            >
                                Liked
                            </span>
                        `
                        : ""
                }
            </article>
        `;
        })
        .join("");
};

const renderSongs = (section, data) => {
    const inner = getSectionStates(section);
    inner.data.innerHTML = data
        .map((item) => {
            const duration = item.duration
                ? `${Math.floor(item.duration / 60)}:${String(
                      item.duration % 60,
                  ).padStart(2, "0")}`
                : "0:00";

            return `
            <article
                class="group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 transition hover:bg-surface-hover md:grid-cols-[auto_1fr_1fr_auto]"
            >
                <!-- Track number / Play -->

                <div class="w-5">
                    <span
                        class="block text-center text-sm text-neutral-500 group-hover:hidden"
                    >
                        ${item.track_number ?? "-"}
                    </span>

                    <button
                        type="button"
                        class="hidden w-full text-primary group-hover:block"
                        data-audio-url="${item.audio_url || ""}"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            class="h-5 w-5 fill-current"
                        >
                            <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"></path>
                        </svg>
                    </button>
                </div>


                <!-- Song -->

                <div class="flex min-w-0 items-center gap-4">

                    <img
                        src="${
                            item.image_url ||
                            item.album_cover_image_url ||
                            "https://images.unsplash.com/photo-1619983081563-430f63602796?w=200"
                        }"
                        alt="${item.title || "Song cover"}"
                        class="h-12 w-12 shrink-0 rounded object-cover"
                    />

                    <div class="min-w-0">

                        <div class="flex min-w-0 items-center gap-2">

                            <h3 class="truncate font-medium">
                                ${item.title || "Unknown Song"}
                            </h3>

                            ${
                                item.is_liked
                                    ? `
                                        <span
                                            class="shrink-0 text-xs text-primary"
                                            title="Liked"
                                        >
                                            ♥
                                        </span>
                                    `
                                    : ""
                            }

                        </div>

                        <p
                            class="truncate text-sm text-neutral-500"
                        >
                            ${item.artist_name || "Unknown Artist"}
                        </p>

                    </div>

                </div>


                <!-- Album -->

                <div class="hidden min-w-0 md:block">

                    <p
                        class="truncate text-sm text-neutral-500"
                    >
                        ${item.album_title || "Unknown Album"}
                    </p>

                    ${
                        item.play_count != null
                            ? `
                                <p
                                    class="mt-1 text-xs text-neutral-600"
                                >
                                    ${Number(
                                        item.play_count,
                                    ).toLocaleString()} plays
                                </p>
                            `
                            : ""
                    }

                </div>


                <!-- Duration -->

                <span class="text-sm text-neutral-500">
                    ${duration}
                </span>

            </article>
        `;
        })
        .join("");
};
const renderPlaylist = (section, data) => {
    const inner = getSectionStates(section);
    inner.data.innerHTML = data
        .map((item) => {
            return `
            <article
                class="group rounded-xl bg-surface p-4 transition hover:bg-surface-hover"
            >
                <div
                    class="relative aspect-square overflow-hidden rounded-lg"
                >
                    <img
                        src="${
                            item.album_cover_image_url ||
                            item.image_url ||
                            "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=500"
                        }"
                        alt="${item.album_title || "Playlist cover"}"
                        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                </div>

                <h3 class="mt-4 truncate font-semibold">
                    ${item.album_title || "Untitled Playlist"}
                </h3>

                <p
                    class="mt-1 truncate text-sm text-neutral-500"
                >
                    ${item.artist_name || "Unknown Artist"}
                </p>

                <p class="mt-2 text-xs text-neutral-600">
                    Playlist
                </p>
            </article>
        `;
        })
        .join("");
};

const renderProfile = (data) => {
    user.innerHTML = `
                        <!-- Avatar -->
                        <div class="flex items-center gap-3">
                            <a href="./pages/profile/">
                                <img
                                    src=${data.user.avatar_url || "https://i.pravatar.cc/100?img=12"}
                                    alt="User avatar"
                                    class="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                                />
                            </a>

                            <!-- Username -->
                            <div class="hidden text-right sm:block">
                                <p class="text-sm font-semibold">
                                    ${data.user.display_name || data.user.username || "User"}
                                </p>
                            </div>
                        </div>

                        <!-- Logout -->
                        <button
                            id="logout-button"
                            type="button"
                            class="rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-neutral-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                        >
                            Log out
                        </button>
    `;
};

// * Hàm xử lý fetch chung
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

// * Hàm xử lý hiện state chung
const handleState = (section, res, key, render) => {
    if (res.status === "rejected") {
        setError(section);
        return;
    }

    const data = res.value[key];

    if (!data.length) {
        setEmpty(section);
        return;
    }

    render(section, data);
    setData(section);
};

// * Kiểm tra user
const fetchProfile = async () => {
    try {
        guest.classList.add("hidden");
        user.classList.remove("hidden");

        let response = await fetchData(`${BASE_URL}/users/me`);

        if (response?.error) {
            const newToken = await fetchData(
                `${BASE_URL}/auth/refresh-token`,
                true,
            );

            if (!newToken?.access_token) {
                localStorage.clear();
            }

            localStorage.setItem("access_token", newToken.access_token);

            response = await fetchData(`${BASE_URL}/users/me`);
        }

        renderProfile(response);

        const logout = document.querySelector("#logout-button");

        if (logout) {
            logout.addEventListener("click", () => {
                if (confirm("Are you sure to logout?")) {
                    localStorage.clear();
                    location.href = "./pages/login/";
                }
            });
        }
    } catch (error) {
        guest.classList.remove("hidden");
        user.classList.add("hidden");
    }
};

fetchProfile();

// * fetch Home
const fetchHome = async () => {
    try {
        setLoading(artistsSection);
        setLoading(albumsSection);
        setLoading(songsSection);
        setLoading(playlistsSection);

        const data = await Promise.allSettled([
            fetchData(`${BASE_URL}/artists?limit=20&offset=0`), // artists
            fetchData(`${BASE_URL}/albums?limit=20&offset=0`), // albums
            fetchData(`${BASE_URL}/tracks?limit=50&offset=0`), // songs
            fetchData(`${BASE_URL}/tracks?limit=50&offset=0`), // playlists
        ]);

        handleState(artistsSection, data[0], "artists", renderArtists);
        handleState(albumsSection, data[1], "albums", renderAlbums);
        handleState(songsSection, data[2], "tracks", renderSongs);
        handleState(playlistsSection, data[3], "tracks", renderPlaylist);
    } catch (e) {
        console.log(e.message);
    }
};

fetchHome();
