import { prisma } from "../config/prisma.js";

/* ----------------------------------------
   GET MY WISHLIST
-----------------------------------------*/
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await prisma.wishlistItem.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            base_price: true,
            discount_price: true,
            rating: true,
            images: {
              where: { is_primary: true },
              take: 1,
              select: { image_url: true },
            },
          },
        },
      },
    });

    const formatted = items.map((item) => ({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.discount_price ?? item.product.base_price,
        image: item.product.images[0]?.image_url || null,
        rating: item.product.rating,
      },
      added_at: item.created_at,
    }));

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("getWishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

/* ----------------------------------------
   ADD TO WISHLIST
-----------------------------------------*/
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const product = await prisma.product.findFirst({
      where: { id: productId, is_active: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.wishlistItem.create({
      data: {
        user_id: userId,
        product_id: productId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    // Unique constraint violation → already in wishlist
    if (error.code === "P2002") {
      return res.status(200).json({
        success: true,
        message: "Already in wishlist",
      });
    }

    console.error("addToWishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add to wishlist",
    });
  }
};

/* ----------------------------------------
   REMOVE FROM WISHLIST
-----------------------------------------*/
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await prisma.wishlistItem.deleteMany({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    return res.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove from wishlist",
    });
  }
};
