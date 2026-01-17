import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        avatar_url: true,
        role: true,
        is_active: true,
        is_email_verified: true,
        created_at: true,
        updated_at: true,
        last_login: true,
      },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: "User not authorized" });
    }

    req.user = user; // ✅ full safe user
    req.token = token; // optional, useful later
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
}
