const fs = require("fs");
const { google } = require("googleapis");

require("dotenv").config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

let tokens = null;

// Load tokens
if (fs.existsSync("tokens.json")) {
    tokens = JSON.parse(fs.readFileSync("tokens.json"));
    oauth2Client.setCredentials(tokens);
}

// Auth URL
function getAuthUrl() {
    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/calendar"],
    });
}

// Save tokens
async function saveTokens(code) {
    const { tokens: newTokens } = await oauth2Client.getToken(code);
    tokens = newTokens;
    oauth2Client.setCredentials(tokens);
    fs.writeFileSync("tokens.json", JSON.stringify(tokens));
    return tokens;
}

/* =====================================================
   ADD EVENT (IST ONLY, NO CONVERSIONS)
===================================================== */

async function addEventGoogle(contestName, startTimeRFC) {
    if (!tokens) throw new Error("Google not authenticated yet!");

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Example: "2025-11-28T20:05:00+05:30"

    // Extract date + time + tz
    const [datePart, timePartWithTZ] = startTimeRFC.split("T");
    const [timePart, tz] = timePartWithTZ.split("+");
    let [H, M, S] = timePart.split(":").map(Number);

    // Add 2 hours without converting timezone
    H += 2;
    let newDate = datePart;

    if (H >= 24) {
        H -= 24;
        const d = new Date(datePart);
        d.setDate(d.getDate() + 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        newDate = `${yyyy}-${mm}-${dd}`;
    }

    const HH = String(H).padStart(2, "0");
    const MM = String(M).padStart(2, "0");
    const SS = String(S).padStart(2, "0");

    const endTimeRFC = `${newDate}T${HH}:${MM}:${SS}+${tz}`;

    const event = {
        summary: contestName,
        start: {
            dateTime: startTimeRFC,
            timeZone: "Asia/Kolkata",
        },
        end: {
            dateTime: endTimeRFC,
            timeZone: "Asia/Kolkata",
        },
        reminders: {
            useDefault: false,
            overrides: [{ method: "popup", minutes: 5 }],
        },
    };

    await calendar.events.insert({
        calendarId: "primary",
        resource: event,
    });

    console.log("Event added:", contestName, startTimeRFC);
}

module.exports = {
    getAuthUrl,
    saveTokens,
    addEventGoogle,
};
