import mongoose from 'mongoose';

// Vérifier si on est côté client
const isClient = typeof window !== 'undefined';

const DeliveryRatingSchema = !isClient ? new mongoose.Schema({
  // Référence à la commande
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true // Une seule évaluation par commande
  },
  
  // Référence au livreur évalué
  deliveryMan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Référence au client qui évalue
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Peut être null si le client n'est pas enregistré
  },
  
  // Note sur 5 étoiles
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v >= 1 && v <= 5;
      },
      message: 'La note doit être un entier entre 1 et 5'
    }
  },
  
  // Commentaire optionnel
  comment: {
    type: String,
    maxlength: 500,
    trim: true,
    default: ''
  },
  
  // Informations sur la commande pour référence
  orderInfo: {
    orderId: String,
    customerName: String,
    customerEmail: String,
    deliveryDate: Date,
    total: Number
  },
  
  // Date de création de l'évaluation
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Statut de modération (pour éviter les abus)
  isModerated: {
    type: Boolean,
    default: false
  },
  
  // Marquer comme signalée si inappropriée
  isFlagged: {
    type: Boolean,
    default: false
  }
}) : null;

// Index pour les performances
if (!isClient && DeliveryRatingSchema) {
  DeliveryRatingSchema.index({ deliveryMan: 1, createdAt: -1 });
  DeliveryRatingSchema.index({ order: 1 });
  DeliveryRatingSchema.index({ rating: 1 });
}

// Méthodes statiques pour les statistiques
if (!isClient && DeliveryRatingSchema) {
  // Calculer la note moyenne d'un livreur
  DeliveryRatingSchema.statics.getAverageRating = async function(deliveryManId) {
    const result = await this.aggregate([
      { $match: { deliveryMan: mongoose.Types.ObjectId(deliveryManId), isModerated: false, isFlagged: false } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    if (result.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result[0].ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });
    
    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalRatings: result[0].totalRatings,
      ratingDistribution: distribution
    };
  };
  
  // Obtenir les dernières évaluations d'un livreur
  DeliveryRatingSchema.statics.getRecentRatings = async function(deliveryManId, limit = 10) {
    return await this.find({
      deliveryMan: deliveryManId,
      isModerated: false,
      isFlagged: false
    })
    .populate('order', 'createdAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('rating comment orderInfo createdAt');
  };
}

const DeliveryRating = !isClient && mongoose.models?.DeliveryRating 
  ? mongoose.models.DeliveryRating 
  : (!isClient ? mongoose.model('DeliveryRating', DeliveryRatingSchema) : null);

export default DeliveryRating;
