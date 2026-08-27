import { renderErrorCard } from "../../components/errorCard";
import { fetchData } from "../../services/spotifyAPI";
import { POPUP_ICONS } from "../../components/popup";
import {
    formatDuration,
    formatPlayCount,
    getTrackNameFontSize,
    getYear,
} from "../../utils/format";
import { getQueryParams } from "../../utils/router";

// * Render Track Page
export const renderTrackPage = async () => {
    const pageContent = document.querySelector("#page-content");
    if (!pageContent) return;

    const { id: trackId } = getQueryParams();

    try {
        const song = await fetchData.get(`/tracks/${trackId}`);

        if (song?.error?.message || !trackId) {
            throw new Error("API Error");
        }
        
        window.currentTrackData = song;

        pageContent.innerHTML = `
            <div class="track-page">

                <!-- ===== HERO SECTION ===== -->
                <div
                    class="track-hero flex flex-col md:flex-row md:items-end gap-4 md:gap-6 px-4 md:px-6 pt-6 md:pt-10 pb-5 md:pb-6"
                    style="background: linear-gradient(to bottom, #6b3a3a, #121212);"
                >

                    <!-- Album Cover -->
                    <div class="track-hero__cover w-36 h-36 md:w-44 md:h-44 lg:w-56 lg:h-56 shrink-0 rounded shadow-2xl overflow-hidden">
                        ${
                            song.image_url || song.album_cover_image_url || song.artist_image_url
                                ? `<img src="${song.image_url || song.album_cover_image_url || song.artist_image_url}" alt="${song.title}" class="w-full h-full object-cover" />`
                                : `<div class="w-full h-full gradient-art-6 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" class="fill-white/30 w-10 h-10 md:w-12 md:h-12">
                                        <path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/>
                                    </svg>
                                </div>`
                        }
                    </div>

                    <!-- Track Info -->
                    <div class="track-hero__info flex flex-col justify-end min-w-0 w-full">

                        <span class="track-hero__type text-white font-bold text-xs md:text-sm">
                            Song
                        </span>

                        <h1
                            class="track-hero__name text-white font-black leading-tight my-1.5 md:my-2 lg:my-3 max-w-full truncate"
                            style="font-size: clamp(28px, 5vw, ${getTrackNameFontSize(song.title)}px);"
                        >
                            ${song.title}
                        </h1>

                        <!-- Metadata -->
                        <div class="track-hero__meta flex items-center flex-wrap gap-1 text-white text-xs md:text-sm">

                            <!-- Artist Avatar -->
                            <div class="shrink-0 rounded-full overflow-hidden w-6 h-6">
                                ${
                                    song.artist_image_url
                                        ? `<img src="${song.artist_image_url}" alt="${song.artist_name}" class="w-full h-full object-cover" />`
                                        : `<div class="w-full h-full gradient-art-8 flex items-center justify-center">
                                            <svg viewBox="0 0 24 24" class="fill-white/50 w-3 h-3">
                                                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.523 0-10 3.582-10 8a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1c0-4.418-4.477-8-10-8z"/>
                                            </svg>
                                        </div>`
                                }
                            </div>

                            <a href="/artist?id=${song.artist_id}" data-link class="font-bold hover:underline truncate max-w-37.5">
                                ${song.artist_name}
                            </a>

                            <span class="text-white/60">•</span>

                            <a href="/album?id=${song.album_id}" data-link class="hover:underline truncate max-w-37.5">
                                ${song.album_title}
                            </a>

                            <span class="text-white/60">•</span>
                            <span class="text-white/60">${getYear(song.created_at)}</span>

                            <span class="text-white/60">•</span>
                            <span class="text-white/60">${formatDuration(song.duration)}</span>

                            <span class="text-white/60">•</span>
                            <span class="text-white/60">${formatPlayCount(song.play_count)}</span>
                        </div>
                    </div>
                </div>


                <!-- ===== ACTION BAR ===== -->
                <div
                    class="track-actions flex items-center gap-4 md:gap-6 px-4 md:px-6 py-4 md:py-5"
                    style="background: linear-gradient(to bottom, rgba(107,58,58,0.35), #121212 60%);"
                >

                    <!-- Play -->
                    <button
                        class="track-actions__play-btn shrink-0 flex items-center justify-center cursor-pointer rounded-full bg-sp-bg-base hover:bg-sp-bg-highlight hover:scale-105 transition-all w-12 h-12 md:w-14 md:h-14"
                        id="track-play-btn"
                        data-tooltip="Play"
                        data-audio-url="${song.audio_url}"
                    >
                        <svg viewBox="0 0 24 24" class="fill-black w-5 h-5 md:w-6 md:h-6 ml-0.5">
                            <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/>
                        </svg>
                    </button>

                    <!-- Like -->
                    <button
                        class="track-like-btn track-actions__add-btn text-sp-text-subdued cursor-pointer hover:text-white hover:scale-105 transition-all flex items-center justify-center p-1.5 md:p-2"
                        id="track-add-btn"
                        data-tooltip="${song.is_liked ? "Change playlist" : "Save to Your Library"}"
                        data-liked="${song.is_liked}"
                        data-track-id="${song.id}"
                        data-track-title="${song.title}"
                        data-track-image="${song.image_url || song.album_cover_image_url || ''}"
                    >
                        ${song.is_liked ? POPUP_ICONS.checkedCircle : POPUP_ICONS.addCircle}
                    </button>

                    <!-- More -->
                    <button
                        class="track-actions__more-btn text-sp-text-subdued cursor-pointer hover:text-white hover:scale-105 transition-all"
                        id="track-more-btn"
                        data-tooltip="More options"
                    >
                        <svg viewBox="0 0 24 24" class="fill-current w-7 h-7 md:w-8 md:h-8">
                            <path d="M4.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                        </svg>
                    </button>
                </div>


                <!-- ===== ARTIST CARD ===== -->
                <div class="track-artist-section px-4 md:px-6 pb-6">
                    <a
                        href="/artist?id=${song.artist_id}"
                        data-link
                        class="track-artist-card flex items-center gap-3 md:gap-4 rounded-lg hover:bg-sp-highlight transition-colors cursor-pointer p-3 md:px-4 w-full md:w-fit md:min-w-75"
                    >

                        <!-- Artist Avatar -->
                        <div class="shrink-0 rounded-full overflow-hidden w-12 h-12 md:w-14 md:h-14">
                            ${
                                song.artist_image_url
                                    ? `<img src="${song.artist_image_url}" alt="${song.artist_name}" class="w-full h-full object-cover" />`
                                    : `<div class="w-full h-full gradient-art-8 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" class="fill-white/40 w-5 h-5 md:w-6 md:h-6">
                                            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.523 0-10 3.582-10 8a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1c0-4.418-4.477-8-10-8z"/>
                                        </svg>
                                    </div>`
                            }
                        </div>

                        <!-- Artist Info -->
                        <div class="min-w-0">
                            <p class="text-sp-text-subdued text-xs md:text-[13px]">
                                Artist
                            </p>

                            <p class="text-white font-bold text-sm md:text-base truncate">
                                ${song.artist_name}
                            </p>
                        </div>
                    </a>
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

