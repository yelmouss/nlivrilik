import mongoose from 'mongoose';
import OrderStatus from './OrderStatus';

// Vérifier si nous sommes côté client
const isClient = typeof window !== 'undefined';
const dummy = { dummy: true }; // Objet factice pour l'exportation côté client

// Schéma pour les commandes - uniquement côté serveur
const OrderSchema = !isClient ? new mongoose.Schema({
  // Si l'utilisateur est connecté, référence à son compte
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Non requis car les commandes peuvent être passées sans compte
  },
  
  // Informations de contact
  contactInfo: {
    fullName: {
      type: String,
      required: [true, 'Le nom complet est requis']
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer une adresse email valide']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Le numéro de téléphone est requis']
    }
  },
  
  // Adresse de livraison
  deliveryAddress: {
    formattedAddress: {
      type: String,
      required: [true, 'L\'adresse de livraison est requise']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    additionalInfo: {
      type: String,
      default: ''
    }
  },
  
  // Contenu de la commande saisi par l'utilisateur
  orderContent: {
    type: String,
    required: [true, 'Le contenu de la commande est requis']
  },
  
  // Statut de la commande
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING
  },
  
  // Informations financières (remplies après la livraison)
  financialDetails: {
    subtotal: {
      type: Number,
      default: 0
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'mobile_payment'],
      default: 'cash'
    },
    isPaid: {
      type: Boolean,
      default: false
    }
  },
  
  // Détails de livraison
  deliveryDetails: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Référence à un utilisateur avec le rôle DELIVERY_MAN
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    deliveryNotes: String
  },
  
  // Dates de création et de mise à jour
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Historique des modifications de statut
  statusHistory: [{
    status: {
      type: String,
      enum: Object.values(OrderStatus)
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String  }]
}) : null;

// Les opérations suivantes ne s'exécutent que côté serveur
if (!isClient && OrderSchema) {
  // Index géospatial pour les recherches basées sur la localisation
  OrderSchema.index({ 'deliveryAddress.coordinates': '2dsphere' });

  // Middleware pre-save pour mettre à jour la date de mise à jour
  OrderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Ajouter une entrée à l'historique des statuts si le statut a changé
    if (this.isModified('status')) {
      this.statusHistory.push({
        status: this.status,
        timestamp: Date.now()
      });
    }
    
    next();
  });
}

// Créer le modèle si mongoose est prêt et si nous sommes côté serveur
const Order = !isClient 
  ? (mongoose.models.Order || mongoose.model('Order', OrderSchema)) 
  : dummy;

export default Order;
