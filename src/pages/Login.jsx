import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, LogIn, AlertCircle, Disc, Loader2, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading: authLoading } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect user back to where they were going, or home
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = await login(formData);
      
      let redirectPath = from;
      if (data?.user && !data.user.is_email_verified) {
        redirectPath = `/verify-email?email=${encodeURIComponent(formData.username)}`;
      } else if (from === "/") {
         if (data?.user?.role === 'ATTENDEE') redirectPath = '/tickets';
         else if (data?.user?.role === 'OWNER') redirectPath = '/owner/dashboard';
         else if (data?.user?.role === 'VENDOR') redirectPath = '/vendor/dashboard';
         else if (data?.user?.role === 'ADMIN') redirectPath = '/neo-admin';
      }
      
      navigate(redirectPath, { replace: true });
    } catch (err) {
      // Catch 401s or Throttling (429) errors
      const message = err.response?.data?.detail || 
                      err.response?.data?.message || 
                      "Authentication failed. Please try again.";
      setError(message);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass" style={styles.loginCard}>
        <div style={styles.header}>
          <Disc size={40} color="var(--primary)" strokeWidth={3} />
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Enter your credentials to access NEOEVENT</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <Mail style={styles.icon} size={20} />
              <input
                type="email"
                name="username"
                placeholder="Enter your email"
                value={formData.username}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock style={styles.icon} size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '-10px' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 

            disabled={authLoading} 
            className="btn-primary" 
            style={styles.submitBtn}
          >
            {authLoading ? <Loader2 className="spinner" size={20} /> : <><LogIn size={20} /> Login</>}
          </button>
        </form>

        <div style={styles.footer}>
          <span>New to NEO?</span>
          <Link to="/signup" style={styles.signupLink}>Create an account</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-color)',
    color: 'var(--on-surface)',
    padding: '20px'
  },
  loginCard: {
    width: '100%',
    maxWidth: '450px',
    padding: 'clamp(1.75rem, 5vw, 2.5rem)',
    borderRadius: '24px',
  },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { fontSize: '1.8rem', fontWeight: 800, margin: '10px 0 5px', color: 'var(--on-surface)' },
  subtitle: { color: 'var(--on-surface-variant)', fontSize: '0.9rem' },
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
    gap: '10px'
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
  footer: { marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--on-surface-variant)' },
  signupLink: { marginLeft: '5px', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }
};

export default LoginPage;


