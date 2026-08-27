export const TrackLoading = () => {
    return `
        <div class="track-page animate-pulse">
            <!-- HERO -->
            <div class="track-hero flex flex-col md:flex-row md:items-end gap-4 md:gap-6 px-4 md:px-6 pt-6 md:pt-10 pb-5 md:pb-6" style="background: linear-gradient(to bottom, #333333, #121212);">

                <!-- Album Cover -->
                <div class="w-36 h-36 md:w-44 md:h-44 lg:w-56 lg:h-56 shrink-0 rounded shadow-2xl bg-sp-highlight"></div>

                <!-- Track Info -->
                <div class="flex flex-col justify-end gap-2 md:gap-3 min-w-0 w-full">
                    <div class="h-3 md:h-4 bg-sp-highlight rounded w-14 md:w-16"></div>
                    <div class="h-10 md:h-14 lg:h-18 bg-sp-highlight rounded w-11/12 md:w-3/4 lg:w-1/2 my-1 md:my-2"></div>

                    <div class="flex items-center gap-2 mt-1 md:mt-2 min-w-0">
                        <div class="shrink-0 rounded-full bg-sp-highlight w-6 h-6"></div>
                        <div class="h-3 md:h-4 bg-sp-highlight rounded w-20 md:w-24"></div>
                        <div class="w-1 h-1 shrink-0 bg-sp-highlight rounded-full"></div>
                        <div class="h-3 md:h-4 bg-sp-highlight rounded w-24 md:w-32"></div>
                        <div class="w-1 h-1 shrink-0 bg-sp-highlight rounded-full"></div>
                        <div class="h-3 md:h-4 bg-sp-highlight rounded w-10 md:w-12"></div>
                    </div>
                </div>
            </div>

            <!-- ACTION BAR -->
            <div class="track-actions flex items-center gap-4 md:gap-6 px-4 md:px-6 py-4 md:py-5" style="background: linear-gradient(to bottom, rgba(51,51,51,0.35), #121212 60%);">
                <div class="shrink-0 rounded-full bg-sp-highlight w-12 h-12 md:w-14 md:h-14"></div>
                <div class="shrink-0 rounded-full bg-sp-highlight w-7 h-7 md:w-8 md:h-8"></div>
                <div class="shrink-0 rounded-full bg-sp-highlight w-7 h-7 md:w-8 md:h-8"></div>
            </div>

            <!-- ARTIST CARD -->
            <div class="track-artist-section px-4 md:px-6 pb-6">
                <div class="track-artist-card flex items-center gap-3 md:gap-4 rounded-lg bg-sp-highlight p-3 md:px-4 w-full md:w-fit md:min-w-75">
                    <div class="shrink-0 rounded-full bg-[#3e3e3e] w-12 h-12 md:w-14 md:h-14"></div>

                    <div class="flex flex-col gap-2 min-w-0 w-full">
                        <div class="h-3 bg-[#3e3e3e] rounded w-12"></div>
                        <div class="h-4 bg-[#3e3e3e] rounded w-28 md:w-32"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
};