import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Camera, Calendar, MapPin, Loader2, CheckCircle } from 'lucide-react';
import api from '../api';
import { formatDateRange } from '../utils/dateUtils';

const Registration = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  });
  const [referenceImage, setReferenceImage] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}/`);
        setEvent(response.data);
      } catch (err) {
        console.error('Failed to fetch event', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistering(true);
    // Registration logic will be implemented in the next phase, 
    // for now we simulate success to show the UI works.
    setTimeout(() => {
      setSuccess(true);
      setRegistering(false);
    }, 1500);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;
  if (!event) return <div style={{ textAlign: 'center', padding: '10rem' }}>Event not found.</div>;

  if (success) {
    return (
      <div className="registration-container" style={{ textAlign: 'center', padding: '8rem 2rem' }}>
        <div className="glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem', borderRadius: '32px' }}>
          <CheckCircle size={80} color="#00c853" style={{ marginBottom: '2rem' }} />
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Registration <span style={{ color: 'var(--primary)' }}>Confirmed!</span></h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            We've sent your digital ticket to <strong>{formData.email}</strong>. See you at {event.title}!
          </p>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ padding: '1rem 2.5rem' }}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
      <div>
        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Exclusive Access</span>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>{event.title}</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--on-surface-variant)' }}>
            <Calendar size={22} color="var(--primary)" />
            <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{formatDateRange(event.start_date, event.end_date)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--on-surface-variant)' }}>
            <MapPin size={22} color="var(--primary)" />
            <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{event.location}</span>
          </div>
        </div>

        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          {event.description}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '3rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="glass" style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)' }}>
              <Shield size={24} />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.2rem' }}>Encrypted Ticketing</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>QR-secured digital tickets sent directly to your vault.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="glass" style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)' }}>
              <Camera size={24} />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.2rem' }}>AI Memory Sorting</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Your photos, instantly identified and delivered to your portal.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '3rem', borderRadius: '32px' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Register Now</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>Full Name</label>
            <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', borderRadius: '12px' }}>
              <User size={20} color="var(--primary)" />
              <input 
                type="text" 
                required
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="John Doe" 
                style={{ background: 'transparent', border: 'none', padding: '1rem', color: '#fff', width: '100%', outline: 'none' }} 
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>Email Address</label>
            <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', borderRadius: '12px' }}>
              <Mail size={20} color="var(--primary)" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com" 
                style={{ background: 'transparent', border: 'none', padding: '1rem', color: '#fff', width: '100%', outline: 'none' }} 
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>Reference Selfie (Optional)</label>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>Enable AI to automatically drop event photos of you into your folder.</p>
            <div className="glass" style={{ 
              height: '120px', 
              border: '2px dashed rgba(255, 177, 115, 0.3)', 
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              position: 'relative',
              cursor: 'pointer'
            }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setReferenceImage(e.target.files[0])}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              {referenceImage ? (
                <>
                  <CheckCircle size={28} color="#00c853" />
                  <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{referenceImage.name}</span>
                </>
              ) : (
                <>
                  <Camera size={32} color="var(--primary)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>Click to upload selfie</span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginTop: '1rem' }}>
            <input type="checkbox" required style={{ marginTop: '0.4rem', width: '18px', height: '18px' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
              I permit NeoEvent to process my images for identification purposes.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={registering}
            className="btn-primary" 
            style={{ marginTop: '1.5rem', height: '64px', fontSize: '1.2rem', fontWeight: 800, borderRadius: '16px' }}
          >
            {registering ? 'Processing...' : `Get ${event.is_paid ? `$${event.price}` : 'Free'} Access`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
