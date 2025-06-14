import mongoose from 'mongoose';

// Define user roles as constants to avoid typos
export const UserRoles = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  DELIVERY_MAN: 'DELIVERY_MAN'
};

/**
 * Base user schema with common fields for all user types
 */
const BaseUserSchema = {
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.facebookId; // Not required if social auth is used
    }
  },
  image: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: Object.values(UserRoles),
    default: UserRoles.USER
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  // Social auth fields
  googleId: {
    type: String,
    sparse: true
  },
  facebookId: {
    type: String,
    sparse: true
  },
  emailVerified: {
    type: Date,
    default: null
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpires: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
};

/**
 * Admin-specific fields
 */
const AdminSchema = {
  permissions: {
    type: [String],
    default: ['manage_users', 'manage_content', 'manage_orders', 'manage_delivery']
  },
  adminLevel: {
    type: Number,
    default: 1 // Different levels of admin access
  }
};

/**
 * Regular user-specific fields
 */
const UserSpecificSchema = {
  favoriteItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  cart: {
    items: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }],
    totalAmount: {
      type: Number,
      default: 0
    }
  },
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
};

/**
 * Delivery person-specific fields
 */
const DeliveryManSchema = {
  vehicleType: {
    type: String,
    enum: ['bicycle', 'motorbike', 'car', 'van'],
    default: 'motorbike'
  },
  vehicleRegistration: {
    type: String
  },
  licenseNumber: {
    type: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  deliveryZone: {
    type: String
  },
  activeDeliveries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  completedDeliveries: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  }
};

// Combine all schemas into one comprehensive UserSchema
const UserSchema = new mongoose.Schema({
  ...BaseUserSchema,
  // Fields that are specific to each role - they will only be populated based on the user's role
  adminDetails: {
    type: AdminSchema,
    default: function() {
      return this.role === UserRoles.ADMIN ? {} : undefined;
    }
  },
  userDetails: {
    type: UserSpecificSchema,
    default: function() {
      return this.role === UserRoles.USER ? {} : undefined;
    }
  },
  deliveryDetails: {
    type: DeliveryManSchema,
    default: function() {
      return this.role === UserRoles.DELIVERY_MAN ? {} : undefined;
    }
  }
}, {
  timestamps: true
});

// Index for geospatial queries for delivery personnel
UserSchema.index({ "deliveryDetails.currentLocation": "2dsphere" });

// Methods specific to different user types
UserSchema.methods = {
  // Common methods for all users
  getProfileInfo() {
    return {
      id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
      image: this.image,
      phoneNumber: this.phoneNumber,
      address: this.address
    };
  },

  // Admin-specific methods
  hasPermission(permission) {
    return this.role === UserRoles.ADMIN && 
           this.adminDetails && 
           this.adminDetails.permissions.includes(permission);
  },

  // User-specific methods
  addToCart(product, quantity, price) {
    if (this.role !== UserRoles.USER) return false;
    
    const cartProductIndex = this.userDetails.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });
    
    let newQuantity = quantity || 1;
    const updatedCartItems = [...this.userDetails.cart.items];
    
    if (cartProductIndex >= 0) {
      newQuantity = this.userDetails.cart.items[cartProductIndex].quantity + newQuantity;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity,
        price: price
      });
    }
    
    this.userDetails.cart.items = updatedCartItems;
    this.userDetails.cart.totalAmount = this.userDetails.cart.items.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
    
    return this.save();
  },

  // Delivery person-specific methods
  updateLocation(coordinates) {
    if (this.role !== UserRoles.DELIVERY_MAN) return false;
    
    this.deliveryDetails.currentLocation.coordinates = coordinates;
    return this.save();
  },
  
  toggleAvailability() {
    if (this.role !== UserRoles.DELIVERY_MAN) return false;
    
    this.deliveryDetails.isAvailable = !this.deliveryDetails.isAvailable;
    return this.save();
  }
};

// Only create the model if it doesn't already exist (for server-side usage)
export default mongoose.models.User || mongoose.model('User', UserSchema);
