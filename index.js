require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const contestRoutes = require("./routes/contestRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev")); // Log all requests

// Routes
app.use("/", contestRoutes);
app.use("/auth", authRoutes);

// Health check
app.get("/ping", (req, res) => {
    res.json({ status: "ok", message: "Contest Reminder Backend Running" });
});

// Error Handling Middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
