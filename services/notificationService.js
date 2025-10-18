
const Notification = require('../models/Notification');
const emailService = require('./emailService');

class NotificationService {
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();

      // Send email if email delivery is requested
      if (notificationData.deliveryMethod?.includes('email')) {
        await this.sendEmailNotification(notification);
      }

      // Send SMS if SMS delivery is requested
      if (notificationData.deliveryMethod?.includes('sms')) {
        await this.sendSMSNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        isRead,
        type,
        category,
        priority
      } = options;

      let filter = { userId };

      if (typeof isRead === 'boolean') filter.isRead = isRead;
      if (type) filter.type = type;
      if (category) filter.category = category;
      if (priority) filter.priority = priority;

      // Don't show expired notifications
      filter.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ];

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Notification.countDocuments(filter);
      const unreadCount = await Notification.countDocuments({
        userId,
        isRead: false,
        ...filter
      });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { 
          isRead: true, 
          readAt: new Date() 
        },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { 
          isRead: true, 
          readAt: new Date() 
        }
      );

      return { success: true, message: 'All notifications marked as read' };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      await Notification.findOneAndDelete({ _id: notificationId, userId });
      return { success: true, message: 'Notification deleted' };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async sendEmailNotification(notification) {
    try {
      // Get user email from the notification or fetch from User model
      const User = require('../models/User');
      const user = await User.findById(notification.userId);
      
      if (!user || !user.email) {
        console.warn('No email found for user:', notification.userId);
        return;
      }

      const emailResult = await emailService.sendEmail(
        user.email,
        notification.title,
        this.formatEmailContent(notification),
        notification.message
      );

      // Update delivery status
      await Notification.findByIdAndUpdate(notification._id, {
        'deliveryStatus.email': emailResult.success ? 'delivered' : 'failed'
      });

      return emailResult;
    } catch (error) {
      console.error('Error sending email notification:', error);
      await Notification.findByIdAndUpdate(notification._id, {
        'deliveryStatus.email': 'failed'
      });
    }
  }

  async sendSMSNotification(notification) {
    try {
      // Implement SMS sending logic here
      // You can integrate with services like Twilio, Africa's Talking, etc.
      
      console.log('SMS notification would be sent:', {
        userId: notification.userId,
        message: notification.message
      });

      // Update delivery status
      await Notification.findByIdAndUpdate(notification._id, {
        'deliveryStatus.sms': 'sent'
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      await Notification.findByIdAndUpdate(notification._id, {
        'deliveryStatus.sms': 'failed'
      });
    }
  }

  formatEmailContent(notification) {
    const actionButton = notification.actionUrl ? 
      `<a href="${notification.actionUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
        ${notification.actionLabel || 'View Details'}
      </a>` : '';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">${notification.title}</h2>
        <p>${notification.message}</p>
        ${actionButton}
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          This is an automated notification from ChamaVault.
        </p>
      </div>
    `;
  }

  // Bulk notification methods
  async broadcastNotification(notificationData, userIds = null) {
    try {
      let recipients = userIds;
      
      if (!recipients) {
        // Broadcast to all active users
        const User = require('../models/User');
        const users = await User.find({ isActive: true }).select('_id');
        recipients = users.map(user => user._id);
      }

      const notifications = recipients.map(userId => ({
        ...notificationData,
        userId
      }));

      await Notification.insertMany(notifications);

      return {
        success: true,
        message: `Notification sent to ${recipients.length} users`
      };
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  }

  // Scheduled notification methods
  async scheduleNotification(notificationData, scheduledFor) {
    try {
      const notification = new Notification({
        ...notificationData,
        scheduledFor,
        deliveryStatus: {
          in_app: 'pending'
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async processScheduledNotifications() {
    try {
      const now = new Date();
      const scheduledNotifications = await Notification.find({
        scheduledFor: { $lte: now },
        'deliveryStatus.in_app': 'pending'
      });

      for (const notification of scheduledNotifications) {
        // Mark as delivered
        notification.deliveryStatus.in_app = 'delivered';
        notification.sentAt = now;
        await notification.save();

        // Send email/SMS if required
        if (notification.deliveryMethod?.includes('email')) {
          await this.sendEmailNotification(notification);
        }
        if (notification.deliveryMethod?.includes('sms')) {
          await this.sendSMSNotification(notification);
        }
      }

      return {
        success: true,
        processed: scheduledNotifications.length
      };
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      throw error;
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
