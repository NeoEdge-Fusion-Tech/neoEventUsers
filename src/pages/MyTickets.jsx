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
    <div className="my-tickets-container" style={{ padding: '4rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '3px' }}>Identity & Access</span>
          <h1 style={{ fontSize: '4.5rem', marginBottom: '0.5rem', fontWeight: 900, letterSpacing: '-2px' }}>My <span style={{ color: 'var(--primary)' }}>Tickets</span></h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem', fontWeight: 500 }}>Manage your events and access credentials.</p>
        </div>
        <div className="glass" style={{ padding: '2rem 3.5rem', borderRadius: '32px', textAlign: 'center', border: '1px solid var(--primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '2px' }}>PHOTOS OF ME</div>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--on-surface)' }}>{photoCount}</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '5rem' }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '3px', background: 'var(--primary)', borderRadius: '2px' }}></div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>MY TICKETS</h2>
            </div>
            
            <div className="glass" style={{ display: 'flex', padding: '0.4rem', borderRadius: '50px' }}>
              <button 
                onClick={() => setActiveTab('upcoming')}
                style={{ 
                  padding: '0.6rem 1.5rem', borderRadius: '50px', border: 'none', 
                  background: activeTab === 'upcoming' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'upcoming' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                Upcoming Events
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                style={{ 
                  padding: '0.6rem 1.5rem', borderRadius: '50px', border: 'none', 
                  background: activeTab === 'past' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'past' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                Past Events
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {(activeTab === 'upcoming' ? upcomingRegistrations : pastRegistrations).length === 0 ? (
              <div className="glass" style={{ padding: '8rem', textAlign: 'center', borderRadius: '40px' }}>
                <Ticket size={72} style={{ opacity: 0.1, marginBottom: '2.5rem', color: 'var(--on-surface)' }} />
                <h3 style={{ fontSize: '2rem', marginBottom: '1.2rem', fontWeight: 900 }}>No Tickets Found</h3>
                <p style={{ color: 'var(--on-surface-variant)', maxWidth: '400px', margin: '0 auto', fontSize: '1.1rem' }}>You haven't registered for any events yet. Explore our events to find your next experience!</p>
                <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '3rem', padding: '1.2rem 4rem', borderRadius: '18px', fontSize: '1rem' }}>DISCOVER EVENTS</button>
              </div>
            ) : (
              (activeTab === 'upcoming' ? upcomingRegistrations : pastRegistrations).map(reg => (
                <div key={reg.id} className="glass hover-card" style={{ display: 'flex', borderRadius: '40px', overflow: 'hidden', height: '240px' }}>
                  <div style={{ width: '260px', position: 'relative' }}>
                    <img src={reg.event_banner || '/placeholder.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, transparent, var(--bg-color))', opacity: 0.5 }}></div>
                    {reg.is_event_active && (
                      <div className="glass" style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', padding: '0.5rem 1.2rem', background: 'var(--primary)', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--on-primary)' }}>LIVE SESSION</div>
                    )}
                  </div>
                  <div style={{ flex: 1, padding: '3rem', display: 'flex', borderLeft: '2px dashed var(--glass-border)', position: 'relative' }}>
                     <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.2rem' }}>
                           <ShieldCheck size={20} color="var(--primary)" />
                           <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Verified Entry</span>
                        </div>
                        <h3 style={{ fontSize: '2rem', marginBottom: '1.2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{reg.event_title}</h3>
                        <div style={{ display: 'flex', gap: '2.5rem', color: 'var(--on-surface-variant)', fontSize: '1rem', fontWeight: 500, marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}><Calendar size={20} color="var(--primary)" /> {formatDateRange(reg.event_start_date, reg.event_end_date)}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}><MapPin size={20} color="var(--primary)" /> {reg.event_location}</div>
                        </div>
                        <div style={{ padding: '0.8rem 1.2rem', background: 'var(--surface-tint)', borderRadius: '12px', display: 'inline-block', border: '1px solid var(--glass-border)' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.2rem', fontWeight: 800 }}>Receipt Code</span>
                          <code style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>{reg.registration_code || 'N/A'}</code>
                        </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button 
                          onClick={() => handleTicketClick(reg)}
                          className="btn-primary" 
                          style={{ height: '76px', padding: '0 3rem', borderRadius: '22px', display: 'flex', alignItems: 'center', gap: '1.2rem', fontWeight: 900, fontSize: '1.1rem' }}
                        >
                          OPEN HUB <ArrowRight size={22} strokeWidth={3} />
                        </button>
                     </div>
                     {/* Decorative Ticket Notch */}
                     <div style={{ position: 'absolute', top: '-20px', right: '220px', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-color)', border: '1px solid var(--glass-border)' }}></div>
                     <div style={{ position: 'absolute', bottom: '-20px', right: '220px', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-color)', border: '1px solid var(--glass-border)' }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <div className="glass" style={{ padding: '3.5rem', borderRadius: '40px', border: '1px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '180px', height: '180px', background: 'var(--primary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(50px)' }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: '72px', height: '72px', background: 'var(--accent-glow)', borderRadius: '22px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', marginBottom: '2.5rem', border: '1px solid var(--glass-border)' }}>
                <Zap size={36} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px' }}>AI Biometrics</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', marginBottom: '3.5rem', lineHeight: '1.8', fontWeight: 500 }}>
                Your unique biometric signature is actively monitoring galleries across all registered events for instant memory delivery.
              </p>
              <button 
                onClick={() => navigate('/settings')}
                className="btn-primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.2rem', padding: '1.4rem', borderRadius: '20px', fontWeight: 900, fontSize: '1rem' }}
              >
                IDENTITY SETTINGS <ArrowRight size={22} />
              </button>
            </div>
          </div>
          
          <div className="glass" style={{ padding: '3rem', borderRadius: '40px' }}>
            <h4 style={{ marginBottom: '2.5rem', fontSize: '1rem', fontWeight: 900, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '3px', opacity: 0.6 }}>Network Stats</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                   <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                   <span style={{ color: 'var(--on-surface-variant)', fontWeight: 700, fontSize: '1.1rem' }}>Identified Photos</span>
                </div>
                <span style={{ fontWeight: 900, fontSize: '1.8rem', color: 'var(--on-surface)' }}>{photoCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                   <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                   <span style={{ color: 'var(--on-surface-variant)', fontWeight: 700, fontSize: '1.1rem' }}>Upcoming Events</span>
                </div>
                <span style={{ fontWeight: 900, fontSize: '1.8rem', color: 'var(--on-surface)' }}>{upcomingRegistrations.length}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MyTickets;
