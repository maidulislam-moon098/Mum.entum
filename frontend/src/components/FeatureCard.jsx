import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ title, description, icon }) => (
  <motion.article
    className="feature-card"
    whileHover={{ y: -6 }}
    transition={{ type: 'spring', stiffness: 240, damping: 20 }}
  >
    <div className="feature-card__icon" aria-hidden="true">
      {icon}
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
  </motion.article>
);

export default FeatureCard;
