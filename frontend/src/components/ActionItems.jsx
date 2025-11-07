import React from 'react';
import { motion } from 'framer-motion';

const ActionItems = ({ items }) => (
  <motion.section className="action-items" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
    <header>
      <h2>Your care checklist</h2>
      <p>Small, manageable actions inspired by your goals and trimester.</p>
    </header>
    <ul>
  {items.length === 0 && <li className="muted">We will suggest next steps as you share more updates.</li>}
      {items.map((item) => (
        <li key={item.id}>
          <label>
            <input type="checkbox" defaultChecked={item.is_completed} />
            <span>
              <strong>{item.title}</strong>
              <small>{item.due_on ? new Date(item.due_on).toLocaleDateString() : 'Flexible'}</small>
            </span>
          </label>
        </li>
      ))}
    </ul>
  </motion.section>
);

export default ActionItems;
