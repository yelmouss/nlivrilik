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

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ message: 'ID de commande requis' }, { status: 400 });
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

    // Vérifier que le statut permet de commencer la livraison
    if (order.status !== OrderStatus.READY) {
      return NextResponse.json({ 
        message: 'Cette commande ne peut pas être mise en livraison dans son état actuel' 
      }, { status: 400 });
    }

    const previousStatus = order.status;

    // Mettre à jour le statut à "en cours de livraison"
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: OrderStatus.IN_TRANSIT,
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            status: OrderStatus.IN_TRANSIT,
            timestamp: new Date(),
            note: `Livraison commencée par ${session.user.name}`
          }
        }
      },
      { new: true }
    );

    // Envoyer les notifications
    try {
      await sendOrderStatusChangeNotification(updatedOrder, previousStatus, OrderStatus.IN_TRANSIT);
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi des notifications:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Livraison commencée avec succès',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Erreur lors du démarrage de la livraison:', error);
    return NextResponse.json(
      { message: 'Erreur serveur', error: error.message },
      { status: 500 }
    );
  }
}
