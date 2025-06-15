import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import UserRoles from '@/models/UserRoles';
import OrderStatus from '@/models/OrderStatus';
import { sendOrderStatusChangeNotification } from '@/lib/order-notifications';

export async function POST(request) {
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

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ message: 'ID de commande requis' }, { status: 400 });
    }

    await connectDB();

    // Vérifier que la commande existe et est disponible
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: 'Commande non trouvée' }, { status: 404 });
    }

    // Vérifier que la commande n'est pas déjà assignée
    if (order.deliveryDetails?.assignedTo) {
      return NextResponse.json({ message: 'Cette commande est déjà assignée à un livreur' }, { status: 400 });
    }

    // Vérifier que le statut permet l'assignation
    const allowedStatuses = [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.READY];
    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json({ 
        message: 'Cette commande ne peut pas être prise dans son état actuel' 
      }, { status: 400 });
    }

    // Vérifier que le livreur n'a pas déjà trop de commandes actives
    const activeOrdersCount = await Order.countDocuments({
      'deliveryDetails.assignedTo': session.user.id,
      status: { $in: [OrderStatus.READY, OrderStatus.IN_TRANSIT] }
    });

    if (activeOrdersCount >= 3) { // Limite de 3 commandes simultanées
      return NextResponse.json({ 
        message: 'Vous avez déjà atteint le nombre maximum de livraisons simultanées (3)' 
      }, { status: 400 });
    }

    const previousStatus = order.status;

    // Assigner la commande au livreur
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          'deliveryDetails.assignedTo': session.user.id,
          status: OrderStatus.READY,
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            status: OrderStatus.READY,
            timestamp: new Date(),
            note: `Commande assignée au livreur ${session.user.name}`
          }
        }
      },
      { new: true }
    );

    // Envoyer les notifications si le statut a changé
    if (previousStatus !== OrderStatus.READY) {
      try {
        await sendOrderStatusChangeNotification(updatedOrder, previousStatus, OrderStatus.READY);
      } catch (notificationError) {
        console.error('Erreur lors de l\'envoi des notifications:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Commande prise avec succès',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Erreur lors de la prise de commande:', error);
    return NextResponse.json(
      { message: 'Erreur serveur', error: error.message },
      { status: 500 }
    );
  }
}
