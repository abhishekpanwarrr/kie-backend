// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // Password helpers
// const hashPassword = async (password) => {
//   const salt = await bcrypt.genSalt(10);
//   return await bcrypt.hash(password, salt);
// };

// const comparePassword = async (password, hashedPassword) => {
//   return await bcrypt.compare(password, hashedPassword);
// };

// // JWT helpers
// const generateToken = (userId) => {
//   return jwt.sign({ userId }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };

// // Generate random string
// const generateRandomString = (length = 8) => {
//   return Math.random()
//     .toString(36)
//     .substring(2, length + 2);
// };

// // Generate order number
// const generateOrderNumber = () => {
//   const timestamp = Date.now();
//   const random = Math.floor(Math.random() * 1000);
//   return `ORD-${timestamp}-${random}`;
// };

// // Format price
// const formatPrice = (price) => {
//   return parseFloat(price).toFixed(2);
// };

// // Calculate discount percentage
// const calculateDiscountPercent = (originalPrice, discountedPrice) => {
//   if (!discountedPrice || discountedPrice >= originalPrice) return 0;
//   return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
// };

// module.exports = {
//   hashPassword,
//   comparePassword,
//   generateToken,
//   generateRandomString,
//   generateOrderNumber,
//   formatPrice,
//   calculateDiscountPercent,
// };

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Password helpers
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// JWT helpers
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Generate random string
const generateRandomString = (length = 8) => {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

// Format price
const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

// Calculate discount percentage
const calculateDiscountPercent = (originalPrice, discountedPrice) => {
  if (!discountedPrice || discountedPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

export {
  hashPassword,
  comparePassword,
  generateToken,
  generateRandomString,
  generateOrderNumber,
  formatPrice,
  calculateDiscountPercent,
};
