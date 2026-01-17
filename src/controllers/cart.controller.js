import { prisma } from "../config/prisma.js";

/* ----------------------------------------
   GET CART
-----------------------------------------*/
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            base_price: true,
            discount_price: true,
            is_active: true,
            images: {
              where: { is_primary: true },
              take: 1,
              select: { image_url: true },
            },
          },
        },
        variant: {
          select: {
            id: true,
            variant_name: true,
            price: true,
            stock_quantity: true,
            image_url: true,
          },
        },
      },
    });

    const formatted = cartItems.map((item) => {
      const price = item.variant?.price ?? item.product.discount_price ?? item.product.base_price;

      return {
        id: item.id,
        quantity: item.quantity,
        price,
        subtotal: Number(price) * item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images[0]?.image_url || null,
        },
        variant: item.variant,
      };
    });

    const total = formatted.reduce((sum, i) => sum + i.subtotal, 0);

    return res.json({
      success: true,
      data: {
        items: formatted,
        total,
      },
    });
  } catch (error) {
    console.error("getCart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

/* ----------------------------------------
   ADD TO CART
-----------------------------------------*/
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, variant_id, quantity = 1 } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await prisma.product.findFirst({
      where: { id: product_id, is_active: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let variant = null;
    if (variant_id) {
      variant = await prisma.productVariant.findFirst({
        where: {
          id: variant_id,
          product_id,
          is_active: true,
        },
      });

      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }

      if (variant.stock_quantity < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        user_id: userId,
        product_id,
        variant_id: variant_id || null,
      },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;

      if (variant && newQty > variant.stock_quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          user_id: userId,
          product_id,
          variant_id: variant_id || null,
          quantity,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Item added to cart",
    });
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add to cart",
    });
  }
};

/* ----------------------------------------
   UPDATE CART ITEM
-----------------------------------------*/
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id, user_id: userId },
      include: { variant: true },
    });

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (item.variant && quantity > item.variant.stock_quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });
    console.log("Added in cart");
    return res.json({
      success: true,
      message: "Cart updated",
    });
  } catch (error) {
    console.error("updateCartItem error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

/* ----------------------------------------
   REMOVE CART ITEM
-----------------------------------------*/
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.cartItem.deleteMany({
      where: { id, user_id: userId },
    });

    return res.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("removeCartItem error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item",
    });
  }
};
