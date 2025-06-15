import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import DeliveryRating from '@/models/DeliveryRating';
import Order from '@/models/Order';
import OrderStatus from '@/models/OrderStatus';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const { orderId, rating, comment } = await request.json();

    // Validation des données
    if (!orderId || !rating) {
      return NextResponse.json({ message: 'Commande et note requises' }, { status: 400 });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ message: 'La note doit être un entier entre 1 et 5' }, { status: 400 });
    }

    if (comment && comment.length > 500) {
      return NextResponse.json({ message: 'Le commentaire ne peut pas dépasser 500 caractères' }, { status: 400 });
    }

    await connectDB();

    // Vérifier que la commande existe et est livrée
    const order = await Order.findById(orderId).populate('deliveryDetails.assignedTo', 'name email');
    if (!order) {
      return NextResponse.json({ message: 'Commande non trouvée' }, { status: 404 });
    }

    if (order.status !== OrderStatus.DELIVERED) {
      return NextResponse.json({ message: 'Seules les commandes livrées peuvent être évaluées' }, { status: 400 });
    }

    if (!order.deliveryDetails?.assignedTo) {
      return NextResponse.json({ message: 'Aucun livreur assigné à cette commande' }, { status: 400 });
    }

    // Vérifier si l'utilisateur connecté est le propriétaire de la commande
    if (session && order.user && order.user.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Vous ne pouvez évaluer que vos propres commandes' }, { status: 403 });
    }

    // Vérifier si une évaluation existe déjà
    const existingRating = await DeliveryRating.findOne({ order: orderId });
    if (existingRating) {
      return NextResponse.json({ message: 'Cette commande a déjà été évaluée' }, { status: 400 });
    }

    // Créer la nouvelle évaluation
    const newRating = new DeliveryRating({
      order: orderId,
      deliveryMan: order.deliveryDetails.assignedTo._id,
      customer: session?.user?.id || null,
      rating: rating,
      comment: comment?.trim() || '',
      orderInfo: {
        orderId: order._id.toString(),
        customerName: order.contactInfo.fullName,
        customerEmail: order.contactInfo.email,
        deliveryDate: order.deliveryDetails.actualDeliveryTime || order.updatedAt,
        total: order.financialDetails?.total || 0
      }
    });

    await newRating.save();

    return NextResponse.json({
      success: true,
      message: 'Évaluation enregistrée avec succès',
      rating: newRating
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'évaluation:', error);
    return NextResponse.json(
      { message: 'Erreur serveur', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const deliveryManId = searchParams.get('deliveryManId');

    await connectDB();

    if (orderId) {
      // Récupérer l'évaluation pour une commande spécifique
      const rating = await DeliveryRating.findOne({ order: orderId });
      return NextResponse.json({
        success: true,
        rating: rating,
        hasRating: !!rating
      });
    }

    if (deliveryManId) {
      // Récupérer les statistiques et évaluations d'un livreur
      const stats = await DeliveryRating.getAverageRating(deliveryManId);
      const recentRatings = await DeliveryRating.getRecentRatings(deliveryManId, 20);

      return NextResponse.json({
        success: true,
        stats: stats,
        recentRatings: recentRatings
      });
    }

    return NextResponse.json({ message: 'Paramètres manquants' }, { status: 400 });

  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    return NextResponse.json(
      { message: 'Erreur serveur', error: error.message },
      { status: 500 }
    );
  }
}
