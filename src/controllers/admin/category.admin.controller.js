import { prisma } from "../../config/prisma.js";

/* ----------------------------------------
   GET ALL CATEGORIES (ADMIN)
-----------------------------------------*/
export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sort_order: "asc" },
      include: {
        parent: {
          select: { id: true, name: true },
        },
        children: {
          select: { id: true, name: true, slug: true, is_active: true },
        },
      },
    });

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("getAllCategoriesAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

/* ----------------------------------------
   CREATE CATEGORY
-----------------------------------------*/
export const createCategoryAdmin = async (req, res) => {
  try {
    const { name, description, parent_id = null, image_url, sort_order = 0 } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        parent_id,
        image_url,
        sort_order,
      },
    });

    return res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("createCategoryAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

/* ----------------------------------------
   UPDATE CATEGORY
-----------------------------------------*/
export const updateCategoryAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parent_id, image_url, sort_order } = req.body;

    const data = {
      ...(name && {
        name,
        slug: name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      }),
      ...(description !== undefined && { description }),
      ...(parent_id !== undefined && { parent_id }),
      ...(image_url !== undefined && { image_url }),
      ...(sort_order !== undefined && { sort_order }),
    };

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("updateCategoryAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

/* ----------------------------------------
   TOGGLE CATEGORY STATUS
-----------------------------------------*/
export const toggleCategoryStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: { is_active },
    });

    return res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("toggleCategoryStatusAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category status",
    });
  }
};

/* ----------------------------------------
   SOFT DELETE CATEGORY
-----------------------------------------*/
export const deleteCategoryAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.category.update({
      where: { id },
      data: { is_active: false },
    });

    return res.json({
      success: true,
      message: "Category deactivated",
    });
  } catch (error) {
    console.error("deleteCategoryAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};
