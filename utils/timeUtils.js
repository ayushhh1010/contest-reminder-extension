/* =====================================================
   CONVERT CF / LC TIME → RFC3339 (IST)
===================================================== */

function convertToRFC3339(raw) {
    // CF example: "Nov/28/2025 20:05 UTC+5.5"
    // LC example: "Dec 1, 2025 20:00 IST"
    // LC new example: "Sun, Nov 30, 08:00 GMT+05:30"

    // Pattern for "Nov/28/2025 20:05"
    let m = raw.match(/([A-Za-z]{3})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})/);

    // Pattern for "Dec 1, 2025 20:00"
    if (!m) {
        m = raw.match(/([A-Za-z]{3}) (\d{1,2}), (\d{4}) (\d{1,2}):(\d{2})/);
    }

    // Pattern for "Sun, Nov 30, 08:00 GMT+05:30" (No year)
    if (!m) {
        const m2 = raw.match(/[A-Za-z]{3}, ([A-Za-z]{3}) (\d{1,2}), (\d{2}):(\d{2})/);
        if (m2) {
            const currentYear = new Date().getFullYear();
            // Construct match array: [full, Month, Day, Year, Hour, Minute]
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

    // Always IST +05:30
    return `${year}-${month}-${day}T${hour}:${minute}:00+05:30`;
}

module.exports = { convertToRFC3339 };
