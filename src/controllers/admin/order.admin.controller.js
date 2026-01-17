import { prisma } from "../../config/prisma.js";

/* ----------------------------------------
   GET ALL ORDERS (ADMIN)
-----------------------------------------*/
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, user_id } = req.query;

    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(user_id && { user_id }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getAllOrdersAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/* ----------------------------------------
   GET ORDER BY ID (ADMIN)
-----------------------------------------*/
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        shipping_address: true,
        billing_address: true,
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
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("getOrderByIdAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

/* ----------------------------------------
   UPDATE ORDER STATUS (ADMIN)
-----------------------------------------*/
export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("updateOrderStatusAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};
