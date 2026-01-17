import express from "express";
import {
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderStatusAdmin,
} from "../../controllers/admin/order.admin.controller.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", getAllOrdersAdmin);
router.get("/:id", getOrderByIdAdmin);
router.patch("/:id/status", updateOrderStatusAdmin);

export default router;
