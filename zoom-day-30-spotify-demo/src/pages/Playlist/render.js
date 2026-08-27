import { getCurrentUser } from "../../services/auth";
import { renderErrorCard } from "../../components/errorCard";
import { fetchData } from "../../services/spotifyAPI";
import { getQueryParams } from "../../utils/router";
import { POPUP_ICONS } from "../../components/popup";

import {
    formatDuration,
    formatPlayCount,
    formatTotalDuration,
    getTrackNameFontSize,
} from "../../utils/format";

// SVG Icons cho các nút chức năng
const ICONS = {
    globe: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 28px; height: 28px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 28px; height: 28px;"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 32px; height: 32px;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    delete: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 28px; height: 28px;"><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>`,
};

// * Render Playlist Page — fetch data & render HTML vào #page-content
export const renderPlaylistPage = async () => {
    const pageContent = document.querySelector("#page-content");
    if (!pageContent) return;

    const { id: playlistId } = getQueryParams();
    const user = await getCurrentUser();

    try {
        const playlist = await fetchData.get(`/playlists/${playlistId}`);
        const { tracks } = await fetchData.get(
            `/playlists/${playlistId}/tracks`,
        );

        if (playlist?.error?.message || !playlistId) {
            throw new Error("API Error");
        }

        const playlistTracks = tracks;
        window.currentTracksData = tracks;

        // Trạng thái công khai (1: Public, 0: Private)
        const isPublic =
            playlist.is_public === 1 || playlist.is_public === true;

        pageContent.innerHTML = `
            <div class="playlist-page pb-8">

                <!-- ===== HERO SECTION ===== -->
                <div class="playlist-hero flex flex-col md:flex-row md:items-end gap-5 md:gap-6 bg-linear-to-b from-[#503828] to-sp-base px-4 py-6 md:px-6 md:pt-10 md:pb-6">

                    <!-- Playlist Cover -->
                    <div class="playlist-hero__cover w-40 h-40 md:w-44 md:h-44 lg:w-56 lg:h-56 flex justify-center items-center shrink-0 rounded shadow-2xl overflow-hidden bg-sp-highlight">
                        ${
                            playlist.image_url
                                ? `<img src="${playlist.image_url}" alt="${playlist.name}" class="w-full h-full object-cover" />`
                                : `
                                    <svg viewBox="0 0 24 24" class="fill-white/30 w-10 h-10 md:w-12 md:h-12">
                                        <path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"></path>
                                    </svg>
                                `
                        }
                    </div>

                    <!-- Playlist Info -->
                    <div class="playlist-hero__info flex flex-col justify-end min-w-0 w-full">
                        <span class="playlist-hero__type text-white font-medium tracking-wider text-xs md:text-sm" id="playlist-type">
                            ${isPublic ? "Public Playlist" : "Private Playlist"}
                        </span>

                        <h1 class="playlist-hero__name text-white font-black leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl wrap-break-word line-clamp-2 my-1.5 md:my-2" id="playlist-name">
                            ${playlist.name}
                        </h1>

                        ${
                            playlist.description
                                ? `<p class="text-sp-text-subdued font-medium text-xs md:text-sm mb-2 md:mb-3 line-clamp-2" id="playlist-description">${playlist.description}</p>`
                                : ""
                        }

                        <!-- Metadata -->
                        <div class="playlist-hero__meta flex items-center flex-wrap gap-1 text-white font-medium text-xs md:text-sm">
                            <div class="shrink-0 rounded-full overflow-hidden flex items-center justify-center w-6 h-6">
                                <svg viewBox="0 0 24 24" class="fill-sp-bg-base w-5 h-5">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                                </svg>
                            </div>

                            <span class="font-bold hover:underline cursor-pointer truncate max-w-32 sm:max-w-none" id="playlist-creator">
                                ${playlist.user_display_name || playlist.user_username || "Spotify"}
                            </span>

                            <span class="text-white/60">•</span>

                            <span id="playlist-saves" class="text-white/60">
                                ${formatPlayCount(playlist.followers_count || 0)} saves
                            </span>

                            <span class="text-white/60">•</span>

                            <span id="playlist-tracks-meta" class="text-white/60">
                                ${playlist.total_tracks || playlistTracks.length} songs, about ${formatTotalDuration(playlist.total_duration)}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- ===== ACTION BAR ===== -->
                <div class="playlist-actions flex items-center gap-5 md:gap-6 px-4 py-4 md:px-6 md:py-5 bg-linear-to-b from-[#503828]/35 to-sp-base">

                    <!-- Play -->
                    <button class="playlist-actions__play-btn shrink-0 flex items-center justify-center cursor-pointer rounded-full bg-sp-bg-base hover:bg-sp-bg-highlight hover:scale-105 transition-all w-12 h-12 md:w-14 md:h-14" id="playlist-play-btn" data-tooltip="Play">
                        <svg viewBox="0 0 24 24" class="fill-black w-5 h-5 md:w-6 md:h-6 ml-0.5">
                            <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/>
                        </svg>
                    </button>

                    <!-- Shuffle -->
                    <button class="text-sp-text-subdued cursor-pointer hover:scale-105 active:scale-95 transition-all" id="playlist-shuffle-btn" data-tooltip="Enable shuffle">
                        <svg viewBox="0 0 16 16" class="fill-current w-5 h-5 md:w-6 md:h-6">
                            <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"/>
                            <path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"/>
                        </svg>
                    </button>

                    ${
                        user
                            ? String(user.id) === String(playlist.user_id)
                                ? `
                                    <!-- Visibility -->
                                    <button class="playlist-actions__visibility-btn text-sp-text-subdued hover:text-white cursor-pointer hover:scale-105 transition-all" id="playlist-visibility-btn" data-tooltip="${isPublic ? "Make private" : "Make public"}" data-public="${isPublic ? "1" : "0"}">
                                        ${isPublic ? ICONS.globe : ICONS.lock}
                                    </button>

                                    <!-- Delete -->
                                    <button class="playlist-actions__delete-btn text-sp-text-subdued cursor-pointer hover:text-red-500 hover:scale-105 transition-all" id="playlist-delete-btn" data-tooltip="Delete playlist">
                                        ${ICONS.delete}
                                    </button>
                                `
                                : `
                                    <!-- Add -->
                                    <button class="playlist-actions__add-btn cursor-pointer hover:scale-105 transition-all ${playlist.is_following ? "" : "text-sp-text-subdued hover:text-white"}" id="playlist-add-btn" data-tooltip="${playlist.is_following ? "Remove from Your Library" : "Save to Your Library"}">
                                        ${
                                            playlist.is_following
                                                ? `<svg viewBox="0 0 24 24" class="fill-[#1ed760] w-7 h-7 md:w-8 md:h-8"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.808 14.331l-4.521-4.522 1.061-1.06 3.46 3.46 7.46-7.46 1.061 1.06-8.521 8.522z"/></svg>`
                                                : `<svg viewBox="0 0 24 24" class="fill-current w-7 h-7 md:w-8 md:h-8"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/><path d="M12.75 7.5h-1.5v3.75H7.5v1.5h3.75v3.75h1.5v-3.75h3.75v-1.5h-3.75V7.5z"/></svg>`
                                        }
                                    </button>

                                    <!-- Follow -->
                                    <button class="playlist-follow-btn border ${playlist.is_following ? "border-white" : "border-white/50"} text-white rounded-full cursor-pointer font-bold px-3 md:px-4 py-1 hover:border-white hover:scale-105 transition-all text-xs md:text-sm" id="playlist-follow-btn" data-tooltip="${playlist.is_following ? "Unfollow playlist" : "Follow playlist"}" data-following="${playlist.is_following}">
                                        ${playlist.is_following ? "Following" : "Follow"}
                                    </button>
                                `
                            : ""
                    }
                </div>

                <!-- ===== TRACKLIST ===== -->
                <div class="playlist-tracks px-2 sm:px-4 md:px-6">

                    <!-- Header -->
                    <div class="playlist-tracks-header flex items-center px-3 md:px-4 py-2 text-sp-text-subdued text-xs md:text-sm font-medium border-b border-white/10 mb-1">
                        <div class="w-7 md:w-8 flex justify-center mr-2 md:mr-4">#</div>
                        <div class="flex-1">Title</div>
                        <div class="w-10 md:w-12 flex justify-end mr-1 md:mr-4">
                            <svg viewBox="0 0 16 16" class="fill-current w-4 h-4">
                                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
                                <path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z"/>
                            </svg>
                        </div>
                    </div>

                    <!-- Rows -->
                    <div class="playlist-tracks-list flex flex-col">
                        ${
                            playlistTracks.length > 0
                                ? playlistTracks
                                    .map(
                                        (track, index) => `
                                    <div class="playlist-track-item flex items-center group hover:bg-white/10 rounded-md transition-colors px-2 sm:px-3 md:px-4 py-2" data-track-id="${track.track_id}" data-audio-url="${track.track_audio_url || ""}">

                                        <!-- Index / Play -->
                                        <div class="w-7 md:w-8 text-sp-text-subdued text-sm md:text-base group-hover:hidden flex justify-center mr-2 md:mr-4 shrink-0">
                                            ${index + 1}
                                        </div>

                                        <button id="playlist__track__play-btn" class="w-7 md:w-8 text-white hidden group-hover:flex justify-center mr-2 md:mr-4 shrink-0">
                                            <svg viewBox="0 0 24 24" class="fill-current w-4 h-4">
                                                <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/>
                                            </svg>
                                        </button>

                                        <!-- Thumbnail + Info -->
                                        <div class="flex items-center gap-2 md:gap-3 flex-1 min-w-0 pr-2 md:pr-4">
                                            <div class="w-9 h-9 md:w-10 md:h-10 rounded bg-sp-highlight shrink-0 overflow-hidden flex items-center justify-center">
                                                ${
                                                    track.track_image_url ||
                                                    track.album_cover_image_url ||
                                                    track.artist_image_url
                                                        ? `<img src="${track.track_image_url || track.album_cover_image_url || track.artist_image_url}" alt="${track.track_title}" class="w-full h-full object-cover" />`
                                                        : `<svg viewBox="0 0 24 24" class="fill-white/30 w-5 h-5"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/></svg>`
                                                }
                                            </div>

                                            <div class="flex flex-col min-w-0">
                                                <a href="/track?id=${track.track_id}" data-link class="text-white font-medium hover:underline truncate text-sm md:text-base">
                                                    ${track.track_title}
                                                </a>

                                                <a href="/artist?id=${track.artist_id}" data-link class="text-sp-text-subdued text-xs md:text-sm hover:underline truncate">
                                                    ${track.artist_name || "Unknown Artist"}
                                                </a>
                                            </div>
                                        </div>

                                        <!-- Like -->
                                        <div class="w-8 md:w-10 flex justify-center shrink-0">
                                            <button class="track-like-btn text-sp-text-subdued hidden group-hover:flex hover:text-white cursor-pointer transition-all" data-track-id="${track.track_id}" data-track-title="${track.track_title}" data-liked="${track.is_liked || false}" data-tooltip="${track.is_liked ? "Change playlist" : "Add to Liked Songs"}">
                                                ${track.is_liked ? POPUP_ICONS.checkedCircle : POPUP_ICONS.addCircle}
                                            </button>
                                        </div>

                                        <!-- Duration -->
                                        <div class="w-10 md:w-12 text-sp-text-subdued text-xs md:text-sm text-right mr-1 md:mr-4 shrink-0">
                                            ${formatDuration(track.track_duration)}
                                        </div>

                                    </div>
                                `,
                                    )
                                    .join("")
                                : `<p class="text-sp-text-subdued py-6 text-center text-sm">No songs available in this playlist.</p>`
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
