import express from "express";
import {
  getInventory,
  getLowStockInventory,
  updateStock,
} from "../../controllers/admin/inventory.admin.controller.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", getInventory);
router.get("/low-stock", getLowStockInventory);
router.patch("/:variantId", updateStock);

export default router;
