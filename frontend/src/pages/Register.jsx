import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterUserMutation, useCheckUsernameQuery } from '../store/api/baseApi';
import { UserPlus, User, Key, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');

  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [registerUser, { isLoading, error: registerError, isSuccess }] = useRegisterUserMutation();

  // Debounce username for availability check
  useEffect(() => {
    if (!username || username.length < 3) {
      setDebouncedUsername('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // RTK Query: skip when no valid debounced value
  const {
    data: usernameCheckData,
    isFetching: usernameChecking,
    isError: usernameCheckError,
  } = useCheckUsernameQuery(debouncedUsername, {
    skip: !debouncedUsername || debouncedUsername.length < 3,
  });

  // Derive username error from query result
  const usernameError = (() => {
    if (username && username.length < 3) return 'Username must be at least 3 characters';
    if (usernameCheckError) return 'Could not verify username availability';
    if (usernameCheckData && !usernameCheckData.available) return 'Username already taken';
    return '';
  })();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (username.length < 3) {
      setValidationError('Username must be at least 3 characters');
      return;
    }
    if (usernameError) {
      setValidationError('Please fix username errors first');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    try {
      await registerUser({ username, password }).unwrap();
    } catch {
      // error handled by mutation hook
    }
  };

  const apiError = registerError?.data?.message || (registerError ? 'Registration failed' : null);

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '6px' }}>Sign Up</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Register your MySQL user account credentials
          </p>
        </div>

        {isSuccess && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            color: '#a7f3d0',
            fontSize: '0.8rem',
            marginBottom: '20px'
          }}>
            <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
            <div>
              Account created successfully! Redirecting to sign in...
            </div>
          </div>
        )}

        {(apiError || validationError) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            color: '#fca5a5',
            fontSize: '0.8rem',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            <span>{apiError || validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: usernameError ? '8px' : '16px' }}>
            <label className="input-label" htmlFor="username">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '38px', borderColor: usernameError ? 'var(--danger)' : 'var(--border)' }}
                required
              />
              {usernameChecking && (
                <Loader2 size={14} className="animate-spin" style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
            </div>
            {usernameError && (
              <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} />
                {usernameError}
              </span>
            )}
          </div>


          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', marginBottom: '16px' }}
            disabled={isLoading || isSuccess || usernameChecking || !!usernameError}
          >
            <UserPlus size={16} />
            {isLoading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Have an account?{' '}
          <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
