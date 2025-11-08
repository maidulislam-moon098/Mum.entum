import React, { useState } from 'react';
import { motion } from 'framer-motion';

const formatDate = (value) => {
  if (!value) return null;
  try {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString().split('T')[0];
  } catch (_err) {
    return null;
  }
};

const formatDisplayDate = (value) => {
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

const ProfileDetails = ({ profile, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  if (!profile) {
    return (
      <motion.section className="profile-details" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="muted">We will fill this out once you share your onboarding details.</p>
      </motion.section>
    );
  }

  const handleEdit = () => {
    setFormData({ ...profile });
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({});
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      setEditing(false);
      setFormData({});
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderField = (field, value, type = 'text') => {
    if (!editing) {
      if (type === 'date') {
        return formatDisplayDate(value) || 'Not provided yet';
      }
      return formatValue(value);
    }

    const currentValue = formData[field] !== undefined ? formData[field] : value;

    if (type === 'select') {
      return (
        <select
          value={currentValue || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd' }}
        >
          <option value="">Select...</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Non-vegetarian">Non-vegetarian</option>
          <option value="Vegan">Vegan</option>
          <option value="Other">Other</option>
        </select>
      );
    }

    if (type === 'date') {
      return (
        <input
          type="date"
          value={formatDate(currentValue) || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
      );
    }

    if (type === 'number') {
      return (
        <input
          type="number"
          value={currentValue || ''}
          onChange={(e) => handleChange(field, parseInt(e.target.value))}
          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
      );
    }

    return (
      <input
        type="text"
        value={currentValue || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
      />
    );
  };

  const sections = [
    {
      title: 'Basic Personal Information',
      description: 'Grounding details we use to personalise every update.',
      rows: [
        { label: 'Preferred name', field: 'preferred_name', value: profile.preferred_name },
        { label: 'Baby nickname', field: 'baby_nickname', value: profile.baby_nickname },
        { label: 'Age', field: 'age', value: profile.age, type: 'number' },
        { label: 'Country / Region', field: 'country', value: profile.country }
      ]
    },
    {
      title: 'Pregnancy Status',
      description: 'Where you are in your journey right now.',
      rows: [
        { label: 'Current week', field: 'current_week', value: profile.current_week, type: 'number' },
        { label: 'Due date', field: 'due_date', value: profile.due_date, type: 'date' }
      ]
    },
    {
      title: 'Medical Background',
      description: 'Helps us keep an eye on important health notes.',
      rows: [
        { label: 'Medications or supplements', field: 'medications', value: profile.medications },
        { label: 'Allergies', field: 'allergies', value: profile.allergies }
      ]
    },
    {
      title: 'Nutrition preferences',
      description: 'We tailor recipes and regional suggestions using this.',
      rows: [
        { label: 'Diet style', field: 'diet_style', value: profile.diet_style, type: 'select' },
        { label: 'Food preferences', field: 'food_preferences', value: profile.food_preferences }
      ]
    },
    {
      title: 'Lifestyle checks',
      description: 'Movement pace and routines help us pick realistic daily rituals.',
      rows: [
        { label: 'Activity level', field: 'activity_level', value: profile.activity_level }
      ]
    },
    {
      title: 'Doctor & Appointment Info',
      description: 'Keep your care circle details within easy reach.',
      rows: [
        { label: 'Next appointment', field: 'next_appointment', value: profile.next_appointment, type: 'date' }
      ]
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'grid', gap: '30px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        {!editing ? (
          <button 
            onClick={handleEdit}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #f084ae, #d9648f)',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button 
              onClick={handleCancel}
              disabled={saving}
              style={{
                padding: '12px 28px',
                background: '#e0e0e0',
                color: '#333',
                border: 'none',
                borderRadius: '24px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #4fb3a6, #3a8f85)',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
      </div>

      {sections.map((section, idx) => (
        <motion.article 
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 2px 16px rgba(240, 132, 174, 0.08)'
          }}
        >
          <header style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '8px', fontSize: '1.5rem' }}>{section.title}</h2>
            <p style={{ color: '#8b7a80', lineHeight: '1.5' }}>{section.description}</p>
          </header>
          <div style={{ display: 'grid', gap: '24px' }}>
            {section.rows.map((row) => (
              <div 
                key={row.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 1fr',
                  gap: '20px',
                  alignItems: 'center',
                  paddingBottom: '20px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                <span style={{ color: '#666', fontWeight: '500' }}>{row.label}</span>
                <strong style={{ fontWeight: '500', color: '#2a2a2a' }}>
                  {renderField(row.field, row.value, row.type)}
                </strong>
              </div>
            ))}
          </div>
        </motion.article>
      ))}
    </motion.section>
  );
};

export default ProfileDetails;
