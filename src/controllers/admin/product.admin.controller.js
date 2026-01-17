import { prisma } from "../../config/prisma.js";

/* ----------------------------------------
   GET ALL PRODUCTS (ADMIN)
-----------------------------------------*/
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { created_at: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
        variants: true,
        images: {
          where: { is_primary: true },
          take: 1,
        },
      },
    });

    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("getAllProductsAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

/* ----------------------------------------
   CREATE PRODUCT
-----------------------------------------*/
export const createProductAdmin = async (req, res) => {
  try {
    const {
      name,
      description,
      short_description,
      category_id,
      brand,
      base_price,
      variants = [],
      images = [],
    } = req.body;

    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now();

    const sku = `PROD-${Date.now()}`;

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name,
          slug,
          sku,
          description,
          short_description,
          category_id,
          brand,
          base_price,
        },
      });

      if (variants.length) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({
            product_id: created.id,
            sku: v.sku || `VAR-${Date.now()}`,
            variant_name: v.variant_name,
            attributes: v.attributes,
            price: v.price,
            stock_quantity: v.stock_quantity || 0,
          })),
        });
      }

      if (images.length) {
        await tx.productImage.createMany({
          data: images.map((img, index) => ({
            product_id: created.id,
            image_url: img.url,
            alt_text: img.alt_text || name,
            sort_order: index,
            is_primary: index === 0,
          })),
        });
      }

      return created;
    });

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("createProductAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

/* ----------------------------------------
   UPDATE PRODUCT
-----------------------------------------*/
export const updateProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.product.update({
      where: { id },
      data: req.body,
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("updateProductAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

/* ----------------------------------------
   TOGGLE PRODUCT STATUS
-----------------------------------------*/
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { is_active },
    });

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("toggleProductStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};

/* ----------------------------------------
   SOFT DELETE PRODUCT
-----------------------------------------*/
export const deleteProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.update({
      where: { id },
      data: { is_active: false },
    });

    return res.json({
      success: true,
      message: "Product deactivated",
    });
  } catch (error) {
    console.error("deleteProductAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};
