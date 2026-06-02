import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../api/axios';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ new_password: '', new_password_confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  
  // Extract uid and token from URL query string
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get('uid');
  const token = queryParams.get('token');

  useEffect(() => {
    if (!uid || !token) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [uid, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uid || !token) return;
    
    if (formData.new_password !== formData.new_password_confirm) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await API.post('auth/password-reset/confirm/', {
        uid,
        token,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm
      });
      
      setSuccess(true);
      
      // Auto-login logic using the fresh tokens returned
      if (data.access) {
        sessionStorage.setItem('access_token', data.access);
        
        // Fetch user data if the endpoint didn't return it
        try {
          const userRes = await API.post('account/refresh/');
          setUser(userRes.data.user);
          
          setTimeout(() => {
             const role = userRes.data.user?.role;
             if (role === 'ATTENDEE') navigate('/tickets');
             else if (role === 'OWNER') navigate('/owner/dashboard');
             else if (role === 'VENDOR') navigate('/vendor/dashboard');
             else navigate('/');
          }, 2000);
        } catch (e) {
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        setTimeout(() => navigate('/login'), 2000);
      }
      
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid or expired token. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass" style={styles.card}>
        <div style={styles.header}>
          {!success && (
            <div style={styles.iconWrapper}>
              <ShieldCheck size={32} color="var(--primary)" />
            </div>
          )}
          <h2 style={styles.title}>Create new password</h2>
          {!success && (
            <p style={styles.subtitle}>
              Please enter your new password below.
            </p>
          )}
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...styles.iconWrapper, background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
              <CheckCircle2 size={32} color="#22c55e" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '15px 0 10px', color: 'var(--on-surface)' }}>Password Reset Successful</h3>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '30px', lineHeight: '1.6' }}>
              Your password has been changed. We are logging you in...
            </p>
            <Loader2 size={32} className="spinner" style={{ color: 'var(--primary)', margin: '0 auto' }} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.inputWrapper}>
                <Lock style={styles.icon} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="new_password"
                  required
                  value={formData.new_password}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <div style={styles.inputWrapper}>
                <Lock style={styles.icon} size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="new_password_confirm"
                  required
                  value={formData.new_password_confirm}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeBtn}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !uid || !token}
              className="btn-primary"
              style={styles.submitBtn}
            >
              {loading ? <Loader2 className="spinner" size={20} /> : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-color)',
    color: 'var(--on-surface)',
    padding: '20px'
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    padding: '40px',
    borderRadius: '24px',
  },
  header: { textAlign: 'center', marginBottom: '30px' },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'rgba(255, 177, 115, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px',
    border: '1px solid rgba(255, 177, 115, 0.2)'
  },
  title: { fontSize: '1.8rem', fontWeight: 800, margin: '10px 0 5px', color: 'var(--on-surface)' },
  subtitle: { color: 'var(--on-surface-variant)', fontSize: '0.95rem', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  icon: { position: 'absolute', left: '12px', color: 'var(--primary)' },
  input: {
    width: '100%',
    padding: '12px 42px',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--on-surface)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--on-surface-variant)',
    display: 'flex',
    alignItems: 'center'
  },
  submitBtn: {
    marginTop: '10px',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'var(--primary)',
    color: 'var(--on-primary)',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    opacity: 1
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.85rem'
  }
};

export default ResetPassword;
