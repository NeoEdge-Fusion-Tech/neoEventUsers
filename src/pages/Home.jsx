import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, ArrowRight, Loader2, Play } from 'lucide-react';
import api from '../api/axios';
import { formatDateRange } from '../utils/dateUtils';
import { Link } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const getRegistrationStatus = (event) => {
    const now = new Date();
    if (event.registration_start && new Date(event.registration_start) > now) return 'Yet to Start';
    if (event.end_date && new Date(event.end_date) < now) return 'Past';
    if (event.registration_deadline && new Date(event.registration_deadline) < now) return 'Past';
    return 'In Progress';
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events/');
        setEvents(response.data.results || response.data || []);
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="home-container" style={{ padding: '0' }}>
      {/* Hero Section */}
      <section className="hero" style={{height: '75vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'radial-gradient(circle at 50% 30%, var(--accent-glow), transparent 60%)', position: 'relative', padding: '0 2rem' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', zIndex: 0, filter: 'blur(100px)' }}>
        </div>
        <br />
        <br />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '1.5rem', display: 'block' }}>
            Elite Event Discovery
          </span>
          <h1 style={{ fontSize: '5.5rem', marginBottom: '1.5rem', fontWeight: 900, lineHeight: '1.1', maxWidth: '1000px', letterSpacing: '-3px' }}>
            Unveiling 
            <span style={{ color: 'transparent', WebkitTextStroke: '1px var(--on-surface)', opacity: 0.6 }}>Artistry</span> in Every <span style={{ color: 'var(--primary)' }}>Moment</span>
          </h1>
          <p style={{ fontSize: '1.4rem', color: 'var(--on-surface-variant)', marginBottom: '4rem', maxWidth: '700px', margin: '0 auto 4rem', fontWeight: 500 }}>
            The definitive ecosystem for secure ticketing and AI-powered memory distribution.
          </p>
          
          <div className="search-bar glass" style={{
            display: 'flex',
            padding: '0.6rem',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '650px',
            margin: '0 auto',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ marginLeft: '1.2rem', color: 'var(--primary)' }}><Search size={24} strokeWidth={2.5} /></div>
            <input 
              type="text" 
              placeholder="Search global galas, summits, and premieres..." 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--on-surface)', 
                flex: 1, 
                fontSize: '1.1rem',
                fontWeight: 600,
                outline: 'none'
              }} 
            />
            <button className="btn-primary" style={{ borderRadius: '18px', padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 800 }}>EXPLORE</button>
          </div>
        </div>
      </section>

      {/* Featured Masterpieces */}
      <section className="featured" style={{ padding: '4rem 4rem 10rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
          <div>
            <h2 style={{ fontSize: '3.2rem', fontWeight: 900, letterSpacing: '-1.5px' }}>Curated <span style={{ color: 'var(--primary)' }}>Masterpieces</span></h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Rare experiences happening in our ecosystem right now.</p>
          </div>
          <button className="glass" style={{ color: 'var(--on-surface)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '1rem 2rem', borderRadius: '14px', fontSize: '0.9rem' }}>
            VIEW REPOSITORY <ArrowRight size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
            <Loader2 className="animate-spin" size={64} color="var(--primary)" />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
              <button onClick={() => setStatusFilter('ALL')} className={statusFilter === 'ALL' ? 'btn-primary' : 'glass'} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', background: statusFilter === 'ALL' ? 'var(--primary)' : 'var(--surface-tint)', color: statusFilter === 'ALL' ? 'var(--on-primary)' : 'var(--on-surface)' }}>All Events</button>
              <button onClick={() => setStatusFilter('YET_TO_START')} className={statusFilter === 'YET_TO_START' ? 'btn-primary' : 'glass'} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', background: statusFilter === 'YET_TO_START' ? 'var(--primary)' : 'var(--surface-tint)', color: statusFilter === 'YET_TO_START' ? 'var(--on-primary)' : 'var(--on-surface)' }}>Yet to Start</button>
              <button onClick={() => setStatusFilter('IN_PROGRESS')} className={statusFilter === 'IN_PROGRESS' ? 'btn-primary' : 'glass'} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', background: statusFilter === 'IN_PROGRESS' ? 'var(--primary)' : 'var(--surface-tint)', color: statusFilter === 'IN_PROGRESS' ? 'var(--on-primary)' : 'var(--on-surface)' }}>In Progress</button>
              <button onClick={() => setStatusFilter('PAST')} className={statusFilter === 'PAST' ? 'btn-primary' : 'glass'} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', background: statusFilter === 'PAST' ? 'var(--primary)' : 'var(--surface-tint)', color: statusFilter === 'PAST' ? 'var(--on-primary)' : 'var(--on-surface)' }}>Past</button>
            </div>
            
            <div className="event-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '4rem' }}>
              {events
                .filter(e => statusFilter === 'ALL' || getRegistrationStatus(e).toUpperCase().replace(/ /g, '_') === statusFilter)
                .map(event => {
                  const regStatus = getRegistrationStatus(event);
                  const isClickable = regStatus === 'In Progress';

                  const cardContent = (
                    <>
                      <div style={{ height: '320px', background: 'var(--surface-highest)', position: 'relative' }}>
                        <img src={event.banner_image || '/placeholder.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'flex', gap: '0.7rem' }}>
                          {event.is_currently_holding && (
                            <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', border: '1px solid var(--primary)', background: 'var(--glass-bg)' }}>
                              LIVE
                            </div>
                          )}
                          <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--on-surface)' }}>
                            {event.is_paid ? 'PREMIUM' : 'OPEN ACCESS'}
                          </div>
                        </div>
                      </div>
                      <div style={{ padding: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                          <Play size={16} fill="var(--primary)" color="var(--primary)" />
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>{regStatus}</span>
                        </div>
                        <h3 style={{ fontSize: '2.2rem', marginBottom: '1.5rem', fontWeight: 900, lineHeight: '1.2', letterSpacing: '-0.5px' }}>{event.title}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--on-surface-variant)', fontSize: '1rem', marginBottom: '3rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Calendar size={20} color="var(--primary)" /> {formatDateRange(event.start_date, event.end_date)}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><MapPin size={20} color="var(--primary)" /> {event.venue_name || event.location || 'Online / TBA'}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '2.5rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Starting At</span>
                            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--on-surface)' }}>{event.is_paid ? `$${event.price}` : 'VIP'}</span>
                          </div>
                          <button className="btn-primary" style={{ padding: '1.2rem 2.5rem', borderRadius: '18px', fontWeight: 800, fontSize: '0.95rem', opacity: isClickable ? 1 : 0.5 }}>{isClickable ? 'OBTAIN ACCESS' : regStatus.toUpperCase()}</button>
                        </div>
                      </div>
                    </>
                  );

                  return isClickable ? (
                    <Link to={`/register/${event.id}`} key={event.id} className="event-card glass hover-card" style={{ borderRadius: '40px', overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}>
                      {cardContent}
                    </Link>
                  ) : (
                    <div key={event.id} className="event-card glass" style={{ borderRadius: '40px', overflow: 'hidden', color: 'inherit', opacity: 0.8, cursor: 'not-allowed' }}>
                      {cardContent}
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
