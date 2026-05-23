import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Camera, Info, Loader2, ArrowLeft, Download, Image as ImageIcon } from 'lucide-react';
import api from '../api';
import { formatDateRange } from '../utils/dateUtils';

const EventConsole = () => {
  const { regId } = useParams();
  const [registration, setRegistration] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [galleryCategory, setGalleryCategory] = useState('personal');

  useEffect(() => {
    const fetchConsoleData = async () => {
      try {
        const regRes = await api.get(`/attendee/registrations/${regId}/`);
        setRegistration(regRes.data);
        
        // Fetch photos for this event
        const photoRes = await api.get(`/photos/gallery/?event_id=${regRes.data.event}&category=${galleryCategory}`);
        setPhotos(photoRes.data.results || photoRes.data);
      } catch (err) {
        console.error('Failed to fetch console data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsoleData();
  }, [regId, galleryCategory]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;
  if (!registration) return <div style={{ textAlign: 'center', padding: '10rem' }}>Registration details not found.</div>;

  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '1rem 2rem',
        border: 'none',
        background: activeTab === id ? 'var(--primary-container)' : 'transparent',
        color: activeTab === id ? 'var(--primary)' : 'var(--on-surface-variant)',
        borderRadius: '12px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      <Icon size={20} /> {label}
    </button>
  );

  return (
    <div className="event-console-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Link to="/my-events" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 600 }}>
        <ArrowLeft size={16} /> BACK TO MY EVENTS
      </Link>

      <div className="glass" style={{ borderRadius: '32px', overflow: 'hidden', marginBottom: '3rem' }}>
        <div style={{ height: '300px', position: 'relative' }}>
          <img src={registration.event_banner || '/event-banner.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '3rem', background: 'linear-gradient(to top, rgba(13, 17, 23, 0.9), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Event Hub</span>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, marginTop: '0.5rem' }}>{registration.event_title}</h1>
            </div>
            <div className="glass" style={{ padding: '0.5rem 1.2rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, borderColor: 'var(--primary)', borderStyle: 'solid', borderWidth: '1px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div> {registration.is_event_active ? 'ACTIVE NOW' : 'EVENT ARCHIVE'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', padding: '1rem', borderBottom: '1px solid var(--surface-highest)', gap: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
          <TabButton id="overview" label="Overview" icon={Info} />
          <TabButton id="ticket" label="My Ticket" icon={Ticket} />
          <TabButton id="gallery" label="Photo Gallery" icon={Camera} />
        </div>

        <div style={{ padding: '3rem' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
              <div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>About this Event</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  Welcome to the {registration.event_title} console. Here you can find all information regarding your attendance, download your digital pass, and view live captures of your moments.
                </p>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
                   <div style={{ background: 'var(--surface-highest)', padding: '1.5rem', borderRadius: '16px', flex: 1 }}>
                     <MapPin size={24} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                     <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>LOCATION</div>
                     <div style={{ fontWeight: 700 }}>{registration.event_location}</div>
                   </div>
                   <div style={{ background: 'var(--surface-highest)', padding: '1.5rem', borderRadius: '16px', flex: 1 }}>
                     <Calendar size={24} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                     <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>DURATION</div>
                     <div style={{ fontWeight: 700 }}>{formatDateRange(registration.event_start_date, registration.event_end_date)}</div>
                   </div>
                </div>
              </div>
              <div className="glass" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center' }}>
                <Ticket size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h4 style={{ marginBottom: '1rem' }}>Ticketing ID</h4>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>{registration.ticket?.ticket_id.split('-')[0].toUpperCase()}</div>
                <button 
                  onClick={() => setActiveTab('ticket')}
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '2rem', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem' }}
                >
                  View Passport
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ticket' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
              <div className="glass" style={{ width: '100%', maxWidth: '450px', borderRadius: '32px', overflow: 'hidden', background: '#fff', color: '#000' }}>
                <div style={{ background: 'var(--primary)', color: '#fff', padding: '2rem', textAlign: 'center' }}>
                  <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Official Event Passport</h3>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.5rem' }}>NEO EVENT</div>
                </div>
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ width: '250px', height: '250px', margin: '0 auto 2rem', background: '#f5f5f5', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {registration.ticket?.qr_code ? (
                      <img src={registration.ticket.qr_code} alt="QR Code" style={{ width: '90%', height: '90%' }} />
                    ) : (
                      <Ticket size={80} color="#ddd" />
                    )}
                  </div>
                  <div style={{ borderTop: '2px dashed #eee', padding: '2rem 0', textAlign: 'left' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 700 }}>ATTENDEE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{registration.user_name || 'VIP Guest'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 700 }}>EVENT PORTAL ACCESS ID</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{registration.ticket?.ticket_id}</div>
                    </div>
                  </div>
                  <button className="btn-primary" style={{ width: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                    <Download size={20} /> Download for Apple Wallet
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  Captured <span style={{ color: 'var(--primary)' }}>Moments</span>
                </h3>
                <div className="glass" style={{ display: 'flex', padding: '0.4rem', borderRadius: '50px' }}>
                  <button 
                    onClick={() => setGalleryCategory('personal')}
                    style={{ 
                      padding: '0.6rem 1.5rem', 
                      borderRadius: '50px', 
                      border: 'none', 
                      background: galleryCategory === 'personal' ? 'var(--primary)' : 'transparent',
                      color: galleryCategory === 'personal' ? '#fff' : 'var(--on-surface-variant)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Personalized (AI)
                  </button>
                  <button 
                    onClick={() => setGalleryCategory('public')}
                    style={{ 
                      padding: '0.6rem 1.5rem', 
                      borderRadius: '50px', 
                      border: 'none', 
                      background: galleryCategory === 'public' ? 'var(--primary)' : 'transparent',
                      color: galleryCategory === 'public' ? '#fff' : 'var(--on-surface-variant)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Public Highlights
                  </button>
                </div>
              </div>

              {photos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px' }}>
                   <ImageIcon size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                   <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>
                     No {galleryCategory} photos available for this event yet.
                   </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {photos.map(photo => (
                    <div key={photo.id} className="glass" style={{ borderRadius: '16px', overflow: 'hidden', height: '350px' }}>
                      <img src={photo.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventConsole;
