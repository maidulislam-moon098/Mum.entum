import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar.jsx';
import FullscreenLoader from '../components/FullscreenLoader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Progress = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setFetching(true);
      setError('');
      try {
        const { data } = await axios.get('/api/dashboard', {
          params: { userId: user.id }
        });
        if (data.onboardingRequired) {
          navigate('/onboarding', { replace: true });
          return;
        }
        setProfile(data.profileSummary);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load progress data.');
      } finally {
        setFetching(false);
      }
    };

    if (user && !loading) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  if (loading || fetching) {
    return <FullscreenLoader message="Loading your progress" />;
  }

  const currentWeek = profile?.current_week || profile?.weeks_pregnant || 0;
  const weeks = Array.from({ length: 40 }, (_, i) => i + 1);
  const progressPercent = ((currentWeek / 40) * 100).toFixed(1);

  return (
    <div className="gradient-bg progress-page app-shell">
      <Navbar />
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ marginBottom: '10px' }}>Your Journey Progress</h1>
          <p style={{ color: '#8b7a80', marginBottom: '40px' }}>
            Track your beautiful journey week by week
          </p>
        </motion.section>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Progress Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(240, 132, 174, 0.1)'
          }}
          >
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: '0 0 8px 0' }}>Week {currentWeek} of 40</h2>
              <p style={{ color: '#8b7a80', fontSize: '1.1rem' }}>{progressPercent}% Complete</p>
            </div>          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '12px',
            background: 'rgba(240, 132, 174, 0.15)',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '40px'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #f084ae, #d9648f)',
                borderRadius: '999px'
              }}
            />
          </div>

          {/* Week Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
            gap: '8px',
            marginBottom: '20px'
          }}>
            {weeks.map(week => {
              const isPast = week < currentWeek;
              const isCurrent = week === currentWeek;
              const isFuture = week > currentWeek;
              
              return (
                <motion.div
                  key={week}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: week * 0.01 }}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: isCurrent ? '700' : '500',
                    background: isPast 
                      ? 'linear-gradient(135deg, rgba(240, 132, 174, 0.2), rgba(248, 188, 211, 0.3))'
                      : isCurrent
                      ? 'linear-gradient(135deg, #f084ae, #d9648f)'
                      : 'rgba(0, 0, 0, 0.05)',
                    color: isCurrent ? 'white' : isPast ? '#d9648f' : '#999',
                    border: isCurrent ? '2px solid #f084ae' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  {week}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(240, 132, 174, 0.1)'
          }}
        >
          <h2 style={{ marginBottom: '24px' }}>Key Milestones</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {[
              { week: 12, title: 'First Trimester Complete', desc: 'Major organs formed' },
              { week: 20, title: 'Halfway There!', desc: 'Baby can hear your voice' },
              { week: 28, title: 'Third Trimester', desc: 'Baby\'s eyes can open' },
              { week: 37, title: 'Full Term', desc: 'Baby is ready to meet you' },
              { week: 40, title: 'Due Date', desc: 'Welcome to the world!' }
            ].map((milestone, idx) => {
              const reached = currentWeek >= milestone.week;
              return (
                <div 
                  key={idx}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: reached 
                      ? 'linear-gradient(135deg, rgba(240, 132, 174, 0.1), rgba(248, 188, 211, 0.15))'
                      : 'rgba(0, 0, 0, 0.03)',
                    opacity: reached ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      Week {milestone.week}: {milestone.title}
                    </div>
                    <div style={{ color: '#8b7a80', fontSize: '0.9rem' }}>
                      {milestone.desc}
                    </div>
                  </div>
                  {reached && <div style={{ color: '#4fb3a6', fontSize: '1.5rem' }}>✓</div>}
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Progress;
