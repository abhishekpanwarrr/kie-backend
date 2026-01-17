import express from "express";
import {
  getAllProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  toggleProductStatus,
  deleteProductAdmin,
} from "../../controllers/admin/product.admin.controller.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", getAllProductsAdmin);
router.post("/", createProductAdmin);
router.put("/:id", updateProductAdmin);
router.patch("/:id/status", toggleProductStatus);
router.delete("/:id", deleteProductAdmin);

export default router;
