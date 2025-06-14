'use server';

import { authOptions } from '../../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import User, { UserRoles } from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { isValidObjectId } from 'mongoose';

// Vérification commune des autorisations admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.email || session.user.role !== 'ADMIN') {
    return false;
  }
  
  return true;
}

// Route GET pour récupérer un utilisateur spécifique
export async function GET(request, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux administrateurs'
      }, { status: 403 });
    }
    
    const { id } = await params;
    
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID utilisateur invalide'
      }, { status: 400 });
    }
    
    await dbConnect();
    
    const user = await User.findById(id)
      .select('-password -verificationToken -verificationTokenExpires')
      .lean();
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Utilisateur non trouvé'
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// Route PATCH pour mettre à jour un utilisateur
export async function PATCH(request, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux administrateurs'
      }, { status: 403 });
    }
    
    const { id } = await params;
    
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID utilisateur invalide'
      }, { status: 400 });
    }
    
    await dbConnect();
    
    // Vérifier si l'utilisateur existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'Utilisateur non trouvé'
      }, { status: 404 });
    }
    
    const data = await request.json();
    const updateData = {};
    
    // Vérifier les champs à mettre à jour
    if (data.name) updateData.name = data.name;
    if (data.email) {
      // Vérifier si le nouvel email n'est pas déjà utilisé par un autre utilisateur
      if (data.email !== existingUser.email) {
        const emailExists = await User.findOne({ email: data.email });
        if (emailExists) {
          return NextResponse.json({ 
            success: false, 
            message: 'Cet email est déjà utilisé par un autre utilisateur'
          }, { status: 400 });
        }
      }
      updateData.email = data.email;
    }
    
    if (data.role && Object.values(UserRoles).includes(data.role)) {
      updateData.role = data.role;
    }
    
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.active !== undefined) updateData.active = data.active;
      // Mise à jour du mot de passe si fourni
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await User.findOneAndUpdate(
      { _id: id }, 
      updateData, 
      { 
        new: true,
        runValidators: true
      }
    ).select('-password -verificationToken -verificationTokenExpires');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// Route DELETE pour supprimer un utilisateur
export async function DELETE(request, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux administrateurs'
      }, { status: 403 });
    }
    
    const { id } = await params;
    
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID utilisateur invalide'
      }, { status: 400 });
    }
    
    await dbConnect();
    
    // Empêcher la suppression du propre compte admin
    const session = await getServerSession(authOptions);
    if (id === session.user.id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      }, { status: 400 });
    }
    
    // Vérifier si l'utilisateur existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'Utilisateur non trouvé'
      }, { status: 404 });
    }
    
    // Supprimer l'utilisateur
    await User.findByIdAndDelete(id);
    
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
