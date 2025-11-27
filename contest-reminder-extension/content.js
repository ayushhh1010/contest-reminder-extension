console.log("Contest Reminder Extension: content script loaded.");

/* ===========================================================
   COMMON UTILITIES
=========================================================== */

// Send contest info to extension background
function sendContest(contestName, startTime) {
    chrome.runtime.sendMessage({
        type: "REGISTER_CONTEST",
        contestName,
        startTime,
    });

    console.log("Sent contest info:", { contestName, startTime });
    showToast(`Reminder set for: ${contestName}`);
}

/* ===========================================================
   CODEFORCES SUPPORT
=========================================================== */

// Extract contest info from Codeforces
function extractCodeforcesInfo() {
    // contest name
    let contestName = document.title;

    const nameEl =
        document.querySelector(".rtable span.title") ||
        document.querySelector(".contest-name") ||
        document.querySelector("h1");

    if (nameEl) contestName = nameEl.innerText.trim();

    // MAIN: extract time from /contests row (your screenshot)
    const listTimeEl = document.querySelector(
        'td.dark > a[href*="worldclock"]'
    );

    if (listTimeEl) {
        const raw = listTimeEl.innerText.replace(/\s+/g, " ").trim();
        console.log("CF TIME FOUND (LIST PAGE):", raw);
        return { contestName, startTime: raw };
    }

    // fallback: registration page
    const regPageTimeEl = document.querySelector(
        'a[href*="worldclock/fixedtime"]'
    );

    if (regPageTimeEl) {
        const raw = regPageTimeEl.innerText.replace(/\s+/g, " ").trim();
        console.log("CF TIME FOUND (REG PAGE):", raw);
        return { contestName, startTime: raw };
    }

    console.log("CF TIME NOT FOUND!");
    return { contestName, startTime: null };
}

// Attach handlers to Codeforces register buttons
function scanCodeforcesButtons() {
    if (!location.href.includes("codeforces.com")) return;

    const selectors = [
        'a.red-link',
        'a[href*="/contestRegistration/"]',
        'a[href*="register"]',
        'input.submit[value="Register"]',
        'input[type="submit"][value*="Register"]',
    ];

    selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((btn) => {
            if (btn.dataset.cfAdded) return;
            btn.dataset.cfAdded = "true";

            btn.addEventListener("click", () => {
                console.log("CODEFORCES REGISTER CLICK:", sel, btn);
                const info = extractCodeforcesInfo();
                sendContest(info.contestName, info.startTime);
            });
        });
    });

    // final register form
    const form = document.querySelector("form.contestRegistration");
    if (form && !form.dataset.cfSubmitAdded) {
        form.dataset.cfSubmitAdded = "true";

        form.addEventListener(
            "submit",
            () => {
                console.log("CODEFORCES FINAL REGISTER SUBMIT");
                const info = extractCodeforcesInfo();
                sendContest(info.contestName, info.startTime);
            },
            true
        );
    }
}

/* ===========================================================
   LEETCODE SUPPORT
=========================================================== */

// Extract contest info from LeetCode Detail Page (Refined)
function extractLeetCodeInfo() {
    let contestName = null;
    let startTime = null;

    // Try specific selector for title first
    const titleEl = document.querySelector("div.flex.items-center.gap-2 > span");
    if (titleEl) contestName = titleEl.innerText.trim();

    // Fallback for title
    if (!contestName) {
        const allElements = document.querySelectorAll("*");
        for (const el of allElements) {
            if (el.tagName === "SCRIPT" || el.tagName === "STYLE") continue;
            if (!contestName && el.innerText && (el.innerText.includes("Weekly Contest") || el.innerText.includes("Biweekly Contest"))) {
                if (el.innerText.length < 100 && el.children.length === 0) {
                    contestName = el.innerText.trim();
                }
            }
            if (contestName) break;
        }
    }
    if (!contestName) contestName = document.title.split("-")[0].trim();

    // Find Time more specifically
    const allElementsTime = document.querySelectorAll("*");
    for (const el of allElementsTime) {
        if (el.tagName === "SCRIPT" || el.tagName === "STYLE") continue;
        if (!startTime && el.innerText && (el.innerText.includes("GMT") || el.innerText.includes("UTC"))) {
            if (el.innerText.length < 100 && el.children.length === 0) { // Only leaf nodes
                // Match pattern like "Sun, Nov 30, 08:00 GMT+05:30"
                startTime = el.innerText.trim();
                break;
            }
        }
    }

    console.log("LEETCODE INFO EXTRACTED (Refined):", { contestName, startTime });
    return { contestName, startTime };
}

// Attach handlers to LeetCode register buttons on Detail Page
function scanLeetCodeButtons() {
    // Only run on contest detail pages
    if (!location.href.includes("leetcode.com/contest/")) return;

    // Find the Register button
    // Strategy: Look for a button with exact text "Register"
    const buttons = Array.from(document.querySelectorAll("button"));
    const registerBtn = buttons.find(btn => {
        const text = btn.innerText.trim();
        return text === "Register";
    });

    if (registerBtn) {
        if (registerBtn.dataset.lcAdded) return;
        registerBtn.dataset.lcAdded = "true";

        registerBtn.addEventListener("click", (e) => {
            const currentText = registerBtn.innerText.trim();
            console.log("Button click. Text:", currentText);

            // Strict check: Only proceed if text is exactly "Register"
            if (currentText !== "Register") {
                console.log("Ignored click. Button text is not 'Register'.");
                return;
            }

            console.log("LEETCODE REGISTER CLICKED");
            const info = extractLeetCodeInfo();
            sendContest(info.contestName, info.startTime);
        });
    }
}

/* ===========================================================
   TOAST NOTIFICATION
=========================================================== */

function showToast(message) {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.backgroundColor = "#333";
    toast.style.color = "#fff";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "5px";
    toast.style.zIndex = "10000";
    toast.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease-in-out";

    document.body.appendChild(toast);

    // Trigger reflow
    void toast.offsetWidth;

    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}



/* ===========================================================
   MAIN OBSERVER
=========================================================== */

function mainScan() {
    scanCodeforcesButtons();
    scanLeetCodeButtons();
}

// Initial scan
mainScan();

// Use MutationObserver instead of setInterval
const observer = new MutationObserver((mutations) => {
    // Debounce or just run scan
    // For simplicity, just run scan. In high-traffic pages, debounce is better.
    mainScan();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

