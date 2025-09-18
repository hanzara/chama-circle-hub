
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'contribution', 'loan', 'investment', 'payment'],
    default: 'info',
  },
  category: {
    type: String,
    enum: ['system', 'chama', 'loan', 'investment', 'payment', 'security'],
    default: 'system',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  data: {
    type: mongoose.Schema.Types.Mixed,
    // Additional data related to the notification
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    // Reference to related document
  },
  relatedModel: {
    type: String,
    enum: ['Chama', 'ChamaLoan', 'Investment', 'MpesaTransaction', 'User'],
  },
  actionUrl: String, // URL to navigate when notification is clicked
  actionLabel: String, // Text for action button
  scheduledFor: Date, // For scheduled notifications
  sentAt: Date,
  deliveryMethod: {
    type: [String],
    enum: ['in_app', 'email', 'sms', 'push'],
    default: ['in_app'],
  },
  deliveryStatus: {
    in_app: {
      type: String,
      enum: ['pending', 'delivered', 'failed'],
      default: 'pending',
    },
    email: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
    },
    sms: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
    },
    push: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
    }
  },
  expiresAt: Date,
  metadata: {
    source: String, // Source of the notification
    campaign: String, // Marketing campaign ID
    tags: [String], // Tags for categorization
  }
}, {
  timestamps: true,
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });

// Automatically mark as sent when created
notificationSchema.pre('save', function(next) {
  if (this.isNew && !this.sentAt) {
    this.sentAt = new Date();
    this.deliveryStatus.in_app = 'delivered';
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
