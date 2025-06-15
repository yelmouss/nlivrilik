import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import User from '@/models/User';
import DeliveryRating from '@/models/DeliveryRating';
import OrderStatus from '@/models/OrderStatus';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'DELIVERY_MAN') {
      return NextResponse.json({ 
        success: false, 
        message: 'Accès non autorisé' 
      }, { status: 401 });
    }

    await dbConnect();

    // Get delivery man's ID
    const deliveryManId = session.user.id;

    // Get active order
    const activeOrder = await Order.findOne({
      deliveryMan: deliveryManId,
      status: { $in: [OrderStatus.IN_TRANSIT] }
    }).populate('deliveryMan', 'name email');

    // Get available orders count
    const availableOrdersCount = await Order.countDocuments({
      status: OrderStatus.READY,
      deliveryMan: { $exists: false }
    });

    // Get today's deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDeliveries = await Order.countDocuments({
      deliveryMan: deliveryManId,
      status: OrderStatus.DELIVERED,
      updatedAt: { $gte: today, $lt: tomorrow }
    });

    // Get total deliveries
    const totalDeliveries = await Order.countDocuments({
      deliveryMan: deliveryManId,
      status: OrderStatus.DELIVERED
    });

    // Get average rating
    const ratingStats = await DeliveryRating.aggregate([
      { $match: { deliveryMan: deliveryManId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const averageRating = ratingStats.length > 0 ? ratingStats[0].averageRating : 0;    // Get delivery man availability status
    const deliveryMan = await User.findById(deliveryManId);
    const isAvailable = deliveryMan?.deliveryDetails?.isAvailable || false;

    return NextResponse.json({
      success: true,
      data: {
        activeOrder,
        availableOrdersCount,
        todayDeliveries,
        totalDeliveries,
        averageRating,
        isAvailable
      }
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
