import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Camera, Plus, Loader2, ArrowRight, Settings, Trash2, Mail, ExternalLink, Globe } from 'lucide-react';
import api from '../api';
import { formatDateRange } from '../utils/dateUtils';
import { useNavigate, Link } from 'react-router-dom';

const OrganizerConsole = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwnedEvents = async () => {
      try {
        const response = await api.get('/events/owned/');
        setEvents(response.data.results || response.data || []);
      } catch (err) {
        console.error('Failed to fetch owned events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnedEvents();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;

  return (
    <div className="organizer-console" style={{ padding: '4rem 6rem', maxWidth: '1600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '4px' }}>Management Suite</span>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-2px', marginTop: '0.5rem' }}>Global <span style={{ color: 'var(--primary)' }}>Masterpieces</span></h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.3rem', fontWeight: 500, marginTop: '0.5rem' }}>The ultimate command center for luxury event distribution.</p>
        </div>
        
        <Link to="/events/create" className="btn-primary" style={{ padding: '1.4rem 2.8rem', borderRadius: '20px', fontSize: '1rem', fontWeight: 900, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 15px 35px rgba(255,177,115,0.2)' }}>
          <Plus size={22} /> CREATE EVENT
        </Link>
      </header>

      {events.length === 0 ? (
        <div className="glass" style={{ padding: '8rem', textAlign: 'center', borderRadius: '48px', border: '1px solid var(--glass-border)' }}>
          <Globe size={80} color="var(--primary)" style={{ opacity: 0.1, marginBottom: '2.5rem' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.2rem' }}>Ready to host?</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto 3rem' }}>Deploy your first global experience and start capturing memories with AI precision.</p>
          <Link to="/events/create" className="btn-primary" style={{ padding: '1.2rem 3rem', borderRadius: '16px', textDecoration: 'none', fontWeight: 900 }}>LAUNCH FIRST EVENT</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', justifyItems: 'center' }}>
          {events.map(event => (
            <div key={event.id} className="glass card-hover" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--glass-border)', maxWidth: '340px', width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ height: '170px', position: 'relative' }}>
                <img src={event.banner_image || '/placeholder.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13, 20, 32, 0.9), transparent)' }}></div>
                <div style={{ position: 'absolute', bottom: '1rem', left: '1.5rem' }}>
                   <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.3rem' }}>Status: {event.status}</div>
                   <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff' }}>{event.title}</h3>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                   <div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 800, marginBottom: '0.4rem', textTransform: 'uppercase' }}>Schedule</div>
                     <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={14} color="var(--primary)" /> {formatDateRange(event.start_date, event.end_date)}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 800, marginBottom: '0.4rem', textTransform: 'uppercase' }}>Vendors</div>
                     <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Camera size={14} color="var(--primary)" /> {event.event_photographers?.length || 0} Assigned</div>
                   </div>
                </div>
 
                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                  <button onClick={() => navigate(`/organizer/event/${event.id}`)} className="btn-primary" style={{ flex: 2, padding: '0.8rem', borderRadius: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                    <Settings size={16} /> MANAGE
                  </button>
                  <button className="glass" style={{ flex: 1, borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--on-surface-variant)', border: '1px solid var(--glass-border)' }}>
                    <Users size={16} />
                  </button>
                  <button className="glass" style={{ flex: 1, borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <Trash2 size={16} />
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

export default OrganizerConsole;
