import React from 'react';
import { motion } from 'framer-motion';

const formatDate = (value) => {
  if (!value) return null;
  try {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toLocaleDateString();
  } catch (_err) {
    return null;
  }
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'Not provided yet';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : 'Not provided yet';
  }

  if (typeof value === 'object') {
    if (value.raw) {
      return value.raw;
    }
    return JSON.stringify(value);
  }

  return value;
};

const ProfileDetails = ({ profile }) => {
  if (!profile) {
    return (
      <motion.section className="profile-details" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="muted">We will fill this out once you share your onboarding details.</p>
      </motion.section>
    );
  }

  const sections = [
    {
      title: 'Basic Personal Information',
      description: 'Grounding details we use to personalise every update.',
      rows: [
        { label: 'Preferred name', value: profile.preferred_name },
        { label: 'Baby nickname', value: profile.baby_nickname },
        { label: 'Age', value: profile.age },
        { label: 'Country / Region', value: profile.country }
      ]
    },
    {
      title: 'Pregnancy Status',
      description: 'Where you are in your journey right now.',
      rows: [
        { label: 'Status', value: profile.pregnancy_status },
        { label: 'Weeks pregnant', value: profile.weeks_pregnant },
        { label: 'Current week synced', value: profile.current_week },
        { label: 'Due date', value: formatDate(profile.due_date) || profile.due_date },
        { label: 'Planning window', value: profile.planning_window },
        { label: 'First pregnancy', value: profile.is_first_pregnancy },
        { label: 'Complications', value: profile.complications }
      ]
    },
    {
      title: 'Medical Background',
      description: 'Helps us keep an eye on important health notes.',
      rows: [
        { label: 'Medical conditions', value: profile.medical_conditions },
        { label: 'Medications or supplements', value: profile.medications }
      ]
    },
    {
      title: 'Nutrition preferences',
      description: `We tailor recipes and regional suggestions using this information${profile.country ? ` for ${profile.country}` : ''}.`,
      rows: [
        { label: 'Diet style', value: profile.diet_style },
        { label: 'Food preferences', value: profile.food_preferences },
        { label: 'Allergies', value: profile.allergies }
      ]
    },
    {
      title: 'Lifestyle checks',
      description: 'Movement pace and routines help us pick realistic daily rituals.',
      rows: [
        { label: 'Activity level', value: profile.activity_level },
        { label: 'Smoking or alcohol', value: profile.substance_use }
      ]
    },
    {
      title: 'Mental Health',
      description: 'Emotional tone helps us send the right kind of support.',
      rows: [{ label: 'Emotional check-in', value: profile.emotional_state }]
    },
    {
      title: 'Doctor & Appointment Info',
      description: 'Keep your care circle details within easy reach.',
      rows: [
        { label: 'Have a doctor', value: profile.has_doctor },
        { label: 'Primary provider', value: profile.primary_provider },
        { label: 'Next appointment', value: formatDate(profile.next_appointment) || profile.next_appointment }
      ]
    },
    {
      title: 'Emergency Info',
      description: 'Critical details that matter in urgent moments.',
      rows: [
        { label: 'Emergency contact', value: profile.emergency_contact },
        { label: 'Blood group', value: profile.blood_group }
      ]
    }
  ];

  return (
    <motion.section className="profile-details" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {sections.map((section) => (
        <article key={section.title} className="profile-details__section">
          <header>
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </header>
          <div className="profile-details__grid">
            {section.rows.map((row) => (
              <div key={row.label} className="profile-details__item">
                <span className="label">{row.label}</span>
                <strong>{formatValue(row.value)}</strong>
              </div>
            ))}
          </div>
        </article>
      ))}
    </motion.section>
  );
};

export default ProfileDetails;
