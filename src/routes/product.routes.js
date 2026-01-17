import express from "express";
import { getAllProducts, getProductBySlug } from "../controllers/productController.js";
const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:slug", getProductBySlug);
export default router;
