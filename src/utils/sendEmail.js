// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function sendOtpEmail(email, otp) {
//   await resend.emails.send({
//     from: "KIE Store <onboarding@resend.dev>",
//     to: email,
//     subject: "Reset your password",
//     html: `
//       <h2>Password Reset</h2>
//       <p>Your verification code:</p>
//       <h1>${otp}</h1>
//       <p>This code expires in 10 minutes.</p>
//     `,
//   });
// }

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email, otp) {
  const { data, error } = await resend.emails.send({
    from: "KIE Store <onboarding@resend.dev>", // ✅ IMPORTANT
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>
      <p>Your verification code:</p>
      <h1>${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send email");
  }

  console.log("Email sent:", data);
}
