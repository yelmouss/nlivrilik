import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import UserRoles from '@/models/UserRoles';
import OrderStatus from '@/models/OrderStatus';
import { sendOrderStatusChangeNotification } from '@/lib/order-notifications';

export async function PATCH(request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier le rôle de livreur
    if (session.user.role !== UserRoles.DELIVERY_MAN) {
      return NextResponse.json({ message: 'Accès refusé' }, { status: 403 });
    }

    const { orderId, financialDetails, deliveryNotes } = await request.json();

    if (!orderId || !financialDetails) {
      return NextResponse.json({ message: 'Données manquantes' }, { status: 400 });
    }

    // Validation des données financières
    if (!financialDetails.subtotal || !financialDetails.deliveryFee) {
      return NextResponse.json({ message: 'Le subtotal et les frais de livraison sont requis' }, { status: 400 });
    }

    if (financialDetails.subtotal < 0 || financialDetails.deliveryFee < 0) {
      return NextResponse.json({ message: 'Les montants ne peuvent pas être négatifs' }, { status: 400 });
    }

    await connectDB();

    // Vérifier que la commande existe et est assignée à ce livreur
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: 'Commande non trouvée' }, { status: 404 });
    }

    // Vérifier que la commande est assignée à ce livreur
    if (!order.deliveryDetails?.assignedTo || order.deliveryDetails.assignedTo.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Cette commande ne vous est pas assignée' }, { status: 403 });
    }

    // Vérifier que le statut permet de terminer la livraison
    if (order.status !== OrderStatus.IN_TRANSIT) {
      return NextResponse.json({ 
        message: 'Cette commande ne peut pas être marquée comme livrée dans son état actuel' 
      }, { status: 400 });
    }

    const previousStatus = order.status;

    // Mettre à jour la commande avec les détails financiers et de livraison
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: OrderStatus.DELIVERED,
          financialDetails: {
            subtotal: financialDetails.subtotal,
            deliveryFee: financialDetails.deliveryFee,
            total: financialDetails.total,
            paymentMethod: financialDetails.paymentMethod || 'cash',
            isPaid: financialDetails.isPaid || false
          },
          'deliveryDetails.actualDeliveryTime': new Date(),
          'deliveryDetails.deliveryNotes': deliveryNotes || '',
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            status: OrderStatus.DELIVERED,
            timestamp: new Date(),
            note: `Livraison terminée par ${session.user.name}. Total: ${financialDetails.total} DA`
          }
        }
      },
      { new: true }
    );

    // Envoyer les notifications
    try {
      await sendOrderStatusChangeNotification(updatedOrder, previousStatus, OrderStatus.DELIVERED);
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi des notifications:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Livraison terminée avec succès',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Erreur lors de la finalisation de la livraison:', error);
    return NextResponse.json(
      { message: 'Erreur serveur', error: error.message },
      { status: 500 }
    );
  }
}
