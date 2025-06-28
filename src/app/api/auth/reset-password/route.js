import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const { token, password } = await request.json();
  if (!token || !password) {
    return NextResponse.json({ message: "Token et mot de passe requis." }, { status: 400 });
  }
  await connectDB();
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) {
    return NextResponse.json({ message: "Lien invalide ou expiré." }, { status: 400 });
  }
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return NextResponse.json({ message: "Mot de passe réinitialisé avec succès." });
}
