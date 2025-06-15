import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import UserRoles from '@/models/UserRoles';
import OrderStatus from '@/models/OrderStatus';

export async function GET() {
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

    await connectDB();

    // Commandes disponibles (confirmées, prêtes, mais pas encore assignées ou assignées à personne)
    const availableOrders = await Order.find({
      status: { $in: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.READY] },
      $or: [
        { 'deliveryDetails.assignedTo': { $exists: false } },
        { 'deliveryDetails.assignedTo': null }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(20);

    // Commandes assignées à ce livreur
    const assignedOrders = await Order.find({
      'deliveryDetails.assignedTo': session.user.id,
      status: { $in: [OrderStatus.READY, OrderStatus.IN_TRANSIT] }
    })
    .sort({ createdAt: -1 });

    // Commandes terminées par ce livreur
    const completedOrders = await Order.find({
      'deliveryDetails.assignedTo': session.user.id,
      status: OrderStatus.DELIVERED
    })
    .sort({ updatedAt: -1 })
    .limit(10);

    return NextResponse.json({
      success: true,
      orders: {
        available: availableOrders,
        assigned: assignedOrders,
        completed: completedOrders
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json(
      { message: 'Erreur serveur', error: error.message },
      { status: 500 }
    );
  }
}
