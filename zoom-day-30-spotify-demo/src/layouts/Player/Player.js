import { POPUP_ICONS } from "../../components/popup.js";

export const Player = () => {
    return `
        <!-- Lưu ý mb-[60px] để nổi trên BottomNav trên mobile, trên md trở đi thì mb-0 và gắn sát dưới -->
        <footer class="player relative flex items-center justify-between bg-sp-surface md:bg-black h-14 md:h-18 lg:h-22 px-3 md:px-4 gap-2 lg:gap-4 mb-18 md:mb-0 rounded-md md:rounded-none mx-2 md:mx-0 z-40" id="player">
            
            <!-- Mobile Thin Progress Bar (absolute top) -->
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-white/20 md:hidden rounded-t-md overflow-hidden pointer-events-none">
                <div id="player-mobile-thin-progress" class="h-full bg-white w-0 transition-all duration-100 ease-linear"></div>
            </div>

            <!-- LEFT: Now Playing Info -->
            <div class="player__left player__now-playing flex items-center gap-2 md:gap-3 flex-1 md:flex-none md:w-[30%] lg:w-[20%] min-w-0 h-full">
                <!-- Song Thumbnail -->
                <div class="player__thumbnail shrink-0 rounded overflow-hidden gradient-art-7 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" id="player-thumbnail">
                    <svg viewBox="0 0 24 24" class="w-5 h-5 md:w-6 md:h-6 fill-white/50">
                        <path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v10.167a3.5 3.5 0 1 1-3.5-3.5H6V3z"/>
                    </svg>
                </div>

                <!-- Song Info -->
                <div class="flex-1 min-w-0">
                    <p class="player__song-name w-fit max-w-full font-medium text-white truncate hover:underline cursor-pointer text-xs md:text-sm" id="player-song-name">
                        No song played
                    </p>
                    <p class="player__artist-name w-fit max-w-full text-sp-text-subdued truncate hover:text-white hover:underline cursor-pointer text-[10px] md:text-[11px]" id="player-artist-name">
                        ---
                    </p>
                </div>

                <!-- Add to Library / Like Button (Hidden on Mobile) -->
                <button class="track-like-btn track-actions__add-btn hidden md:flex text-sp-text-subdued cursor-pointer hover:text-white hover:scale-105 transition-all items-center justify-start p-2 shrink-0"
                    id="player-track-like-btn"
                    data-tooltip="Save to Your Library"
                    data-liked="false"
                    data-track-id=""
                    data-track-title=""
                    data-track-image=""
                >
                    ${POPUP_ICONS.addCircle}
                </button>
            </div>

            <!-- CENTER: Playback Controls -->
            <div class="player__center player__controls flex flex-col items-center justify-center gap-1 md:gap-2 w-auto md:w-[40%] lg:w-[60%] md:max-w-150 min-w-0">
                <!-- Control Buttons -->
                <div class="player__control-buttons flex items-center justify-center gap-3 md:gap-4 lg:gap-6">
                    <!-- Shuffle (Hidden Mobile/Tablet) -->
                    <button class="player__shuffle-btn cursor-pointer text-sp-text-subdued transition-colors hidden lg:block" id="player-shuffle-btn" data-tooltip="Enable shuffle">
                        <svg viewBox="0 0 16 16" class="fill-current w-3.5 h-3.5 lg:w-4 lg:h-4"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"></path><path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"></path></svg>
                    </button>

                    <!-- Previous (Visible on Mobile now) -->
                    <button class="player__prev-btn cursor-pointer text-sp-text-subdued hover:text-white transition-colors block" id="player-prev-btn" data-tooltip="Previous">
                        <svg viewBox="0 0 16 16" class ="fill-current w-4 h-4 lg:w-4 lg:h-4"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H2.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h.6z"/></svg>
                    </button>

                    <!-- Play/Pause -->
                    <!-- Mobile: bg-transparent, màu trắng. Tablet/Desktop: Tròn trắng, icon đen -->
                   <button
                        class="player__play-btn cursor-pointer bg-white text-black rounded-full flex items-center justify-center hover:scale-105 hover:opacity-95 transition-transform w-8 h-8 md:w-9 md:h-9"
                        id="player-play-btn"
                        data-tooltip="Play"
                    >
                        <svg viewBox="0 0 16 16" class="fill-current w-4 h-4 md:w-4 md:h-4">
                            <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/>
                        </svg>
                    </button>

                    <!-- Next (Visible on Mobile now) -->
                    <button class="player__next-btn cursor-pointer text-sp-text-subdued hover:text-white transition-colors block" id="player-next-btn" data-tooltip="Next">
                        <svg viewBox="0 0 16 16" class="fill-current w-4 h-4 lg:w-4 lg:h-4"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-.6z"/></svg>
                    </button>

                    <!-- Repeat (Hidden Mobile/Tablet) -->
                    <button class="player__repeat-btn cursor-pointer text-sp-text-subdued transition-colors hidden lg:block" id="player-repeat-btn" data-tooltip="Enable repeat">
                        <svg viewBox="0 0 16 16" class="fill-current w-3.5 h-3.5 lg:w-4 lg:h-4"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L7.44 13.256a.75.75 0 0 1 0-1.06l2.328-2.328a.75.75 0 1 1 1.06 1.06L9.81 12h2.44a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/></svg>
                    </button>
                </div>

                <!-- Progress Bar (Hidden Mobile) -->
                <div class="player__progress hidden md:flex items-center gap-1.5 md:gap-2 w-full">
                    <!-- time current ẩn trên tablet, hiện trên desktop -->
                    <span class="player__time-current text-sp-text-subdued text-right text-[9px] md:text-xs min-w-7 md:min-w-10 hidden lg:block" id="player-time-current">0:00</span>
                    <input type="range" min="0" max="100" value="0" class="progress-bar flex-1 cursor-pointer min-w-0" style="height: 3px;" id="player-progress-bar" />
                    <!-- time total giữ lại trên tablet -->
                    <span class="player__time-total text-sp-text-subdued text-[9px] md:text-xs min-w-7 md:min-w-10" id="player-time-total">0:00</span>
                </div>
            </div>

            <!-- RIGHT: Volume & Extra Controls (Hidden Mobile/Tablet) -->
            <div class="player__right player__volume hidden lg:flex items-center justify-end w-[20%] min-w-0">
                <button class="text-sp-text-subdued cursor-pointer hover:text-white transition-colors p-1.5 md:p-2" id="player-volume-btn" data-tooltip="Mute">
                    <svg viewBox="0 0 16 16" class="fill-current w-3.5 h-3.5 md:w-4 md:h-4"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.683 3.29V2.86L2.817 6.15zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"/><path d="M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z"/></svg>
                </button>
                <input type="range" min="0" max="100" value="100" class="player__volume-slider cursor-pointer w-16 lg:w-24" style="height: 4px;" id="player-volume-slider" />
                <button class="text-sp-text-subdued cursor-pointer hover:text-white transition-colors p-1.5 md:p-2" data-tooltip="Full screen">
                    <svg viewBox="0 0 16 16" class="fill-current w-3.5 h-3.5 md:w-4 md:h-4"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.25 3C0.25 2.0335 1.0335 1.25 2 1.25H5.375V2.75H2C1.86193 2.75 1.75 2.86193 1.75 3V5.42857H0.25V3ZM14 2.75H10.625V1.25H14C14.9665 1.25 15.75 2.0335 15.75 3V5.42857H14.25V3C14.25 2.86193 14.1381 2.75 14 2.75ZM1.75 10.5714V13C1.75 13.1381 1.86193 13.25 2 13.25H5.375V14.75H2C1.0335 14.75 0.25 13.9665 0.25 13V10.5714H1.75ZM14.25 13V10.5714H15.75V13C15.75 13.9665 14.9665 14.75 14 14.75H10.625V13.25H14C14.1381 13.25 14.25 13.1381 14.25 13Z" fill="currentColor"></path></svg>
                </button>
            </div>
        </footer>
    `;
};
