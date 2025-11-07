import React from 'react';
import { motion } from 'framer-motion';

const formatDate = (value) => {
  if (!value) return '';
  try {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }
    return parsed.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  } catch (_err) {
    return '';
  }
};

const ImportantNotifications = ({ items }) => (
  <motion.section className="notifications" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
    <header>
      <h2>Important updates</h2>
      <p>Quick highlights that deserve a moment of your attention.</p>
    </header>
    {items && items.length > 0 ? (
      <ul className="notifications__list">
        {items.map((notification) => {
          const severity = (notification.severity || 'info').toLowerCase();
          const label = severity.charAt(0).toUpperCase() + severity.slice(1);
          return (
            <li key={notification.id} className={`notifications__item notifications__item--${severity}`}>
              <div className="notifications__meta">
                <span className="notifications__severity">{label}</span>
              <span className="notifications__date">{formatDate(notification.created_at)}</span>
            </div>
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            </li>
          );
        })}
      </ul>
    ) : (
      <p className="muted">You are all caught up for now—no urgent nudges today.</p>
    )}
  </motion.section>
);

export default ImportantNotifications;
