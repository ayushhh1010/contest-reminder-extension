const { getAuthUrl, saveTokens } = require("../googleAuth");

exports.googleAuth = (req, res) => {
    const url = getAuthUrl();
    res.redirect(url);
};

exports.googleAuthCallback = async (req, res) => {
    const code = req.query.code;
    try {
        await saveTokens(code);
        res.send("Google Calendar Connected Successfully! You can close this window.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error connecting Google Calendar");
    }
};
