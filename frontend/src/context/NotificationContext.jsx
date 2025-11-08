import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const [permission, setPermission] = useState(Notification.permission);
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications and service workers
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
  }, []);

  /**
   * Request notification permission from user
   */
  const requestPermission = async () => {
    if (!isSupported) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await subscribeToPush();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  /**
   * Subscribe to push notifications
   */
  const subscribeToPush = async () => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const response = await fetch('http://localhost:5000/api/notifications/vapid-public-key');
      const { publicKey } = await response.json();

      // Subscribe to push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Send subscription to server
      await fetch('http://localhost:5000/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription: sub })
      });

      setSubscription(sub);
      console.log('Successfully subscribed to push notifications');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribeFromPush = async () => {
    if (!subscription) {
      return;
    }

    try {
      await subscription.unsubscribe();
      
      await fetch('http://localhost:5000/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setSubscription(null);
      console.log('Successfully unsubscribed from push notifications');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  };

  /**
   * Send test notification
   */
  const sendTestNotification = async () => {
    try {
      await fetch('http://localhost:5000/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const value = {
    permission,
    subscription,
    isSupported,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Helper function to convert VAPID key
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
