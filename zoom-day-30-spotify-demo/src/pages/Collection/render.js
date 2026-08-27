import { renderErrorCard } from "../../components/errorCard.js";
import { fetchData } from "../../services/spotifyAPI.js";
import { getCurrentUser } from "../../services/auth.js";
import {
    formatDateAdded,
    formatDuration,
    formatTotalDuration,
} from "../../utils/format.js";
import { POPUP_ICONS } from "../../components/popup.js";
import { loginPage } from "../../services/redirectLogin.js";

// SVG Icons cho trang Collection (Liked Songs)
const ICONS = {
    play: `<svg viewBox="0 0 24 24" class="fill-black" style="width: 24px; height: 24px; margin-left: 2px;"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/></svg>`,
    shuffle: `<svg viewBox="0 0 16 16" class="fill-current w-6 h-6"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"></path><path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"></path></svg>`,
    heartBig: `<svg viewBox="0 0 15 15" class="fill-white w-20 h-20"><path d="M8 3.5c1.2-1.7 3.5-2 4.8-.8 1.3 1.2 1.4 3.2.2 4.6L8 13 3 7.3C1.8 5.9 1.9 3.9 3.2 2.7 4.5 1.5 6.8 1.8 8 3.5z"/></svg>`,
    clock: `<svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/><path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z"/></svg>`,
    more: `<svg viewBox="0 0 16 16" class="fill-current w-4 h-4"><path d="M3 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM16 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>`,
};

/**
 * Render Collection Page (Liked Songs)
 */
