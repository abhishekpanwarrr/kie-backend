import { prisma } from "../config/prisma.js";

// GET /api/v1/addresses
export const getAddresses = async (req, res) => {
  try {
    const addresses = await prisma.userAddress.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: "desc" },
    });

    res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("getAddresses error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch addresses" });
  }
};

// POST /api/v1/addresses
export const createAddress = async (req, res) => {
  try {
    const {
      address_type = "home",
      address_line1,
      address_line2,
      city,
      state,
      country,
      postal_code,
    } = req.body;

    if (!address_line1 || !city || !country || !postal_code) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const address = await prisma.userAddress.create({
      data: {
        user_id: req.user.id,
        address_type,
        address_line1,
        address_line2,
        city,
        state,
        country,
        postal_code,
      },
    });

    res.status(201).json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error("createAddress error:", error);
    res.status(500).json({ success: false, message: "Failed to create address" });
  }
};
