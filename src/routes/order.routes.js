import express from "express";
import { placeOrder, getMyOrders, getOrderById } from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, placeOrder);
router.get("/", requireAuth, getMyOrders);
router.get("/:id", requireAuth, getOrderById);

export default router;
