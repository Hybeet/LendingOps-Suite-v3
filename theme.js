/* =========================================================
   LENDINGOPS SUITE — THEME ENGINE
   Light / Dark / System
   ========================================================= */

(function () {
    "use strict";

    const THEME_STORAGE_KEY = "lendingops-theme";

    const VALID_THEMES = ["light", "dark", "system"];

    function getSystemTheme() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    function getSavedTheme() {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

        return VALID_THEMES.includes(savedTheme)
            ? savedTheme
            : "system";
    }

    function applyTheme(theme) {
        const resolvedTheme =
            theme === "system"
                ? getSystemTheme()
                : theme;

        document.documentElement.setAttribute(
            "data-theme",
            resolvedTheme
        );

        document.documentElement.setAttribute(
            "data-theme-preference",
            theme
        );

        updateThemeButton(theme);
    }

    function saveTheme(theme) {
        localStorage.setItem(
            THEME_STORAGE_KEY,
            theme
        );

        applyTheme(theme);
    }

    function updateThemeButton(theme) {
        const button = document.getElementById("theme-toggle-btn");

        if (!button) return;

        const labels = {
            light: "☀️ Light",
            dark: "🌙 Dark",
            system: "💻 System"
        };

        button.innerHTML =
            labels[theme] + ' <span class="theme-chevron">▾</span>';

        button.setAttribute(
            "aria-label",
            "Current theme: " + theme
        );
    }

    function closeThemeMenu() {
        const menu = document.getElementById("theme-menu");

        if (!menu) return;

        menu.classList.remove("open");

        const button =
            document.getElementById("theme-toggle-btn");

        if (button) {
            button.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }

    function toggleThemeMenu() {
        const menu =
            document.getElementById("theme-menu");

        const button =
            document.getElementById("theme-toggle-btn");

        if (!menu || !button) return;

        const isOpen =
            menu.classList.toggle("open");

        button.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    }

    function initializeTheme() {
        const savedTheme = getSavedTheme();

        applyTheme(savedTheme);

        const toggleButton =
            document.getElementById("theme-toggle-btn");

        const themeMenu =
            document.getElementById("theme-menu");

        if (!toggleButton || !themeMenu) return;

        toggleButton.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();
                toggleThemeMenu();
            }
        );

        const themeOptions =
            document.querySelectorAll(
                ".theme-option"
            );

        themeOptions.forEach(function (option) {

            option.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    const selectedTheme =
                        option.getAttribute(
                            "data-theme-choice"
                        );

                    if (!VALID_THEMES.includes(selectedTheme)) {
                        return;
                    }

                    saveTheme(selectedTheme);

                    themeOptions.forEach(function (item) {
                        item.classList.remove("selected");
                    });

                    option.classList.add("selected");

                    closeThemeMenu();
                }
            );

        });

        document.addEventListener(
            "click",
            function () {
                closeThemeMenu();
            }
        );

        const systemTheme =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

        systemTheme.addEventListener(
            "change",
            function () {

                const currentPreference =
                    localStorage.getItem(
                        THEME_STORAGE_KEY
                    ) || "system";

                if (currentPreference === "system") {
                    applyTheme("system");
                }

            }
        );

        themeOptions.forEach(function (option) {

            const choice =
                option.getAttribute(
                    "data-theme-choice"
                );

            if (choice === savedTheme) {
                option.classList.add("selected");
            }

        });
    }

    /*
     * Initialize after the page has loaded.
     */
    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeTheme
        );

    } else {

        initializeTheme();

    }

})();