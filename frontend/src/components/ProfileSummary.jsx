import React from 'react';
import { motion } from 'framer-motion';

const ProfileSummary = ({ profile }) => (
  <motion.section className="profile-summary" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
    <header>
      <h2>Pregnancy snapshot</h2>
      <p>We use your responses to keep track of what matters most right now.</p>
    </header>
    {profile ? (
      <div className="profile-summary__grid">
        <div>
          <span className="label">Baby nickname</span>
          <strong>{profile.baby_nickname || 'To be decided'}</strong>
        </div>
        <div>
          <span className="label">Gestational week</span>
          <strong>{profile.current_week || '—'}</strong>
        </div>
        <div>
          <span className="label">Expected due date</span>
          <strong>{profile.due_date || 'Add due date'}</strong>
        </div>
        <div>
          <span className="label">Care team</span>
          <strong>{profile.primary_provider || 'No provider added yet'}</strong>
        </div>
        <div>
          <span className="label">Focus area</span>
          <strong>{profile.preferred_focus || 'Set your focus during onboarding'}</strong>
        </div>
        <div className="profile-summary__note">
          <span className="label">Notes</span>
          <p>{profile.notes || 'We will add your observations here as you share more with us.'}</p>
        </div>
      </div>
    ) : (
      <p className="muted">Complete onboarding to unlock personalised insights.</p>
    )}
  </motion.section>
);

export default ProfileSummary;
