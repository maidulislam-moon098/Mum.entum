import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Navbar from '../components/Navbar.jsx';
import FullscreenLoader from '../components/FullscreenLoader.jsx';
import ChatWidget from '../components/ChatWidget.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Assistant = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [notificationPrompt, setNotificationPrompt] = useState(null);

  // Check for notification prompt in URL
  useEffect(() => {
    const question = searchParams.get('question');
    const promptId = searchParams.get('promptId');
    
    if (question && promptId) {
      setNotificationPrompt({ question, promptId });
      // Clean up URL
      window.history.replaceState({}, '', '/assistant');
    }
  }, [searchParams]);

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
      <main style={{ 
        padding: '60px 80px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)'
      }}>
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          style={{ 
            textAlign: 'center', 
            marginBottom: '40px'
          }}
        >
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #f084ae, #d9648f)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>
            Mum.entum AI
          </h1>
          <p style={{ 
            color: '#8b7a80', 
            fontSize: '1.15rem',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Ask anything—from lifestyle tweaks to appointment prep—and we will respond with gentle, evidence-informed guidance.
          </p>
        </motion.section>
        {error && <div className="alert" style={{ marginBottom: '20px' }}>{error}</div>}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ChatWidget 
            profileSummary={profile} 
            userId={user?.id} 
            initialPrompt={notificationPrompt}
          />
        </div>
      </main>
    </div>
  );
};

export default Assistant;
