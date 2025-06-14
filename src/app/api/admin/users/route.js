'use server';

import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import User, { UserRoles } from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Route GET pour récupérer tous les utilisateurs (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification et les permissions
    if (!session || !session.user.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux administrateurs',
        users: []
      }, { status: 403 });
    }
    
    await dbConnect();
    
    // Récupérer tous les utilisateurs (exclure le mot de passe pour des raisons de sécurité)
    const users = await User.find({})
      .select('-password -verificationToken -verificationTokenExpires')
      .sort({ createdAt: -1 }) // Tri par date de création décroissante
      .lean(); // Convertit les documents Mongoose en objets JavaScript simples
    
    return NextResponse.json({ 
      success: true, 
      users 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur',
      users: []
    }, { status: 500 });
  }
}

// Route POST pour créer un nouvel utilisateur (admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification et les permissions
    if (!session || !session.user.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux administrateurs'
      }, { status: 403 });
    }
    
    await dbConnect();
    const data = await request.json();
    
    // Vérifier les données requises
    if (!data.name || !data.email || !data.password) {
      return NextResponse.json({
        success: false,
        message: 'Données incomplètes. Nom, email et mot de passe requis.'
      }, { status: 400 });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      }, { status: 400 });
    }
    
    // Vérifier si le rôle est valide
    const role = data.role && Object.values(UserRoles).includes(data.role) 
      ? data.role 
      : UserRoles.USER;
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Créer l'utilisateur
    const newUser = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: role,
      emailVerified: new Date(), // L'admin crée des comptes déjà vérifiés
      phoneNumber: data.phoneNumber || '',
      address: data.address || '',
      active: true
    });
    
    await newUser.save();
    
    // Exclure le mot de passe de la réponse
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    return NextResponse.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: userResponse
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// Route PATCH pour mettre à jour un utilisateur (admin only)
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification et les permissions
    if (!session || !session.user.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux administrateurs'
      }, { status: 403 });
    }
    
    await dbConnect();
    const data = await request.json();
    
    // Vérifier les données requises
    if (!data.userId) {
      return NextResponse.json({
        success: false,
        message: 'ID utilisateur requis'
      }, { status: 400 });
    }
    
    // Trouver l'utilisateur
    const user = await User.findById(data.userId);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Utilisateur introuvable'
      }, { status: 404 });
    }
    
    // Mettre à jour les champs autorisés
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;
    if (data.address !== undefined) user.address = data.address;
    if (data.active !== undefined) user.active = data.active;
    
    // Mettre à jour le rôle si valide
    if (data.role && Object.values(UserRoles).includes(data.role)) {
      user.role = data.role;
    }
    
    // Mettre à jour le mot de passe si fourni
    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }
    
    // Si l'email est modifié, réinitialiser la vérification d'email si demandé
    if (data.email && data.email !== user.email && data.resetVerification) {
      user.emailVerified = null;
      // Générer un nouveau token de vérification et envoyer un email si nécessaire
    }
    
    await user.save();
    
    // Exclure le mot de passe de la réponse
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return NextResponse.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      user: userResponse
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// Route DELETE pour supprimer un utilisateur (admin only)
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification et les permissions
    if (!session || !session.user.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux administrateurs'
      }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'ID utilisateur requis'
      }, { status: 400 });
    }
    
    // Empêcher la suppression de son propre compte
    if (userId === session.user.id) {
      return NextResponse.json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      }, { status: 400 });
    }
    
    await dbConnect();
    
    // Trouver et supprimer l'utilisateur
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return NextResponse.json({
        success: false,
        message: 'Utilisateur introuvable'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
