import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const authEnabled = Boolean(supabase);
  const brandHref = user ? '/dashboard' : '/';
  const appRoutes = ['/dashboard', '/profile', '/assistant', '/onboarding'];
  const isAppView = user && appRoutes.some((path) => location.pathname.startsWith(path));

  const handleSignOut = async () => {
    if (!authEnabled) return;
    await supabase.auth.signOut();
    navigate('/');
  };

  if (isAppView) {
    return (
      <aside className="sidebar">
        <Link className="sidebar__brand" to={brandHref}>
          <span className="sidebar__mark">🌸</span>
          <span>Mum.entum</span>
        </Link>
        <nav className="sidebar__nav">
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
            Profile
          </Link>
          <Link to="/assistant" className={location.pathname === '/assistant' ? 'active' : ''}>
            Mum.entum AI
          </Link>
        </nav>
        <div className="sidebar__footer">
          <button type="button" className="button button--ghost" onClick={handleSignOut} disabled={!authEnabled}>
            Sign out
          </button>
        </div>
      </aside>
    );
  }

  return (
    <header className="navbar">
      <Link className="navbar__brand" to={brandHref}>
        <span className="navbar__mark">🌸</span>
        <span>Mum.entum</span>
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
