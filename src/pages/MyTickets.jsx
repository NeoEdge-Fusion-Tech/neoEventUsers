import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, Camera, ArrowRight, Download, Loader2, ShieldCheck, Zap } from 'lucide-react';
import api from '../api';
import { formatDateRange } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

const MyTickets = () => {
  const [upcomingRegistrations, setUpcomingRegistrations] = useState([]);
  const [pastRegistrations, setPastRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [photoCount, setPhotoCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [upcomingRes, pastRes, countRes] = await Promise.all([
          api.get('/attendee/events/upcoming/').catch(() => ({ data: { results: [] } })),
          api.get('/attendee/events/history/').catch(() => ({ data: { results: [] } })),
          api.get('/photos/stats/count/').catch(() => ({ data: { count: 0 } }))
        ]);
        
        const upcoming = upcomingRes.data.results || upcomingRes.data || [];
        const past = pastRes.data.results || pastRes.data || [];
        
        setUpcomingRegistrations(upcoming);
        setPastRegistrations(past);
        setPhotoCount(countRes.data.count || 0);
        
        // Auto-switch to past tab if there are no upcoming events but there are past events
        if (upcoming.length === 0 && past.length > 0) {
          setActiveTab('past');
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTicketClick = (reg) => {
    navigate(`/event-console/${reg.id}`);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;

  return (
    <div className="my-tickets-container responsive-page-pad" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header className="responsive-row" style={{ marginBottom: '3rem', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '3px' }}>Identity & Access</span>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', marginBottom: '0.5rem', fontWeight: 900, letterSpacing: '-1.5px', marginTop: '0.5rem' }}>My <span style={{ color: 'var(--primary)' }}>Tickets</span></h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', fontWeight: 500 }}>Manage your events and access credentials.</p>
        </div>
        <div className="glass" style={{ padding: '1rem 2.5rem', borderRadius: '20px', textAlign: 'center', border: '1px solid var(--primary)', alignSelf: 'flex-start' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '1.5px' }}>PHOTOS OF ME</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--on-surface)' }}>{photoCount}</div>
        </div>
      </header>

      <div className="responsive-dashboard-grid">
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '30px', height: '3px', background: 'var(--primary)', borderRadius: '2px' }}></div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.3px' }}>MY TICKETS</h2>
            </div>
            
            <div className="glass" style={{ display: 'flex', padding: '0.3rem', borderRadius: '50px' }}>
              <button 
                onClick={() => setActiveTab('upcoming')}
                style={{ 
                  padding: '0.5rem 1.2rem', borderRadius: '50px', border: 'none', 
                  background: activeTab === 'upcoming' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'upcoming' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
                }}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                style={{ 
                  padding: '0.5rem 1.2rem', borderRadius: '50px', border: 'none', 
                  background: activeTab === 'past' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'past' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
                }}
              >
                Past
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {(activeTab === 'upcoming' ? upcomingRegistrations : pastRegistrations).length === 0 ? (
              <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px' }}>
                <Ticket size={48} style={{ opacity: 0.15, marginBottom: '1.5rem', color: 'var(--on-surface)' }} />
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.8rem', fontWeight: 900 }}>No Tickets Found</h3>
                <p style={{ color: 'var(--on-surface-variant)', maxWidth: '400px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.5' }}>You haven't registered for any events yet. Explore our events to find your next experience!</p>
                <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1.5rem', padding: '0.8rem 2.5rem', borderRadius: '12px', fontSize: '0.9rem' }}>DISCOVER EVENTS</button>
              </div>
            ) : (
              (activeTab === 'upcoming' ? upcomingRegistrations : pastRegistrations).map(reg => (
                <div key={reg.id} className="glass hover-card ticket-card-responsive">
                  <div className="ticket-card-banner">
                    <img src={reg.event_banner || '/placeholder.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, transparent, var(--bg-color))', opacity: 0.5 }}></div>
                    {reg.is_event_active && (
                      <div className="glass" style={{ position: 'absolute', bottom: '1rem', left: '1rem', padding: '0.4rem 0.8rem', background: 'var(--primary)', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--on-primary)' }}>LIVE SESSION</div>
                    )}
                  </div>
                  <div className="ticket-card-content">
                     <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                           <ShieldCheck size={16} color="var(--primary)" />
                           <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Verified Entry</span>
                        </div>
                        <h3 style={{ fontSize: '1.35rem', marginBottom: '0.8rem', fontWeight: 900, letterSpacing: '-0.3px', lineHeight: '1.25' }}>{reg.event_title}</h3>
                        <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--on-surface-variant)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={16} color="var(--primary)" /> {formatDateRange(reg.event_start_date, reg.event_end_date)}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={16} color="var(--primary)" /> {reg.event_location}</div>
                        </div>
                        <div style={{ padding: '0.5rem 1rem', background: 'var(--surface-tint)', borderRadius: '10px', display: 'inline-block', border: '1px solid var(--glass-border)' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.1rem', fontWeight: 800 }}>Receipt Code</span>
                          <code style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>{reg.registration_code || 'N/A'}</code>
                        </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button 
                          onClick={() => handleTicketClick(reg)}
                          className="btn-primary" 
                          style={{ height: '48px', padding: '0 2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 850, fontSize: '0.85rem' }}
                        >
                          OPEN HUB <ArrowRight size={16} strokeWidth={2.5} />
                        </button>
                     </div>
                     {/* Decorative Ticket Notch */}
                     <div className="ticket-notch ticket-notch-top"></div>
                     <div className="ticket-notch ticket-notch-bottom"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '180px', height: '180px', background: 'var(--primary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(50px)' }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--accent-glow)', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>
                <Zap size={24} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.8rem', fontWeight: 900, letterSpacing: '-0.3px' }}>AI Biometrics</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6', fontWeight: 500 }}>
                Your unique biometric signature is actively monitoring galleries across all registered events for instant memory delivery.
              </p>
              <button 
                onClick={() => navigate('/settings')}
                className="btn-primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', padding: '0.8rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.85rem' }}
              >
                IDENTITY SETTINGS <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 900, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6 }}>Network Stats</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}></div>
                   <span style={{ color: 'var(--on-surface-variant)', fontWeight: 700, fontSize: '0.95rem' }}>Identified Photos</span>
                </div>
                <span style={{ fontWeight: 900, fontSize: '1.35rem', color: 'var(--on-surface)' }}>{photoCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}></div>
                   <span style={{ color: 'var(--on-surface-variant)', fontWeight: 700, fontSize: '0.95rem' }}>Upcoming Events</span>
                </div>
                <span style={{ fontWeight: 900, fontSize: '1.35rem', color: 'var(--on-surface)' }}>{upcomingRegistrations.length}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MyTickets;
