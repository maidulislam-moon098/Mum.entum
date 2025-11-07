import React from 'react';
import { motion } from 'framer-motion';

const MetricsTimeline = ({ metrics }) => (
  <motion.section className="metrics-timeline" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
    <header>
      <h2>Weekly baby insights</h2>
      <p>Growth highlights and health focus based on your trimester and recent responses.</p>
    </header>
    <div className="metrics-timeline__scroll">
      {metrics.length === 0 && <p className="muted">We will populate this timeline as soon as onboarding is complete.</p>}
      {metrics.map((metric) => (
        <article key={metric.week} className="metric-card">
          <span className="metric-card__week">Week {metric.week}</span>
          <h3>{metric.headline}</h3>
          <p>{metric.description}</p>
          <ul>
            {metric.focus_points?.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  </motion.section>
);

export default MetricsTimeline;
