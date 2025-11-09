import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TreatmentRecommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('sb-access-token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/treatment-recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      const token = localStorage.getItem('sb-access-token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/treatment-recommendations/${id}/acknowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to acknowledge recommendation:', error);
    }
  };

  const getRiskColor = (level) => {
    switch (level.toLowerCase()) {
      case 'high':
      case 'critical':
        return { bg: '#fee', border: '#f44', text: '#c00' };
      case 'medium':
      case 'moderate':
        return { bg: '#ffefd5', border: '#ffa500', text: '#cc8400' };
      case 'low':
      default:
        return { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' };
    }
  };

  const getRiskIcon = (level) => {
    switch (level.toLowerCase()) {
      case 'high':
      case 'critical':
        return '🚨';
      case 'medium':
      case 'moderate':
        return '⚠️';
      case 'low':
      default:
        return '💡';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
        Loading recommendations...
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
          borderRadius: '20px',
          padding: '32px',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✨</div>
        <h3 style={{ marginBottom: '8px', color: '#2e7d32' }}>All Clear!</h3>
        <p style={{ color: '#558b2f' }}>No active treatment recommendations at the moment.</p>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <header style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>🏥 AI Treatment Recommendations</h3>
        <p style={{ color: '#8b7a80', fontSize: '0.95rem' }}>
          Personalized care advice based on your health data
        </p>
      </header>

      <AnimatePresence>
        {recommendations.map((rec, index) => {
          const colors = getRiskColor(rec.risk_level);
          return (
            <motion.article
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              style={{
                background: colors.bg,
                border: `2px solid ${colors.border}`,
                borderRadius: '20px',
                padding: '24px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ fontSize: '2rem' }}>
                  {getRiskIcon(rec.risk_level)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '1.15rem', margin: 0, color: colors.text }}>
                      {rec.title}
                    </h4>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: colors.border,
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {rec.risk_level}
                    </span>
                  </div>
                  <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '16px' }}>
                    {rec.description}
                  </p>

                  {rec.recommended_actions && rec.recommended_actions.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ display: 'block', marginBottom: '8px', color: colors.text }}>
                        Recommended Actions:
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#555' }}>
                        {rec.recommended_actions.map((action, i) => (
                          <li key={i} style={{ marginBottom: '6px' }}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleAcknowledge(rec.id)}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '16px',
                        border: 'none',
                        background: colors.border,
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                    >
                      ✓ Got it
                    </button>
                    <span style={{ fontSize: '0.85rem', color: '#999' }}>
                      {rec.category}
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default TreatmentRecommendations;
