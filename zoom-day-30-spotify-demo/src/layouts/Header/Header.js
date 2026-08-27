export const Header = () => {
    return `
        <header class="header flex items-center justify-between h-16 bg-sp-black px-2 sm:px-4 gap-2 sm:gap-3 lg:gap-4" style="min-width: 0;">
            <!-- LEFT: Logo -->
            <div class="header__left hidden md:flex shrink-0">
                <!-- Spotify Logo -->
                <a href="/" data-link class="header__logo mx-1 sm:mx-2 lg:mx-3" data-tooltip="Spotify">
                    <svg role="img" viewBox="0 0 24 24" class="fill-white w-8 h-8">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                </a>
            </div>

            <!-- CENTER: Home + Search -->
            <div class="header__center flex items-center gap-2 flex-1 min-w-0 justify-center">
                <!-- Home Button -->
                <a href="/" data-link class="header__home-btn flex items-center justify-center shrink-0 rounded-full bg-sp-highlight hover:bg-sp-press hover:scale-105 transition-colors w-10 h-10 sm:w-12 sm:h-12" data-tooltip="Home">
                    <svg viewBox="0 0 24 24" class="fill-white w-5 h-5 sm:w-6 sm:h-6">
                        <path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0-1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33a3 3 0 0 0-3 0z"/>
                    </svg>
                </a>

                <!-- Search Bar -->
                <div id="header-search-wrapper" class="group header__search-wrapper relative flex-1 min-w-0 max-w-120">
                    <div class="header__search flex items-center w-full rounded-full bg-sp-search-bg hover:bg-sp-search-hover transition-colors border-2 border-transparent focus-within:border-white h-10 sm:h-12 px-3 sm:px-4">
                        <!-- Search Icon -->
                        <svg viewBox="0 0 24 24" class="fill-sp-text-subdued shrink-0 group-hover:fill-white transition-all w-5 h-5 sm:w-6 sm:h-6">
                            <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z"/>
                        </svg>

                        <!-- Search Input -->
                        <input type="text" class="header__search-input flex-1 bg-transparent border-none outline-none text-white placeholder:text-sp-text-subdued text-sm sm:text-base ml-2.5 min-w-0" placeholder="What do you want to play?" id="search-input" autocomplete="off"/>

                        <!-- Clear button -->
                        <button id="search-clear-btn" class="hidden text-sp-text-subdued hover:text-white cursor-pointer p-1 shrink-0">
                            <svg viewBox="0 0 16 16" class="fill-current w-4 h-4">
                                <path d="M2.47 2.47a.75.75 0 0 1 1.06 0L8 6.94l4.47-4.47a.75.75 0 1 1 1.06 1.06L9.06 8l4.47 4.47a.75.75 0 1 1-1.06 1.06L8 9.06l-4.47 4.47a.75.75 0 0 1-1.06-1.06L6.94 8 2.47 3.53a.75.75 0 0 1 0-1.06z"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Dropdown -->
                    <div id="search-dropdown" class="hidden absolute top-full left-0 right-0 mt-2 bg-sp-highlight rounded-lg shadow-2xl p-3 z-9999 max-h-120 overflow-y-auto"></div>
                </div>
            </div>

            <!-- RIGHT: Auth -->
            <div class="header__right flex items-center gap-1 shrink-0" style="min-width: 0;">
                <!-- Auth Buttons -->
                <div id="guest-actions" class="header__auth flex items-center shrink-0" style="margin-left: 8px;">
                    <a href="/src/pages/register/" class="header__signup-link hidden md:block text-sp-text-subdued font-bold whitespace-nowrap hover:text-white hover:scale-105 transition-colors text-sm px-3 lg:px-4 py-2">
                        Sign up
                    </a>

                    <a href="/src/pages/login/" class="header__login-btn bg-white text-black font-bold rounded-full whitespace-nowrap hover:scale-105 transition-transform cursor-pointer text-sm sm:text-base px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3" id="login-btn">
                        Log in
                    </a>
                </div>

                <div id="user-actions" class="flex shrink-0 items-center gap-2 sm:gap-3"></div>
            </div>
        </header>
    `;
}