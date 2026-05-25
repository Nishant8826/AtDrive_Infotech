
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Database, LayoutDashboard, ShoppingBag, ClipboardList, LogOut, LogIn, UserPlus, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: 'var(--radius)',
    color: isActive(path) ? 'var(--text-primary)' : 'var(--text-secondary)',
    backgroundColor: isActive(path) ? 'var(--secondary)' : 'transparent',
    fontWeight: '500',
    fontSize: '0.875rem',
    transition: 'all var(--transition-fast)',
  });

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <Database size={20} style={{ color: 'var(--text-primary)' }} />
        <span style={{
          fontSize: '0.95rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}>
          console
        </span>
      </Link>

      <div className="navbar-links">
        <Link to="/" style={linkStyle('/')}>
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <Link to="/products" style={linkStyle('/products')}>
          <ShoppingBag size={16} />
          Products
        </Link>

        {isAuthenticated && (
          <Link to="/orders" style={linkStyle('/orders')}>
            <ClipboardList size={16} />
            Orders
          </Link>
        )}
      </div>

      <div className="navbar-actions">
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{
            padding: '6px',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              user: <strong style={{ color: 'var(--text-primary)' }}>{user?.username}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/login"
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <LogIn size={14} />
              Login
            </Link>
            <Link
              to="/register"
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <UserPlus size={14} />
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
