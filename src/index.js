import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import kitRoutes from "./routes/kitRoutes.js";
import generateRoutes from "./routes/generateRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ success: true, data: { message: "PrepFlow API is running" } });
});

app.get("/awake", (_req, res) => {
  res.set("Cache-Control", "no-store, max-age=0");
  res.json({ success: true, data: { message: "PrepFlow backend is awake" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/kits", kitRoutes);
app.use("/api/kits", generateRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const keepAliveIntervalMs = 15 * 60 * 1000;
const awakeUrlFor = (url) => {
  if (!url) return null;
  return `${url.replace(/\/$/, "")}/awake`;
};

const keepAliveTargets = [
  awakeUrlFor(process.env.FRONTEND_URL),
  awakeUrlFor(process.env.BACKEND_URL),
].filter(Boolean);

const pingAwakeRoutes = async () => {
  await Promise.all(
    keepAliveTargets.map(async (url) => {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          console.warn(`Keep-alive request to ${url} returned ${response.status}`);
        }
      } catch (error) {
        console.warn(`Keep-alive request to ${url} failed: ${error.message}`);
      }
    }),
  );
};

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);

  if (keepAliveTargets.length) {
    pingAwakeRoutes();
    setInterval(pingAwakeRoutes, keepAliveIntervalMs).unref();
  }
});
