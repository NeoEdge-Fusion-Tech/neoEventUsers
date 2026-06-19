import React, { useState, useEffect } from 'react';
import { Camera, Clock, CheckCircle, AlertCircle, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import api from '../api';
import { formatDateRange } from '../utils/dateUtils';
import { Link } from 'react-router-dom';

const PhotographerDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Fetch all assigned events
        const response = await api.get('/events/assigned/');
        
        // For each event, we check if the user has uploaded any photos
        // In a real app, this pending status should ideally come from the backend serializer
        const sessionsWithStatus = await Promise.all(response.data.map(async (event) => {
          const photoRes = await api.get(`/photos/photographer-photos/?event_id=${event.id}`);
          return {
            ...event,
            is_pending: photoRes.data.length === 0
          };
        }));
        
        setSessions(sessionsWithStatus);
      } catch (err) {
        console.error('Failed to fetch assigned sessions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(s => {
    if (filter === 'pending') return s.is_pending;
    if (filter === 'completed') return !s.is_pending;
    return true;
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;

  return (
    <div className="photographer-dashboard responsive-page-pad" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header className="responsive-row" style={{ marginBottom: '3rem', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem' }}>
        <div>
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Vendor Portal</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-1.5px', marginTop: '0.5rem' }}>Active <span style={{ color: 'var(--primary)' }}>Assignments</span></h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Manage your captures and distribution status across global events.</p>
        </div>
        
        <div className="glass" style={{ display: 'flex', padding: '0.4rem', borderRadius: '50px' }}>
          {['all', 'pending', 'completed'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{ 
                padding: '0.6rem 1.4rem', 
                borderRadius: '50px', 
                border: 'none', 
                background: filter === f ? 'var(--primary)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--on-surface-variant)',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '0.9rem'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {filteredSessions.length === 0 ? (
        <div className="glass" style={{ padding: '6rem', textAlign: 'center', borderRadius: '40px' }}>
          <Camera size={64} color="var(--primary)" style={{ opacity: 0.2, marginBottom: '2rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>No assignments found</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>When organizers invite you to events, they will appear here.</p>
        </div>
      ) : (
        <div className="responsive-event-grid">
          {filteredSessions.map(session => (
            <div key={session.id} className="glass hover-card" style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
              <div style={{ height: '200px', position: 'relative' }}>
                <img src={session.banner_image || '/placeholder.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                   {session.is_pending ? (
                     <div style={{ background: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '0.5rem 1.2rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(8px)' }}>
                       <Clock size={14} /> UPLOAD PENDING
                     </div>
                   ) : (
                     <div style={{ background: 'rgba(34, 197, 94, 0.9)', color: '#fff', padding: '0.5rem 1.2rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(8px)' }}>
                       <CheckCircle size={14} /> PORTFOLIO SYNCED
                     </div>
                   )}
                </div>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.8rem' }}>Event Assignment</div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '1rem' }}>{session.title}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                     <Clock size={16} color="var(--primary)" /> {formatDateRange(session.start_date, session.end_date)}
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                     <CheckCircle size={16} color={session.is_pending ? 'var(--on-surface-variant)' : 'var(--primary)'} />
                     {session.is_pending ? 'Waiting for first capture sync' : 'Highlights delivered to attendees'}
                   </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <Link 
                    to={`/upload/${session.id}`} 
                    className="btn-primary" 
                    style={{ flex: 1, textDecoration: 'none', textAlign: 'center', padding: '0.8rem 1.6rem', borderRadius: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontSize: '0.95rem' }}
                  >
                    <Camera size={18} /> START UPLOAD
                  </Link>
                  <button className="glass" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--on-surface-variant)' }}>
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotographerDashboard;
