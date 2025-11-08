import { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationPermissionBanner() {
  const { permission, isSupported, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user previously dismissed the banner
  useEffect(() => {
    const wasDismissed = localStorage.getItem('notification-banner-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleEnable = async () => {
    setIsLoading(true);
    const granted = await requestPermission();
    setIsLoading(false);
    
    if (granted) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  // Don't show if:
  // - Notifications not supported
  // - Already granted permission
  // - User dismissed the banner
  if (!isSupported || permission === 'granted' || dismissed) {
    return null;
  }

  return (
    <div className="notification-banner">
      <div className="notification-banner__content">
        <div className="notification-banner__icon">🔔</div>
        <div className="notification-banner__text">
          <h3 className="notification-banner__title">Stay Connected</h3>
          <p className="notification-banner__description">
            Let Mum.entum check in on you with gentle reminders and supportive messages
          </p>
        </div>
        <div className="notification-banner__actions">
          <button 
            className="button button--primary button--small"
            onClick={handleEnable}
            disabled={isLoading}
          >
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </button>
          <button 
            className="button button--ghost button--small"
            onClick={handleDismiss}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
