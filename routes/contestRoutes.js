const express = require("express");
const router = express.Router();
const contestController = require("../controllers/contestController");

router.post("/add-contest-reminder", contestController.addContestReminder);

module.exports = router;
