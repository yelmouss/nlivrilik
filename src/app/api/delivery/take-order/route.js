'use server';

import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import User from '@/models/User';
import OrderStatus from '@/models/OrderStatus';
import { NextResponse } from 'next/server';
import { sendOrderStatusChangeNotification } from '@/lib/order-notifications';

// Vérification commune des autorisations livreur
async function checkDeliveryAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.email || session.user.role !== 'DELIVERY_MAN') {
    return false;
  }
  
  return session;
}

// Route POST pour prendre une commande
export async function POST(request) {
  try {
    const session = await checkDeliveryAuth();
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux livreurs'
      }, { status: 403 });
    }
    
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de commande requis'
      }, { status: 400 });
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
    
    // Vérifier si le livreur a déjà une commande active
    const activeOrder = await Order.findOne({
      'deliveryDetails.assignedTo': deliveryMan._id,
      status: { $in: [OrderStatus.CONFIRMED, OrderStatus.IN_TRANSIT] }
    });
    
    if (activeOrder) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vous avez déjà une commande active. Terminez-la avant d\'en prendre une nouvelle.'
      }, { status: 400 });
    }
    
    // Trouver et mettre à jour la commande
    const order = await Order.findOne({
      _id: orderId,
      status: OrderStatus.CONFIRMED,
      $or: [
        { 'deliveryDetails.assignedTo': { $exists: false } },
        { 'deliveryDetails.assignedTo': null }
      ]
    });
    
    if (!order) {
      return NextResponse.json({ 
        success: false, 
        message: 'Commande introuvable ou déjà assignée'
      }, { status: 404 });
    }
    
    // Assigner la commande au livreur
    order.deliveryDetails.assignedTo = deliveryMan._id;
    order.deliveryDetails.estimatedDeliveryTime = new Date(Date.now() + 60 * 60 * 1000); // 1 heure à partir de maintenant
    
    // Ajouter à l'historique des statuts
    order.statusHistory.push({
      status: OrderStatus.CONFIRMED,
      timestamp: new Date(),
      note: `Commande assignée au livreur ${deliveryMan.name}`
    });
    
    await order.save();
    
    // Mettre à jour la liste des livraisons actives du livreur
    await User.findByIdAndUpdate(deliveryMan._id, {
      $addToSet: { 'deliveryDetails.activeDeliveries': order._id }
    });
    
    // Envoyer une notification de changement de statut
    try {
      const populatedOrder = await Order.findById(order._id)
        .populate('user', 'name email phoneNumber')
        .populate('deliveryDetails.assignedTo', 'name email phoneNumber')
        .lean();
        
      if (populatedOrder) {
        await sendOrderStatusChangeNotification(populatedOrder, OrderStatus.PENDING, OrderStatus.CONFIRMED);
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de la notification:', emailError);
      // Ne pas bloquer la réponse pour les erreurs d'email
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Commande prise avec succès !',
      orderId: order._id
    });
    
  } catch (error) {
    console.error('Erreur lors de la prise de commande:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
