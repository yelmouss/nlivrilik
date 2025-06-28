import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';

export async function GET(request, context) {
  try {
    const { params } = await context;
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de commande requis' 
      }, { status: 400 });
    }

    await dbConnect();

    const order = await Order.findById(orderId)
      .populate('deliveryDetails.assignedTo', 'name email')
      .populate('user', 'name email');

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        message: 'Commande non trouvée' 
      }, { status: 404 });
    }

    // Vérifier les permissions
    const session = await getServerSession(authOptions);
    const canView = 
      !session || // Pas de session (commande anonyme)
      session.user.role === 'ADMIN' || // Admin peut tout voir
      (session.user.role === 'DELIVERY_MAN' && order.deliveryDetails?.assignedTo?.email === session.user.email) || // Livreur assigné
      (order.user && order.user.email === session.user.email) || // Propriétaire de la commande
      (order.contactInfo.email === session.user.email); // Email de contact correspond

    if (!canView) {
      return NextResponse.json({ 
        success: false, 
        message: 'Accès non autorisé à cette commande' 
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
