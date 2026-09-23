(() => {
    "use strict";

    const SEARCH_CONFIG = {
        headerSelector: ".datacore-header",
        tableBodyId: "ledger-grid-body",

        barId: "datacore-search-bar",
        inputId: "datacore-search-input",
        countId: "datacore-search-count",
        previousId: "datacore-search-previous",
        nextId: "datacore-search-next",
        closeId: "datacore-search-close"
    };

    const searchState = {
        query: "",
        matches: [],
        currentIndex: -1
    };

    function getElement(id) {
        return document.getElementById(id);
    }

    function createSearchBar() {
        if (getElement(SEARCH_CONFIG.barId)) {
            return;
        }

        const headerActions =
            document.querySelector(
                ".datacore-header-actions"
            );

        if (!headerActions) {
            return;
        }

        const searchBar =
            document.createElement("div");

        searchBar.id =
            SEARCH_CONFIG.barId;

        searchBar.className =
            "datacore-search-bar";

        searchBar.innerHTML = `
            <span
                class="datacore-search-icon"
                aria-hidden="true"
            >
                🔍
            </span>

            <input
                id="${SEARCH_CONFIG.inputId}"
                class="datacore-search-input"
                type="search"
                placeholder="Search..."
                autocomplete="off"
                spellcheck="false"
                aria-label="Search DataCore"
            >

            <span
                id="${SEARCH_CONFIG.countId}"
                class="datacore-search-count"
            >
                0/0
            </span>

            <button
                type="button"
                id="${SEARCH_CONFIG.previousId}"
                class="datacore-search-control"
                title="Previous match"
                aria-label="Previous match"
            >
                ↑
            </button>

            <button
                type="button"
                id="${SEARCH_CONFIG.nextId}"
                class="datacore-search-control"
                title="Next match"
                aria-label="Next match"
            >
                ↓
            </button>

            <button
                type="button"
                id="${SEARCH_CONFIG.closeId}"
                class="datacore-search-control datacore-search-close"
                title="Clear search"
                aria-label="Clear search"
            >
                ×
            </button>
        `;

        /*
         * Search stays permanently visible.
         * It is inserted before Refresh / other DataCore actions.
         */
        headerActions.prepend(searchBar);

        bindSearchEvents();
    }

    function getRows() {
        const body =
            getElement(
                SEARCH_CONFIG.tableBodyId
            );

        if (!body) {
            return [];
        }

        return Array.from(
            body.querySelectorAll("tr")
        );
    }

    function clearRowHighlights() {
        getRows().forEach(row => {
            row.classList.remove(
                "datacore-search-match"
            );

            row.classList.remove(
                "datacore-search-current"
            );
        });
    }

    function updateMatchCount() {
        const count =
            getElement(
                SEARCH_CONFIG.countId
            );

        if (!count) {
            return;
        }

        if (
            searchState.matches.length === 0
        ) {
            count.textContent = "0/0";
            return;
        }

        count.textContent =
            `${searchState.currentIndex + 1}/${searchState.matches.length}`;
    }

    function showCurrentMatch() {
        if (
            searchState.currentIndex < 0 ||
            searchState.currentIndex >=
                searchState.matches.length
        ) {
            return;
        }

        searchState.matches.forEach(row => {
            row.classList.remove(
                "datacore-search-current"
            );
        });

        const currentRow =
            searchState.matches[
                searchState.currentIndex
            ];

        if (!currentRow) {
            return;
        }

        currentRow.classList.add(
            "datacore-search-current"
        );

        currentRow.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    function performSearch() {
        const input =
            getElement(
                SEARCH_CONFIG.inputId
            );

        if (!input) {
            return;
        }

        searchState.query =
            String(input.value || "")
                .trim()
                .toLowerCase();

        searchState.matches = [];
        searchState.currentIndex = -1;

        clearRowHighlights();

        if (!searchState.query) {
            updateMatchCount();
            return;
        }

        const rows = getRows();

        rows.forEach(row => {
            const rowText =
                String(
                    row.textContent || ""
                ).toLowerCase();

            if (
                rowText.includes(
                    searchState.query
                )
            ) {
                searchState.matches.push(row);

                row.classList.add(
                    "datacore-search-match"
                );
            }
        });

        if (
            searchState.matches.length > 0
        ) {
            searchState.currentIndex = 0;
            showCurrentMatch();
        }

        updateMatchCount();
    }

    function nextMatch() {
        if (
            searchState.matches.length === 0
        ) {
            return;
        }

        searchState.currentIndex =
            (
                searchState.currentIndex + 1
            ) %
            searchState.matches.length;

        showCurrentMatch();
        updateMatchCount();
    }

    function previousMatch() {
        if (
            searchState.matches.length === 0
        ) {
            return;
        }

        searchState.currentIndex =
            (
                searchState.currentIndex -
                1 +
                searchState.matches.length
            ) %
            searchState.matches.length;

        showCurrentMatch();
        updateMatchCount();
    }

    function clearSearch() {
        const input =
            getElement(
                SEARCH_CONFIG.inputId
            );

        if (input) {
            input.value = "";
            input.focus();
        }

        searchState.query = "";
        searchState.matches = [];
        searchState.currentIndex = -1;

        clearRowHighlights();
        updateMatchCount();
    }

    function bindSearchEvents() {
        const input =
            getElement(
                SEARCH_CONFIG.inputId
            );

        const previous =
            getElement(
                SEARCH_CONFIG.previousId
            );

        const next =
            getElement(
                SEARCH_CONFIG.nextId
            );

        const close =
            getElement(
                SEARCH_CONFIG.closeId
            );

        input?.addEventListener(
            "input",
            performSearch
        );

        input?.addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") {
                    event.preventDefault();

                    if (event.shiftKey) {
                        previousMatch();
                    } else {
                        nextMatch();
                    }

                    return;
                }

                if (event.key === "Escape") {
                    event.preventDefault();
                    clearSearch();
                }
            }
        );

        previous?.addEventListener(
            "click",
            previousMatch
        );

        next?.addEventListener(
            "click",
            nextMatch
        );

        close?.addEventListener(
            "click",
            clearSearch
        );

        /*
         * Desktop convenience shortcut.
         * The application search bar remains visible on mobile/PWA.
         */
        document.addEventListener(
            "keydown",
            event => {
                if (
                    (event.ctrlKey ||
                        event.metaKey) &&
                    event.key.toLowerCase() === "f"
                ) {
                    event.preventDefault();

                    input?.focus();
                    input?.select();
                }
            }
        );
    }

    function initialize() {
        createSearchBar();
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();