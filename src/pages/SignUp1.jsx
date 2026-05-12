import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api/auth';
import { User, Mail, Lock, UserPlus, Image as ImageIcon, CheckCircle, AlertCircle, Phone } from 'lucide-react';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'ATTENDEE',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('role', formData.role);
    data.append('first_name', formData.firstName);
    data.append('last_name', formData.lastName);
    data.append('phone_number', formData.phoneNumber);
    if (profileImage) {
      data.append('profile_image', profileImage);
    }

    try {
      await signup(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || 'Registration failed. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ 
      minHeight: 'calc(100vh - 80px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '4rem 2rem'
    }}>
      <div className="glass" style={{ 
        maxWidth: '550px', 
        width: '100%', 
        padding: '3.5rem', 
        borderRadius: '44px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Role Toggle Header */}
        <div style={{ 
          display: 'flex', 
          background: 'var(--accent-glow)', 
          padding: '0.4rem', 
          borderRadius: '18px', 
          marginBottom: '3.5rem',
          border: '1px solid var(--glass-border)',
          gap: '0.4rem'
        }}>
          {[
            { id: 'ATTENDEE', label: 'Attendee' },
            { id: 'PHOTOGRAPHER', label: 'Photographer' },
            { id: 'OWNER', label: 'Organizer' }
          ].map(role => (
            <button 
              key={role.id}
              type="button"
              onClick={() => setFormData({...formData, role: role.id})}
              style={{ 
                flex: 1, 
                padding: '0.8rem 0.4rem', 
                borderRadius: '12px', 
                fontSize: '0.85rem', 
                fontWeight: 800, 
                background: formData.role === role.id ? 'var(--primary)' : 'transparent',
                color: formData.role === role.id ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              {role.label}
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.8rem', fontWeight: 900, letterSpacing: '-1.5px' }}>
            {formData.role === 'ATTENDEE' ? 'Join as ' : (formData.role === 'PHOTOGRAPHER' ? 'Impact as ' : 'Scale as ')} 
            <span style={{ color: 'var(--primary)' }}>NeoEvent</span>
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', fontWeight: 500 }}>
            {formData.role === 'ATTENDEE' && 'Secure your access to global galas and AI memory archives.'}
            {formData.role === 'PHOTOGRAPHER' && 'Showcase your portfolio and capture global masterpieces.'}
            {formData.role === 'OWNER' && 'The ultimate ecosystem for luxury event management.'}
          </p>
        </div>

        {error && (
          <div className="glass" style={{ 
            padding: '1.2rem', 
            borderRadius: '16px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444', 
            marginBottom: '2rem',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            border: '1px solid #ef4444'
          }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div className="form-group" style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input 
                type="text" 
                placeholder="Username" 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                className="glass"
                style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 600, fontSize: '1rem', outline: 'none' }}
              />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="glass"
                style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 600, fontSize: '1rem', outline: 'none' }}
              />
            </div>
          </div>
          
          <div className="form-group" style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
            <input 
              type="password" 
              placeholder="Create Password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              className="glass"
              style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 600, fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div style={{ marginTop: '0.8rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Identity Reference (Optional)
            </label>
            <div className="glass" style={{ 
              border: '2px dashed var(--primary)', 
              borderRadius: '24px', 
              padding: '2rem', 
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              background: 'var(--accent-glow)'
            }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setReferenceImage(e.target.files[0])}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              {referenceImage ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', color: '#22c55e', fontWeight: 800 }}>
                  <CheckCircle size={22} /> REFERENCE CAPTURED
                </div>
              ) : (
                <div style={{ color: 'var(--on-surface-variant)' }}>
                  <ImageIcon size={32} color="var(--primary)" style={{ display: 'block', margin: '0 auto 1rem' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Upload reference for biometric sorting</span>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ width: '100%', padding: '1.4rem', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 900, marginTop: '1.5rem' }}
          >
            {loading ? 'SYNCHRONIZING...' : 'ACTIVATE ACCOUNT'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', fontSize: '1rem', color: 'var(--on-surface-variant)', textAlign: 'center', fontWeight: 500 }}>
          Already part of the ecosystem? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>LOG IN</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
