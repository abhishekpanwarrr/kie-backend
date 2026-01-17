import { prisma } from "../../config/prisma.js";

/* ----------------------------------------
   GET ALL INVENTORY (ADMIN)
-----------------------------------------*/
export const getInventory = async (req, res) => {
  try {
    const variants = await prisma.productVariant.findMany({
      orderBy: { updated_at: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            is_active: true,
            low_stock_threshold: true,
          },
        },
      },
    });

    const formatted = variants.map((v) => ({
      variant_id: v.id,
      sku: v.sku,
      variant_name: v.variant_name,
      stock_quantity: v.stock_quantity,
      price: v.price,
      product: v.product,
      is_low_stock: v.stock_quantity <= v.product.low_stock_threshold,
    }));

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("getInventory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};

/* ----------------------------------------
   GET LOW STOCK ITEMS
-----------------------------------------*/
export const getLowStockInventory = async (req, res) => {
  try {
    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          select: {
            name: true,
            low_stock_threshold: true,
          },
        },
      },
    });

    const lowStock = variants.filter((v) => v.stock_quantity <= v.product.low_stock_threshold);

    return res.json({
      success: true,
      data: lowStock.map((v) => ({
        variant_id: v.id,
        sku: v.sku,
        variant_name: v.variant_name,
        stock_quantity: v.stock_quantity,
        threshold: v.product.low_stock_threshold,
        product_name: v.product.name,
      })),
    });
  } catch (error) {
    console.error("getLowStockInventory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch low stock inventory",
    });
  }
};

/* ----------------------------------------
   UPDATE STOCK (ADMIN)
-----------------------------------------*/
export const updateStock = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { stock_quantity } = req.body;

    if (stock_quantity == null || stock_quantity < 0) {
      return res.status(400).json({
        message: "Valid stock_quantity is required",
      });
    }

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock_quantity },
    });

    return res.json({
      success: true,
      data: variant,
    });
  } catch (error) {
    console.error("updateStock error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update stock",
    });
  }
};
