require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Database configuration
const connectDB = require("./config/db");

// API routes
const projectRoutes = require("./routes/projectRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Initialize Express
const app = express();

// Trust proxy when deployed behind a hosting proxy.
// Enable only if your deployment uses a trusted proxy.
if (process.env.TRUST_PROXY === "true") {
app.set("trust proxy", 1);
}

// Hide Express technology header
app.disable("x-powered-by");

// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigins = (
process.env.CLIENT_URL || "http://localhost:5173"
)
.split(",")
.map((origin) => origin.trim())
.filter(Boolean);

app.use(
cors({
origin(origin, callback) {
// Allow requests without an Origin header, such as local scripts.
if (!origin || allowedOrigins.includes(origin)) {
return callback(null, true);
}

  return callback(new Error("Origin not allowed by CORS"));
},
methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization"],

})
);

// ========================================
// BODY PARSING
// ========================================

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/health", (req, res) => {
const databaseConnected = mongoose.connection.readyState === 1;

res.status(databaseConnected ? 200 : 503).json({
success: databaseConnected,
message: databaseConnected
? "Portfolio backend is running successfully!"
: "Backend is running, but the database is unavailable.",
database: databaseConnected ? "connected" : "disconnected",
timestamp: new Date().toISOString(),
});
});

// ========================================
// API ROUTES
// ========================================

app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/contact", contactRoutes);

// ========================================
// ROOT ROUTE
// ========================================

app.get("/", (req, res) => {
res.status(200).json({
success: true,
message: "Portfolio Backend API is running.",
health: "/api/health",
});
});

// ========================================
// 404 HANDLER
// ========================================

app.use((req, res, next) => {
res.status(404).json({
success: false,
message: `Route not found: ${req.method} ${req.originalUrl}`,
});
});

// ========================================
// CENTRAL ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
console.error("API Error:", err.message);

if (res.headersSent) {
return next(err);
}

// Invalid JSON request body
if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
return res.status(400).json({
success: false,
message: "Invalid JSON request body.",
});
}

// Request body exceeds configured limit
if (err.status === 413) {
return res.status(413).json({
success: false,
message: "Request body is too large.",
});
}

// CORS rejection
if (err.message === "Origin not allowed by CORS") {
return res.status(403).json({
success: false,
message: "This origin is not allowed to access the API.",
});
}

return res.status(err.status || 500).json({
success: false,
message:
err.status && err.status < 500
? err.message
: "Internal server error.",
});
});

// ========================================
// SERVER STARTUP
// ========================================

const PORT = Number(process.env.PORT) || 5000;

let server;
let isShuttingDown = false;

const startServer = async () => {
try {
await connectDB();

server = app.listen(PORT, () => {
  console.log("----------------------------------------");
  console.log("Portfolio Backend Started Successfully");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Allowed Origins: ${allowedOrigins.join(", ")}`);
  console.log("----------------------------------------");
});

} catch (error) {
console.error("Server startup failed:", error.message);
process.exit(1);
}
};

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const shutdown = (signal) => {
if (isShuttingDown) return;

isShuttingDown = true;
console.log(`\n${signal} received. Shutting down server...`);

if (!server) {
mongoose.disconnect()
.finally(() => process.exit(0));
return;
}

server.close(async () => {
try {
await mongoose.disconnect();
console.log("Database connection closed.");
process.exit(0);
} catch (error) {
console.error("Shutdown error:", error.message);
process.exit(1);
}
});

// Avoid hanging indefinitely during shutdown.
setTimeout(() => {
console.error("Graceful shutdown timed out.");
process.exit(1);
}, 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Start application
startServer();

module.exports = app;