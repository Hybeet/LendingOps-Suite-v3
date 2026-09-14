/* =========================================================
   LENDINGOPS SUITE
   DISBURSEMENT CORE — FRONTEND CONTROLLER
   ========================================================= */

(() => {
    "use strict";

    const DISBURSEMENT_UI = {
        launcher: "disbursement-launcher",
        openButton: "open-disbursement-core-btn",
        panel: "disbursement-core-panel",

        refreshButton: "refresh-disbursement-core-btn",

        market: "disbursement-market-display",
        date: "disbursement-date-display",
        count: "disbursement-record-count",

        statusDot: "disbursement-status-indicator",
        statusText: "disbursement-status-text",

        message: "disbursement-message",

        emptyState: "disbursement-empty-state",
        previewArea: "disbursement-preview-area",
        previewBody: "disbursement-preview-body",

        reviewBadge: "disbursement-review-badge",
        footerCount: "disbursement-footer-count",

        clearButton: "clear-disbursement-preview-btn",
        postButton: "post-disbursement-core-btn"
    };


    const disbursementState = {
        marketName: "",
        reportDate: "",
        rawReportText: "",
        disbursementSection: "",
        records: [],
        extracted: false,
        previewLoading: false,
        posting: false,
        postConfirmed: false
    };


    /* =====================================================
       DOM
       ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }


    /* =====================================================
       VISIBILITY
       ===================================================== */

    function showElement(element) {
        if (element) {
            element.hidden = false;
        }
    }


    function hideElement(element) {
        if (element) {
            element.hidden = true;
        }
    }


    /* =====================================================
       STATUS
       ===================================================== */

    function setDisbursementStatus(text, state) {

        const statusText = $(DISBURSEMENT_UI.statusText);
        const statusDot = $(DISBURSEMENT_UI.statusDot);

        if (statusText) {
            statusText.textContent = text;
        }

        if (statusDot) {

            statusDot.style.background =
                state === "ready"
                    ? "#16a34a"
                    : state === "working"
                        ? "#2563eb"
                        : state === "error"
                            ? "#dc2626"
                            : "#94a3b8";
        }
    }


    /* =====================================================
       MESSAGE
       ===================================================== */

    function showMessage(message, type = "info") {

        const element = $(DISBURSEMENT_UI.message);

        if (!element) return;

        element.textContent = message;
        element.hidden = false;

        if (type === "success") {
            element.style.background = "#f0fdf4";
            element.style.color = "#166534";
            element.style.border = "1px solid #bbf7d0";
        }
        else if (type === "error") {
            element.style.background = "#fef2f2";
            element.style.color = "#991b1b";
            element.style.border = "1px solid #fecaca";
        }
        else {
            element.style.background = "#eff6ff";
            element.style.color = "#1d4ed8";
            element.style.border = "1px solid #bfdbfe";
        }
    }


    function hideMessage() {

        const element = $(DISBURSEMENT_UI.message);

        if (element) {
            element.hidden = true;
            element.textContent = "";
        }
    }


    /* =====================================================
       PANEL
       ===================================================== */

    function openDisbursementPanel() {

        const panel = $(DISBURSEMENT_UI.panel);
        const launcher = $(DISBURSEMENT_UI.launcher);
        const button = $(DISBURSEMENT_UI.openButton);

        showElement(panel);
        hideElement(launcher);

        if (button) {
            button.setAttribute(
                "aria-expanded",
                "true"
            );
        }

        if (panel) {
            panel.setAttribute(
                "aria-hidden",
                "false"
            );
        }
    }


    function closeDisbursementPanel() {

        const panel = $(DISBURSEMENT_UI.panel);
        const launcher = $(DISBURSEMENT_UI.launcher);
        const button = $(DISBURSEMENT_UI.openButton);

        hideElement(panel);
        showElement(launcher);

        if (button) {
            button.setAttribute(
                "aria-expanded",
                "false"
            );
        }

        if (panel) {
            panel.setAttribute(
                "aria-hidden",
                "true"
            );
        }
    }


    /* =====================================================
       HIDE / SHOW DATACORE
       
       IMPORTANT:
       Existing HTML has:
       
       <h1 id="datacore-section">
       <div class="datacore-container panel">
       
       There is NO datacore <section>.
       ===================================================== */

    function getDataCoreHeading() {
        return document.getElementById(
            "datacore-section"
        );
    }


    function getDataCoreContainer() {

        const heading =
            getDataCoreHeading();

        if (!heading) {
            return null;
        }

        return heading.nextElementSibling;
    }


    function hideDataCoreWorkspace() {

        const heading =
            getDataCoreHeading();

        const container =
            getDataCoreContainer();

        if (heading) {
            heading.hidden = false;
        }

        if (container) {
            container.hidden = false;
        }
    }


    function showDataCoreWorkspace() {

        const heading =
            getDataCoreHeading();

        const container =
            getDataCoreContainer();

        if (heading) {
            heading.hidden = false;
        }

        if (container) {
            container.hidden = false;
        }
    }


    /* =====================================================
       RESET DISBURSEMENT UI
       ===================================================== */

    function resetDisbursementCore() {

        disbursementState.marketName = "";
        disbursementState.reportDate = "";
        disbursementState.rawReportText = "";
        disbursementState.records = [];
        disbursementState.extracted = false;
        disbursementState.previewLoading = false;
        disbursementState.posting = false;
        disbursementState.postConfirmed = false;

        const market = $(DISBURSEMENT_UI.market);
        const date = $(DISBURSEMENT_UI.date);
        const count = $(DISBURSEMENT_UI.count);
        const body = $(DISBURSEMENT_UI.previewBody);
        const footer = $(DISBURSEMENT_UI.footerCount);
        const preview = $(DISBURSEMENT_UI.previewArea);
        const empty = $(DISBURSEMENT_UI.emptyState);
        const postButton = $(DISBURSEMENT_UI.postButton);

        if (market) market.textContent = "—";
        if (date) date.textContent = "—";
        if (count) count.textContent = "0";
        if (footer) footer.textContent = "0 records";

        if (body) {
            body.innerHTML = "";
        }

        hideMessage();

        hideElement(preview);
        showElement(empty);

        if (postButton) {
            postButton.disabled = true;
        }

        setDisbursementStatus(
            "Waiting for report",
            "idle"
        );

        closeDisbursementPanel();
    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       NUMBER
       ===================================================== */

    function numberValue(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return 0;
        }

        const cleaned =
            String(value)
                .replace(/[₦,\s]/g, "");

        const number =
            Number(cleaned);

        return Number.isFinite(number)
            ? number
            : 0;
    }


    function formatNaira(value) {

        return "₦" +
            numberValue(value)
                .toLocaleString(
                    "en-NG",
                    {
                        maximumFractionDigits: 2
                    }
                );
    }


    /* =====================================================
       FIELD
       ===================================================== */

    function inputField(
        field,
        value,
        rowIndex,
        type = "text"
    ) {

        return `
            <input
                class="disbursement-preview-input"
                type="${type}"
                data-disbursement-field="${escapeHtml(field)}"
                data-disbursement-index="${rowIndex}"
                value="${escapeHtml(value)}"
            >
        `;
    }


    /* =====================================================
       RENDER
       ===================================================== */

    function renderDisbursementRecords() {

        const body =
            $(DISBURSEMENT_UI.previewBody);

        const count =
            $(DISBURSEMENT_UI.count);

        const footer =
            $(DISBURSEMENT_UI.footerCount);

        const preview =
            $(DISBURSEMENT_UI.previewArea);

        const empty =
            $(DISBURSEMENT_UI.emptyState);

        const postButton =
            $(DISBURSEMENT_UI.postButton);

        if (!body) return;

        body.innerHTML = "";

        if (!disbursementState.records.length) {

            hideElement(preview);
            showElement(empty);

            if (count) count.textContent = "0";
            if (footer) footer.textContent = "0 records";

            if (postButton) {
                postButton.disabled = true;
            }

            return;
        }

        hideElement(empty);
        showElement(preview);

        if (count) {
            count.textContent =
                String(disbursementState.records.length);
        }

        if (footer) {
            footer.textContent =
                `${disbursementState.records.length} record${
                    disbursementState.records.length === 1
                        ? ""
                        : "s"
                }`;
        }

        body.innerHTML =
            disbursementState.records
                .map((record, index) => {

                    const isNew =
                        String(record.customerType || "")
                            .toLowerCase()
                            .includes("new");

                    return `
                        <tr data-disbursement-row="${index}">

                            <td>${index + 1}</td>

                            <td>
                                ${inputField(
                                    "customerName",
                                    record.customerName || "",
                                    index
                                )}
                            </td>

                            <td>
                                <span class="disbursement-type-badge">
                                    ${escapeHtml(
                                        record.customerType || ""
                                    )}
                                </span>
                            </td>

                            <td>
                                ${inputField(
                                    "newDeals",
                                    record.newDeals || "",
                                    index,
                                    "number"
                                )}
                            </td>

                            <td>
                                ${inputField(
                                    "principal",
                                    record.principal || 0,
                                    index,
                                    "number"
                                )}
                            </td>

                            <td>
                                ${inputField(
                                    "borrowerUniqueNumber",
                                    record.borrowerUniqueNumber || "",
                                    index
                                )}
                            </td>

                            <td>
                                ${inputField(
                                    "loanUniqueNumber",
                                    record.loanUniqueNumber || "",
                                    index
                                )}
                            </td>

                            <td>
                                ${inputField(
                                    "form",
                                    record.form ?? 100,
                                    index,
                                    "number"
                                )}
                            </td>

                            <td>
                                ${inputField(
                                    "card",
                                    record.card ?? (
                                        isNew ? 200 : 0
                                    ),
                                    index,
                                    "number"
                                )}
                            </td>

                            <td>
                                ${inputField(
                                    "dailyRepayment",
                                    record.dailyRepayment || 0,
                                    index,
                                    "number"
                                )}
                            </td>

                            <td>
                                ${inputField(
                                    "branchId",
                                    record.branchId || "",
                                    index
                                )}
                            </td>

                            <td>
                                ${inputField(
                                    "disbursementDate",
                                    record.disbursementDate || "",
                                    index
                                )}
                            </td>

                            <td>
                                ${inputField(
                                    "marketOfficer",
                                    record.marketOfficer || "",
                                    index
                                )}
                            </td>

                            <td>
                                ${inputField(
                                    "status",
                                    record.status || "Pending",
                                    index
                                )}
                            </td>

                        </tr>
                    `;
                })
                .join("");

        if (postButton) {
            postButton.disabled =
                disbursementState.postConfirmed;
        }
    }

    function updateDisbursementPreviewUI() {

        const body =
            document.getElementById(
                DISBURSEMENT_UI.previewBody
            );

        const preview =
            document.getElementById(
                DISBURSEMENT_UI.previewArea
            );

        const empty =
            document.getElementById(
                DISBURSEMENT_UI.emptyState
            );

        const countElement =
            document.getElementById(
                DISBURSEMENT_UI.count
            );

        const footerElement =
            document.getElementById(
                DISBURSEMENT_UI.footerCount
            );

        const postButton =
            document.getElementById(
                DISBURSEMENT_UI.postButton
            );


        if (!body) {
            return;
        }


        const records =
            Array.isArray(
                disbursementState.records
            )
                ? disbursementState.records
                : [];


        const count =
            records.length;


        /*
        * =============================================================
        * UPDATE COUNTERS
        * =============================================================
        */

        if (countElement) {

            countElement.textContent =
                String(count);

        }


        if (footerElement) {

            footerElement.textContent =
                count +
                (
                    count === 1
                        ? " record"
                        : " records"
                );

        }


        /*
        * =============================================================
        * EMPTY STATE
        * =============================================================
        */

        if (!count) {

            body.innerHTML = "";

            if (preview) {
                preview.hidden = true;
            }

            if (empty) {
                empty.hidden = false;
            }

            if (postButton) {
                postButton.disabled = true;
            }

            return;
        }


        /*
        * =============================================================
        * RECORDS EXIST
        *
        * IMPORTANT:
        * Hide the "No disbursement records loaded" box.
        * Show the actual preview area.
        * =============================================================
        */

        if (empty) {
            empty.hidden = true;
        }


        if (preview) {
            preview.hidden = false;
        }


        /*
        * =============================================================
        * RENDER RECORDS
        * =============================================================
        */

        body.innerHTML =
            records
                .map(
                    function(record, index) {

                        const customerName =
                            String(
                                record.customerName ||
                                record.name ||
                                ""
                            ).trim();


                        const customerType =
                            String(
                                record.customerType ||
                                ""
                            ).trim();


                        const principal =
                            Number(
                                record.principal || 0
                            );


                        /*
                        * BACKEND AUTHORITATIVE FIELD NAMES
                        *
                        * borrowerUniqueNumber
                        * loanUniqueNumber
                        *
                        * We also support the shorter names
                        * for backward compatibility.
                        */

                        const borrowerUniqueNumber =
                            String(
                                record.borrowerUniqueNumber ??
                                record.borrowerUniqueNum ??
                                ""
                            ).trim();


                        const loanUniqueNumber =
                            String(
                                record.loanUniqueNumber ??
                                record.loanUniqueNum ??
                                ""
                            ).trim();


                        const form =
                            record.form ?? "";


                        const card =
                            record.card ?? "";


                        const dailyRepayment =
                            Number(
                                record.dailyRepayment || 0
                            );


                        const branchId =
                            String(
                                record.branchId ||
                                ""
                            ).trim();


                        const marketOfficer =
                            String(
                                record.marketOfficer ||
                                record.marketOfficerName ||
                                ""
                            ).trim();


                        const disbursementDate =
                            String(
                                record.disbursementDate ||
                                ""
                            ).trim();


                        const status =
                            String(
                                record.matchStatus ||
                                record.status ||
                                (
                                    record.existingCustomer
                                        ? "Returning Customer Matched"
                                        : "Pending Review"
                                )
                            ).trim();


                        return `
                            <tr
                                data-disbursement-index="${index}"
                            >

                                <td>
                                    ${index + 1}
                                </td>


                                <td>
                                    <input
                                        type="text"
                                        id="disbursement-customer-name-${index}"
                                        name="disbursement-customer-name-${index}"
                                        class="disbursement-preview-input"
                                        value="${escapeDisbursementHtml(
                                            customerName
                                        )}"
                                        data-disbursement-name="${index}"
                                        data-disbursement-field="customerName"
                                        data-disbursement-index="${index}"
                                        autocomplete="off"
                                        style="width:100%;"
                                    >
                                </td>


                                <td>
                                    ${escapeDisbursementHtml(
                                        customerType
                                    )}
                                </td>


                                <td>
                                    ₦${formatDisbursementMoney(
                                        principal
                                    )}
                                </td>


                                <td>
                                    <input
                                        type="text"
                                        id="disbursement-borrower-${index}"
                                        name="disbursement-borrower-${index}"
                                        class="disbursement-preview-input"
                                        value="${escapeDisbursementHtml(
                                            borrowerUniqueNumber
                                        )}"
                                        data-disbursement-field="borrowerUniqueNumber"
                                        data-disbursement-index="${index}"
                                        autocomplete="off"
                                    >
                                </td>


                                <td>
                                    <input
                                        type="text"
                                        id="disbursement-loan-${index}"
                                        name="disbursement-loan-${index}"
                                        class="disbursement-preview-input"
                                        value="${escapeDisbursementHtml(
                                            loanUniqueNumber
                                        )}"
                                        data-disbursement-field="loanUniqueNumber"
                                        data-disbursement-index="${index}"
                                        autocomplete="off"
                                    >
                                </td>


                                <td>
                                    <input
                                        type="number"
                                        id="disbursement-form-${index}"
                                        name="disbursement-form-${index}"
                                        class="disbursement-preview-input"
                                        value="${escapeDisbursementHtml(
                                            form
                                        )}"
                                        data-disbursement-field="form"
                                        data-disbursement-index="${index}"
                                        min="0"
                                        step="1"
                                    >
                                </td>


                                <td>
                                    <input
                                        type="number"
                                        id="disbursement-card-${index}"
                                        name="disbursement-card-${index}"
                                        class="disbursement-preview-input"
                                        value="${escapeDisbursementHtml(
                                            card
                                        )}"
                                        data-disbursement-field="card"
                                        data-disbursement-index="${index}"
                                        min="0"
                                        step="1"
                                    >
                                </td>


                                <td>
                                    ₦${formatDisbursementMoney(
                                        dailyRepayment
                                    )}
                                </td>


                                <td>
                                    ${escapeDisbursementHtml(
                                        branchId
                                    )}
                                </td>


                                <td>
                                    ${escapeDisbursementHtml(
                                        disbursementDate
                                    )}
                                </td>


                                <td>
                                    ${escapeDisbursementHtml(
                                        marketOfficer
                                    )}
                                </td>


                                <td>
                                    ${escapeDisbursementHtml(
                                        status
                                    )}
                                </td>

                            </tr>
                        `;
                    }
                )
                .join("");


        /*
        * =============================================================
        * RE-BIND EDITABLE CUSTOMER-NAME INPUTS
        * =============================================================
        */

        body
            .querySelectorAll(
                "[data-disbursement-name]"
            )
            .forEach(
                function(input) {

                    input.addEventListener(
                        "input",
                        function(event) {

                            const index =
                                Number(
                                    event.target
                                        .dataset
                                        .disbursementName
                                );


                            if (
                                !Number.isInteger(index) ||
                                !disbursementState.records[index]
                            ) {
                                return;
                            }


                            disbursementState.records[
                                index
                            ].customerName =
                                event.target.value.trim();


                            /*
                            * A manually corrected name
                            * must be checked against
                            * DataCore again.
                            */

                            disbursementState.records[
                                index
                            ].matchStatus =
                                "Needs DataCore re-check";

                        }
                    );

                }
            );


        /*
        * =============================================================
        * POST BUTTON
        * =============================================================
        */

        if (postButton) {

            postButton.disabled =
                disbursementState.postConfirmed;

        }

    }

    function escapeDisbursementHtml(value) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }

    function formatDisbursementMoney(value) {

        const amount =
            Number(value);

        if (!Number.isFinite(amount)) {
            return "0";
        }

        return amount.toLocaleString(
            "en-NG",
            {
                maximumFractionDigits: 2
            }
        );
    }


    /* =====================================================
       COLLECT EDITS
       ===================================================== */

    function updateRecordFromInput(input) {

        const index =
            Number(
                input.dataset.disbursementIndex
            );

        const field =
            input.dataset.disbursementField;

        if (
            !Number.isInteger(index) ||
            !field ||
            !disbursementState.records[index]
        ) {
            return;
        }

        let value = input.value;

        const numericFields = [
            "newDeals",
            "principal",
            "form",
            "card",
            "dailyRepayment"
        ];

        if (numericFields.includes(field)) {
            value = numberValue(value);
        }

        disbursementState.records[index][field] =
            value;
    }


    /* =====================================================
       LOAD FROM EXISTING PARSER STATE
       
       This does NOT call DataCore directly.
       The browser already has the report text.
       ===================================================== */

    function loadFromParserState() {

        const reportInput =
            document.getElementById(
                "reportInput"
            );

        const marketInput =
            document.getElementById(
                "displayMarket"
            );

        const dateInput =
            document.getElementById(
                "displayDate"
            );

        const rawReportText =
            reportInput?.value?.trim() || "";

        const marketName =
            marketInput?.value?.trim() || "";

        const reportDate =
            dateInput?.value?.trim() || "";

        if (
            !rawReportText ||
            !marketName ||
            !reportDate
        ) {
            return false;
        }

        disbursementState.rawReportText =
            rawReportText;

        disbursementState.disbursementSection =
            "";

        disbursementState.records =
            [];

        disbursementState.extracted =
            false;

        disbursementState.posting =
            false;

        disbursementState.postConfirmed =
            false;

        disbursementState.marketName =
            marketName;

        disbursementState.reportDate =
            reportDate;

        /*
        * Keep the Disbursement Core header synchronized
        * with the extracted parser state.
        */
        const marketDisplay =
            document.getElementById(
                DISBURSEMENT_UI.market
            );

        const dateDisplay =
            document.getElementById(
                DISBURSEMENT_UI.date
            );

        if (marketDisplay) {
            marketDisplay.textContent =
                marketName;
        }

        if (dateDisplay) {
            dateDisplay.textContent =
                reportDate;
        }

        return true;
    }


    /* =====================================================
       BACKEND PREVIEW
       
       This calls BUSINESS PARSER only.
       Business Parser then talks to DataCore.
       No DataCore API key exists here.
       ===================================================== */

    async function requestDisbursementSectionPreview(
        disbursementSection
    ) {

        const market =
            String(
                disbursementState.marketName || ""
            ).trim();


        const reportDate =
            String(
                disbursementState.reportDate || ""
            ).trim();


        const section =
            String(
                disbursementSection || ""
            ).trim();


        if (!market) {

            throw new Error(
                "Disbursement Preview: Market is missing."
            );

        }


        if (!reportDate) {

            throw new Error(
                "Disbursement Preview: Report date is missing."
            );

        }


        if (!section) {

            throw new Error(
                "Disbursement Preview: No Disbursement section was found."
            );

        }


        setDisbursementStatus(
            "Reading Disbursement section...",
            "working"
        );


        showMessage(
            "Disbursement section found. Preparing customer preview..."
        );


        /*
        * =============================================================
        * BUSINESS PARSER GET REQUEST
        * =============================================================
        *
        * ONLY the Disbursement section is sent.
        *
        * The FULL REPORT is NOT sent.
        *
        * =============================================================
        */

        const url =
            new URL(
                API_CONFIG.BUSINESS_PARSER
            );


        url.searchParams.set(
            "action",
            "getDisbursementPreview"
        );


        url.searchParams.set(
            "stage",
            "parse"
        );


        url.searchParams.set(
            "marketName",
            market
        );


        url.searchParams.set(
            "reportDate",
            reportDate
        );


        url.searchParams.set(
            "disbursementSection",
            section
        );


        /*
        * =============================================================
        * BROWSER → BUSINESS PARSER
        * =============================================================
        */

        const response =
            await fetch(
                url.toString(),
                {

                    method:
                        "GET",

                    cache:
                        "no-store",

                    credentials:
                        "omit"

                }
            );


        if (!response.ok) {

            throw new Error(
                "Disbursement Preview request failed. HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        if (
            !result ||
            result.status !== "success"
        ) {

            throw new Error(
                result &&
                result.message
                    ? result.message
                    : "Disbursement Preview parsing failed."
            );

        }


        const records =
            Array.isArray(
                result.records
            )
                ? result.records
                : [];


        /*
        * =============================================================
        * STORE PARSED RECORDS
        * =============================================================
        */

        disbursementState.records =
            records;


        disbursementState.extracted =
            true;


        /*
        * =============================================================
        * IMMEDIATE PREVIEW
        * =============================================================
        */

        updateDisbursementPreviewUI();


        if (!records.length) {

            setDisbursementStatus(
                "No Disbursement records",
                "error"
            );


            showMessage(
                result.message ||
                "No disbursement records were detected in the Disbursement section.",
                "error"
            );


            return [];

        }


        setDisbursementStatus(
            "Disbursement preview loaded",
            "working"
        );


        showMessage(
            records.length +
            " Disbursement record" +
            (
                records.length === 1
                    ? ""
                    : "s"
            ) +
            " extracted. Waiting for DataCore customer matching..."
        );


        return records;
    }

    async function enrichDisbursementPreviewRecords() {

        const market =
            String(
                disbursementState.marketName || ""
            ).trim();


        const reportDate =
            String(
                disbursementState.reportDate || ""
            ).trim();


        const records =
            Array.isArray(
                disbursementState.records
            )
                ? disbursementState.records
                : [];


        if (!market) {

            throw new Error(
                "Disbursement Enrichment: Market is missing."
            );

        }


        if (!reportDate) {

            throw new Error(
                "Disbursement Enrichment: Report date is missing."
            );

        }


        if (!records.length) {

            return [];

        }


        setDisbursementStatus(
            "Matching customers with DataCore...",
            "working"
        );


        showMessage(
            "DataCore is ready. Matching returning customers and preparing new-customer records..."
        );


        /*
        * =============================================================
        * BUSINESS PARSER GET REQUEST
        * =============================================================
        *
        * Only the SMALL parsed Disbursement record array is sent.
        *
        * The full report is NOT sent.
        *
        * =============================================================
        */

        const url =
            new URL(
                API_CONFIG.BUSINESS_PARSER
            );


        url.searchParams.set(
            "action",
            "getDisbursementPreview"
        );


        url.searchParams.set(
            "stage",
            "enrich"
        );


        url.searchParams.set(
            "marketName",
            market
        );


        url.searchParams.set(
            "reportDate",
            reportDate
        );


        url.searchParams.set(
            "records",
            JSON.stringify(
                records
            )
        );


        /*
        * =============================================================
        * BROWSER → BUSINESS PARSER
        * =============================================================
        */

        const response =
            await fetch(
                url.toString(),
                {

                    method:
                        "GET",

                    cache:
                        "no-store",

                    credentials:
                        "omit"

                }
            );


        if (!response.ok) {

            throw new Error(
                "Disbursement enrichment failed. HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        if (
            !result ||
            result.status !== "success"
        ) {

            throw new Error(
                result &&
                result.message
                    ? result.message
                    : "DataCore Disbursement enrichment failed."
            );

        }


        disbursementState.records =
            Array.isArray(
                result.records
            )
                ? result.records
                : [];


        updateDisbursementPreviewUI();


        setDisbursementStatus(
            "DataCore matching complete",
            "ready"
        );


        showMessage(
            disbursementState.records.length +
            " Disbursement record" +
            (
                disbursementState.records.length === 1
                    ? ""
                    : "s"
            ) +
            " matched and prepared for review.",
            "success"
        );


        return disbursementState.records;
    }

    /* =====================================================
    INDEPENDENT DISBURSEMENT REFRESH

    IMPORTANT:
    This refreshes ONLY Disbursement Core.

    It does NOT:
    - rerun the main report extraction
    - reload the full DataCore customer table
    - call waitForDataCoreCustomerPopulation()
    - rebuild the Field Registry

    It rereads the CURRENT reportInput.
    ===================================================== */

    async function refreshDisbursementCore() {

        if (
            disbursementState.previewLoading ||
            disbursementState.posting
        ) {
            return;
        }


        const reportInput =
            document.getElementById(
                "reportInput"
            );


        if (!reportInput) {

            showMessage(
                "The report input field could not be found.",
                "error"
            );

            setDisbursementStatus(
                "Refresh failed",
                "error"
            );

            return;
        }


        const rawReportText =
            String(
                reportInput.value || ""
            ).trim();


        if (!rawReportText) {

            showMessage(
                "Please enter a report before refreshing Disbursement Core.",
                "error"
            );

            setDisbursementStatus(
                "No report available",
                "error"
            );

            return;
        }


        /*
        * =============================================================
        * READ CURRENT MARKET + DATE
        * =============================================================
        */

        const marketInput =
            document.getElementById(
                "displayMarket"
            );


        const dateInput =
            document.getElementById(
                "displayDate"
            );


        const marketName =
            String(
                marketInput?.value || ""
            ).trim();


        const reportDate =
            String(
                dateInput?.value || ""
            ).trim();


        if (
            !marketName ||
            !reportDate
        ) {

            showMessage(
                "Market and report date are required before refreshing Disbursement Core.",
                "error"
            );

            setDisbursementStatus(
                "Refresh failed",
                "error"
            );

            return;
        }


        const refreshButton =
            document.getElementById(
                DISBURSEMENT_UI.refreshButton
            );


        try {

            disbursementState.previewLoading =
                true;


            /*
            * =========================================================
            * DISABLE REFRESH WHILE WORKING
            * =========================================================
            */

            if (refreshButton) {

                refreshButton.disabled =
                    true;

                refreshButton.textContent =
                    "↻ Refreshing...";
            }


            /*
            * =========================================================
            * SYNCHRONIZE STATE WITH CURRENT REPORT
            *
            * IMPORTANT:
            *
            * We deliberately reread reportInput.value.
            *
            * Therefore, if the officer corrected a customer name
            * in the report, the corrected name is what gets parsed.
            * =========================================================
            */

            disbursementState.rawReportText =
                rawReportText;

            disbursementState.marketName =
                marketName;

            disbursementState.reportDate =
                reportDate;


            /*
            * =========================================================
            * EXTRACT ONLY CURRENT DISBURSEMENT SECTION
            * =========================================================
            */

            const disbursementSection =
                extractDisbursementSectionForPreview(
                    rawReportText
                );


            disbursementState.disbursementSection =
                disbursementSection;


            if (!disbursementSection) {

                disbursementState.records =
                    [];

                disbursementState.extracted =
                    false;

                updateDisbursementPreviewUI();

                throw new Error(
                    "No Disbursement section was found in the current report."
                );
            }


            /*
            * =========================================================
            * CLEAR THE OLD PREVIEW FIRST
            * =========================================================
            *
            * This is important.
            *
            * We don't want the old DataCore match to remain visible
            * while the new report is being parsed.
            * =========================================================
            */

            disbursementState.records =
                [];

            disbursementState.extracted =
                false;

            updateDisbursementPreviewUI();


            setDisbursementStatus(
                "Refreshing Disbursement section...",
                "working"
            );


            showMessage(
                "Reading the current Disbursement section..."
            );


            /*
            * =========================================================
            * STAGE 1 — PARSE
            * =========================================================
            *
            * This sends ONLY the Disbursement section.
            *
            * It does NOT run the main extraction.
            * =========================================================
            */

            const parsedRecords =
                await requestDisbursementSectionPreview(
                    disbursementSection
                );


            if (
                !Array.isArray(parsedRecords) ||
                parsedRecords.length === 0
            ) {

                throw new Error(
                    "No valid Disbursement customers were found in the current report."
                );
            }


            /*
            * =========================================================
            * STAGE 2 — DATACORE ENRICHMENT
            * =========================================================
            *
            * IMPORTANT:
            *
            * We deliberately DO NOT call:
            *
            * window.waitForDataCoreCustomerPopulation()
            *
            * The enrichment endpoint already reads the market sheet
            * on the DataCore side.
            *
            * Therefore Refresh remains independent of the slow
            * full DataCore customer-loading process.
            * =========================================================
            */

            setDisbursementStatus(
                "Matching customers with DataCore...",
                "working"
            );


            showMessage(
                "Disbursement parsed. Matching names with DataCore..."
            );


            await enrichDisbursementPreviewRecords();


            /*
            * =========================================================
            * SUCCESS
            * =========================================================
            */

            setDisbursementStatus(
                "Disbursement refreshed",
                "ready"
            );


            showMessage(
                disbursementState.records.length +
                " Disbursement record" +
                (
                    disbursementState.records.length === 1
                        ? ""
                        : "s"
                ) +
                " refreshed and prepared for review.",
                "success"
            );


        } catch (error) {

            console.error(
                "Disbursement Core refresh error:",
                error
            );


            setDisbursementStatus(
                "Refresh failed",
                "error"
            );


            showMessage(
                error &&
                error.message
                    ? error.message
                    : "Disbursement Core refresh failed.",
                "error"
            );


        } finally {

            disbursementState.previewLoading =
                false;


            if (refreshButton) {

                refreshButton.disabled =
                    false;

                refreshButton.textContent =
                    "↻ Refresh";

            }

        }
    }



    function extractDisbursementSectionForPreview(
        rawReportText
    ) {

        const report =
            String(
                rawReportText || ""
            ).replace(/\r/g, "");

        if (!report.trim()) {
            return "";
        }

        const lines =
            report.split("\n");

        let startIndex = -1;

        /*
        * Locate the actual Disbursement heading.
        *
        * Examples supported:
        *
        * *Disbursement*
        * *Disbursement* *RETURNING OR NEW CUSTOMER...
        * Disbursement
        */

        for (
            let i = 0;
            i < lines.length;
            i++
        ) {

            const line =
                String(lines[i] || "")
                    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u2060]/g, "")
                    .trim();

            if (
                /^\s*\*?\s*disbursement\b/i
                    .test(line)
            ) {

                startIndex = i;
                break;
            }
        }

        if (startIndex === -1) {
            return "";
        }

        const stopPatterns = [
            /^\s*\*?\s*previous\s+pay\s*down\b/i,
            /^\s*\*?\s*pay\s*down\s+with\s+phone\b/i,
            /^\s*\*?\s*used\s+pay\s*down\b/i,
            /^\s*\*?\s*use\s+pay\s*down\b/i,
            /^\s*\*?\s*record\s+of\s+form\b/i,
            /^\s*\*?\s*recovery\s+with\s+phone\b/i,
            /^\s*\*?\s*recovery\b/i,
            /^\s*\*?\s*collections?\b/i,
            /^\s*\*?\s*total\s+collection\b/i
        ];

        let endIndex =
            lines.length;

        for (
            let i = startIndex + 1;
            i < lines.length;
            i++
        ) {

            const line =
                String(lines[i] || "")
                    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u2060]/g, "")
                    .trim();

            if (!line) {
                continue;
            }

            const isStop =
                stopPatterns.some(
                    function(pattern) {
                        return pattern.test(line);
                    }
                );

            if (isStop) {
                endIndex = i;
                break;
            }
        }

        const section =
            lines
                .slice(
                    startIndex,
                    endIndex
                )
                .join("\n")
                .trim();

        return section;
    }


    /* =====================================================
       EXTRACTION COMPLETE
       
       This is the important bridge.
       We do not alter extractData() in script.js.
       ===================================================== */

    async function handleExtractionComplete() {

        if (
            disbursementState.previewLoading
        ) {
            return;
        }

        disbursementState.previewLoading =
            true;

        try {

            const loaded =
                loadFromParserState();

            if (!loaded) {
                return;
            }

            disbursementState.extracted =
                true;

            /*
            * --------------------------------------------------------
            * STEP 1
            * Show Disbursement Core immediately.
            * --------------------------------------------------------
            */

            showDataCoreWorkspace();

            openDisbursementPanel();

            setDisbursementStatus(
                "Extracting Disbursement section...",
                "working"
            );

            showMessage(
                "Reading only the Disbursement section from the report..."
            );

            /*
            * --------------------------------------------------------
            * STEP 2
            * Extract ONLY the Disbursement section.
            * --------------------------------------------------------
            */

            const disbursementSection =
                extractDisbursementSectionForPreview(
                    disbursementState.rawReportText
                );

            disbursementState.disbursementSection =
                disbursementSection;

            if (!disbursementSection) {

                disbursementState.records =
                    [];

                updateDisbursementPreviewUI();

                setDisbursementStatus(
                    "No Disbursement section",
                    "error"
                );

                showMessage(
                    "No Disbursement section was found in this report.",
                    "error"
                );

                return;
            }

            /*
            * --------------------------------------------------------
            * STEP 3
            *
            * Start BOTH operations.
            *
            * A. Parse Disbursement immediately.
            * B. Wait for DataCore customer population.
            *
            * They run independently.
            * --------------------------------------------------------
            */

            const disbursementParsePromise =
                requestDisbursementSectionPreview(
                    disbursementSection
                );

            const dataCoreReadyPromise =
                window.waitForDataCoreCustomerPopulation();

            /*
            * --------------------------------------------------------
            * STEP 4
            * Wait ONLY for the Disbursement parser.
            *
            * This gives us the immediate preview.
            * --------------------------------------------------------
            */

            await disbursementParsePromise;

            /*
            * At this point the user can see:
            *
            * Customer
            * Returning / New
            * Principal
            *
            * We are NOT waiting for DataCore to display this.
            */

            /*
            * --------------------------------------------------------
            * STEP 5
            * Now wait for DataCore.
            * --------------------------------------------------------
            */

            await dataCoreReadyPromise;

            /*
            * --------------------------------------------------------
            * STEP 6
            * DataCore is ready.
            *
            * Send ONLY the parsed Disbursement records.
            * NEVER send the whole report.
            * --------------------------------------------------------
            */

            await enrichDisbursementPreviewRecords();

        } catch (error) {

            console.error(
                "Disbursement Core extraction error:",
                error
            );

            setDisbursementStatus(
                "Disbursement processing failed",
                "error"
            );

            showMessage(
                error &&
                error.message
                    ? error.message
                    : "Disbursement processing failed.",
                "error"
            );

        } finally {

            disbursementState.previewLoading =
                false;
        }
    }


    /* =====================================================
       WATCH EXISTING EXTRACTION
       
       We intentionally do not replace extractData().
       We watch the existing display fields.
       ===================================================== */

    function startExtractionWatcher() {

        window.addEventListener(
            "lendingops:extraction-complete",
            function() {

                handleExtractionComplete();

            }
        );

    }


    /* =====================================================
       CLEAR PREVIEW
       ===================================================== */

    function clearDisbursementPreview() {

        disbursementState.records = [];
        disbursementState.postConfirmed = false;

        renderDisbursementRecords();

        hideMessage();

        setDisbursementStatus(
            "Waiting for review",
            "idle"
        );
    }


    /* =====================================================
       POST
       
       IMPORTANT:
       The frontend sends the prepared records to
       BUSINESS PARSER.

       It NEVER sends a DataCore API key.
       ===================================================== */

    async function postDisbursementCore() {

        if (
            disbursementState.posting ||
            disbursementState.postConfirmed
        ) {
            return;
        }

        if (
            !disbursementState.records.length
        ) {
            showMessage(
                "There are no disbursement records to post.",
                "error"
            );

            return;
        }


        const confirmed =
            window.confirm(
                `Post ${disbursementState.records.length} disbursement record${
                    disbursementState.records.length === 1
                        ? ""
                        : "s"
                } to the market sheet?\n\n` +
                "The records will be validated by the backend before writing."
            );


        if (!confirmed) {
            return;
        }


        disbursementState.posting = true;


        const postButton =
            $(DISBURSEMENT_UI.postButton);

        if (postButton) {
            postButton.disabled = true;
            postButton.textContent =
                "Posting...";
        }


        setDisbursementStatus(
            "Posting records",
            "working"
        );


        try {

            const response =
                await fetch(
                    API_CONFIG.BUSINESS_PARSER,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "text/plain;charset=utf-8"
                        },
                        body: JSON.stringify({
                            action:
                                "datacoreDisbursementPost",

                            marketName:
                                disbursementState.marketName,

                            reportDateTarget:
                                disbursementState.reportDate,

                            records:
                                disbursementState.records
                        }),

                        cache: "no-store",
                        credentials: "omit"
                    }
                );


            if (!response.ok) {
                throw new Error(
                    `Business Parser returned HTTP ${response.status}.`
                );
            }


            const result =
                await response.json();


            if (
                !result ||
                result.success !== true
            ) {
                throw new Error(
                    result?.message ||
                    "Disbursement posting failed."
                );
            }

            if (
                typeof result.inserted !== "number" &&
                !Array.isArray(result.rows)
            ) {
                throw new Error(
                    "Business Parser disbursement post returned no valid write result."
                );
            }


            disbursementState.postConfirmed =
                true;


            setDisbursementStatus(
                "Posted successfully",
                "ready"
            );


            showMessage(
                `${result.inserted ?? disbursementState.records.length} disbursement record${
                    (result.inserted ?? disbursementState.records.length) === 1
                        ? ""
                        : "s"
                } successfully posted.`,
                "success"
            );


            if (postButton) {
                postButton.textContent =
                    "Posted";
                postButton.disabled = true;
            }


        } catch (error) {

            console.error(
                "Disbursement post error:",
                error
            );

            disbursementState.postConfirmed =
                false;

            setDisbursementStatus(
                "Posting failed",
                "error"
            );

            showMessage(
                error.message ||
                "Disbursement posting failed.",
                "error"
            );

            if (postButton) {
                postButton.disabled = false;
                postButton.textContent =
                    "Post Disbursements";
            }

        } finally {

            disbursementState.posting =
                false;
        }
    }


    /* =====================================================
       EXISTING RESET BUTTON
       
       We attach to the existing button.
       No replacement of script.js reset logic.
       ===================================================== */

    function attachResetWatcher() {

        const resetButton =
            document.getElementById(
                "clear-workspace-btn"
            );

        if (!resetButton) {
            return;
        }


        resetButton.addEventListener(
            "click",
            () => {

                /*
                 * Existing script.js reset logic
                 * remains responsible for the
                 * main application state.
                 *
                 * We only reset our own UI.
                 */

                setTimeout(() => {

                    resetDisbursementCore();

                    hideDataCoreWorkspace();

                }, 50);
            }
        );
    }


    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {

        const openButton =
            $(DISBURSEMENT_UI.openButton);

        const clearButton =
            $(DISBURSEMENT_UI.clearButton);

        const postButton =
            $(DISBURSEMENT_UI.postButton);


        if (openButton) {

            openButton.addEventListener(
                "click",
                () => {

                    openDisbursementPanel();

                    if (
                        disbursementState.disbursementSection
                    ) {
                        requestDisbursementSectionPreview(
                            disbursementState.disbursementSection
                        );
                    }
                }
            );
        }


        if (clearButton) {

            clearButton.addEventListener(
                "click",
                clearDisbursementPreview
            );
        }


        if (postButton) {

            postButton.addEventListener(
                "click",
                postDisbursementCore
            );
        }


        const previewBody =
            $(DISBURSEMENT_UI.previewBody);


        if (previewBody) {

            previewBody.addEventListener(
                "input",
                event => {

                    const input =
                        event.target.closest(
                            ".disbursement-preview-input"
                        );

                    if (!input) {
                        return;
                    }

                    updateRecordFromInput(
                        input
                    );
                }
            );
        }
    }

    /* =====================================================
        CREATE DISBURSEMENT REFRESH BUTTON
        ===================================================== */

    function initializeDisbursementRefreshButton() {

        /*
        * ============================================================
        * PERMANENT DISBURSEMENT REFRESH BUTTON
        * ============================================================
        *
        * This button belongs to the Disbursement Core itself.
        *
        * It remains available even when:
        *
        * - no disbursement records were detected
        * - parsing failed
        * - the Disbursement heading is missing
        * - the preview is empty
        * - the officer corrects the report and needs to retry
        *
        * IMPORTANT:
        * This function does NOT change the extraction/parser logic.
        * ============================================================
        */

        const panel =
            $(DISBURSEMENT_UI.panel);

        if (!panel) {
            return;
        }


        /*
        * ------------------------------------------------------------
        * DO NOT CREATE A SECOND BUTTON
        * ------------------------------------------------------------
        */

        let refreshButton =
            $(DISBURSEMENT_UI.refreshButton);


        /*
        * ------------------------------------------------------------
        * FIND THE EXISTING STATUS AREA
        * ------------------------------------------------------------
        *
        * The Refresh button should sit beside:
        *
        *     ● Ready
        *
        * or:
        *
        *     ● Posting failed
        *
        * or:
        *
        *     ● Posting records
        *
        * We therefore attach it to the existing status area instead
        * of positioning it over the whole Disbursement panel.
        */

        const statusText =
            $(DISBURSEMENT_UI.statusText);

        let statusContainer =
            statusText
                ? statusText.parentElement
                : null;


        /*
        * ------------------------------------------------------------
        * FALLBACK
        * ------------------------------------------------------------
        *
        * If the status text is temporarily unavailable, use the
        * panel header rather than floating the button over the panel.
        */

        if (!statusContainer) {

            const headings =
                panel.querySelectorAll(
                    "h1, h2, h3, h4, h5, h6"
                );

            for (
                let i = 0;
                i < headings.length;
                i++
            ) {

                const headingText =
                    String(
                        headings[i].textContent || ""
                    )
                        .trim()
                        .toLowerCase();

                if (
                    headingText ===
                    "disbursement core"
                ) {

                    statusContainer =
                        headings[i].parentElement;

                    break;
                }
            }

        }


        if (!statusContainer) {
            return;
        }


        /*
        * ------------------------------------------------------------
        * CREATE BUTTON IF IT DOES NOT EXIST
        * ------------------------------------------------------------
        */

        if (!refreshButton) {

            refreshButton =
                document.createElement("button");


            refreshButton.id =
                DISBURSEMENT_UI.refreshButton;


            refreshButton.type =
                "button";


            refreshButton.textContent =
                "↻ Refresh";


            /*
            * Use the existing Disbursement button styling.
            * This preserves your current design.
            */

            const referenceButton =
                $(
                    DISBURSEMENT_UI.clearButton
                ) ||
                $(
                    DISBURSEMENT_UI.postButton
                );


            if (referenceButton) {

                refreshButton.className =
                    referenceButton.className;

            }


            /*
            * --------------------------------------------------------
            * BUTTON SIZE
            * --------------------------------------------------------
            *
            * Small and compact.
            *
            * The button wraps around the text instead of becoming
            * a long full-width button.
            */

            refreshButton.style.position =
                "static";

            refreshButton.style.top =
                "";

            refreshButton.style.right =
                "";

            refreshButton.style.bottom =
                "";

            refreshButton.style.left =
                "";

            refreshButton.style.zIndex =
                "1";

            refreshButton.style.display =
                "inline-flex";

            refreshButton.style.width =
                "auto";

            refreshButton.style.minWidth =
                "0";

            refreshButton.style.maxWidth =
                "max-content";

            refreshButton.style.flex =
                "0 0 auto";

            refreshButton.style.flexShrink =
                "0";

            refreshButton.style.alignItems =
                "center";

            refreshButton.style.justifyContent =
                "center";

            refreshButton.style.whiteSpace =
                "nowrap";

            refreshButton.style.padding =
                "6px 10px";

            refreshButton.style.margin =
                "0 0 0 10px";

            refreshButton.style.lineHeight =
                "1.2";

            refreshButton.style.fontSize =
                "13px";

            refreshButton.style.cursor =
                "pointer";

            refreshButton.style.transition =
                "background-color 0.18s ease, color 0.18s ease, transform 0.12s ease";


            /*
            * --------------------------------------------------------
            * REFRESH FUNCTION
            * --------------------------------------------------------
            *
            * KEEPING YOUR EXISTING FUNCTION.
            *
            * Nothing about the refresh process is changed.
            */

            refreshButton.addEventListener(
                "click",
                refreshDisbursementCore
            );


            /*
            * --------------------------------------------------------
            * CLICK COLOR EFFECT
            * --------------------------------------------------------
            *
            * The button changes colour when clicked.
            *
            * We deliberately do this without changing the permanent
            * styling of the button.
            */

            refreshButton.addEventListener(
                "click",
                function() {

                    refreshButton.style.backgroundColor =
                        "#1d4ed8";

                    refreshButton.style.color =
                        "#ffffff";

                    refreshButton.style.transform =
                        "scale(0.96)";


                    window.setTimeout(
                        function() {

                            refreshButton.style.backgroundColor =
                                "";

                            refreshButton.style.color =
                                "";

                            refreshButton.style.transform =
                                "";

                        },
                        300
                    );

                }
            );


            /*
            * --------------------------------------------------------
            * INSERT BESIDE THE EXISTING STATUS
            * --------------------------------------------------------
            */

            statusContainer.appendChild(
                refreshButton
            );

        }


        /*
        * ------------------------------------------------------------
        * MAKE SURE THE STATUS AREA CAN HOLD THE BUTTON BESIDE IT
        * ------------------------------------------------------------
        *
        * We only change the layout if necessary.
        *
        * This does NOT make the whole Disbursement panel absolute
        * or change the position of your cards/tables.
        */

        const computedDisplay =
            window.getComputedStyle(
                statusContainer
            ).display;


        if (
            computedDisplay !== "flex" &&
            computedDisplay !== "inline-flex"
        ) {

            statusContainer.style.display =
                "flex";

            statusContainer.style.alignItems =
                "center";

        }


        /*
        * ------------------------------------------------------------
        * KEEP REFRESH ON THE RIGHT SIDE OF THE STATUS
        * ------------------------------------------------------------
        */

        refreshButton.style.position =
            "static";

        refreshButton.style.marginLeft =
            "10px";

        refreshButton.style.marginRight =
            "0";

        refreshButton.style.width =
            "auto";

        refreshButton.style.minWidth =
            "0";

        refreshButton.style.maxWidth =
            "max-content";

        refreshButton.style.flexShrink =
            "0";


        /*
        * ------------------------------------------------------------
        * ALWAYS VISIBLE
        * ------------------------------------------------------------
        *
        * IMPORTANT:
        * Even when records = 0, the Refresh button remains available.
        */

        refreshButton.hidden =
            false;


        refreshButton.style.display =
            "inline-flex";


        /*
        * Do not disable Refresh simply because the preview is empty.
        *
        * That is exactly when the officer needs it.
        */

        if (
            !disbursementState.previewLoading
        ) {

            refreshButton.disabled =
                false;

            refreshButton.textContent =
                "↻ Refresh";

        }

    }


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    function initializeDisbursementCore() {

        /*
         * Initial application state:
         *
         * DataCore hidden
         * Disbursement panel hidden
         * Launcher hidden until extraction/reset
         */

        hideDataCoreWorkspace();

        resetDisbursementCore();

        bindEvents();

        attachResetWatcher();

        startExtractionWatcher();

        initializeDisbursementRefreshButton();
    }


    document.addEventListener(
        "DOMContentLoaded",
        initializeDisbursementCore
    );


})();