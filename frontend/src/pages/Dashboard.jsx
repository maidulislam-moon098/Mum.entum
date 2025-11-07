import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar.jsx';
import FullscreenLoader from '../components/FullscreenLoader.jsx';
import ProfileSummary from '../components/ProfileSummary.jsx';
import MetricsTimeline from '../components/MetricsTimeline.jsx';
import CareInsights from '../components/CareInsights.jsx';
import ActionItems from '../components/ActionItems.jsx';
import ImportantNotifications from '../components/ImportantNotifications.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    profileSummary: null,
    weeklyMetrics: [],
    careInsights: [],
    actionItems: [],
    importantNotifications: [],
    nutritionSuggestions: [],
    lifestyleSuggestions: []
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
          weeklyMetrics: dashboardData.weeklyMetrics || [],
          careInsights: dashboardData.careInsights || [],
          actionItems: dashboardData.actionItems || [],
          importantNotifications: dashboardData.importantNotifications || [],
          nutritionSuggestions: dashboardData.nutritionSuggestions || [],
          lifestyleSuggestions: dashboardData.lifestyleSuggestions || []
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load dashboard.');
      } finally {
        setFetching(false);
      }
    };

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
      <main>
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dashboard__hero">
          <div>
            <h1>Hello {data.profileSummary?.preferred_name || user.user_metadata?.full_name || 'beautiful mama'} 🌸</h1>
            <p>Here is a look at what matters most for you and baby today.</p>
          </div>
        </motion.section>
        {error && <div className="alert">{error}</div>}
        <ImportantNotifications items={data.importantNotifications} />
  <ProfileSummary profile={data.profileSummary} />
  <MetricsTimeline metrics={data.weeklyMetrics} />
        <div className="dashboard__grid">
          <CareInsights
            insights={data.nutritionSuggestions}
            title="Nutrition guidance"
            subtitle="AI-personalised meal ideas anchored in your region and health profile."
            emptyMessage="Complete onboarding to unlock region-specific nourishment tips."
          />
          <CareInsights
            insights={data.lifestyleSuggestions}
            title="Lifestyle support"
            subtitle="Movement, rest, and care coordination ideas tuned to your answers."
            emptyMessage="Update your profile to view movement and rest suggestions."
          />
          <CareInsights
            insights={data.careInsights}
            title="General insights"
            subtitle="Additional notes and education personalised for your journey."
            emptyMessage="We will surface broader guidance here as you log more check-ins."
          />
          <ActionItems items={data.actionItems} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
