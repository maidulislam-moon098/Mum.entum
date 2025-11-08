import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar.jsx';
import FullscreenLoader from '../components/FullscreenLoader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const BABY_SIZE_COMPARISONS = {
  4: { item: 'Poppy seed', emoji: '🌱', size: '2mm' },
  5: { item: 'Sesame seed', emoji: '🌾', size: '3mm' },
  6: { item: 'Lentil', emoji: '🫘', size: '5mm' },
  7: { item: 'Blueberry', emoji: '🫐', size: '10mm' },
  8: { item: 'Raspberry', emoji: '🍇', size: '16mm' },
  9: { item: 'Cherry', emoji: '🍒', size: '23mm' },
  10: { item: 'Strawberry', emoji: '🍓', size: '31mm' },
  11: { item: 'Fig', emoji: '🫐', size: '41mm' },
  12: { item: 'Plum', emoji: '🍑', size: '54mm' },
  13: { item: 'Lemon', emoji: '🍋', size: '74mm' },
  14: { item: 'Peach', emoji: '🍑', size: '87mm' },
  15: { item: 'Apple', emoji: '🍎', size: '10cm' },
  16: { item: 'Avocado', emoji: '🥑', size: '12cm' },
  17: { item: 'Pear', emoji: '🍐', size: '13cm' },
  18: { item: 'Bell pepper', emoji: '🫑', size: '14cm' },
  19: { item: 'Mango', emoji: '🥭', size: '15cm' },
  20: { item: 'Banana', emoji: '🍌', size: '16cm' },
  21: { item: 'Carrot', emoji: '🥕', size: '27cm' },
  22: { item: 'Papaya', emoji: '🍈', size: '28cm' },
  23: { item: 'Grapefruit', emoji: '🍊', size: '29cm' },
  24: { item: 'Cantaloupe', emoji: '🍈', size: '30cm' },
  25: { item: 'Cauliflower', emoji: '🥦', size: '34cm' },
  26: { item: 'Lettuce head', emoji: '🥬', size: '35cm' },
  27: { item: 'Cabbage', emoji: '🥬', size: '36cm' },
  28: { item: 'Eggplant', emoji: '🍆', size: '37cm' },
  29: { item: 'Butternut squash', emoji: '🎃', size: '38cm' },
  30: { item: 'Cucumber', emoji: '🥒', size: '40cm' },
  31: { item: 'Coconut', emoji: '🥥', size: '41cm' },
  32: { item: 'Jicama', emoji: '🥔', size: '42cm' },
  33: { item: 'Pineapple', emoji: '🍍', size: '44cm' },
  34: { item: 'Honeydew melon', emoji: '🍈', size: '45cm' },
  35: { item: 'Honeydew melon', emoji: '🍈', size: '46cm' },
  36: { item: 'Romaine lettuce', emoji: '🥬', size: '47cm' },
  37: { item: 'Swiss chard', emoji: '🥬', size: '48cm' },
  38: { item: 'Leek', emoji: '🧅', size: '49cm' },
  39: { item: 'Mini watermelon', emoji: '🍉', size: '50cm' },
  40: { item: 'Small pumpkin', emoji: '🎃', size: '51cm' }
};

const DEVELOPMENTAL_MILESTONES = {
  4: 'The neural tube is forming, which will become the brain and spinal cord.',
  8: 'Tiny fingers and toes are developing. The heart is beating about 150-170 times per minute.',
  12: 'Baby can make sucking motions and is developing reflexes.',
  16: 'Baby can hear your voice and may start responding to sounds.',
  20: 'You might feel the first flutters of movement. Baby is developing sleep-wake cycles.',
  24: 'Baby\'s lungs are developing rapidly. Eyelids can open and close.',
  28: 'Baby can recognize your voice. Brain development is accelerating.',
  32: 'Baby is practicing breathing movements and developing fat layers.',
  36: 'Baby is getting into position for birth. Organs are nearly fully developed.',
  40: 'Baby is ready to meet you! All systems are go for delivery.'
};

const getMilestone = (week) => {
  const milestones = Object.keys(DEVELOPMENTAL_MILESTONES)
    .map(Number)
    .sort((a, b) => a - b);
  
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (week >= milestones[i]) {
      return DEVELOPMENTAL_MILESTONES[milestones[i]];
    }
  }
  return DEVELOPMENTAL_MILESTONES[4];
};

