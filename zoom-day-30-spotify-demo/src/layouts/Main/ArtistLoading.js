export const ArtistLoading = () => {
    return `
        <div class="artist-page animate-pulse pb-8">

            <!-- ===== HERO SECTION SKELETON ===== -->
            <div class="artist-hero flex flex-col md:flex-row md:items-end gap-4 md:gap-6 px-4 md:px-6 pt-6 md:pt-10 pb-5 md:pb-6" style="background: linear-gradient(to bottom, #333333, #121212);">

                <!-- Artist Image -->
                <div class="shrink-0 rounded-full shadow-2xl bg-sp-highlight w-36 h-36 md:w-44 md:h-44 lg:w-48 lg:h-48"></div>

                <!-- Artist Info -->
                <div class="flex flex-col justify-end min-w-0 w-full">
                    <div class="h-12 md:h-16 lg:h-20 bg-sp-highlight rounded w-3/4 md:w-1/2 mb-3 md:mb-4"></div>
                    <div class="h-3 md:h-4 bg-sp-highlight rounded w-32 md:w-48"></div>
                </div>
            </div>


            <!-- ===== ACTIONS SKELETON ===== -->
            <div class="artist-actions flex items-center gap-4 md:gap-6 px-4 md:px-6 py-4 md:py-6 bg-sp-base">
                <div class="shrink-0 rounded-full bg-sp-highlight w-12 h-12 md:w-14 md:h-14"></div>
                <div class="h-7 md:h-8 bg-sp-highlight rounded-full w-20 md:w-24"></div>
            </div>


            <!-- ===== POPULAR TRACKS SKELETON ===== -->
            <div class="artist-popular px-4 md:px-6">

                <div class="h-7 md:h-8 bg-sp-highlight rounded w-28 md:w-32 mb-4"></div>

                <div class="popular-list flex flex-col gap-1 md:gap-2">
                    ${[1, 2, 3, 4, 5].map(() => `
                        <div class="flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2">

                            <!-- Track Number -->
                            <div class="w-5 md:w-8 h-4 bg-sp-highlight rounded shrink-0"></div>

                            <!-- Track Info -->
                            <div class="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                <div class="w-10 h-10 rounded bg-sp-highlight shrink-0"></div>
                                <div class="h-4 bg-sp-highlight rounded w-32 md:w-48 max-w-full"></div>
                            </div>

                            <!-- Album / Plays -->
                            <div class="hidden md:flex flex-1 justify-end pr-4 lg:pr-8">
                                <div class="h-4 bg-sp-highlight rounded w-20 lg:w-24"></div>
                            </div>

                            <!-- Duration -->
                            <div class="w-10 md:w-12 h-4 bg-sp-highlight rounded shrink-0"></div>
                        </div>
                    `).join("")}
                </div>
            </div>


            <!-- ===== DISCOGRAPHY SKELETON ===== -->
            <div class="artist-albums mt-8 md:mt-10 px-4 md:px-6">

                <div class="flex items-center justify-between mb-4 md:mb-6">
                    <div class="h-7 md:h-8 bg-sp-highlight rounded w-32 md:w-40"></div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                    ${[1, 2, 3, 4, 5, 6].map(() => `
                        <div class="bg-sp-elevated p-3 md:p-4 rounded-md min-w-0">
                            <div class="w-full aspect-square mb-3 md:mb-4 rounded-md bg-sp-highlight"></div>
                            <div class="h-4 bg-sp-highlight rounded w-3/4 mb-2"></div>
                            <div class="h-3 bg-sp-highlight rounded w-1/2"></div>
                        </div>
                    `).join("")}
                </div>
            </div>

        </div>
    `;
};