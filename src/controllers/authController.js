import { loginUser, registerUser } from "../services/auth.services.js";
import bcrypt from "bcryptjs";
import { sendOtpEmail } from "../utils/sendEmail.js";

export async function register(req, res) {
  try {
    const body = req.body;
    // 🔒 SECURITY: never trust frontend role blindly
    const user = await registerUser(
      body.first_name,
      body.last_name,
      body.email,
      body.password,
      body.role
    );
    res.status(201).json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role, // 👈 return role
      },
    });
  } catch (err) {
    res.status(400).json({
      message: err.message || "Registration failed",
    });
  }
}

export async function login(req, res) {
  const body = req.body;
  const { user, token } = await loginUser(body.email, body.password);
  res.json({
    token,
    user,
  });
}

export const getMe = (req, res) => {
  return res.json({
    success: true,
    data: req.user,
  });
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const { first_name, last_name, phone, avatar_url } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        first_name,
        last_name,
        phone,
        avatar_url,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        avatar_url: true,
        role: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("updateMe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // ✅ Verify old password
    const isMatch = await bcrypt.compare(current_password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // 🔐 Hash new password
    const hashed = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashed },
    });

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("changePassword error:", error);
    res.status(500).json({
      message: "Failed to change password",
    });
  }
};

const DEV_EMAIL = "hanjutere207@gmail.com";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // delete old OTPs
  await prisma.passwordResetOtp.deleteMany({ where: { email } });

  await prisma.passwordResetOtp.create({
    data: { email, otp, expiresAt },
  });

  console.log("RESET OTP:", otp); // replace with email later
  await sendOtpEmail(DEV_EMAIL, otp);
  return res.json({ success: true, message: "OTP sent to email" });
};

// export const verifyResetOtp = async (req, res) => {

//   const { email, otp } = req.body;

//   const record = await prisma.passwordResetOtp.findFirst({
//     where: { email, otp },
//   });

//   if (!record || record.expiresAt < new Date()) {
//     return res.status(400).json({ message: "Invalid or expired OTP" });
//   }
//   // mark as verified
//   await prisma.passwordResetOtp.update({
//     where: { id: record.id },
//     data: { verified: true },
//   });
//   return res.json({ success: true });
// };

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  const record = await prisma.passwordResetOtp.findFirst({
    where: { email, otp },
  });

  if (!record) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (record.expiresAt < new Date()) {
    // cleanup expired OTP
    await prisma.passwordResetOtp.delete({
      where: { id: record.id },
    });

    return res.status(400).json({ message: "OTP expired" });
  }

  // ✅ OTP is valid → delete it (one-time use)
  await prisma.passwordResetOtp.delete({
    where: { id: record.id },
  });

  return res.json({ success: true });
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and password required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password_hash: hashed,
    },
  });

  return res.json({
    success: true,
    message: "Password reset successful",
  });
};

export const sendEmailVerification = async (req, res) => {
  const { email } = req.user; // user must be logged in

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.is_email_verified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // clear old OTPs
  await prisma.emailVerificationOtp.deleteMany({ where: { email } });

  await prisma.emailVerificationOtp.create({
    data: { email, otp, expiresAt },
  });

  await sendOtpEmail(DEV_EMAIL, otp); // reuse your Resend email util

  return res.json({ success: true, message: "Verification code sent" });
};

export const verifyEmail = async (req, res) => {
  const userId = req.user.id;
  const { otp } = req.body;

  const record = await prisma.emailVerificationOtp.findFirst({
    where: {
      email: req.user.email,
      otp,
    },
  });

  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { is_email_verified: true },
  });

  // cleanup OTPs
  await prisma.emailVerificationOtp.deleteMany({
    where: { email: req.user.email },
  });

  return res.json({
    success: true,
    message: "Email verified successfully",
  });
};
