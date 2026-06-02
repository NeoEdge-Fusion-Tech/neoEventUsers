import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, LockKeyhole } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError('');
    
    try {
      await API.post('auth/password-reset/', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
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
              <LockKeyhole size={32} color="var(--primary)" />
            </div>
          )}
          <h2 style={styles.title}>Reset your password</h2>
          {!success && (
            <p style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
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
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '15px 0 10px', color: 'var(--on-surface)' }}>Check your email</h3>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '30px', lineHeight: '1.6' }}>
              We've sent password reset instructions to <br/>
              <strong style={{ color: 'var(--on-surface)' }}>{email}</strong>
            </p>
            <Link to="/login" style={styles.linkButton}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail style={styles.icon} size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="btn-primary"
              style={styles.submitBtn}
            >
              {loading ? (
                <Loader2 className="spinner" size={20} />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div style={styles.footer}>
              <Link to="/login" style={styles.footerLink}>
                Remember your password? Login
              </Link>
            </div>
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
    padding: '12px 12px 12px 42px',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--on-surface)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s'
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
  linkButton: {
    display: 'inline-block',
    padding: '12px 24px',
    borderRadius: '10px',
    background: 'rgba(255, 177, 115, 0.1)',
    color: 'var(--primary)',
    fontWeight: 700,
    textDecoration: 'none',
    border: '1px solid rgba(255, 177, 115, 0.2)',
    transition: 'all 0.3s'
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
  },
  footer: { marginTop: '15px', textAlign: 'center' },
  footerLink: { color: 'var(--on-surface-variant)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }
};

export default ForgotPassword;
