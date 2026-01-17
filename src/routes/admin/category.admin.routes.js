import express from "express";
import {
  getAllCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  toggleCategoryStatusAdmin,
  deleteCategoryAdmin,
} from "../../controllers/admin/category.admin.controller.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", getAllCategoriesAdmin);
router.post("/", createCategoryAdmin);
router.put("/:id", updateCategoryAdmin);
router.patch("/:id/status", toggleCategoryStatusAdmin);
router.delete("/:id", deleteCategoryAdmin);

export default router;
