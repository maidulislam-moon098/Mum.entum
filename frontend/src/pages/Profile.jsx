import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar.jsx';
import FullscreenLoader from '../components/FullscreenLoader.jsx';
import ProfileDetails from '../components/ProfileDetails.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      setError(err.response?.data?.error || 'Unable to load your profile details.');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (updates) => {
    try {
      setError('');
      setSuccessMessage('');
      const { data } = await axios.post('/api/profile/update', {
        userId: user.id,
        updates
      });
      setProfile(data.profile);
      setSuccessMessage('Profile updated successfully! ✨');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    }
  };

  useEffect(() => {
    if (user && !loading) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  if (loading || fetching) {
    return <FullscreenLoader message="Gathering your profile" />;
  }

  return (
    <div className="gradient-bg profile-page app-shell">
      <Navbar />
      <main style={{ padding: '40px 60px', maxWidth: '1000px', margin: '0 auto' }}>
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '40px' }}
        >
          <h1 style={{ marginBottom: '12px' }}>Your profile, all in one place</h1>
          <p style={{ color: '#8b7a80', fontSize: '1.1rem' }}>
            Review the details guiding your personalised journey and update anything that needs a refresh.
          </p>
        </motion.section>
        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
        {successMessage && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{successMessage}</div>}
        <ProfileDetails profile={profile} onSave={handleSave} />
      </main>
    </div>
  );
};

export default Profile;
