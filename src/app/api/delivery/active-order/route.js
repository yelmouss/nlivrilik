'use server';

import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import User from '@/models/User';
import OrderStatus from '@/models/OrderStatus';
import { NextResponse } from 'next/server';

// Vérification commune des autorisations livreur
async function checkDeliveryAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.email || session.user.role !== 'DELIVERY_MAN') {
    return false;
  }
  
  return session;
}

// Route GET pour récupérer la commande active du livreur
export async function GET() {
  try {
    const session = await checkDeliveryAuth();
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux livreurs'
      }, { status: 403 });
    }
    
    await dbConnect();
    
    // Trouver le livreur
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
    
    // Récupérer la commande active du livreur
    const activeOrder = await Order.findOne({
      'deliveryDetails.assignedTo': deliveryMan._id,
      status: { $in: [OrderStatus.CONFIRMED, OrderStatus.IN_TRANSIT] }
    })
    .populate('user', 'name email')
    .lean();
    
    if (!activeOrder) {
      return NextResponse.json({ 
        success: false, 
        message: 'Aucune commande active trouvée'
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      order: activeOrder 
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande active:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
