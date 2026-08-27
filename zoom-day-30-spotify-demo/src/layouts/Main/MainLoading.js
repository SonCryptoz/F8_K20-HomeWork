export const MainLoading = () => {
    return `
        <div class="main-view__content p-4 md:p-6">
            <div class="animate-pulse">
                <!-- Section title -->
                <div class="h-7 w-48 rounded bg-[#333] mb-6"></div>

                <!-- Cards -->
                <div class="
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    xl:grid-cols-5
                    gap-4
                ">
                    ${Array.from(
                        { length: 10 },
                        () => `
                            <div class="min-w-0">
                                <!-- Thumbnail -->
                                <div class="aspect-square rounded-md bg-[#333]"></div>

                                <!-- Title -->
                                <div class="h-4 w-3/4 rounded bg-[#333] mt-3"></div>

                                <!-- Subtitle -->
                                <div class="h-3 w-1/2 rounded bg-[#333] mt-2"></div>
                            </div>
                        `,
                    ).join("")}
                </div>
            </div>
        </div>
    `;
};