const BabyInsights = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    profileSummary: null,
    weeklyMetrics: []
  });
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;
      setFetching(true);
      setError('');
      try {
        const { data: dashboardData } = await axios.get('/api/dashboard', {
          params: { userId: user.id }
        });
        if (dashboardData.onboardingRequired) {
          navigate('/onboarding', { replace: true });
          return;
        }
        setData({
          profileSummary: dashboardData.profileSummary || null,
          weeklyMetrics: dashboardData.weeklyMetrics || []
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load baby insights.');
      } finally {
        setFetching(false);
      }
    };

    if (user && !loading) {
      fetchDashboard();
    }
  }, [user, loading, navigate]);

  if (loading || fetching) {
    return <FullscreenLoader message="Loading baby insights" />;
  }

  const currentWeek = data.profileSummary?.current_week || data.profileSummary?.weeks_pregnant;
  const sizeComparison = currentWeek ? BABY_SIZE_COMPARISONS[currentWeek] || BABY_SIZE_COMPARISONS[20] : BABY_SIZE_COMPARISONS[20];
  const milestone = currentWeek ? getMilestone(currentWeek) : '';

  return (
    <div className="gradient-bg baby-insights-page app-shell">
      <Navbar />
      <main style={{ padding: '40px 60px', maxWidth: '1000px', margin: '0 auto' }}>
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '40px' }}
        >
          <h1 style={{ marginBottom: '12px' }}>Your baby this week</h1>
          <p style={{ color: '#8b7a80', fontSize: '1.1rem' }}>
            Discover how your little one is growing and what's happening right now.
          </p>
        </motion.section>
        
        {error && <div className="alert" style={{ marginBottom: '30px' }}>{error}</div>}

        {currentWeek ? (
          <>
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '50px',
                marginBottom: '40px',
                boxShadow: '0 4px 20px rgba(240, 132, 174, 0.1)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.9rem', color: '#8b7a80', marginBottom: '30px' }}>
                Week {currentWeek}
              </div>
              <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>
                About the size of a {sizeComparison.item}
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#8b7a80', marginBottom: '40px' }}>
                {sizeComparison.size}
              </p>
              {milestone && (
                <div style={{
                  background: 'rgba(240, 132, 174, 0.08)',
                  borderRadius: '16px',
                  padding: '30px',
                  textAlign: 'left'
                }}>
                  <h3 style={{ marginBottom: '12px' }}>
                    Developmental milestone
                  </h3>
                  <p style={{ lineHeight: '1.6', color: '#3a3a3a' }}>{milestone}</p>
                </div>
              )}
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ marginBottom: '40px' }}
            >
              <h2 style={{ marginBottom: '10px' }}>Your weekly insights</h2>
              <p style={{ color: '#8b7a80', marginBottom: '30px' }}>
                What to focus on and what's happening with baby this week.
              </p>
              <div style={{ display: 'grid', gap: '24px' }}>
                {data.weeklyMetrics.length === 0 && (
                  <p style={{ color: '#8b7a80' }}>
                    Complete onboarding to see personalized weekly insights.
                  </p>
                )}
                {data.weeklyMetrics.map((metric, index) => (
                  <motion.article 
                    key={metric.week}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (index * 0.1), duration: 0.3 }}
                    style={{
                      background: 'white',
                      borderRadius: '20px',
                      padding: '30px',
                      boxShadow: '0 2px 12px rgba(240, 132, 174, 0.08)'
                    }}
                  >
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.85rem',
                      color: '#f084ae',
                      marginBottom: '12px',
                      fontWeight: '600'
                    }}>
                      Week {metric.week}
                    </span>
                    <h3 style={{ marginBottom: '12px', fontSize: '1.3rem' }}>{metric.headline}</h3>
                    <p style={{ marginBottom: '16px', lineHeight: '1.6', color: '#555' }}>
                      {metric.description}
                    </p>
                    {metric.focus_points && metric.focus_points.length > 0 && (
                      <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#555' }}>
                        {metric.focus_points.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </motion.article>
                ))}
              </div>
            </motion.section>
          </>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(240, 132, 174, 0.1)'
          }}>
            <h3 style={{ marginBottom: '12px' }}>Complete your onboarding</h3>
            <p style={{ color: '#8b7a80' }}>
              Share your pregnancy details to unlock personalized baby insights and size comparisons.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BabyInsights;
