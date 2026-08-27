import { renderErrorCard } from "../../components/errorCard";
import { fetchData } from "../../services/spotifyAPI";
import {
    formatDuration,
    formatTotalDuration,
    formatDateAdded,
} from "../../utils/format";
import { getQueryParams } from "../../utils/router";
import { POPUP_ICONS } from "../../components/popup";
import { loginPage } from "../../services/redirectLogin";
import { getCurrentUser } from "../../services/auth.js";

// SVG Icons cho các nút chức năng

const ICONS = {
    globe: `<svg viewBox="0 0 16 16" class="fill-current" style="width: 20px; height: 20px;"><path d="M8.152 16H8a8 8 0 1 1 .152 0m-.41-14.202c-.226.273-.463.713-.677 1.323-.369 1.055-.626 2.496-.687 4.129h3.547c-.06-1.633-.318-3.074-.687-4.129-.213-.61-.45-1.05-.676-1.323-.194-.235-.326-.285-.385-.296h-.044c-.055.007-.19.052-.391.296M4.877 7.25c.062-1.771.34-3.386.773-4.624q.148-.427.329-.806a6.51 6.51 0 0 0-4.436 5.43zm-3.334 1.5a6.51 6.51 0 0 0 4.436 5.43 8 8 0 0 1-.33-.806c-.433-1.238-.71-2.853-.772-4.624zm4.835 0c.061 1.633.318 3.074.687 4.129.214.61.451 1.05.677 1.323.202.244.336.29.391.297l.044-.001c.06-.01.19-.061.385-.296.226-.273.463-.713.676-1.323.37-1.055.626-2.496.687-4.129zm5.048 0c-.061 1.771-.339 3.386-.772 4.624q-.123.353-.268.674a6.5 6.5 0 0 0 4.071-5.298zm3.031-1.5a6.51 6.51 0 0 0-4.071-5.298q.145.322.268.674c.433 1.238.711 2.853.772 4.624z"/></svg>`,
    lock: `<svg viewBox="0 0 16 16" class="fill-current" style="width: 20px; height: 20px;"><path d="M4 4a4 4 0 1 1 8 0v3h1.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25v-5.5C1 7.784 1.784 7 2.75 7H4zm1.5 3h5V4a2.5 2.5 0 0 0-5 0zM2.75 8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 32px; height: 32px;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    delete: `<svg viewBox="0 0 24 24" class="fill-current" style="width: 28px; height: 28px;"><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>`,
};

export const renderMyPlaylistPage = async () => {
    const pageContent = document.querySelector("#page-content");
    if (!pageContent) return;

    // Kiểm tra trạng thái đăng nhập - Nếu chưa đăng nhập chuyển sang Login
    const user = await getCurrentUser();
    if (!user) {
        loginPage();
        return;
    }

    const { id: playlistId } = getQueryParams();

    try {
        const playlist = await fetchData.get(`/playlists/${playlistId}`);
        const { tracks } = await fetchData.get(
            `/playlists/${playlistId}/tracks`,
        );

        if (playlist?.error?.message || !playlistId) {
            throw new Error("API Error");
        }

        const playlistTracks = tracks;
        playlistTracks.reverse();
        window.currentTracksData = tracks;

        // Trạng thái công khai (1: Public, 0: Private)
        const isPublic =
            playlist.is_public === 1 || playlist.is_public === true;

        pageContent.innerHTML = `
            <div class="playlist-page" style="padding-bottom: 32px;">
                
                <!-- ===== HERO SECTION ===== -->
                <div class="playlist-hero flex flex-col md:flex-row md:items-end gap-5 md:gap-6"
                    style="background: linear-gradient(transparent 0, rgba(0,0,0,0.5) 100%), var(--sp-bg-highlight); padding: 24px 16px 20px 16px;">

                    <!-- Cover Image with Editable Overlay -->
                    <div
                        class="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-md shrink-0 shadow-[0_4px_60px_rgba(0,0,0,0.5)] bg-sp-highlight overflow-hidden flex items-center justify-center relative group cursor-pointer"
                        id="myplaylist-cover-edit-btn"
                    >
                        ${
                            playlist.image_url
                                ? `<img src="${playlist.image_url}" alt="Playlist Cover" class="w-full h-full object-cover" id="myplaylist-cover-img" />`
                                : `<svg viewBox="0 0 24 24" class="fill-sp-text-subdued w-12 h-12 md:w-16 md:h-16"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"></path></svg>`
                        }

                        <!-- Hover Overlay -->
                        <div class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg viewBox="0 0 24 24" class="fill-white w-8 h-8 md:w-10 md:h-10 mb-2">
                                <path d="M17.318 1.975a3.329 3.329 0 1 1 4.707 4.707L8.451 20.256c-.49.49-1.082.867-1.735 1.103L2.34 22.94a1 1 0 0 1-1.28-1.28l1.581-4.376a4.7 4.7 0 0 1 1.103-1.735zm3.293 1.414a1.33 1.33 0 0 0-1.88 0L5.159 16.963c-.283.283-.5.624-.636 1l-.857 2.372 2.371-.857a2.7 2.7 0 0 0 1.001-.636L20.611 5.268a1.33 1.33 0 0 0 0-1.879"></path>
                            </svg>
                            <span class="text-white text-sm md:text-md font-medium">Choose photo</span>
                        </div>
                    </div>

                    <!-- Metadata Info -->
                    <div class="flex flex-col gap-2 relative min-w-0 w-full">

                        <span
                            class="text-sm font-medium text-white"
                            id="myplaylist-public-status"
                        >
                            ${isPublic ? "Public Playlist" : "Private Playlist"}
                        </span>

                        <!-- Editable Title -->
                        <h1
                            class="font-black text-white text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-tight cursor-pointer truncate"
                            id="myplaylist-title-edit"
                            data-tooltip="Edit details"
                        >
                            ${playlist.name}
                        </h1>

                        <p
                            class="text-sp-text-subdued font-medium text-sm mb-2 md:mb-3 line-clamp-2"
                            id="playlist-description"
                            style="${playlist.description ? '' : 'display: none;'}"
                        >
                            ${playlist.description || ''}
                        </p>

                        <!-- Metadata line -->
                        <div
                            class="playlist-hero__meta flex items-center flex-wrap gap-1 text-white font-medium"
                            style="font-size: 14px;"
                        >
                            <div
                                class="shrink-0 rounded-full overflow-hidden flex items-center justify-center"
                                style="width: 24px; height: 24px;"
                            >
                                <img
                                    src="${playlist.user_image_url || "https://i.pravatar.cc/100?img=12"}"
                                    class="w-full h-full object-cover rounded-full"
                                />
                            </div>

                            <span class="font-bold hover:underline cursor-pointer truncate max-w-37.5">
                                ${playlist.user_display_name || playlist.user_username || "Spotify"}
                            </span>

                            <span class="text-white/60">•</span>

                            <span class="text-white/60">
                                ${playlist.total_tracks || playlistTracks.length} songs, about ${formatTotalDuration(playlist.total_duration || playlistTracks.reduce((acc, curr) => acc + (curr.track_duration || curr.duration || 0), 0))}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- ===== ACTION BAR ===== -->
                <div
                    class="myplaylist-actions flex items-center gap-5 md:gap-6"
                    style="padding: 16px; background: linear-gradient(to bottom, rgba(80,56,40,0.35), #121212 60%);"
                >

                    <!-- Play Button -->
                    <button
                        class="myplaylist-actions__play-btn shrink-0 flex items-center justify-center cursor-pointer rounded-full bg-sp-bg-base hover:bg-sp-bg-highlight hover:scale-105 transition-all"
                        style="width: 52px; height: 52px;"
                        id="playlist-play-btn"
                        data-tooltip="Play"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            class="fill-black w-5 h-5 md:w-6 md:h-6"
                            style="margin-left: 2px;"
                        >
                            <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/>
                        </svg>
                    </button>

                    <!-- Shuffle Button -->
                    <button
                        class="text-sp-text-subdued cursor-pointer hover:scale-105 transition-all"
                        id="my-playlist-shuffle-btn"
                        data-tooltip="Shuffle"
                    >
                        <svg viewBox="0 0 16 16" class="fill-current w-5 h-5 md:w-6 md:h-6">
                            <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"></path>
                            <path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"></path>
                        </svg>
                    </button>

                    <!-- Delete Playlist Button -->
                    <button
                        class="myplaylist-delete-btn text-sp-text-subdued cursor-pointer hover:text-red-500 hover:scale-105 transition-all ml-0 md:ml-2"
                        id="myplaylist-delete-btn"
                        data-tooltip="Delete playlist"
                    >
                        ${ICONS.delete}
                    </button>
                </div>

                <!-- Edit Modal Container -->
                <div
                    id="myplaylist-edit-modal"
                    hidden
                    class="fixed flex items-center justify-center inset-0 z-100 bg-black/70 p-4"
                >
                    <div class="bg-sp-highlight rounded-xl p-5 md:p-6 w-full max-w-131 max-h-[90vh] overflow-y-auto shadow-2xl relative">

                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-white text-xl md:text-2xl font-bold">
                                Edit details
                            </h2>

                            <button
                                class="text-sp-text-subdued hover:text-white hover:bg-[#3a3a3a] absolute top-4 right-4 rounded-[50%] p-2 cursor-pointer"
                                id="myplaylist-edit-close"
                            >
                                <svg viewBox="0 0 16 16" class="fill-current w-4 h-4">
                                    <path d="M1.47 1.47a.75.75 0 011.06 0L8 6.94l5.47-5.47a.75.75 0 111.06 1.06L9.06 8l5.47 5.47a.75.75 0 11-1.06 1.06L8 9.06l-5.47 5.47a.75.75 0 11-1.06-1.06L6.94 8 1.47 2.53a.75.75 0 010-1.06z"/>
                                </svg>
                            </button>
                        </div>

                        <div
                            id="myplaylist-name-error"
                            style="display: none;"
                            class="bg-[#e91429] text-white p-3 rounded mb-4 text-[13px] font-bold flex items-center gap-2"
                        >
                            <svg viewBox="0 0 16 16" class="fill-current w-5 h-5">
                                <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"/>
                                <path d="M7.25 12.026v-1.5h1.5v1.5h-1.5zm.884-7.096A1.125 1.125 0 007.06 6.39l.256 2.814h1.368l.256-2.814a1.125 1.125 0 00-1.074-1.46z"/>
                            </svg>
                            Playlist name is required.
                        </div>

                        <!-- Modal Content -->
                        <div class="flex flex-col sm:flex-row gap-4 mb-4">

                            <!-- Image -->
                            <div
                                class="w-full sm:w-45 h-45 rounded-md overflow-hidden shrink-0 bg-sp-highlight flex items-center justify-center shadow-lg relative group cursor-pointer"
                                id="myplaylist-modal-img-container"
                            >
                                ${
                                    playlist.image_url
                                        ? `<img src="${playlist.image_url}" alt="Cover" class="w-full h-full object-cover" id="myplaylist-modal-img" />`
                                        : `<svg viewBox="0 0 24 24" class="fill-sp-text-subdued w-14 h-14"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/></svg>`
                                }

                                <div class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg viewBox="0 0 24 24" class="fill-white w-9 h-9 mb-2">
                                        <path d="M17.318 1.975a3.329 3.329 0 1 1 4.707 4.707L8.451 20.256c-.49.49-1.082.867-1.735 1.103L2.34 22.94a1 1 0 0 1-1.28-1.28l1.581-4.376a4.7 4.7 0 0 1 1.103-1.735zm3.293 1.414a1.33 1.33 0 0 0-1.88 0L5.159 16.963c-.283.283-.5.624-.636 1l-.857 2.372 2.371-.857a2.7 2.7 0 0 0 1.001-.636L20.611 5.268a1.33 1.33 0 0 0 0-1.879"></path>
                                    </svg>
                                    <span class="text-white font-bold text-[15px]">
                                        Choose photo
                                    </span>
                                </div>

                                <input
                                    type="file"
                                    id="myplaylist-modal-file-input"
                                    class="hidden"
                                    accept="image/*"
                                />
                            </div>

                            <div class="flex-1 flex flex-col gap-3 min-w-0">
                                <input
                                    type="text"
                                    id="myplaylist-modal-name"
                                    value="${playlist.name}"
                                    class="w-full bg-white/10 text-white p-2 rounded outline-none border border-transparent focus:border-white/50 text-sm font-medium"
                                    placeholder="Add a name"
                                />

                                <textarea
                                    id="myplaylist-modal-desc"
                                    class="w-full min-h-32 sm:h-full bg-white/10 text-white p-2 rounded outline-none border border-transparent focus:border-white/50 text-sm resize-none"
                                    placeholder="Add an optional description"
                                >${playlist.description || ""}</textarea>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-2">

                            <button
                                id="myplaylist-modal-visibility"
                                class="text-white font-bold text-sm bg-transparent cursor-pointer border border-white/30 rounded-full px-4 py-2 hover:border-white active:scale-95 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                                data-public="${isPublic ? "1" : "0"}"
                            >
                                ${isPublic ? ICONS.lock + " Make private" : ICONS.globe + " Make public"}
                            </button>

                            <button
                                id="myplaylist-modal-save"
                                class="bg-white text-black font-bold cursor-pointer px-8 py-3 rounded-full hover:scale-105 transition-all w-full sm:w-auto"
                            >
                                Save
                            </button>
                        </div>

                        <p class="text-[11px] text-white font-bold mt-4">
                            By proceeding, you agree to give Spotify access to the image you choose to upload. Please make sure you have the right to upload the image.
                        </p>
                    </div>
                </div>

                <!-- ===== TRACKLIST TABLE ===== -->
                <div class="playlist-tracks px-3 sm:px-4 md:px-6">

                    <!-- Table Header -->
                    <div
                        class="playlist-tracks-header flex items-center px-2 sm:px-4 py-2 text-sp-text-subdued text-sm font-medium border-b border-white/10 mb-2"
                    >
                        <div class="w-6 sm:w-8 flex justify-center mr-2 sm:mr-4">
                            #
                        </div>

                        <div class="flex-1 min-w-0">
                            Title
                        </div>

                        <div class="flex-1 hidden md:block min-w-0">
                            Album
                        </div>

                        <div class="w-32 hidden lg:block text-sp-text-subdued">
                            Date added
                        </div>

                        <div class="w-10 hidden sm:flex justify-center"></div>

                        <div class="w-12 flex justify-end mr-2 sm:mr-4">
                            <svg viewBox="0 0 16 16" class="fill-current w-4 h-4">
                                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
                                <path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z"/>
                            </svg>
                        </div>
                    </div>

                    <!-- Track Rows -->
                    <div class="playlist-tracks-list flex flex-col">
                        ${
                            playlistTracks.length > 0
                                ? playlistTracks
                                    .map((track, index) => {
                                        const albumId = track.album_id || "";
                                        const albumTitle =
                                            track.album_title || "Single";

                                        const dateAdded = formatDateAdded(
                                            track.added_at ||
                                                track.saved_at ||
                                                track.created_at ||
                                                track.updated_at ||
                                                playlist.updated_at ||
                                                playlist.created_at,
                                        );

                                        return `
                                            <div
                                                class="playlist-track-item flex items-center group hover:bg-white/10 rounded-md transition-colors px-2 sm:px-4 py-2"
                                                data-track-id="${track.track_id}"
                                                data-audio-url="${track.track_audio_url || ""}"
                                            >

                                                <!-- Index -->
                                                <div class="w-6 sm:w-8 shrink-0 text-sp-text-subdued text-sm sm:text-base group-hover:hidden flex justify-center mr-2 sm:mr-4">
                                                    ${index + 1}
                                                </div>

                                                <!-- Play icon -->
                                                <button
                                                    id="myplaylist__track__play-btn"
                                                    class="w-6 sm:w-8 shrink-0 text-white hidden group-hover:flex justify-center mr-2 sm:mr-4"
                                                >
                                                    <svg viewBox="0 0 24 24" class="fill-current w-4 h-4">
                                                        <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/>
                                                    </svg>
                                                </button>

                                                <!-- Thumbnail & Title/Artist -->
                                                <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2 sm:pr-4">

                                                    <div class="w-9 h-9 sm:w-10 sm:h-10 rounded bg-sp-highlight shrink-0 overflow-hidden flex items-center justify-center">
                                                        ${
                                                            track.track_image_url ||
                                                            track.album_cover_image_url ||
                                                            track.artist_image_url
                                                                ? `<img src="${track.track_image_url || track.album_cover_image_url || track.artist_image_url}" alt="${track.track_title}" class="w-full h-full object-cover" />`
                                                                : `<svg viewBox="0 0 24 24" class="fill-white/30 w-5 h-5"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/></svg>`
                                                        }
                                                    </div>

                                                    <div class="flex flex-col min-w-0">
                                                        <a
                                                            href="/track?id=${track.track_id}"
                                                            data-link
                                                            class="text-white font-medium hover:underline truncate text-sm sm:text-base"
                                                        >
                                                            ${track.track_title}
                                                        </a>

                                                        <a
                                                            href="/artist?id=${track.artist_id}"
                                                            data-link
                                                            class="text-sp-text-subdued text-xs sm:text-sm hover:underline truncate"
                                                        >
                                                            ${track.artist_name || "Unknown Artist"}
                                                        </a>
                                                    </div>
                                                </div>

                                                <!-- Album Title -->
                                                <div class="flex-1 hidden md:block min-w-0 pr-4">
                                                    ${
                                                        albumId
                                                            ? `<a href="/album?id=${albumId}" data-link class="text-sp-text-subdued text-sm hover:underline hover:text-white truncate">${albumTitle}</a>`
                                                            : `<span class="text-sp-text-subdued text-sm truncate">${albumTitle}</span>`
                                                    }
                                                </div>

                                                <!-- Date Added -->
                                                <div class="w-32 hidden lg:block text-sp-text-subdued text-sm truncate pr-2">
                                                    ${dateAdded}
                                                </div>

                                                <!-- Like -->
                                                <div class="w-10 hidden sm:flex justify-center shrink-0">
                                                    <button
                                                        class="track-like-btn text-sp-text-subdued hidden group-hover:flex hover:text-white cursor-pointer transition-all"
                                                        data-track-id="${track.track_id}"
                                                        data-track-title="${track.track_title}"
                                                        data-liked="${track.is_liked || false}"
                                                        data-tooltip="${track.is_liked ? "Change playlist" : "Add to Liked Songs"}"
                                                    >
                                                        ${track.is_liked ? POPUP_ICONS.checkedCircle : POPUP_ICONS.addCircle}
                                                    </button>
                                                </div>

                                                <!-- Duration -->
                                                <div class="w-10 sm:w-12 shrink-0 text-sp-text-subdued text-xs sm:text-sm text-right mr-2 sm:mr-4">
                                                    ${formatDuration(track.track_duration)}
                                                </div>
                                            </div>
                                        `;
                                    })
                                    .join("")
                                : `<p class="text-sp-text-subdued py-6 text-center">No songs available in this playlist.</p>`
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