export const renderCollectionPage = async () => {
    const pageContent = document.querySelector("#page-content");
    if (!pageContent) return;

    // Kiểm tra trạng thái đăng nhập - Nếu chưa đăng nhập chuyển sang Login
    const user = await getCurrentUser();
    if (!user) {
        loginPage();
        return;
    }

    try {
        // Gọi API /me/tracks/liked lấy danh sách bài hát đã thích của user
        const res = await fetchData.auth("/me/tracks/liked");
        const tracks = Array.isArray(res)
            ? res
            : res?.tracks || res?.data || [];

        // Tính toán thời lượng & số lượng bài hát
        const trackCount = tracks.length;
        const totalSeconds = tracks.reduce(
            (acc, t) => acc + (t.duration || t.track_duration || 0),
            0,
        );

        const durationFormatted = formatTotalDuration(totalSeconds);
        const creatorName = user?.display_name || user?.username || "Anonymous";

        window.currentTracksData = tracks;
        pageContent.innerHTML = `
            <div class="collection-page pb-8">

                <!-- ===== HERO SECTION ===== -->
                <div class="collection-hero flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-6 px-5 sm:px-6 pt-6 sm:pt-10 pb-5 sm:pb-6" style="background: linear-gradient(180deg, #5038a0 0%, #2e1e6a 60%, #121212 100%);">

                    <!-- Liked Songs Big Cover -->
                    <div class="collection-hero__cover w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 shrink-0 rounded-md shadow-2xl overflow-hidden flex items-center justify-center mx-auto sm:mx-0" style="background: linear-gradient(135deg, #450af5, #c4efd9);">
                        ${ICONS.heartBig}
                    </div>

                    <!-- Hero Info -->
                    <div class="collection-hero__info flex flex-col justify-end min-w-0 w-full">
                        <!-- Type -->
                        <span class="text-white font-bold text-xs sm:text-sm tracking-wider mb-1">Playlist</span>

                        <!-- Huge Title -->
                        <h1 class="text-white font-black leading-tight tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl my-1 sm:my-2 select-none truncate" id="collection-title">
                            Liked Songs
                        </h1>

                        <!-- Metadata row -->
                        <div class="flex items-center flex-wrap gap-1.5 text-white font-medium text-xs sm:text-sm mt-2 sm:mt-3">
                            <!-- Creator Avatar -->
                            <div class="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-sp-highlight flex items-center justify-center">
                                ${
                                    user?.avatar_url
                                        ? `<img src="${user.avatar_url}" alt="${creatorName}" class="w-full h-full object-cover" />`
                                        : `<svg viewBox="0 0 24 24" class="fill-sp-bg-base w-5 h-5"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`
                                }
                            </div>

                            <!-- Creator Name -->
                            <span class="font-bold hover:underline cursor-pointer">${creatorName}</span>
                            <span class="text-white/60">•</span>
                            <span class="text-white/90">${trackCount} songs${totalSeconds > 0 ? `, ${durationFormatted}` : ", 0 sec"}</span>
                        </div>
                    </div>
                </div>

                <!-- ===== ACTION BAR ===== -->
                <div class="collection-actions flex items-center gap-5 sm:gap-6 px-5 sm:px-6 py-4 sm:py-5" style="background: linear-gradient(to bottom, rgba(46,30,106,0.3), #121212 60%);">

                    <!-- Play Button -->
                    <button class="collection-play-btn shrink-0 flex items-center justify-center cursor-pointer rounded-full bg-sp-bg-base hover:bg-sp-bg-highlight hover:scale-105 active:scale-95 transition-all shadow-2xl w-14 h-14" id="collection-play-btn" data-tooltip="Play Liked Songs">
                        ${ICONS.play}
                    </button>

                    <!-- Shuffle Button -->
                    <button class="text-sp-text-subdued cursor-pointer hover:scale-105 active:scale-95 transition-all" id="collection-shuffle-btn" data-tooltip="Enable shuffle">
                        ${ICONS.shuffle}
                    </button>
                </div>

                <!-- ===== TRACKLIST TABLE ===== -->
                <div class="collection-tracks px-3 sm:px-4 md:px-6">

                    <!-- Table Header -->
                    <div class="collection-tracks-header flex items-center px-3 sm:px-4 py-2 text-sp-text-subdued text-xs sm:text-sm font-medium border-b border-white/10 mb-2">
                        <div class="w-6 sm:w-8 flex justify-center mr-2 sm:mr-4">#</div>
                        <div class="flex-1 min-w-0">Title</div>
                        <div class="flex-1 hidden md:block min-w-0">Album</div>
                        <div class="w-32 hidden lg:block text-sp-text-subdued">Date added</div>
                        <div class="w-10 flex justify-center"></div>
                        <div class="w-10 sm:w-12 flex justify-end mr-2 sm:mr-4">${ICONS.clock}</div>
                    </div>

                    <!-- Track Rows -->
                    <div class="collection-tracks-list flex flex-col">
                        ${
                            tracks.length > 0
                                ? tracks.map((track, index) => {
                                    const trackId = track.id || track.track_id;
                                    const trackTitle = track.title || track.track_title || "Unknown Title";
                                    const artistId = track.artist_id || "";
                                    const artistName = track.artist_name || "Unknown Artist";
                                    const albumId = track.album_id || "";
                                    const albumTitle = track.album_title || "Single";
                                    const imageUrl = track.image_url || track.track_image_url || track.album_cover_image_url || track.artist_image_url || "";
                                    const audioUrl = track.audio_url || track.track_audio_url || "";
                                    const duration = track.duration || track.track_duration || 0;
                                    const dateAdded = formatDateAdded(track.saved_at || track.created_at);

                                    return `
                                        <div class="collection-track-item flex items-center group hover:bg-white/10 rounded-md transition-colors px-3 sm:px-4 py-2" data-track-id="${trackId}" data-audio-url="${audioUrl}">

                                            <!-- Index / Play icon -->
                                            <div class="w-6 sm:w-8 text-sp-text-subdued text-sm group-hover:hidden flex justify-center mr-2 sm:mr-4 font-medium">${index + 1}</div>
                                            <div class="w-6 sm:w-8 text-white hidden group-hover:flex justify-center mr-2 sm:mr-4">
                                                <svg viewBox="0 0 24 24" class="fill-current w-4 h-4"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/></svg>
                                            </div>

                                            <!-- Thumbnail & Title/Artist -->
                                            <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2 sm:pr-4">
                                                <div class="w-10 h-10 rounded bg-sp-highlight shrink-0 overflow-hidden flex items-center justify-center shadow">
                                                    ${
                                                        imageUrl
                                                            ? `<img src="${imageUrl}" alt="${trackTitle}" class="w-full h-full object-cover" />`
                                                            : `<svg viewBox="0 0 24 24" class="fill-white/30 w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-0.45-1-1-1z"/></svg>`
                                                    }
                                                </div>

                                                <div class="flex flex-col min-w-0">
                                                    <a href="/track?id=${trackId}" data-link class="text-white font-medium hover:underline truncate text-sm">${trackTitle}</a>
                                                    <a href="/artist?id=${artistId}" data-link class="text-sp-text-subdued text-xs hover:underline hover:text-white truncate mt-0.5">${artistName}</a>
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
                                            <div class="w-32 hidden lg:block text-sp-text-subdued text-sm truncate pr-2">${dateAdded}</div>

                                            <!-- Like -->
                                            <div class="w-10 flex justify-center">
                                                <button class="track-like-btn text-sp-bg-base hidden group-hover:flex hover:scale-110 active:scale-95 transition-transform cursor-pointer" data-track-id="${trackId}" data-track-title="${trackTitle}" data-liked="true" data-tooltip="Change playlist">
                                                    ${POPUP_ICONS.checkedCircle}
                                                </button>
                                            </div>

                                            <!-- Track Duration -->
                                            <div class="w-10 sm:w-12 text-sp-text-subdued text-sm text-right font-normal mr-2 sm:mr-4">${formatDuration(duration)}</div>
                                        </div>
                                    `;
                                }).join("")
                                : `
                                    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
                                        <div class="w-16 h-16 rounded-full bg-sp-highlight flex items-center justify-center mb-4 text-sp-text-subdued">
                                            <svg viewBox="0 0 24 24" class="fill-current w-8 h-8"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                        </div>
                                        <h3 class="text-white font-bold text-lg mb-1">Songs you like will appear here</h3>
                                        <p class="text-sp-text-subdued text-sm max-w-sm">Save songs by tapping the heart or plus icon in the player or tracklists.</p>
                                    </div>
                                `
                        }
                    </div>
                </div>
            </div>
        `; 
    } catch (error) {
        console.error("Collection Page Error:", error);
        pageContent.innerHTML = `
            <div class="flex items-center justify-center h-full">
                ${renderErrorCard("Unable to load Liked Songs.")}
            </div>
        `;
    }
};

/**
 * Init events cho Collection Page
 */
