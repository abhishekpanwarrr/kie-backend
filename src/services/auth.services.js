import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;

export async function registerUser(first_name, last_name, email, password, role) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("User already exists");
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      first_name,
      last_name,
      email,
      password_hash: hashed,
      role,
    },
  });

  return user;
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}
