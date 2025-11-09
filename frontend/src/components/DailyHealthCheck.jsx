import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DailyHealthCheck = ({ userId }) => {
  const [healthData, setHealthData] = useState({
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    weight_kg: '',
    symptoms: [],
    symptom_notes: '',
    mood: ''
  });
  const [customSymptom, setCustomSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayData, setTodayData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const commonSymptoms = [
    'Nausea',
    'Fatigue',
    'Headache',
    'Back pain',
    'Swelling',
    'Heartburn',
    'Dizziness',
    'Shortness of breath'
  ];

  const moodOptions = ['Happy', 'Calm', 'Tired', 'Anxious'];

  useEffect(() => {
    fetchTodayData();
  }, [userId]);

  const fetchTodayData = async () => {
    try {
      const token = localStorage.getItem('sb-access-token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/health-tracking/latest`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setTodayData(data);
          setHealthData({
            blood_pressure_systolic: data.blood_pressure_systolic || '',
            blood_pressure_diastolic: data.blood_pressure_diastolic || '',
            weight_kg: data.weight_kg || '',
            symptoms: data.symptoms || [],
            symptom_notes: data.symptom_notes || '',
            mood: data.mood || ''
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch today\'s health data:', error);
    }
  };

  const handleSymptomToggle = (symptom) => {
    setHealthData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleAddCustomSymptom = () => {
    if (customSymptom.trim() && !healthData.symptoms.includes(customSymptom.trim())) {
      setHealthData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, customSymptom.trim()]
      }));
      setCustomSymptom('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sb-access-token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/health-tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...healthData,
          weight_kg: healthData.weight_kg ? parseFloat(healthData.weight_kg) : null,
          blood_pressure_systolic: healthData.blood_pressure_systolic ? parseInt(healthData.blood_pressure_systolic) : null,
          blood_pressure_diastolic: healthData.blood_pressure_diastolic ? parseInt(healthData.blood_pressure_diastolic) : null
        })
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchTodayData();
      }
    } catch (error) {
      console.error('Failed to save health data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #f084ae15, #4fb3a615)',
        borderRadius: '24px',
        padding: '32px',
        border: '2px solid rgba(240, 132, 174, 0.2)'
      }}
    >
      <header style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', color: '#2a2a2a' }}>
          📊 Daily Health Check
        </h3>
        <p style={{ color: '#8b7a80', fontSize: '0.95rem' }}>
          Track your vitals to help our AI provide personalized care recommendations
        </p>
      </header>

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            background: '#4fb3a6',
            color: 'white',
            padding: '14px 20px',
            borderRadius: '16px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: '500'
          }}
        >
          ✓ Health data saved successfully!
        </motion.div>
      )}

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Mood */}
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#333' }}>
            How's your mood today?
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {moodOptions.map(mood => (
              <button
                key={mood}
                type="button"
                onClick={() => setHealthData({ ...healthData, mood })}
                style={{
                  padding: '12px 24px',
                  borderRadius: '20px',
                  border: '2px solid',
                  borderColor: healthData.mood === mood ? '#4fb3a6' : 'rgba(0,0,0,0.1)',
                  background: healthData.mood === mood ? '#4fb3a6' : 'white',
                  color: healthData.mood === mood ? 'white' : '#666',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        {/* Blood Pressure */}
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
            Blood Pressure (mmHg)
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="120"
              value={healthData.blood_pressure_systolic}
              onChange={(e) => setHealthData({ ...healthData, blood_pressure_systolic: e.target.value })}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '16px',
                border: '2px solid rgba(240, 132, 174, 0.3)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <span style={{ fontWeight: '600', color: '#666' }}>/</span>
            <input
              type="number"
              placeholder="80"
              value={healthData.blood_pressure_diastolic}
              onChange={(e) => setHealthData({ ...healthData, blood_pressure_diastolic: e.target.value })}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '16px',
                border: '2px solid rgba(240, 132, 174, 0.3)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
          <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '6px' }}>
            Systolic / Diastolic
          </p>
        </div>

        {/* Weight */}
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="65.5"
            value={healthData.weight_kg}
            onChange={(e) => setHealthData({ ...healthData, weight_kg: e.target.value })}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: '16px',
              border: '2px solid rgba(240, 132, 174, 0.3)',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Symptoms */}
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#333' }}>
            How are you feeling today?
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            {commonSymptoms.map(symptom => (
              <button
                key={symptom}
                type="button"
                onClick={() => handleSymptomToggle(symptom)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '20px',
                  border: '2px solid',
                  borderColor: healthData.symptoms.includes(symptom) ? '#f084ae' : 'rgba(0,0,0,0.1)',
                  background: healthData.symptoms.includes(symptom) ? '#f084ae' : 'white',
                  color: healthData.symptoms.includes(symptom) ? 'white' : '#666',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                {symptom}
              </button>
            ))}
          </div>

          {/* Custom symptoms */}
          {healthData.symptoms.filter(s => !commonSymptoms.includes(s)).map(symptom => (
            <div key={symptom} style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '20px',
              background: '#4fb3a6',
              color: 'white',
              marginRight: '8px',
              marginBottom: '8px'
            }}>
              {symptom}
              <button
                onClick={() => handleSymptomToggle(symptom)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '0 4px'
                }}
              >
                ×
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Add custom symptom..."
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSymptom()}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '16px',
                border: '2px dashed rgba(79, 179, 166, 0.4)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomSymptom}
              style={{
                padding: '12px 24px',
                borderRadius: '16px',
                border: 'none',
                background: '#4fb3a6',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>
            Additional notes (optional)
          </label>
          <textarea
            placeholder="Any specific concerns or observations..."
            value={healthData.symptom_notes}
            onChange={(e) => setHealthData({ ...healthData, symptom_notes: e.target.value })}
            rows={3}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: '16px',
              border: '2px solid rgba(240, 132, 174, 0.3)',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '16px 32px',
            borderRadius: '24px',
            border: 'none',
            background: 'linear-gradient(135deg, #f084ae, #d9648f)',
            color: 'white',
            fontSize: '1.05rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          {loading ? 'Saving...' : todayData ? 'Update Today\'s Data' : 'Save Health Data'}
        </button>
      </div>
    </motion.article>
  );
};

export default DailyHealthCheck;
