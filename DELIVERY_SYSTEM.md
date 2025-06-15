# Système de Livraison Complet

## Vue d'ensemble

Ce système permet aux livreurs de gérer leurs livraisons de A à Z, avec la possibilité pour les clients d'évaluer leur prestation après livraison.

## Architecture

### 1. Interface Livreur (`/delivery`)

#### Pages principales :
- **Dashboard** (`/delivery`) - Tableau de bord avec statistiques et commande active
- **Commandes disponibles** (`/delivery/available-orders`) - Liste des commandes à prendre
- **Commande active** (`/delivery/active-order`) - Gestion de la commande en cours
- **Historique** (`/delivery/history`) - Historique des livraisons passées
- **Évaluations** (`/delivery/ratings`) - Consultation des évaluations clients

### 2. APIs pour les livreurs (`/api/delivery`)

#### Endpoints disponibles :
- `GET /api/delivery/status` - Statut de disponibilité du livreur
- `POST /api/delivery/toggle-availability` - Basculer la disponibilité
- `GET /api/delivery/available-orders` - Liste des commandes disponibles
- `POST /api/delivery/take-order` - Prendre une commande
- `GET /api/delivery/active-order` - Récupérer la commande active
- `POST /api/delivery/update-order` - Mettre à jour une commande (statut, prix, paiement)
- `GET /api/delivery/history` - Historique avec statistiques
- `GET /api/delivery/ratings` - Évaluations du livreur

### 3. Système d'évaluation

#### Composants :
- `DeliveryRatingDialog` - Dialogue d'évaluation (5 étoiles + commentaire)
- `DeliveryCompletedDialog` - Notification de livraison terminée
- `AutoDeliveryRating` - Déclenchement automatique de l'évaluation

#### APIs :
- `POST /api/ratings` - Créer une évaluation
- `GET /api/ratings` - Récupérer les évaluations
- `GET /api/orders/[orderId]` - Récupérer une commande spécifique

## Flux de fonctionnement

### 1. Prise de commande
1. Le livreur consulte les commandes disponibles
2. Il prend une commande (une seule à la fois)
3. La commande passe en statut "assignée"

### 2. Livraison
1. Le livreur démarre la livraison (statut → "EN_TRANSIT")
2. Il renseigne les détails de livraison (prix, mode de paiement)
3. Il marque la commande comme livrée (statut → "DELIVERED")

### 3. Évaluation
1. Automatiquement après la livraison, le client reçoit une notification
2. Le client peut évaluer le livreur (1-5 étoiles + commentaire optionnel)
3. L'évaluation est sauvegardée et impacte les statistiques du livreur

## Modèles de données

### User (avec deliveryDetails pour DELIVERY_MAN)
```javascript
deliveryDetails: {
  vehicleType: String,
  isAvailable: Boolean,
  currentLocation: GeoJSON,
  activeDeliveries: [ObjectId],
  completedDeliveries: Number,
  rating: {
    average: Number,
    count: Number
  }
}
```

### Order (avec deliveryDetails)
```javascript
deliveryDetails: {
  assignedTo: ObjectId, // Livreur assigné
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date
}
```

### DeliveryRating
```javascript
{
  order: ObjectId,
  deliveryMan: ObjectId,
  customer: ObjectId,
  rating: Number (1-5),
  comment: String,
  orderInfo: {
    customerName: String,
    customerEmail: String,
    deliveryDate: Date,
    total: Number
  }
}
```

## Sécurité

- Authentification NextAuth.js requise
- Vérification du rôle `DELIVERY_MAN` sur toutes les routes
- Un livreur ne peut prendre qu'une commande à la fois
- Seuls les clients peuvent évaluer leurs propres commandes
- Les évaluations sont uniques par commande

## Intégration Client

Le système d'évaluation s'intègre automatiquement dans :
- Page "Mes Commandes" (`/my-orders`)
- Déclenchement automatique après livraison
- Notifications visuelles pour encourager l'évaluation

## Statistiques et Analyse

Les livreurs peuvent consulter :
- Note moyenne
- Nombre total d'évaluations
- Répartition des notes (1-5 étoiles)
- Commentaires récents
- Historique complet des évaluations

## Technologies utilisées

- **Frontend** : Next.js 14, React, Material-UI
- **Backend** : Next.js API Routes
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : NextAuth.js
- **Notifications** : Material-UI Snackbar et Dialogs

## Prochaines améliorations possibles

1. Notifications push/email pour les livreurs
2. Système de géolocalisation en temps réel
3. Chat intégré livreur-client
4. Optimisation des tournées
5. Système de bonus basé sur les évaluations
