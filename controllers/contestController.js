const { addEventGoogle } = require("../googleAuth");
const { convertToRFC3339 } = require("../utils/timeUtils");

exports.addContestReminder = async (req, res) => {
    try {
        const { contestName, startTime } = req.body;

        if (!contestName || !startTime) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const rfcTime = convertToRFC3339(startTime);
        if (!rfcTime) {
            return res.status(400).json({ error: "Invalid time format" });
        }

        console.log("Parsed IST time (RFC3339):", rfcTime);

        await addEventGoogle(contestName, rfcTime);

        res.json({ success: true, message: "Reminder added" });
    } catch (err) {
        console.error("Backend error:", err);
        res.status(500).json({ error: "Failed to add event" });
    }
};
