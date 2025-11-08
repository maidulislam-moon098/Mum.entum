import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

/**
 * Development component for testing notifications
 * Add to routes if needed for testing
 */
export default function NotificationTest() {
  const { 
    permission, 
    isSupported, 
    requestPermission, 
    sendTestNotification 
  } = useNotifications();
  
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendTest = async () => {
    setSending(true);
    await sendTestNotification();
    setSending(false);
  };

  const handleSendCustom = async () => {
    if (!customMessage.trim()) return;
    
    setSending(true);
    try {
      await fetch('http://localhost:5000/api/notifications/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('Error sending custom notification:', error);
    }
    setSending(false);
  };

  if (!isSupported) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>❌ Notifications Not Supported</h2>
        <p>Your browser doesn't support push notifications.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '600px', 
      margin: '0 auto',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '20px' }}>🔔 Notification Testing</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Status</h3>
        <p>
          <strong>Permission:</strong> {permission}
        </p>
        <p>
          <strong>Supported:</strong> {isSupported ? 'Yes' : 'No'}
        </p>
      </div>

      {permission !== 'granted' && (
        <div style={{ marginBottom: '30px' }}>
          <button 
            className="button button--primary"
            onClick={requestPermission}
          >
            Request Permission
          </button>
        </div>
      )}

      {permission === 'granted' && (
        <>
          <div style={{ marginBottom: '30px' }}>
            <h3>Quick Tests</h3>
            <button 
              className="button button--primary"
              onClick={handleSendTest}
              disabled={sending}
              style={{ marginBottom: '10px' }}
            >
              {sending ? 'Sending...' : 'Send Test Notification'}
            </button>
            
            <button 
              className="button button--ghost"
              onClick={handleSendCustom}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Smart Check-in'}
            </button>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3>Custom Message</h3>
            <input
              type="text"
              placeholder="Enter custom message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #ddd',
                marginBottom: '10px'
              }}
            />
          </div>

          <div style={{ 
            padding: '20px', 
            background: '#f5f5f5', 
            borderRadius: '12px',
            fontSize: '0.9rem'
          }}>
            <h4>How to Test:</h4>
            <ol>
              <li>Click "Send Test Notification" to test basic push</li>
              <li>Click "Send Smart Check-in" to test AI-driven prompts</li>
              <li>Close or minimize the browser to see notifications</li>
              <li>Click on notification to be redirected to Assistant</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
