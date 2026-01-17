import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, getWishlist);
router.post("/:productId", requireAuth, addToWishlist);
router.delete("/:productId", requireAuth, removeFromWishlist);

export default router;
