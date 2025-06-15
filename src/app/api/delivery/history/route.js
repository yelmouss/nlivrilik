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

// Route GET pour récupérer l'historique des livraisons
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
    
    // Récupérer toutes les commandes terminées du livreur
    const completedOrders = await Order.find({
      'deliveryDetails.assignedTo': deliveryMan._id,
      status: { $in: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] }
    })
    .populate('user', 'name email')
    .sort({ 'deliveryDetails.actualDeliveryTime': -1, updatedAt: -1 })
    .lean();
    
    // Calculer les statistiques
    const deliveredOrders = completedOrders.filter(order => order.status === OrderStatus.DELIVERED);
    const totalDeliveries = deliveredOrders.length;
    
    const totalEarnings = deliveredOrders.reduce((sum, order) => {
      return sum + (order.financialDetails?.deliveryFee || 0);
    }, 0);
    
    // Calculer la note moyenne basée sur les évaluations
    const ratedOrders = deliveredOrders.filter(order => order.rating?.rating);
    const averageRating = ratedOrders.length > 0 
      ? ratedOrders.reduce((sum, order) => sum + order.rating.rating, 0) / ratedOrders.length 
      : 0;
    
    // Calculer le taux de réussite (livraisons réussies vs annulées)
    const successfulDeliveries = deliveredOrders.length;
    const totalAttempts = completedOrders.length;
    const completionRate = totalAttempts > 0 ? (successfulDeliveries / totalAttempts) * 100 : 0;
    
    const stats = {
      totalDeliveries,
      totalEarnings,
      averageRating,
      completionRate
    };
    
    return NextResponse.json({ 
      success: true, 
      orders: completedOrders,
      stats
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
