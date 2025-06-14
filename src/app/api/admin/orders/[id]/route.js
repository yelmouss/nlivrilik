'use server';

import { authOptions } from '../../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/mongoose'; // Changed from @/lib/mongodb
import Order from '@/models/Order';
import OrderStatus from '@/models/OrderStatus';
import User from '@/models/User'; // Add this line
import { isValidObjectId } from 'mongoose';
import { sendOrderStatusChangeNotification } from '@/lib/order-notifications';

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
    
    const resolvedParams = await params; // Await params
    const { id } = resolvedParams; // Use resolvedParams
    
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
    
    const resolvedParams = await params; // Await params
    const { id } = resolvedParams; // Use resolvedParams
    
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
    let statusChanged = false;
    let previousStatus = order.status; // Store initial status before any changes

    // Validate deliveryDetails.assignedTo if present and is a non-empty string that's not a valid ObjectId
    if (
      data.deliveryDetails &&
      data.deliveryDetails.hasOwnProperty('assignedTo') &&
      data.deliveryDetails.assignedTo !== null &&
      typeof data.deliveryDetails.assignedTo === 'string' &&
      data.deliveryDetails.assignedTo.length > 0 &&
      !isValidObjectId(data.deliveryDetails.assignedTo)
    ) {
      // Attempt to find a user by name if assignedTo is a string (potential name)
      const deliveryUser = await User.findOne({ name: data.deliveryDetails.assignedTo });
      if (deliveryUser) {
        data.deliveryDetails.assignedTo = deliveryUser._id; // Replace name with ObjectId
      } else {
        // If no user found by name, and it's not a valid ObjectId, return error
        return NextResponse.json({
          success: false,
          message: `Invalid ObjectId or user name for assignedTo: ${data.deliveryDetails.assignedTo}`
        }, { status: 400 });
      }
    }
    
    // Mettre à jour les champs de la commande
    Object.keys(data).forEach(key => {
      if (key === 'status' && order.status !== data[key]) {
        statusChanged = true;
      }
      // Handle nested objects like deliveryDetails
      if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
        if (!order[key]) order[key] = {};
        Object.keys(data[key]).forEach(subKey => {
          order[key][subKey] = data[key][subKey];
        });
      } else {
        order[key] = data[key];
      }
    });

    const updatedOrder = await order.save();

    // If status changed, send notification
    if (statusChanged) {
      try {
        // We need to populate user and deliveryDetails.assignedTo for the email template
        const populatedOrder = await Order.findById(updatedOrder._id)
          .populate('user', 'name email phoneNumber')
          .populate('deliveryDetails.assignedTo', 'name email phoneNumber')
          .lean();
          
        if (populatedOrder) {
          await sendOrderStatusChangeNotification(populatedOrder, previousStatus);
        } else {
          console.error('Failed to populate order for notification after update:', updatedOrder._id);
        }
      } catch (emailError) {
        console.error('Failed to send order status change notification:', emailError);
        // Do not block the response for email errors, but log it.
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Commande mise à jour avec succès',
      order // Return the updated order
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    // Check for Mongoose validation error specifically for assignedTo for more clarity if needed
    if (error.name === 'ValidationError' && error.errors && error.errors['deliveryDetails.assignedTo']) {
        return NextResponse.json({
            success: false,
            message: `Erreur de validation: ${error.errors['deliveryDetails.assignedTo'].message}`,
            errorDetails: error.errors
        }, { status: 400 });
    }
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
    
    const resolvedParams = await params; // Await params
    const { id } = resolvedParams; // Use resolvedParams
    
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
