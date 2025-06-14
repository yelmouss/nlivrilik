'use server';

import { authOptions } from '../../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import OrderStatus from '@/models/OrderStatus';
import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';

// Vérification commune des autorisations admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.email || session.user.role !== 'ADMIN') {
    return false;
  }
  
  return true;
}

// Route GET pour récupérer une commande spécifique
export async function GET(request, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux administrateurs'
      }, { status: 403 });
    }
    
    const { id } = params;
    
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de commande invalide'
      }, { status: 400 });
    }
    
    await dbConnect();
    
    const order = await Order.findById(id)
      .populate('user', 'name email phoneNumber')
      .populate('deliveryDetails.assignedTo', 'name email phoneNumber')
      .lean();
    
    if (!order) {
      return NextResponse.json({ 
        success: false, 
        message: 'Commande non trouvée'
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      order 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// Route PATCH pour mettre à jour une commande
export async function PATCH(request, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux administrateurs'
      }, { status: 403 });
    }
    
    const { id } = params;
    
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de commande invalide'
      }, { status: 400 });
    }
    
    await dbConnect();
    
    // Vérifier si la commande existe
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ 
        success: false, 
        message: 'Commande non trouvée'
      }, { status: 404 });
    }
    
    const data = await request.json();
    
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
    }
    
    // Si on assigne la commande à un livreur
    if (data.deliveryDetails) {
      order.deliveryDetails = {
        ...order.deliveryDetails,
        ...data.deliveryDetails
      };
    }
    
    // Si on ajoute des détails financiers
    if (data.financialDetails) {
      order.financialDetails = {
        ...order.financialDetails,
        ...data.financialDetails
      };
    }
    
    // Mettre à jour les commentaires ou notes
    if (data.adminNotes) {
      order.adminNotes = data.adminNotes;
    }
    
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

// Route DELETE pour supprimer une commande
export async function DELETE(request, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux administrateurs'
      }, { status: 403 });
    }
    
    const { id } = params;
    
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de commande invalide'
      }, { status: 400 });
    }
    
    await dbConnect();
    
    // Vérifier si la commande existe
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ 
        success: false, 
        message: 'Commande non trouvée'
      }, { status: 404 });
    }
    
    // En option: au lieu de supprimer complètement, on peut marquer comme supprimée
    // order.deleted = true;
    // await order.save();
    
    // Ou supprimer complètement
    await Order.findByIdAndDelete(id);
    
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
