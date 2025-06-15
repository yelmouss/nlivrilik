'use server';

import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import DeliveryRating from '@/models/DeliveryRating';
import User from '@/models/User';
import { NextResponse } from 'next/server';

// Vérification commune des autorisations livreur
async function checkDeliveryAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.email || session.user.role !== 'DELIVERY_MAN') {
    return false;
  }
  
  return session;
}

// Route GET pour récupérer les évaluations du livreur
export async function GET() {
  try {
    const session = await checkDeliveryAuth();
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Non autorisé. Accès réservé aux livreurs'
      }, { status: 403 });
    }
    
    await dbConnect();
    
    const deliveryMan = await User.findOne({ 
      email: session.user.email,
      role: 'DELIVERY_MAN'
    });
    
    if (!deliveryMan) {
      return NextResponse.json({ 
        success: false, 
        message: 'Livreur introuvable'
      }, { status: 404 });
    }
    
    // Récupérer toutes les évaluations du livreur
    const ratings = await DeliveryRating.find({ 
      deliveryMan: deliveryMan._id 
    })
    .populate('order', 'createdAt')
    .sort({ createdAt: -1 })
    .limit(50); // Limiter à 50 évaluations récentes
    
    // Calculer les statistiques
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
      : 0;
    
    // Répartition des notes
    const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: ratings.filter(r => r.rating === star).length
    }));
    
    // Évaluations récentes avec commentaires
    const recentRatingsWithComments = ratings
      .filter(r => r.comment && r.comment.trim() !== '')
      .slice(0, 10);
    
    return NextResponse.json({ 
      success: true,
      stats: {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution
      },
      ratings: ratings.map(rating => ({
        _id: rating._id,
        rating: rating.rating,
        comment: rating.comment,
        createdAt: rating.createdAt,
        orderDate: rating.order?.createdAt,
        customerName: rating.orderInfo?.customerName || 'Client anonyme'
      })),
      recentComments: recentRatingsWithComments.map(rating => ({
        _id: rating._id,
        rating: rating.rating,
        comment: rating.comment,
        createdAt: rating.createdAt,
        customerName: rating.orderInfo?.customerName || 'Client anonyme'
      }))
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
