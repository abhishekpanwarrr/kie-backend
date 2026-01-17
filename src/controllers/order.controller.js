import { prisma } from "../config/prisma.js";

/* ----------------------------------------
   PLACE ORDER
-----------------------------------------*/
export const placeOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    const { shipping_address_id, billing_address_id, payment_method = "COD", notes } = req.body;

    if (!shipping_address_id || !billing_address_id) {
      return res.status(400).json({
        message: "Shipping and billing address required",
      });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: userId },
      include: {
        product: true,
        variant: true,
      },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;

      // 🔒 Validate stock + calculate subtotal
      for (const item of cartItems) {
        const price = item.variant?.price ?? item.product.discount_price ?? item.product.base_price;

        if (item.variant) {
          if (item.variant.stock_quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${item.product.name}`);
          }
        }

        subtotal += Number(price) * item.quantity;
      }

      const tax = 0;
      const shipping = 0;
      const total = subtotal + tax + shipping;

      // 🧾 Create order
      const order = await tx.order.create({
        data: {
          order_number: `ORD-${Date.now()}`,
          user_id: userId,
          subtotal,
          tax,
          shipping,
          total,
          shipping_address_id,
          billing_address_id,
          payment_method,
          payment_status: "pending",
          notes,
        },
      });

      // 📦 Create order items + reduce stock
      for (const item of cartItems) {
        const price = item.variant?.price ?? item.product.discount_price ?? item.product.base_price;

        await tx.orderItem.create({
          data: {
            order_id: order.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price,
            total: Number(price) * item.quantity,
          },
        });

        if (item.variant) {
          await tx.productVariant.update({
            where: { id: item.variant_id },
            data: {
              stock_quantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // 🧹 Clear cart
      await tx.cartItem.deleteMany({
        where: { user_id: userId },
      });

      return order;
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: result,
    });
  } catch (error) {
    console.error("placeOrder error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to place order",
    });
  }
};

/* ----------------------------------------
   GET MY ORDERS
-----------------------------------------*/
export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
              },
            },
            variant: {
              select: {
                variant_name: true,
              },
            },
          },
        },
      },
    });

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("getMyOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/* ----------------------------------------
   GET ORDER BY ID
-----------------------------------------*/
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        user_id: req.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, slug: true },
            },
            variant: {
              select: { variant_name: true },
            },
          },
        },
        shipping_address: true,
        billing_address: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("getOrderById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};
