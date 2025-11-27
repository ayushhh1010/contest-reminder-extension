// Service worker for Contest Reminder Extension
// Handles OAuth authentication and Google Calendar API calls

let accessToken = null;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "REGISTER_CONTEST") {
        console.log("Background received contest:", msg);

        // Handle async operation
        handleContestRegistration(msg.contestName, msg.startTime)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));

        return true; // Keep channel open for async response
    }
});

// Authenticate user and get access token
async function authenticate() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                accessToken = token;
                resolve(token);
            }
        });
    });
}

// Convert time to RFC3339 format
function convertToRFC3339(raw) {
    // CF example: "Nov/28/2025 20:05 UTC+5.5"
    // LC example: "Dec 1, 2025 20:00 IST"
    // LC new example: "Sun, Nov 30, 08:00 GMT+05:30"

    let m = raw.match(/([A-Za-z]{3})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})/);

    if (!m) {
        m = raw.match(/([A-Za-z]{3}) (\d{1,2}), (\d{4}) (\d{1,2}):(\d{2})/);
    }

    if (!m) {
        const m2 = raw.match(/[A-Za-z]{3}, ([A-Za-z]{3}) (\d{1,2}), (\d{2}):(\d{2})/);
        if (m2) {
            const currentYear = new Date().getFullYear();
            m = [m2[0], m2[1], m2[2], String(currentYear), m2[3], m2[4]];
        }
    }

    if (!m) return null;

    const monthMap = {
        Jan: "01", Feb: "02", Mar: "03", Apr: "04",
        May: "05", Jun: "06", Jul: "07", Aug: "08",
        Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };

    const month = monthMap[m[1]];
    const day = m[2].padStart(2, "0");
    const year = m[3];
    const hour = m[4].padStart(2, "0");
    const minute = m[5].padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}:00+05:30`;
}

// Add event to Google Calendar
async function addEventToCalendar(contestName, startTimeRFC) {
    // Calculate end time (2 hours later)
    const startDate = new Date(startTimeRFC);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const endTimeRFC = endDate.toISOString().replace(/\.\d{3}Z$/, '+05:30');

    const event = {
        summary: contestName,
        start: {
            dateTime: startTimeRFC,
            timeZone: "Asia/Kolkata"
        },
        end: {
            dateTime: endTimeRFC,
            timeZone: "Asia/Kolkata"
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: "popup", minutes: 5 }
            ]
        }
    };

    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to create calendar event");
    }

    return await response.json();
}

// Main handler for contest registration
async function handleContestRegistration(contestName, startTime) {
    try {
        // Convert time to RFC3339
        const rfcTime = convertToRFC3339(startTime);
        if (!rfcTime) {
            throw new Error("Invalid time format");
        }

        console.log("Parsed time:", rfcTime);

        // Authenticate if needed
        if (!accessToken) {
            await authenticate();
        }

        // Try to add event
        try {
            await addEventToCalendar(contestName, rfcTime);
            console.log("✅ Event added successfully:", contestName);
        } catch (error) {
            // If auth error, re-authenticate and retry
            if (error.message.includes("401") || error.message.includes("invalid_grant")) {
                console.log("Token expired, re-authenticating...");
                accessToken = null;
                await authenticate();
                await addEventToCalendar(contestName, rfcTime);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error("❌ Error adding event:", error);
        throw error;
    }
}
