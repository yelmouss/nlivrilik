'use server';

import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';

// Vérification commune des autorisations livreur
async function checkDeliveryAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.email || session.user.role !== 'DELIVERY_MAN') {
    return false;
  }
  
  return session;
}

// Route POST pour basculer la disponibilité
export async function POST() {
  try {
    const session = await checkDeliveryAuth();
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux livreurs'
      }, { status: 403 });
    }
    
    await dbConnect();
    
    const deliveryMan = await User.findOne({ 
      email: session.user.email,
      role: 'DELIVERY_MAN'
    });
    
    if (!deliveryMan) {
      return NextResponse.json({ 
        success: false, 
        message: 'Livreur introuvable'
      }, { status: 404 });
    }
    
    // Basculer la disponibilité
    const currentAvailability = deliveryMan.deliveryDetails?.isAvailable ?? true;
    
    // Mettre à jour la disponibilité
    await User.findByIdAndUpdate(deliveryMan._id, {
      'deliveryDetails.isAvailable': !currentAvailability
    });
    
    return NextResponse.json({ 
      success: true,
      isAvailable: !currentAvailability,
      message: `Statut mis à jour: ${!currentAvailability ? 'Disponible' : 'Indisponible'}`
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
