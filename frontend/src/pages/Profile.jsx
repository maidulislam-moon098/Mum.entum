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
        setError(err.response?.data?.error || 'Unable to load your profile details.');
      } finally {
        setFetching(false);
      }
    };

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
      <main>
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="profile-page__hero">
          <div>
            <h1>Your profile, all in one place</h1>
            <p>Review the details guiding your personalised journey and update anything that needs a refresh.</p>
          </div>
        </motion.section>
        {error && <div className="alert">{error}</div>}
        <ProfileDetails profile={profile} />
      </main>
    </div>
  );
};

export default Profile;
