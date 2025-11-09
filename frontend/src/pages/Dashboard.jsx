import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar.jsx';
import FullscreenLoader from '../components/FullscreenLoader.jsx';
import ProfileSummary from '../components/ProfileSummary.jsx';
import CareInsights from '../components/CareInsights.jsx';
import ActionItems from '../components/ActionItems.jsx';
import ImportantNotifications from '../components/ImportantNotifications.jsx';
import NotificationPermissionBanner from '../components/NotificationPermissionBanner.jsx';
import DailyHealthCheck from '../components/DailyHealthCheck.jsx';
import TreatmentRecommendations from '../components/TreatmentRecommendations.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    profileSummary: null,
    careInsights: [],
    actionItems: [],
    importantNotifications: [],
    nutritionSuggestions: [],
    lifestyleSuggestions: [],
    moodSummary: null
  });
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

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
        careInsights: dashboardData.careInsights || [],
        actionItems: dashboardData.actionItems || [],
        importantNotifications: dashboardData.importantNotifications || [],
        nutritionSuggestions: dashboardData.nutritionSuggestions || [],
        lifestyleSuggestions: dashboardData.lifestyleSuggestions || [],
        moodSummary: dashboardData.moodSummary || null
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load dashboard.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      fetchDashboard();
    }
  }, [user, loading, navigate]);

  if (loading || fetching) {
    return <FullscreenLoader message="Curating your dashboard" />;
  }

  return (
    <div className="gradient-bg dashboard app-shell">
      <Navbar />
      <main style={{ padding: '40px 60px', maxWidth: '1400px', margin: '0 auto' }}>
        <NotificationPermissionBanner />
        
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '40px' }}
        >
          <h1 style={{ marginBottom: '12px' }}>
            Hello {data.profileSummary?.preferred_name || user.user_metadata?.full_name || 'beautiful mama'}
          </h1>
          <p style={{ color: '#8b7a80', fontSize: '1.1rem' }}>
            Here is a look at what matters most for you and baby today.
          </p>
        </motion.section>

        {error && <div className="alert" style={{ marginBottom: '30px' }}>{error}</div>}

        {/* Mood Summary Card */}
        {data.moodSummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6, type: 'spring' }}
            style={{
              background: 'linear-gradient(135deg, rgba(240, 132, 174, 0.08), rgba(248, 188, 211, 0.12))',
              borderRadius: '32px',
              padding: '60px 40px',
              marginBottom: '50px',
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(240, 132, 174, 0.15)'
            }}
          >
            <motion.div 
              style={{ fontSize: '8rem', marginBottom: '30px' }}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              {data.moodSummary.emoji}
            </motion.div>
            <p style={{
              fontSize: '1.5rem',
              lineHeight: '1.7',
              color: '#2a2a2a',
              maxWidth: '700px',
              margin: '0 auto',
              fontWeight: '500'
            }}>
              {data.moodSummary.summary}
            </p>
            {data.moodSummary.needsAttention && (
              <p style={{
                marginTop: '20px',
                fontSize: '1rem',
                color: '#8b7a80',
                fontStyle: 'italic'
              }}>
                Remember to check with your doctor if you're concerned
              </p>
            )}
          </motion.div>
        )}

        {/* Daily Health Check */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{ marginBottom: '50px' }}
        >
          <DailyHealthCheck userId={user?.id} />
        </motion.div>

        {/* Treatment Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          style={{ marginBottom: '50px' }}
        >
          <TreatmentRecommendations userId={user?.id} />
        </motion.div>

        {/* Action Items - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ marginBottom: '50px' }}
        >
          <h2 style={{ 
            fontSize: '2.2rem', 
            marginBottom: '24px', 
            color: '#f084ae',
            fontWeight: '700'
          }}>
            Your Care Checklist
          </h2>
          <ActionItems items={data.actionItems} userId={user?.id} onUpdate={fetchDashboard} />
        </motion.div>

        {/* Nourishment and Lifestyle - Two Columns */}
        <div style={{ display: 'grid', gap: '50px', gridTemplateColumns: '1fr 1fr' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 style={{ 
              fontSize: '2.2rem', 
              marginBottom: '24px', 
              color: '#f084ae',
              fontWeight: '700'
            }}>
              Today's Nourishment
            </h2>
            <CareInsights
              insights={data.nutritionSuggestions}
              title=""
              subtitle=""
              emptyMessage="Complete onboarding to unlock meal suggestions."
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 style={{ 
              fontSize: '2.2rem', 
              marginBottom: '24px', 
              color: '#f084ae',
              fontWeight: '700'
            }}>
              Lifestyle Support
            </h2>
            <CareInsights
              insights={data.lifestyleSuggestions}
              title=""
              subtitle=""
              emptyMessage="Update your profile to view suggestions."
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
