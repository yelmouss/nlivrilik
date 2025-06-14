'use server';

import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Order from '@/models/Order';
import OrderStatus from '@/models/OrderStatus';
import { NextResponse } from 'next/server';

// Route GET pour récupérer toutes les commandes (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification et les permissions
    if (!session || !session.user.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux administrateurs',
        orders: []
      }, { status: 403 });
    }
    
    await dbConnect();
    
    // Récupérer toutes les commandes
    const orders = await Order.find({})
      .sort({ createdAt: -1 }) // Tri par date de création décroissante
      .populate('user', 'name email') // Récupérer les informations de base de l'utilisateur
      .lean(); // Convertit les documents Mongoose en objets JavaScript simples
    
    return NextResponse.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur',
      orders: []
    }, { status: 500 });
  }
}

// Route PATCH pour mettre à jour une commande (admin only)
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
    if (!data.orderId) {
      return NextResponse.json({
        success: false,
        message: 'ID de commande requis'
      }, { status: 400 });
    }
    
    // Trouver la commande
    const order = await Order.findById(data.orderId);
    
    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Commande introuvable'
      }, { status: 404 });
    }
    
    // Mettre à jour les champs de la commande
    if (data.status && Object.values(OrderStatus).includes(data.status)) {
      const oldStatus = order.status;
      order.status = data.status;
      
      // Ajouter une entrée à l'historique des statuts
      order.statusHistory.push({
        status: data.status,
        timestamp: new Date(),
        note: data.note || `Statut modifié de ${oldStatus} à ${data.status} par l'administrateur`
      });
      
      // Si on assigne la commande à un livreur
      if (data.deliveryMan) {
        order.deliveryDetails.assignedTo = data.deliveryMan;
      }
      
      // Si on ajoute des détails financiers
      if (data.financialDetails) {
        order.financialDetails = {
          ...order.financialDetails,
          ...data.financialDetails
        };
      }
    }
    
    // Si d'autres champs sont à mettre à jour
    if (data.deliveryDetails) {
      order.deliveryDetails = {
        ...order.deliveryDetails,
        ...data.deliveryDetails
      };
    }
    
    // Sauvegarder les modifications
    await order.save();
    
    return NextResponse.json({
      success: true,
      message: 'Commande mise à jour avec succès',
      order
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// Route DELETE pour supprimer une commande (admin only)
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
    const orderId = searchParams.get('id');
    
    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: 'ID de commande requis'
      }, { status: 400 });
    }
    
    await dbConnect();
    
    // Trouver et supprimer la commande
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    
    if (!deletedOrder) {
      return NextResponse.json({
        success: false,
        message: 'Commande introuvable'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Commande supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
