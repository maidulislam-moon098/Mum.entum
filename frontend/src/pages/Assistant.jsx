import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar.jsx';
import FullscreenLoader from '../components/FullscreenLoader.jsx';
import ChatWidget from '../components/ChatWidget.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Assistant = () => {
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
        setError(err.response?.data?.error || 'Unable to load profile context for the assistant.');
      } finally {
        setFetching(false);
      }
    };

    if (user && !loading) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  if (loading || fetching) {
  return <FullscreenLoader message="Warming up Mum.entum AI" />;
  }

  return (
    <div className="gradient-bg assistant-page app-shell">
      <Navbar />
      <main>
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="assistant-page__hero">
          <div>
            <h1>Mum.entum AI</h1>
            <p>Ask anything—from lifestyle tweaks to appointment prep—and we will respond with gentle, evidence-informed guidance.</p>
          </div>
        </motion.section>
        {error && <div className="alert">{error}</div>}
        <ChatWidget profileSummary={profile} />
      </main>
    </div>
  );
};

export default Assistant;
