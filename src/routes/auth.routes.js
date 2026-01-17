import express from "express";
import {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  sendEmailVerification,
  verifyEmail,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
// Validation rules
// const registerValidation = [
//   body("email").isEmail().normalizeEmail(),
//   body("password").isLength({ min: 6 }),
//   body("first_name").notEmpty().trim(),
//   body("last_name").notEmpty().trim(),
// ];

// const loginValidation = [body("email").isEmail().normalizeEmail(), body("password").notEmpty()];

// Routes
// authRouter.get("/me", requireAuth, (req, res) => {
//   res.json({
//     id: req.user.id,
//     role: req.user.role,
//   });
// });
import { updateMe } from "../controllers/authController.js";

router.get("/me", requireAuth, getMe);

router.post("/register", register);
router.post("/login", login);

router.put("/change-password", requireAuth, changePassword);
router.put("/me", requireAuth, updateMe);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

router.post("/send-email-verification", requireAuth, sendEmailVerification);
router.post("/verify-email", requireAuth, verifyEmail);

export default router;
