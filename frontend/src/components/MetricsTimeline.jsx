import React from 'react';
import { motion } from 'framer-motion';

const MetricsTimeline = ({ metrics }) => (
  <motion.section 
    className="metrics-timeline" 
    initial={{ opacity: 0, y: 16 }} 
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <header>
      <h2>Weekly baby insights</h2>
      <p>Growth highlights and health focus based on your trimester and recent responses.</p>
    </header>
    <div className="metrics-timeline__scroll">
      {metrics.length === 0 && <p className="muted">We will populate this timeline as soon as onboarding is complete.</p>}
      {metrics.map((metric, index) => (
        <motion.article 
          key={metric.week} 
          className="metric-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <span className="metric-card__week">Week {metric.week}</span>
          <h3>{metric.headline}</h3>
          <p>{metric.description}</p>
          {metric.focus_points && metric.focus_points.length > 0 && (
            <ul>
              {metric.focus_points.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          )}
        </motion.article>
      ))}
    </div>
  </motion.section>
);

export default MetricsTimeline;
