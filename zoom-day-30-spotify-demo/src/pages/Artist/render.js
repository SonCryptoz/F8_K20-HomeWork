import { renderErrorCard } from "../../components/errorCard";
import { POPUP_ICONS } from "../../components/popup";
import { fetchData } from "../../services/spotifyAPI";
import {
    formatDuration,
    formatPlayCount,
    getTrackNameFontSize,
    getYear,
} from "../../utils/format";
import { getQueryParams } from "../../utils/router";

// * Render Artist Page
export const renderArtistPage = async () => {
    const pageContent = document.querySelector("#page-content");
    if (!pageContent) return;

    const { id: artistId } = getQueryParams();

    try {
        const artist = await fetchData.get(`/artists/${artistId}`);
        const { tracks } = await fetchData.get("/tracks?offset=0&limit=50");
        const { albums } = await fetchData.get("/albums?limit=20&offset=0");

        if (artist?.error?.message || !artistId) {
            throw new Error("API Error");
        }

        // Lọc track / album thuộc đúng artist này
        const artistTracks = tracks.filter((t) => t.artist_id === artist.id);
        const artistAlbums = albums.filter((al) => al.artist_id === artist.id);

                const popularTracks = artistTracks.length > 0 ? artistTracks : [];
        const discography = artistAlbums.length > 0 ? artistAlbums : [];
        
        window.currentTracksData = popularTracks;
        window.allTracksData = tracks; // Cần thiết để lấy danh sách bài hát cho từng album
        
        pageContent.innerHTML = `
            <div class="artist-page pb-8">

                <!-- ===== HERO SECTION ===== -->
                <div
                    class="artist-hero flex flex-col md:flex-row md:items-end gap-4 md:gap-6 px-4 md:px-6 pt-6 md:pt-10 pb-5 md:pb-6"
                    style="background: ${
                        artist.background_image_url
                            ? `linear-gradient(to bottom, rgba(0,0,0,0.3), #121212), url('${artist.background_image_url}') center/cover no-repeat`
                            : `linear-gradient(to bottom, #6b3a3a, #121212)`
                    };"
                >

                    <!-- Avatar -->
                    <div class="artist-hero__avatar shrink-0 rounded-full shadow-2xl overflow-hidden bg-sp-highlight flex items-center justify-center text-sp-text-subdued w-36 h-36 md:w-44 md:h-44 lg:w-48 lg:h-48">
                        ${
                            artist.image_url
                                ? `<img src="${artist.image_url}" alt="${artist.name}" class="w-full h-full object-cover" />`
                                : `<span class="font-black text-4xl">${artist.name?.charAt(0) ?? "?"}</span>`
                        }
                    </div>

                    <!-- Info -->
                    <div class="artist-hero__info flex flex-col justify-end min-w-0 w-full">

                        ${
                            artist.is_verified
                                ? `<div class="flex items-center gap-1 mb-2">
                                    <svg viewBox="0 0 122.88 116.87" class="w-5 h-5 md:w-6 md:h-6">
                                        <polygon fill="#1ed760" fill-rule="evenodd" points="61.37 8.24 80.43 0 90.88 17.79 111.15 22.32 109.15 42.85 122.88 58.43 109.2 73.87 111.15 94.55 91 99 80.43 116.87 61.51 108.62 42.45 116.87 32 99.08 11.73 94.55 13.73 74.01 0 58.43 13.68 42.99 11.73 22.32 31.88 17.87 42.45 0 61.37 8.24"/>
                                        <path fill="#fff" d="M37.92,65c-6.07-6.53,3.25-16.26,10-10.1,2.38,2.17,5.84,5.34,8.24,7.49L74.66,39.66C81.1,33,91.27,42.78,84.91,49.48L61.67,77.2a7.13,7.13,0,0,1-9.9.44C47.83,73.89,42.05,68.5,37.92,65Z"/>
                                    </svg>
                                    <span class="text-white font-medium text-xs md:text-sm">Verified by Spotify</span>
                                </div>`
                                : ""
                        }

                        <h1
                            class="text-white font-black leading-tight mb-1.5 md:mb-2 truncate max-w-full"
                            style="font-size: clamp(28px, 5vw, ${getTrackNameFontSize(artist.title)}px);"
                        >
                            ${artist.name}
                        </h1>

                        <span class="text-white font-medium text-sm md:text-base">
                            ${formatPlayCount(artist.monthly_listeners)} monthly listeners
                        </span>
                    </div>
                </div>


                <!-- ===== ACTIONS ===== -->
                <div class="artist-actions flex items-center gap-4 md:gap-6 px-4 md:px-6 py-4 md:py-6 bg-sp-base">

                    <!-- Play -->
                    <button
                        id="artist-play-btn"
                        class="shrink-0 flex items-center justify-center rounded-full cursor-pointer bg-sp-bg-base hover:bg-sp-bg-highlight hover:scale-105 transition-all w-12 h-12 md:w-14 md:h-14"
                        data-tooltip="Play"
                    >
                        <svg viewBox="0 0 24 24" class="fill-black w-5 h-5 md:w-6 md:h-6 ml-0.5">
                            <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/>
                        </svg>
                    </button>

                    <!-- Shuffle -->
                    <button
                        class="text-sp-text-subdued cursor-pointer hover:text-white hover:scale-105 active:scale-95 transition-all"
                        id="artist-shuffle-btn"
                        data-tooltip="Enable shuffle"
                    >
                        <svg viewBox="0 0 16 16" class="fill-current w-5 h-5 md:w-6 md:h-6">
                            <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"/>
                            <path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"/>
                        </svg>
                    </button>

                    <!-- Follow -->
                    <button
                        id="artist-follow-btn"
                        class="border border-white/50 text-white rounded-full cursor-pointer font-bold px-3 md:px-4 py-1 hover:border-white hover:scale-105 transition-all text-xs md:text-sm"
                        data-artist-id="${artist.id}"
                        data-following="${artist.is_following}"
                        data-artist-name="${artist.name}"
                        data-artist-image="${artist.image_url || ''}"
                    >
                        ${artist.is_following ? "Following" : "Follow"}
                    </button>
                </div>


                <!-- ===== POPULAR TRACKS ===== -->
                <div class="artist-popular px-4 md:px-6">

                    <h2 class="text-white text-xl md:text-2xl font-bold mb-3 md:mb-4">
                        Popular
                    </h2>

                    <div class="popular-list flex flex-col max-h-72 overflow-auto">
                        ${
                            popularTracks.length > 0
                                ? popularTracks
                                    .map(
                                        (track, index) => `
                                            <div
                                                class="popular-item flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2 rounded-md hover:bg-white/10 transition-colors group min-w-0"
                                                data-track-id="${track.id}"
                                                data-audio-url="${track.audio_url}"
                                            >

                                                <!-- Index / Play -->
                                                <div class="w-5 md:w-8 shrink-0 text-sp-text-subdued text-sm md:text-base group-hover:hidden flex justify-center">
                                                    ${index + 1}
                                                </div>

                                                <button
                                                    id="track__play-btn"
                                                    class="w-5 md:w-8 shrink-0 text-white hidden group-hover:flex justify-center"
                                                >
                                                    <svg viewBox="0 0 24 24" class="fill-current w-4 h-4">
                                                        <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"/>
                                                    </svg>
                                                </button>

                                                <!-- Title -->
                                                <div class="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                                    <div class="w-10 h-10 rounded bg-sp-highlight shrink-0 overflow-hidden">
                                                        ${
                                                            track.image_url || track.album_cover_image_url || track.artist_image_url
                                                                ? `<img src="${track.image_url || track.album_cover_image_url || track.artist_image_url}" alt="${track.title}" class="w-full h-full object-cover" />`
                                                                : ""
                                                        }
                                                    </div>

                                                    <a
                                                        href="/track?id=${track.id}"
                                                        data-link
                                                        class="text-white font-medium hover:underline truncate"
                                                    >
                                                        ${track.title}
                                                    </a>
                                                </div>

                                                <!-- Add to Liked Songs -->
                                                <button
                                                    class="track-like-btn mr-2 md:mr-8 lg:mr-12 text-sp-text-subdued hidden group-hover:flex hover:text-white cursor-pointer transition-all shrink-0"
                                                    data-track-id="${track.id}"
                                                    data-track-title="${track.title}"
                                                    data-liked="${track.is_liked || false}"
                                                    data-tooltip="${track.is_liked ? "Change playlist" : "Add to Liked Songs"}"
                                                >
                                                    ${track.is_liked ? POPUP_ICONS.checkedCircle : POPUP_ICONS.addCircle}
                                                </button>

                                                <!-- Player Count -->
                                                <div class="hidden sm:block text-sp-text-subdued text-xs md:text-sm text-right pr-2 md:pr-8 truncate w-20 md:w-28">
                                                    ${formatPlayCount(track.play_count)}
                                                </div>

                                                <!-- Duration -->
                                                <div class="w-10 md:w-12 shrink-0 text-sp-text-subdued text-xs md:text-sm text-right">
                                                    ${formatDuration(track.duration)}
                                                </div>
                                            </div>
                                        `,
                                    )
                                    .join("")
                                : `<p class="text-sp-text-subdued">No songs available.</p>`
                        }
                    </div>
                </div>


                <!-- ===== DISCOGRAPHY / ALBUMS ===== -->
                <div class="artist-albums mt-8 md:mt-10 px-4 md:px-6">

                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-white text-xl md:text-2xl font-bold">
                            Discography
                        </h2>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                        ${
                            discography.length > 0
                                ? discography
                                    .map(
                                        (album) => `
                                            <div
                                                class="p-2 md:p-3 rounded-md hover:bg-sp-highlight transition-colors cursor-pointer group min-w-0"
                                                data-album-id="${album.id}"
                                            >
                                                <div class="relative w-full aspect-square mb-3 md:mb-4 shadow-lg rounded-md overflow-hidden bg-sp-highlight">

                                                    ${
                                                        album.cover_image_url
                                                            ? `<img src="${album.cover_image_url}" alt="${album.title}" class="w-full h-full object-cover" />`
                                                            : ""
                                                    }

                                                    <div class="absolute bottom-2 right-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            id="playlist__play-btn"
                                                            class="w-10 h-10 md:w-12 md:h-12 bg-sp-bg-base rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 hover:bg-sp-bg-highlight transition-all"
                                                        >
                                                            <svg viewBox="0 0 24 24" class="fill-black w-5 h-5 md:w-5.5 md:h-5.5">
                                                                <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <h3 class="text-white font-bold truncate pb-1 text-sm md:text-base">
                                                    ${album.title}
                                                </h3>

                                                <p class="text-sp-text-subdued text-xs md:text-sm truncate">
                                                    ${getYear(album.release_date)} • ${album.total_tracks} bài hát
                                                </p>
                                            </div>
                                        `,
                                    )
                                    .join("")
                                : `<p class="text-sp-text-subdued">No albums available.</p>`
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
