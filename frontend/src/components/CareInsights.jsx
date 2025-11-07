import React from 'react';
import { motion } from 'framer-motion';

const CareInsights = ({
  insights = [],
  title = 'What to notice this week',
  subtitle = 'Insights generated from your check-ins, vitals, and educational library.',
  emptyMessage = 'Share more with us and we will surface helpful guidance here.'
}) => (
  <motion.section className="care-insights" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
    <header>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </header>
    <div className="care-insights__grid">
      {insights.length === 0 && <p className="muted">{emptyMessage}</p>}
      {insights.map((insight) => (
        <article key={insight.id || insight.title} className="insight-card">
          <span className="insight-card__tag">{insight.category || 'Wellness'}</span>
          <h3>{insight.title}</h3>
          <p>{insight.summary}</p>
          {insight.created_at && (
            <footer>
              <span>{new Date(insight.created_at).toLocaleDateString()}</span>
            </footer>
          )}
        </article>
      ))}
    </div>
  </motion.section>
);

export default CareInsights;
