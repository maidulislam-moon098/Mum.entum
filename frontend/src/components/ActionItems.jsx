import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const ActionItems = ({ items, userId, onUpdate }) => {
  const [loading, setLoading] = useState({});

  const handleToggle = async (itemId, currentStatus) => {
    setLoading(prev => ({ ...prev, [itemId]: true }));
    try {
      await axios.post('/api/action-items/toggle', {
        itemId,
        userId,
        isCompleted: !currentStatus
      });
      
      // Notify parent to refresh data
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to toggle action item:', error);
      alert('Failed to update checklist item');
    } finally {
      setLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ background: 'transparent', padding: 0 }}
    >
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '12px' }}>
        {items.length === 0 && (
          <li style={{ color: '#8b7a80' }}>
            Chat with the AI to get personalized checklist items!
          </li>
        )}
        {items.map((item, index) => (
          <motion.li 
            key={item.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            style={{ 
              opacity: item.is_completed ? 0.6 : 1,
              padding: '16px 0',
              borderBottom: index < items.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={item.is_completed}
                onChange={() => handleToggle(item.id, item.is_completed)}
                disabled={loading[item.id]}
                style={{ 
                  marginTop: '4px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ flex: 1 }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong style={{ 
                    textDecoration: item.is_completed ? 'line-through' : 'none',
                    color: '#2a2a2a',
                    fontSize: '1rem'
                  }}>
                    {item.title}
                  </strong>
                  {item.category && (
                    <small style={{ 
                      marginLeft: '8px', 
                      padding: '2px 8px', 
                      background: 'rgba(240, 132, 174, 0.15)',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      color: '#d9648f'
                    }}>
                      {item.category}
                    </small>
                  )}
                </div>
                {item.due_on && (
                  <small style={{ color: '#8b7a80', fontSize: '0.85rem' }}>
                    Due: {new Date(item.due_on).toLocaleDateString()}
                  </small>
                )}
              </span>
            </label>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
};

export default ActionItems;
