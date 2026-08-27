import { renderErrorCard } from "../../components/errorCard";
import { POPUP_ICONS } from "../../components/popup";
import { fetchData } from "../../services/spotifyAPI";
import {
    formatDuration,
    formatTotalDuration,
    getTrackNameFontSize,
    getYear,
} from "../../utils/format";
import { getQueryParams } from "../../utils/router";

// * Render Album Page
export const renderAlbumPage = async () => {
    const pageContent = document.querySelector("#page-content");
    if (!pageContent) return;

    const { id: albumId } = getQueryParams();

    try {
        const album = await fetchData.get(`/albums/${albumId}`);
        const { tracks } = await fetchData.get("/tracks?offset=0&limit=50");

        if (album?.error?.message || !albumId) {
            throw new Error("API Error");
        }

        // Lọc track thuộc đúng album này
        const albumTracks = tracks.filter(
            (t) => t.artist_id === album.artist_id,
        );

        // Xác định loại phát hành (EP / Album / Single)
        const albumType =
            album.total_tracks <= 1
                ? "Single"
                : album.total_tracks <= 6
                  ? "EP"
                  : "Album";

        window.currentTracksData = albumTracks;
        pageContent.innerHTML = `
            <div class="album-page pb-8">

                <!-- ===== HERO SECTION ===== -->
                <div class="album-hero flex flex-col md:flex-row md:items-end gap-4 md:gap-6 px-4 md:px-6 pt-6 md:pt-10 pb-5 md:pb-6"
                    style="background: linear-gradient(to bottom, #1d4275, #121212);">

                    <!-- Album Cover -->
                    <div class="album-hero__cover w-36 h-36 md:w-44 md:h-44 lg:w-56 lg:h-56 shrink-0 rounded shadow-2xl overflow-hidden bg-sp-highlight">
                        ${
                            album.cover_image_url
                                ? `<img src="${album.cover_image_url}" alt="${album.title}" class="w-full h-full object-cover" />`
                                : `<div class="w-full h-full gradient-art-6 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" class="fill-white/30 w-10 h-10 md:w-12 md:h-12">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                                    </svg>
                                </div>`
                        }
                    </div>

                    <!-- Album Info -->
                    <div class="album-hero__info flex flex-col justify-end min-w-0 w-full">

                        <!-- Type -->
                        <span class="album-hero__type text-white font-bold uppercase tracking-wider text-xs md:text-sm" id="album-type">
                            ${albumType}
                        </span>

                        <!-- Album Title -->
                        <h1 class="album-hero__name text-white font-black leading-tight truncate"
                            style="font-size: clamp(28px, 5vw, ${getTrackNameFontSize(album.title)}px); margin: 6px 0 10px 0;"
                            id="album-name">
                            ${album.title}
                        </h1>

                        <!-- Metadata -->
                        <div class="album-hero__meta flex items-center flex-wrap gap-1 text-white font-medium text-xs md:text-sm">

                            <!-- Artist Avatar -->
                            <div class="shrink-0 rounded-full overflow-hidden w-6 h-6">
                                ${
                                    album.artist_image_url
                                        ? `<img src="${album.artist_image_url}" alt="${album.artist_name}" class="w-full h-full object-cover" />`
                                        : `<div class="w-full h-full gradient-art-8 flex items-center justify-center">
                                            <svg viewBox="0 0 24 24" class="fill-white/50 w-3 h-3">
                                                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.523 0-10 3.582-10 8a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1c0-4.418-4.477-8-10-8z"/>
                                            </svg>
                                        </div>`
                                }
                            </div>

                            <!-- Artist -->
                            <a href="/artist?id=${album.artist_id}" data-link class="font-bold hover:underline truncate" id="album-artist-link">
                                ${album.artist_name}
                            </a>

                            <span class="text-white/60">•</span>

                            <!-- Year -->
                            <span id="album-year" class="text-white/60">
                                ${getYear(album.release_date || album.created_at)}
                            </span>

                            <span class="text-white/60">•</span>

                            <!-- Tracks & Duration -->
                            <span id="album-tracks-meta" class="text-white/60">
                                ${album.total_tracks || albumTracks.length} songs, ${formatTotalDuration(album.total_duration)}
                            </span>
                        </div>
                    </div>
                </div>


                <!-- ===== ACTION BAR ===== -->
                <div class="album-actions flex items-center gap-4 md:gap-6 px-4 md:px-6 py-4 md:py-5"
                    style="background: linear-gradient(to bottom, rgba(29,66,117,0.35), #121212 60%);">

                    <!-- Play -->
                    <button class="album-actions__play-btn shrink-0 flex items-center justify-center cursor-pointer rounded-full bg-sp-bg-base hover:bg-sp-bg-highlight hover:scale-105 transition-all w-12 h-12 md:w-14 md:h-14"
                        id="album-play-btn" data-tooltip="Play">
                        <svg viewBox="0 0 24 24" class="fill-black w-5 h-5 md:w-6 md:h-6 ml-0.5">
                            <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/>
                        </svg>
                    </button>

                    <!-- Shuffle -->
                    <button class="text-sp-text-subdued cursor-pointer hover:scale-105 active:scale-95 transition-all"
                        id="album-shuffle-btn" data-tooltip="Enable shuffle">
                        <svg viewBox="0 0 16 16" class="fill-current w-5 h-5 md:w-6 md:h-6">
                            <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"></path>
                            <path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"></path>
                        </svg>
                    </button>

                    <!-- Like -->
                    <button class="album-actions__like-btn cursor-pointer transition-all hover:scale-105 ${
                        album.is_liked
                            ? "text-sp-bg-base"
                            : "text-sp-text-subdued hover:text-white"
                    }"
                        id="album-like-btn"
                        data-tooltip="${album.is_liked ? "Remove from Your Library" : "Like this Album"}"
                        data-liked="${album.is_liked}"
                        data-album-title="${album.title}"
                        data-album-artist="${album.artist_name || "Artist"}"
                        data-album-image="${album.cover_image_url || album.image_url || ""}">
                        <svg viewBox="0 0 24 24" class="fill-current w-7 h-7 md:w-8 md:h-8">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>

                    <!-- Add -->
                    <button class="album-actions__add-btn cursor-pointer hover:scale-105 transition-all ${
                        album.is_liked
                            ? "text-sp-bg-base"
                            : "text-sp-text-subdued hover:text-white"
                    }"
                        id="album-add-btn"
                        data-tooltip="${album.is_liked ? "Remove from Your Library" : "Save to Your Library"}">
                        <svg viewBox="0 0 24 24" class="fill-current w-7 h-7 md:w-8 md:h-8">
                            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
                            <path d="M12.75 7.5h-1.5v3.75H7.5v1.5h3.75v3.75h1.5v-3.75h3.75v-1.5h-3.75V7.5z"/>
                        </svg>
                    </button>
                </div>


                <!-- ===== TRACKLIST ===== -->
                <div class="album-tracks px-4 md:px-6">

                    <!-- Header -->
                    <div class="album-tracks-header flex items-center px-2 md:px-4 py-2 text-sp-text-subdued text-xs md:text-sm font-medium border-b border-white/10 mb-2">

                        <div class="w-5 md:w-8 flex justify-center mr-2 md:mr-4">
                            #
                        </div>

                        <div class="flex-1">
                            Title
                        </div>

                        <div class="w-10 md:w-12 flex justify-end">
                            <svg viewBox="0 0 16 16" class="fill-current w-4 h-4">
                                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
                                <path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z"/>
                            </svg>
                        </div>
                    </div>


                    <!-- Tracks -->
                    <div class="album-tracks-list flex flex-col">

                        ${
                            albumTracks.length > 0
                                ? albumTracks.map((track, index) => `
                                    <div class="album-track-item flex items-center group hover:bg-white/10 rounded-md transition-colors px-2 md:px-4 py-2 md:py-2.5"
                                        data-track-id="${track.id}"
                                        data-audio-url="${track.audio_url || ""}">

                                        <!-- Index -->
                                        <div class="w-5 md:w-8 text-sp-text-subdued text-xs md:text-base group-hover:hidden flex justify-center mr-2 md:mr-4 shrink-0">
                                            ${index + 1}
                                        </div>

                                        <!-- Play -->
                                        <button id="album__track__play-btn"
                                            class="w-5 md:w-8 text-white hidden group-hover:flex justify-center mr-2 md:mr-4 shrink-0">
                                            <svg viewBox="0 0 24 24" class="fill-current w-4 h-4">
                                                <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/>
                                            </svg>
                                        </button>

                                        <!-- Track Info -->
                                        <div class="flex-1 flex flex-col min-w-0 pr-2 md:pr-4">
                                            <a href="/track?id=${track.id}" data-link
                                                class="track-title text-white w-fit max-w-full font-medium hover:underline truncate text-sm md:text-base">
                                                ${track.title}
                                            </a>

                                            <a href="/artist?id=${album.artist_id}" data-link
                                                class="text-sp-text-subdued w-fit max-w-full text-xs md:text-sm hover:underline truncate">
                                                ${track.artist_name || album.artist_name}
                                            </a>
                                        </div>

                                        <!-- Like -->
                                        <button class="track-like-btn text-sp-text-subdued hidden group-hover:flex hover:text-white cursor-pointer transition-colors items-center justify-center p-1.5 md:p-2 shrink-0"
                                            data-track-id="${track.id}"
                                            data-track-title="${track.title}"
                                            data-liked="${track.is_liked}"
                                            data-track-image="${album.cover_image_url || album.image_url || ""}"
                                            data-tooltip="${track.is_liked ? "Change playlist" : "Add to Liked Songs"}">
                                            ${track.is_liked ? POPUP_ICONS.checkedCircle : POPUP_ICONS.addCircle}
                                        </button>

                                        <!-- Duration -->
                                        <div class="w-10 md:w-12 text-sp-text-subdued text-xs md:text-sm text-right shrink-0">
                                            ${formatDuration(track.duration)}
                                        </div>
                                    </div>
                                `).join("")
                                : `<p class="text-sp-text-subdued py-4 text-center">No songs available in this album.</p>`
                        }

                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.log(error);

        pageContent.innerHTML = `
            <div class="flex items-center justify-center h-full">
                ${renderErrorCard("Something went wrong.")}
            </div>
        `;
    }
};

