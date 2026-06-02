import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resending, setResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  
  // Try to get email from router state or query params
  const emailParams = new URLSearchParams(location.search).get('email');
  const [email, setEmail] = useState(location.state?.email || emailParams || '');

  useEffect(() => {
    if (!email) {
      setError("Email address missing. Please request a new verification link.");
    }
  }, [email]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };
  
  const handleKeyDown = (e, index) => {
    // Focus previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await API.post('auth/verify-email/', {
        email: email,
        otp: otpCode
      });
      
      setSuccess("Email verified successfully! Setting up your dashboard...");
      
      // Auto login user
      setUser(data.user);
      if (data.access) {
        sessionStorage.setItem('access_token', data.access);
      }
      
      setTimeout(() => {
         if (data?.user?.role === 'ATTENDEE') navigate('/tickets');
         else if (data?.user?.role === 'OWNER') navigate('/owner/dashboard');
         else if (data?.user?.role === 'VENDOR') navigate('/vendor/dashboard');
         else navigate('/');
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.detail || "Verification failed. Please check your code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email address missing. Please request a new verification link.");
      return;
    }
    
    setResending(true);
    setError('');
    setSuccess('');
    
    try {
      const { data } = await API.post('auth/resend-otp/', { email });
      setSuccess(data.detail || "Verification code resent successfully. Please check your inbox.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <Mail size={32} color="var(--primary)" />
          </div>
          <h2 style={styles.title}>Check your email</h2>
          <p style={styles.subtitle}>
            We've sent a 6-digit verification code to <br/>
            <strong style={{ color: 'var(--on-surface)' }}>{email || 'your email address'}</strong>
          </p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleVerify} style={styles.form}>
          <div style={styles.otpContainer}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={e => handleChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onFocus={e => e.target.select()}
                style={styles.otpInput}
              />
            ))}
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
                Verify Email
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          Didn't receive the email?{" "}
          <button 
            type="button"
            onClick={handleResend}
            disabled={resending || !email}
            style={{...styles.resendBtn, opacity: (resending || !email) ? 0.5 : 1}}
          >
            {resending ? "Sending..." : "Click to resend"}
          </button>
        </div>
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
  subtitle: { color: 'var(--on-surface-variant)', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '25px' },
  otpContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px'
  },
  otpInput: {
    width: '50px',
    height: '60px',
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--on-surface)',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s'
  },
  submitBtn: {
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
  },
  successAlert: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.85rem'
  },
  footer: { marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--on-surface-variant)' },
  resendBtn: { background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }
};

export default VerifyEmail;
