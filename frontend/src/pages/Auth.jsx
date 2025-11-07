import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import Navbar from '../components/Navbar.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const authEnabled = Boolean(supabase);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      if (!authEnabled) {
        throw new Error('Supabase credentials missing. Authentication is disabled in this environment.');
      }

      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });
        if (signInError) throw signInError;
        navigate('/dashboard');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.fullName }
          }
        });
        if (signUpError) throw signUpError;
        setNotice('Check your email to confirm your account. After verification you can continue onboarding.');
        setMode('login');
      }
    } catch (authError) {
      setError(authError.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!authEnabled) return;
    await supabase.auth.signOut();
  };

  if (user) {
    return (
      <div className="gradient-bg auth">
        <Navbar />
        <main>
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
            <h1>Welcome back, {user.user_metadata?.full_name || 'Mum.entum mum'}</h1>
            <p>Jump straight into your dashboard, review your profile or chat with Mum.entum AI.</p>
            <div className="auth-card__actions">
              <button type="button" className="button button--primary" onClick={() => navigate('/dashboard')}>
                Go to dashboard
              </button>
              <button type="button" className="button button--ghost" onClick={() => navigate('/profile')}>
                View profile
              </button>
              <button type="button" className="button button--ghost" onClick={() => navigate('/assistant')}>
                Open Mum.entum AI
              </button>
              <button type="button" className="button button--ghost" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </motion.section>
        </main>
      </div>
    );
  }

  return (
    <div className="gradient-bg auth">
      <Navbar />
      <main>
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
          <div className="auth-card__toggle">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button" disabled={!authEnabled}>
              Existing user
            </button>
            <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')} type="button" disabled={!authEnabled}>
              New to Mum.entum
            </button>
          </div>
          {!authEnabled && (
            <div className="notice">
              Authentication is disabled while Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable sign-in.
            </div>
          )}
          <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p>
            {mode === 'login'
              ? 'Sign in to access your personalised dashboard and companion chat.'
              : 'Join Mum.entum to unlock tailored guidance for each stage of your pregnancy.'}
          </p>
          {error && <div className="alert">{error}</div>}
          {notice && <div className="notice">{notice}</div>}
          <form onSubmit={handleAuth} className="auth-form">
            {mode === 'signup' && (
              <label>
                Full name
                <input
                  required
                  name="fullName"
                  type="text"
                  placeholder="Rosie Bloom"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </label>
            )}
            <label>
              Email
              <input
                required
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </label>
            <label>
              Password
              <input
                required
                name="password"
                type="password"
                minLength={6}
                placeholder="Create a secure password"
                value={form.password}
                onChange={handleChange}
              />
            </label>
            <button type="submit" className="button button--primary" disabled={loading || !authEnabled}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          </form>
        </motion.section>
      </main>
    </div>
  );
};

export default AuthPage;
