'use server';

import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
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

// Route GET pour récupérer les commandes disponibles
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
    
    // Récupérer les commandes confirmées qui ne sont pas encore assignées à un livreur
    const availableOrders = await Order.find({
      status: OrderStatus.CONFIRMED,
      $or: [
        { 'deliveryDetails.assignedTo': { $exists: false } },
        { 'deliveryDetails.assignedTo': null }
      ]
    })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .lean();
    
    return NextResponse.json({ 
      success: true, 
      orders: availableOrders 
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes disponibles:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
