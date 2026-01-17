import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, getCart);
router.post("/", requireAuth, addToCart);
router.put("/:id", requireAuth, updateCartItem);
router.delete("/:id", requireAuth, removeCartItem);

export default router;
