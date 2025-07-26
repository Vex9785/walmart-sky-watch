import { PushNotifications } from '@capacitor/push-notifications';
import { FlightAlert } from '../types/flight';

class NotificationService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permission for notifications
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();
        
        // Listen for registration success
        await PushNotifications.addListener('registration', (token) => {
          console.info('Registration token: ', token.value);
        });

        // Listen for registration errors
        await PushNotifications.addListener('registrationError', (err) => {
          console.error('Registration error: ', err.error);
        });

        // Listen for push notifications
        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received: ', notification);
        });

        // Listen for notification actions
        await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue);
        });

        this.isInitialized = true;
        console.log('Push notifications initialized successfully');
      } else {
        console.warn('Push notification permission not granted');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  async sendLocalNotification(alert: FlightAlert) {
    try {
      const { flight, aircraft, alertType } = alert;
      
      let title = '';
      let body = '';

      switch (alertType) {
        case 'heading_to_minnesota':
          title = '✈️ Walmart Flight Alert';
          body = `${aircraft.registration} (${flight.callsign}) is heading to Minnesota`;
          break;
        case 'in_minnesota':
          title = '📍 Walmart Flight in Minnesota';
          body = `${aircraft.registration} (${flight.callsign}) is currently in Minnesota`;
          break;
      }

      // For web/development, use browser notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: alert.id,
          data: alert
        });
      }

      // For mobile, this would use the PushNotifications plugin
      // with a local notification implementation
      console.log('Notification sent:', { title, body, alert });
      
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async requestWebNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

export const notificationService = new NotificationService();