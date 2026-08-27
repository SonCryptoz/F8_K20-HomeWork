export const MyPlaylistLoading = () => {
    return `
        <div class="playlist-page animate-pulse pb-8">

            <!-- ===== HERO SECTION SKELETON ===== -->
            <div class="playlist-hero flex flex-col md:flex-row md:items-end gap-4 md:gap-6 px-4 md:px-6 pt-6 md:pt-10 pb-5 md:pb-6"
                style="background: linear-gradient(to bottom, #333333, #121212);">

                <!-- Playlist Cover -->
                <div class="w-36 h-36 md:w-44 md:h-44 lg:w-56 lg:h-56 shrink-0 rounded shadow-2xl bg-sp-highlight"></div>

                <!-- Info -->
                <div class="flex flex-col justify-end gap-2 md:gap-3 w-full min-w-0">

                    <!-- Type -->
                    <div class="h-3 md:h-4 bg-sp-highlight rounded w-24 md:w-28 mb-1"></div>

                    <!-- Playlist Title -->
                    <div class="h-10 md:h-14 lg:h-16 bg-sp-highlight rounded w-11/12 md:w-3/4 lg:w-1/2 my-1 md:my-2"></div>

                    <!-- Description -->
                    <div class="h-3 md:h-4 bg-sp-highlight rounded w-2/3 md:w-1/2 lg:w-2/3"></div>

                    <!-- Metadata -->
                    <div class="flex items-center flex-wrap gap-2 mt-1 md:mt-2">
                        <div class="shrink-0 rounded-full bg-sp-highlight w-6 h-6"></div>
                        <div class="h-3 md:h-4 bg-sp-highlight rounded w-20 md:w-24"></div>
                        <div class="w-1 h-1 bg-sp-highlight rounded-full"></div>
                        <div class="h-3 md:h-4 bg-sp-highlight rounded w-16 md:w-20"></div>
                        <div class="w-1 h-1 bg-sp-highlight rounded-full"></div>
                        <div class="h-3 md:h-4 bg-sp-highlight rounded w-28 md:w-36"></div>
                    </div>
                </div>
            </div>


            <!-- ===== ACTIONS SKELETON ===== -->
            <div class="playlist-actions flex items-center gap-4 md:gap-6 px-4 md:px-6 py-4 md:py-5"
                style="background: linear-gradient(to bottom, rgba(51,51,51,0.35), #121212 60%);">

                <!-- Play -->
                <div class="shrink-0 rounded-full bg-sp-highlight w-12 h-12 md:w-14 md:h-14"></div>

                <!-- Make Public / Private -->
                <div class="shrink-0 rounded-full bg-sp-highlight w-7 h-7"></div>

                <!-- Follow -->
                <div class="shrink-0 rounded-full bg-sp-highlight w-7 h-7 md:w-8 md:h-8"></div>

                <!-- Plus -->
                <div class="shrink-0 rounded-full bg-sp-highlight w-7 h-7 md:w-8 md:h-8"></div>

                <!-- Delete -->
                <div class="shrink-0 rounded-full bg-sp-highlight w-7 h-7"></div>

                <!-- More -->
                <div class="shrink-0 rounded-full bg-sp-highlight w-7 h-7 md:w-8 md:h-8"></div>
            </div>


            <!-- ===== TRACKLIST SKELETON ===== -->
            <div class="playlist-tracks px-4 md:px-6 mt-2">

                <!-- Header -->
                <div class="flex items-center px-2 md:px-4 py-2 border-b border-white/10 mb-2">

                    <!-- Number -->
                    <div class="w-5 md:w-8 h-3 md:h-4 bg-sp-highlight rounded mr-2 md:mr-4"></div>

                    <!-- Title -->
                    <div class="h-3 md:h-4 bg-sp-highlight rounded w-20 flex-1"></div>

                    <!-- Duration -->
                    <div class="w-6 md:w-10 h-3 md:h-4 bg-sp-highlight rounded"></div>
                </div>


                <!-- Rows -->
                <div class="flex flex-col gap-1 md:gap-2">

                    ${[1, 2, 3, 4].map(() => `
                        <div class="flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2 md:py-2.5">

                            <!-- Number -->
                            <div class="w-5 md:w-8 h-3 md:h-4 bg-sp-highlight rounded shrink-0"></div>

                            <!-- Thumbnail -->
                            <div class="w-10 h-10 rounded bg-sp-highlight shrink-0"></div>

                            <!-- Track Info -->
                            <div class="flex-1 flex flex-col gap-1.5 min-w-0">

                                <!-- Title -->
                                <div class="h-3 md:h-4 bg-sp-highlight rounded w-32 md:w-48 max-w-full"></div>

                                <!-- Artist -->
                                <div class="h-2.5 md:h-3 bg-sp-highlight rounded w-20 md:w-28"></div>
                            </div>

                            <!-- Duration -->
                            <div class="w-10 md:w-12 h-3 md:h-4 bg-sp-highlight rounded shrink-0"></div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
    `;
};