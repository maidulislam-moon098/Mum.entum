import React from 'react';
import { motion } from 'framer-motion';

const CareInsights = ({
  insights = [],
  title = 'What to notice this week',
  subtitle = 'Insights generated from your check-ins, vitals, and educational library.',
  emptyMessage = 'Share more with us and we will surface helpful guidance here.'
}) => (
  <motion.section 
    initial={{ opacity: 0, y: 16 }} 
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    style={{ background: 'transparent', padding: 0 }}
  >
    {title && (
      <header style={{ marginBottom: '20px' }}>
        <h2>{title}</h2>
        {subtitle && <p style={{ color: '#8b7a80' }}>{subtitle}</p>}
      </header>
    )}
    <div style={{ display: 'grid', gap: '16px' }}>
      {insights.length === 0 && <p style={{ color: '#8b7a80' }}>{emptyMessage}</p>}
      {insights.map((insight, index) => (
        <motion.article 
          key={insight.id || insight.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.3 }}
          style={{
            background: 'transparent',
            padding: '16px 0',
            borderBottom: index < insights.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none'
          }}
        >
          <span style={{
            display: 'inline-block',
            fontSize: '0.85rem',
            color: '#f084ae',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            {insight.category || 'Wellness'}
          </span>
          <h3 style={{ marginBottom: '8px', fontSize: '1.1rem', color: '#2a2a2a' }}>
            {insight.title}
          </h3>
          <p style={{ lineHeight: '1.6', color: '#555' }}>{insight.summary}</p>
          {insight.created_at && (
            <footer style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#8b7a80' }}>
                {new Date(insight.created_at).toLocaleDateString()}
              </span>
            </footer>
          )}
        </motion.article>
      ))}
    </div>
  </motion.section>
);

export default CareInsights;
