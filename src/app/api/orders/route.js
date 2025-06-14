'use server';

import { authOptions } from '../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';

// Fonction pour récupérer les commandes d'un utilisateur
export async function getUserOrders() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.email) {
      return { 
        success: false, 
        message: 'Non autorisé',
        orders: []
      };    }
    
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return { 
        success: false, 
        message: 'Utilisateur introuvable',
        orders: []
      };
    }
    
    // Pour l'instant, utilisons des données mockées
    // Dans une implémentation réelle, vous récupéreriez les commandes de l'utilisateur depuis la base de données
    const orders = [
      {
        id: 'ORD-001',
        date: '2025-06-10',
        status: 'delivered',
        items: [{ name: 'Package Delivery', quantity: 1, price: 50 }],
        total: 50,
        address: '123 Main Street, City',
        trackingNumber: 'TRK123456789'
      },
      {
        id: 'ORD-002',
        date: '2025-06-12',
        status: 'in_transit',
        items: [{ name: 'Express Delivery', quantity: 1, price: 75 }],
        total: 75,
        address: '456 Oak Avenue, Town',
        trackingNumber: 'TRK987654321'
      }
    ];
    
    return { 
      success: true, 
      orders 
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return { 
      success: false, 
      message: 'Erreur interne du serveur',
      orders: []
    };
  }
}

// Route GET pour récupérer les commandes de l'utilisateur connecté
export async function GET() {
  try {
    const result = await getUserOrders();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error',
      orders: []
    }, { status: 500 });
  }
}
