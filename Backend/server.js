// SigmaGPT Backend Server
// Developed and maintained by Harshvardhan Singh
// GitHub: https://github.com/harshvardhansinghbhanawat-glitch

import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import { isApiKeyConfigured } from "./utils/openai.js";

const app = express();
const PORT = process.env.PORT || 8080;
let mongodInstance = null;

if (!process.env.JWT_SECRET) {
    console.warn("[SigmaGPT Backend] Warning: JWT_SECRET is not set in .env. Using fallback development secret.");
}

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

// Health & System Info Route
app.get("/api/health", (_req, res) => {
    return res.json({
        status: "ok",
        app: "SigmaGPT",
        version: "2.0.0",
        maintainer: "Harshvardhan Singh",
        github: "https://github.com/harshvardhansinghbhanawat-glitch",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        openAiConfigured: isApiKeyConfigured(),
        timestamp: new Date().toISOString(),
    });
});

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

const connectDB = async () => {
    const uri = process.env.MONGODB_URI?.trim();

    if (uri) {
        try {
            await mongoose.connect(uri);
            console.log("Connected with Database!");
            return;
        } catch (err) {
            console.error("Failed to connect with configured MONGODB_URI:", err.message);
            console.log("Falling back to local in-memory database for development...");
        }
    } else {
        console.log("No MONGODB_URI configured. Initializing in-memory MongoDB server...");
    }

    try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        mongodInstance = await MongoMemoryServer.create();
        const memUri = mongodInstance.getUri();
        await mongoose.connect(memUri);
        console.log(`Connected with in-memory MongoDB! (${memUri})`);
    } catch (err) {
        console.error("Failed to initialize database:", err);
        process.exit(1);
    }
};

const cleanup = async () => {
    console.log("\nShutting down SigmaGPT server...");
    try {
        if (mongodInstance) {
            await mongodInstance.stop();
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error during cleanup:", err);
    }
    process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`server running on ${PORT}`);
        console.log(`OpenAI API status: ${isApiKeyConfigured() ? "Configured" : "Not configured (safe mode active)"}`);
    });
};

startServer();
