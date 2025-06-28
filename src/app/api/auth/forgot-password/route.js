import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import { createEmailTransporter } from "@/lib/email";

export async function POST(request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ message: "Email requis." }, { status: 400 });
  }
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) {
    // Toujours répondre OK pour éviter l'énumération d'emails
    return NextResponse.json({ message: "Si cet email existe, un lien a été envoyé." });
  }
  // Générer un token unique
  const token = crypto.randomBytes(32).toString("hex");
  const tokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1h
  user.resetPasswordToken = token;
  user.resetPasswordExpires = tokenExpires;
  await user.save();
  // Envoyer l'email
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;
  const transporter = createEmailTransporter();
  await transporter.sendMail({
    to: user.email,
    from: process.env.EMAIL_FROM,
    subject: "Réinitialisation de votre mot de passe",
    html: `<p>Bonjour,</p><p>Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Ce lien expire dans 1 heure.</p>`,
  });
  return NextResponse.json({ message: "Si cet email existe, un lien a été envoyé." });
}
