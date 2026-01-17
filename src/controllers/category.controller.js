import { prisma } from "../config/prisma.js";

/**
 * GET /categories
 * Returns category tree (parent -> children)
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        is_active: true,
        parent_id: null,
      },
      orderBy: {
        sort_order: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image_url: true,
        sort_order: true,
        children: {
          where: { is_active: true },
          orderBy: { sort_order: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image_url: true,
            sort_order: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("getAllCategories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

/**
 * GET /categories/:slug
 * Returns single category + children
 */
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        slug,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image_url: true,
        sort_order: true,
        children: {
          where: { is_active: true },
          orderBy: { sort_order: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image_url: true,
            sort_order: true,
          },
        },
        products: {
          where: { is_active: true },
          take: 20,
          select: {
            id: true,
            name: true,
            slug: true,
            base_price: true,
            discount_price: true,
            rating: true,
            review_count: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("getCategoryBySlug error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};
