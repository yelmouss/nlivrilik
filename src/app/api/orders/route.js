'use server';

import { authOptions } from '../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Order from '@/models/Order';
import OrderStatus from '@/models/OrderStatus';
import { NextResponse } from 'next/server';

// Fonction pour récupérer les commandes d'un utilisateur
export async function getUserOrders() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.email) {
      return { 
        success: false, 
        message: 'Non autorisé',
        orders: []
      };
    }
    
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return { 
        success: false, 
        message: 'Utilisateur introuvable',
        orders: []
      };
    }
    
    // Récupérer les commandes réelles de l'utilisateur depuis la base de données
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 }) // Tri par date de création décroissante
      .lean(); // Convertit les documents Mongoose en objets JavaScript simples
    
    return { 
      success: true, 
      orders 
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return { 
      success: false, 
      message: 'Erreur interne du serveur',
      orders: []
    };
  }
}

// Route GET pour récupérer les commandes de l'utilisateur connecté
export async function GET() {
  try {
    const result = await getUserOrders();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error',
      orders: []
    }, { status: 500 });
  }
}

// Route POST pour créer une nouvelle commande
export async function POST(request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const data = await request.json();
    
    // Valider les données requises
    if (!data.contactInfo || !data.deliveryAddress || !data.orderContent) {
      return NextResponse.json({
        success: false,
        message: 'Données incomplètes. Veuillez fournir toutes les informations nécessaires.'
      }, { status: 400 });
    }
    
    // Préparer l'objet de commande
    const orderData = {
      contactInfo: data.contactInfo,
      deliveryAddress: data.deliveryAddress,
      orderContent: data.orderContent,
      status: OrderStatus.PENDING,
      statusHistory: [{
        status: OrderStatus.PENDING,
        timestamp: new Date(),
        note: 'Commande créée'
      }]
    };
    
    // Si l'utilisateur est connecté, associer la commande à son compte
    if (session && session.user.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        orderData.user = user._id;
        
        // Utiliser les informations du profil si elles ne sont pas fournies
        if (!data.contactInfo.email) {
          orderData.contactInfo.email = user.email;
        }
        if (!data.contactInfo.fullName && user.name) {
          orderData.contactInfo.fullName = user.name;
        }
        if (!data.contactInfo.phoneNumber && user.phoneNumber) {
          orderData.contactInfo.phoneNumber = user.phoneNumber;
        }
      }
    }
    
    // Créer la commande
    const newOrder = new Order(orderData);
    await newOrder.save();
    
    // Si l'utilisateur est connecté, ajouter la commande à son historique
    if (orderData.user) {
      await User.findByIdAndUpdate(
        orderData.user,
        { $push: { orderHistory: newOrder._id } }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Commande créée avec succès',
      orderId: newOrder._id
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// Route PATCH pour mettre à jour le statut d'une commande
export async function PATCH(request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const data = await request.json();
    
    // Vérifier l'authentification
    if (!session || !session.user.email) {
      return NextResponse.json({
        success: false,
        message: 'Non autorisé'
      }, { status: 401 });
    }
    
    // Vérifier les données requises
    if (!data.orderId || !data.status) {
      return NextResponse.json({
        success: false,
        message: 'Données incomplètes'
      }, { status: 400 });
    }
    
    // Vérifier que le statut est valide
    if (!Object.values(OrderStatus).includes(data.status)) {
      return NextResponse.json({
        success: false,
        message: 'Statut de commande invalide'
      }, { status: 400 });
    }
    
    // Récupérer l'utilisateur
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Utilisateur introuvable'
      }, { status: 404 });
    }
    
    // Récupérer la commande
    const order = await Order.findById(data.orderId);
    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Commande introuvable'
      }, { status: 404 });
    }
    
    // Vérifier les autorisations (seul l'utilisateur qui a passé la commande ou un admin/livreur peut modifier)
    const isOwner = order.user && order.user.toString() === user._id.toString();
    const isAdminOrDelivery = user.role === 'ADMIN' || user.role === 'DELIVERY_MAN';
    
    if (!isOwner && !isAdminOrDelivery) {
      return NextResponse.json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier cette commande'
      }, { status: 403 });
    }
    
    // Mettre à jour le statut
    order.status = data.status;
    
    // Ajouter une entrée à l'historique des statuts
    order.statusHistory.push({
      status: data.status,
      timestamp: new Date(),
      note: data.note || `Statut modifié par ${user.name || user.email}`
    });
    
    // Si le statut est "delivered", mettre à jour les détails de livraison
    if (data.status === OrderStatus.DELIVERED) {
      order.deliveryDetails.actualDeliveryTime = new Date();
      
      // Si des détails financiers sont fournis, les mettre à jour
      if (data.financialDetails) {
        Object.assign(order.financialDetails, data.financialDetails);
      }
    }
    
    // Si le statut est "confirmed" et que c'est un livreur qui confirme, l'assigner à la commande
    if (data.status === OrderStatus.CONFIRMED && user.role === 'DELIVERY_MAN') {
      order.deliveryDetails.assignedTo = user._id;
      order.deliveryDetails.estimatedDeliveryTime = data.estimatedDeliveryTime || null;
    }
    
    await order.save();
    
    return NextResponse.json({
      success: true,
      message: 'Statut de commande mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de commande:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
