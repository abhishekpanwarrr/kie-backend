import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
// Import routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import adminProductRoutes from "./routes/admin/product.admin.routes.js";
import adminOrderRoutes from "./routes/admin/order.admin.routes.js";
import adminCategoryRoutes from "./routes/admin/category.admin.routes.js";
import adminInventoryRoutes from "./routes/admin/inventory.admin.routes.js";
import addressRoutes from "./routes/address.routes.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
// import logger from "./utils/logger.js";

dotenv.config();

const app = express();

// Security middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
// app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/v1/", limiter);

// Body parsing

// Request logging
// app.use((req, res, next) => {
//   logger.info(`${req.method} ${req.path} - ${req.ip}`);
//   next();
// });

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/addresses", addressRoutes);

// ADMIN ROUTES
app.use("/api/v1/admin/products", adminProductRoutes);
app.use("/api/v1/admin/orders", adminOrderRoutes);
app.use("/api/v1/admin/categories", adminCategoryRoutes);
app.use("/api/v1/admin/inventory", adminInventoryRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "shopping-app-backend",
    version: "1.0.0",
  });
});

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Shopping App API",
    documentation: "/api-docs", // Add later if you implement Swagger
    health: "/health",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use(errorHandler);

export default app;
