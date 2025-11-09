import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';
import Logo from './Logo.jsx';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const authEnabled = Boolean(supabase);
  const brandHref = user ? '/dashboard' : '/';
  const appRoutes = ['/dashboard', '/baby', '/profile', '/assistant', '/progress', '/insights', '/onboarding'];
  const isAppView = user && appRoutes.some((path) => location.pathname.startsWith(path));

  const handleSignOut = async () => {
    if (!authEnabled) return;
    await supabase.auth.signOut();
    navigate('/');
  };

  if (isAppView) {
    return (
      <aside className="sidebar">
        <div className="sidebar__header">
          <Link className="sidebar__brand" to={brandHref} aria-label="Mum.entum home">
            <Logo height="40px" />
          </Link>
        </div>
        <nav className="sidebar__nav">
          <Link
            to="/dashboard"
            className={location.pathname === '/dashboard' ? 'active' : ''}
            aria-label="Dashboard"
            data-abbrev="D"
          >
            <span className="sidebar__nav-label">Dashboard</span>
          </Link>
          <Link
            to="/baby"
            className={location.pathname === '/baby' ? 'active' : ''}
            aria-label="Baby Insights"
            data-abbrev="B"
          >
            <span className="sidebar__nav-label">Baby Insights</span>
          </Link>
          <Link
            to="/progress"
            className={location.pathname === '/progress' ? 'active' : ''}
            aria-label="Progress"
            data-abbrev="Pg"
          >
            <span className="sidebar__nav-label">Progress</span>
          </Link>
          <Link
            to="/insights"
            className={location.pathname === '/insights' ? 'active' : ''}
            aria-label="Insights"
            data-abbrev="In"
          >
            <span className="sidebar__nav-label">Insights</span>
          </Link>
          <Link
            to="/profile"
            className={location.pathname === '/profile' ? 'active' : ''}
            aria-label="Profile"
            data-abbrev="Pr"
          >
            <span className="sidebar__nav-label">Profile</span>
          </Link>
          <Link
            to="/assistant"
            className={location.pathname === '/assistant' ? 'active' : ''}
            aria-label="Mum.entum AI"
            data-abbrev="AI"
          >
            <span className="sidebar__nav-label">Mum.entum AI</span>
          </Link>
        </nav>
        <div className="sidebar__footer">
          <button
            type="button"
            className="button button--ghost"
            onClick={handleSignOut}
            disabled={!authEnabled}
            aria-label="Sign out"
          >
            <span className="sidebar__footer-text">Sign out</span>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <header className="navbar">
      <Link className="navbar__brand" to={brandHref}>
        <Logo height="32px" />
      </Link>
      <nav className="navbar__nav">
        {user && (
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
            Dashboard
          </Link>
        )}
      </nav>
      {user ? (
        <button className="button button--small" type="button" onClick={handleSignOut} disabled={!authEnabled}>
          Sign out
        </button>
      ) : (
        <Link className="button button--small" to="/auth">
          Sign in
        </Link>
      )}
    </header>
  );
};

export default Navbar;
