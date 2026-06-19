import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ChevronRight, Loader2, Archive, Globe, Play } from 'lucide-react';
import api from '../api';
import { formatDateRange } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../api/ticket';

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const [upcomingRes, pastRes] = await Promise.all([
          ticketService.getUpcomingEvents(),
          ticketService.getPastEvents()
        ]);
        
        // Combine results. Depending on DRF pagination, it might be in .data.results
        const upcoming = upcomingRes.data.results || upcomingRes.data || [];
        const past = pastRes.data.results || pastRes.data || [];
        
        setRegistrations([...upcoming, ...past]);
      } catch (err) {
        console.error('Failed to fetch registrations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  const upcoming = registrations.filter(r => !r.is_event_active && new Date(r.event_start_date) > new Date());
  const active = registrations.filter(r => r.is_event_active);
  const past = registrations.filter(r => !r.is_event_active && new Date(r.event_end_date || r.event_start_date) < new Date());

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;

  const EventSection = ({ title, events, icon: Icon, emptyMsg, color = 'var(--primary)' }) => (
    <section style={{ marginBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `rgba(${color === 'var(--primary)' ? '255,177,115' : '176,196,222'}, 0.1)`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: color }}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 900, letterSpacing: '-0.5px' }}>{title}</h2>
        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)', marginLeft: '1rem' }}></div>
      </div>

      {events.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1rem', fontWeight: 500 }}>{emptyMsg}</p>
        </div>
      ) : (
        <div className="responsive-event-grid" style={{ gap: '1.5rem' }}>
          {events.map(reg => (
            <div 
              key={reg.id} 
              onClick={() => navigate(`/event-console/${reg.id}`)}
              className="glass hover-card"
              style={{ borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--glass-border)', transition: 'all 0.3s ease' }}
            >
              <div style={{ height: '140px', position: 'relative' }}>
                <img src={reg.event_banner || '/placeholder.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(13, 20, 32, 0.8), transparent)' }}></div>
                {reg.is_event_active && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem 0.8rem', background: 'var(--primary)', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--on-primary)', boxShadow: '0 4px 15px rgba(255,177,115,0.3)' }}>LIVE NOW</div>
                )}
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                   <Play size={12} fill={reg.is_event_active ? 'var(--primary)' : 'var(--on-surface-variant)'} color={reg.is_event_active ? 'var(--primary)' : 'var(--on-surface-variant)'} />
                   <span style={{ fontSize: '0.7rem', fontWeight: 800, color: reg.is_event_active ? 'var(--primary)' : 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                     {reg.is_event_active ? 'Session Active' : (new Date(reg.event_start_date) > new Date() ? 'Upcoming' : 'Archived')}
                   </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.8rem', fontWeight: 900, lineHeight: '1.25' }}>{reg.event_title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Calendar size={15} color="var(--primary)" /> {formatDateRange(reg.event_start_date, reg.event_end_date)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><MapPin size={15} color="var(--primary)" /> {reg.event_location}</div>
                </div>
                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                   <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--surface-tint)', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s ease' }}>
                      <ChevronRight size={18} />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="my-events-container responsive-page-pad" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '3px' }}>Timeline & History</span>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 900, letterSpacing: '-1.5px', marginTop: '0.5rem' }}>Experience <span style={{ color: 'var(--primary)' }}>Chronicle</span></h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: 500, marginTop: '0.5rem' }}>Your personal journey through global masterpieces.</p>
      </header>
      
      <EventSection title="Happening Now" events={active} icon={Globe} emptyMsg="No active live sessions in your chronicle." color="var(--primary)" />
      <EventSection title="Pending Experiences" events={upcoming} icon={Clock} emptyMsg="Your future schedule is currently clear." color="var(--on-surface-variant)" />
      <EventSection title="Digital Archive" events={past} icon={Archive} emptyMsg="No previous experiences recorded." color="var(--on-surface-variant)" />
    </div>
  );
};

export default MyEvents;
