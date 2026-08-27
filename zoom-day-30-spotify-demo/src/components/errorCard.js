// * Error card for empty content or error
export const renderErrorCard = (message = "Can not load content") => {
    return `
        <div
            class="main__error-card flex flex-col w-full items-center justify-center rounded-lg bg-sp-surface text-center"
            style="
                min-height: 220px;
                padding: 24px;
                grid-column: 1 / -1;
            "
        >
            <!-- Error icon -->
            <div
                class="flex items-center justify-center rounded-full bg-[#333]"
                style="width: 48px; height: 48px; margin-bottom: 16px;"
            >
                <svg
                    viewBox="0 0 24 24"
                    class="fill-white/60"
                    style="width: 24px; height: 24px;"
                >
                    <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z"/>
                </svg>
            </div>

            <p class="text-white font-bold" style="font-size: 16px;">
                ${message}
            </p>

            <p
                class="text-sp-text-subdued"
                style="font-size: 13px; margin-top: 6px;"
            >
                Try reload the page.
            </p>
        </div>
    `;
};