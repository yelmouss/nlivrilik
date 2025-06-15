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

// Route PATCH pour mettre à jour une commande
export async function PATCH(request) {
  try {
    const session = await checkDeliveryAuth();
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux livreurs'
      }, { status: 403 });
    }
    
    const { orderId, status, financialDetails, deliveryNotes } = await request.json();
    
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
    
    // Trouver la commande assignée au livreur
    const order = await Order.findOne({
      _id: orderId,
      'deliveryDetails.assignedTo': deliveryMan._id
    });
    
    if (!order) {
      return NextResponse.json({ 
        success: false, 
        message: 'Commande introuvable ou non assignée à ce livreur'
      }, { status: 404 });
    }
    
    const previousStatus = order.status;
    let statusChanged = false;
    
    // Mettre à jour le statut si fourni
    if (status && Object.values(OrderStatus).includes(status)) {
      if (order.status !== status) {
        order.status = status;
        statusChanged = true;
        
        // Si le statut est "en livraison", marquer comme tel
        if (status === OrderStatus.IN_TRANSIT && !order.deliveryDetails.estimatedDeliveryTime) {
          order.deliveryDetails.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }
        
        // Si le statut est "livré", marquer la date de livraison
        if (status === OrderStatus.DELIVERED) {
          order.deliveryDetails.actualDeliveryTime = new Date();
          
          // Retirer de la liste des livraisons actives du livreur
          await User.findByIdAndUpdate(deliveryMan._id, {
            $pull: { 'deliveryDetails.activeDeliveries': order._id },
            $inc: { 'deliveryDetails.completedDeliveries': 1 }
          });
        }
        
        // Ajouter à l'historique des statuts
        order.statusHistory.push({
          status: status,
          timestamp: new Date(),
          note: `Statut mis à jour par le livreur ${deliveryMan.name}`
        });
      }
    }
    
    // Mettre à jour les détails financiers
    if (financialDetails) {
      order.financialDetails = {
        ...order.financialDetails,
        ...financialDetails
      };
    }
    
    // Mettre à jour les notes de livraison
    if (deliveryNotes !== undefined) {
      order.deliveryDetails.deliveryNotes = deliveryNotes;
    }
    
    await order.save();
    
    // Envoyer une notification si le statut a changé
    if (statusChanged) {
      try {
        const populatedOrder = await Order.findById(order._id)
          .populate('user', 'name email phoneNumber')
          .populate('deliveryDetails.assignedTo', 'name email phoneNumber')
          .lean();
          
        if (populatedOrder) {
          await sendOrderStatusChangeNotification(populatedOrder, previousStatus, status);
        }
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de la notification:', emailError);
        // Ne pas bloquer la réponse pour les erreurs d'email
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Commande mise à jour avec succès !',
      order: order
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
