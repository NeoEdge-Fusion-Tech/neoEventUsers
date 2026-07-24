import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Camera, Info, Loader2, ArrowLeft, Download, Image as ImageIcon, CreditCard, Send, Star, CheckCircle, ExternalLink } from 'lucide-react';
import api from '../api';
import { formatDateRange } from '../utils/dateUtils';

const EventConsole = () => {
  const { regId } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [galleryCategory, setGalleryCategory] = useState('personal');
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  
  // Transfer state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferName, setTransferName] = useState('');
  const [transferring, setTransferring] = useState(false);

  // Rating State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorRating, setVendorRating] = useState(5);
  const [vendorReview, setVendorReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchConsoleData = async () => {
      try {
        const regRes = await api.get(`/attendee/registrations/${regId}/`);
        setRegistration(regRes.data);
        
        // Fetch photos for this event
        const photoRes = await api.get(`/photos/gallery/?event_id=${regRes.data.event_id}&category=${galleryCategory}`);
        setPhotos(photoRes.data.results || photoRes.data);
        setSelectedPhotos(new Set()); // Clear selection when category changes
      } catch (err) {
        console.error('Failed to fetch console data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsoleData();
  }, [regId, galleryCategory]);

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(photoId)) {
        newSelection.delete(photoId);
      } else {
        newSelection.add(photoId);
      }
      return newSelection;
    });
  };

  const handleDownloadSelected = async () => {
    if (selectedPhotos.size === 0) return;
    const photoIds = Array.from(selectedPhotos).join(',');
    const downloadUrl = `/photos/events/${registration.event_id}/download-personal-zip/?photo_ids=${photoIds}`;
    
    try {
      const response = await api.get(downloadUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_photos_${registration.event_id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download zip', err);
      alert('Failed to download selected photos.');
    }
  };

  const handleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)));
    }
  };

  const handleDownloadTicket = () => {
    if (registration?.qr_code) {
      const link = document.createElement('a');
      link.href = registration.qr_code;
      link.setAttribute('download', `neo_event_pass_${registration.registration_code}.png`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } else {
      alert("No QR Code generated yet for this pass.");
    }
  };

  const handleTransferTicket = async (e) => {
    e.preventDefault();
    if (!transferEmail) return;
    setTransferring(true);
    try {
      await api.post(`/attendee/registrations/${regId}/transfer/`, {
        new_email: transferEmail,
        new_name: transferName
      });
      alert('Ticket transferred successfully.');
      setTransferModalOpen(false);
      window.location.href = '/tickets'; // redirect to tickets list since they no longer own it
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to transfer ticket');
    } finally {
      setTransferring(false);
    }
  };

  const handleRateVendor = async (e) => {
    e.preventDefault();
    if (!selectedVendor) return;
    setSubmittingRating(true);
    try {
      await api.post(`/events/${registration.event_id}/vendors/${selectedVendor.vendor}/rate/`, {
        rating: vendorRating,
        review: vendorReview
      });
      alert('Thank you! Your rating has been submitted.');
      setRatingModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;
  if (!registration) return <div style={{ textAlign: 'center', padding: '10rem' }}>Registration details not found.</div>;

  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.6rem 1.25rem',
        border: 'none',
        background: activeTab === id ? 'var(--primary)' : 'transparent',
        color: activeTab === id ? 'var(--on-primary)' : 'var(--on-surface-variant)',
        borderRadius: '10px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: '0.85rem',
        flexShrink: 0
      }}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="event-console-container responsive-page-pad" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Link to="/tickets" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
        <ArrowLeft size={14} /> BACK TO MY TICKETS
      </Link>

      <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ height: '240px', position: 'relative' }}>
          <img src={registration.banner_image || '/event-banner.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div className="responsive-row" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '1.5rem', background: 'linear-gradient(to top, rgba(13, 17, 23, 0.95), transparent)', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>Event Hub</span>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, marginTop: '0.2rem' }}>{registration.event_title}</h1>
            </div>
            <div className="glass" style={{ padding: '0.4rem 1rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, borderColor: 'var(--primary)', borderStyle: 'solid', borderWidth: '1px', fontSize: '0.75rem', alignSelf: 'flex-start' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div> {registration.is_event_active ? 'ACTIVE NOW' : 'EVENT ARCHIVE'}
            </div>
          </div>
        </div>

        <div className="scrollable-tabs-wrapper" style={{ padding: '0.5rem', borderBottom: '1px solid var(--surface-highest)', background: 'var(--surface-tint)' }}>
          <TabButton id="overview" label="Overview" icon={Info} />
          <TabButton id="ticket" label="My Ticket" icon={Ticket} />
          <TabButton id="payment" label="Payment" icon={CreditCard} />
          <TabButton id="gallery" label="Photo Gallery" icon={Camera} />
          <TabButton id="vendors" label="Vendors" icon={Star} />
        </div>

        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'overview' && (
            <div className="responsive-dashboard-grid" style={{ gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', fontWeight: 900 }}>About this Event</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  Welcome to the {registration.event_title} console. Here you can find all information regarding your attendance, download your digital pass, and view live captures of your moments.
                </p>
                <div className="responsive-row" style={{ marginTop: '1.5rem', gap: '1.25rem' }}>
                   <div style={{ background: 'var(--surface-highest)', padding: '1.25rem', borderRadius: '12px', flex: 1 }}>
                     <MapPin size={20} color="var(--primary)" style={{ marginBottom: '0.6rem' }} />
                     <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>LOCATION</div>
                     <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{[registration.venue_name, registration.venue_address].filter(Boolean).join(', ')}</div>
                   </div>
                   <div style={{ background: 'var(--surface-highest)', padding: '1.25rem', borderRadius: '12px', flex: 1 }}>
                     <Calendar size={20} color="var(--primary)" style={{ marginBottom: '0.6rem' }} />
                     <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>DURATION</div>
                     <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatDateRange(registration.start_date, registration.end_date)}</div>
                   </div>
                </div>
              </div>
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center', alignSelf: 'flex-start' }}>
                <Ticket size={32} color="var(--primary)" style={{ marginBottom: '0.8rem' }} />
                <h4 style={{ marginBottom: '0.6rem', fontSize: '0.95rem', fontWeight: 800 }}>Ticketing ID</h4>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>{registration.registration_code}</div>
                <button 
                  onClick={() => setActiveTab('ticket')}
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '1.25rem', padding: '0.7rem', borderRadius: '10px', fontSize: '0.85rem' }}
                >
                  View Passport
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ticket' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
              <div className="glass" style={{ width: '100%', maxWidth: '400px', borderRadius: '24px', overflow: 'hidden', background: '#fff', color: '#000' }}>
                <div style={{ background: 'var(--primary)', color: 'var(--on-primary)', padding: '1.5rem', textAlign: 'center' }}>
                  <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Official Event Passport</h3>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, marginTop: '0.4rem' }}>{registration.event_title}</div>
                </div>
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ width: '200px', height: '200px', margin: '0 auto 1.5rem', background: '#f5f5f5', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    {registration.qr_code ? (
                      <img src={registration.qr_code} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Ticket size={64} color="#ddd" />
                    )}
                  </div>
                  <div style={{ borderTop: '2px dashed #eee', padding: '1.5rem 0', textAlign: 'left' }}>
                    <div style={{ marginBottom: '0.8rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 700 }}>ATTENDEE</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{registration.attendee_name || 'VIP Guest'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 700 }}>EVENT PORTAL ACCESS ID</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{registration.registration_code}</div>
                    </div>
                  </div>
                  <button onClick={handleDownloadTicket} className="btn-primary" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                    <Download size={16} /> Download Passport
                  </button>
                  <button onClick={() => setTransferModalOpen(true)} style={{ width: '100%', marginTop: '0.8rem', padding: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}>
                    <Send size={16} /> Transfer Ticket
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
              <div className="glass" style={{ width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 900 }}>
                  <CreditCard size={20} color="var(--primary)" /> Payment History
                </h3>
                
                <div style={{ background: 'var(--surface-highest)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Transaction ID</div>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{registration.id.split('-').pop()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Date</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{new Date(registration.registered_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800 }}>{registration.ticket_type_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Event Ticket</div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>
                       {parseFloat(registration.ticket_price) === 0 ? 'FREE' : `${registration.event_currency || 'USD'} ${registration.ticket_price}`}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Status</span>
                     <span style={{ 
                       padding: '0.3rem 0.8rem', 
                       borderRadius: '50px', 
                       background: 'rgba(34, 197, 94, 0.1)', 
                       color: '#22c55e', 
                       fontWeight: 800, 
                       fontSize: '0.75rem' 
                     }}>
                       SUCCESSFUL
                     </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <div className="responsive-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 900 }}>
                  Captured <span style={{ color: 'var(--primary)' }}>Moments</span>
                </h3>
                <div className="glass" style={{ display: 'flex', padding: '0.3rem', borderRadius: '50px' }}>
                  <button 
                    onClick={() => setGalleryCategory('personal')}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      borderRadius: '50px', 
                      border: 'none', 
                      background: galleryCategory === 'personal' ? 'var(--primary)' : 'transparent',
                      color: galleryCategory === 'personal' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Personalized (AI)
                  </button>
                  {registration.is_public_gallery_enabled && (
                    <button 
                      onClick={() => setGalleryCategory('public')}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        borderRadius: '50px', 
                        border: 'none', 
                        background: galleryCategory === 'public' ? 'var(--primary)' : 'transparent',
                        color: galleryCategory === 'public' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Public Highlights
                    </button>
                  )}
                </div>
              </div>

              {photos.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <button 
                    onClick={handleSelectAll}
                    style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selectedPhotos.size > 0 && (
                    <button 
                      onClick={handleDownloadSelected}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Download size={16} /> Download Selected ({selectedPhotos.size})
                    </button>
                  )}
                </div>
              )}

              {photos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--surface-tint)', borderRadius: '16px' }}>
                   <ImageIcon size={48} style={{ opacity: 0.15, marginBottom: '1rem', color: 'var(--on-surface)' }} />
                   <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
                     No {galleryCategory} photos available for this event yet.
                   </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  {photos.map(photo => (
                    <div 
                      key={photo.id} 
                      className="glass" 
                      style={{ 
                        borderRadius: '12px', 
                        overflow: 'hidden', 
                        height: '240px', 
                        position: 'relative',
                        cursor: 'pointer',
                        border: selectedPhotos.has(photo.id) ? '3px solid var(--primary)' : '3px solid transparent'
                      }}
                      onClick={() => togglePhotoSelection(photo.id)}
                    >
                      <img src={photo.raw_media_file_url || photo.media_file_url || photo.media_file} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      <div style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px', 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: selectedPhotos.has(photo.id) ? 'var(--primary)' : 'rgba(0,0,0,0.3)', 
                        border: '2px solid white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {selectedPhotos.has(photo.id) && <span>✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vendors' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
              <div className="glass" style={{ width: '100%', maxWidth: '800px', borderRadius: '24px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Star size={20} color="var(--primary)" /> Event Vendors
                </h3>
                {(!registration.event_vendors || registration.event_vendors.length === 0) ? (
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>No vendors are listed for this event.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {registration.event_vendors.map((v, idx) => (
                      <div key={idx} style={{ background: 'var(--surface-highest)', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '1px' }}>{v.role_display}</div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: '0.2rem' }}>{v.vendor_business_name || v.vendor_username}</h4>
                          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>{v.vendor_email}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                          {v.vendor && (
                            <button 
                              onClick={() => navigate(`/vendor/profile/${v.vendor}`)}
                              style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              <ExternalLink size={14} /> Profile
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setSelectedVendor(v);
                              setVendorRating(5);
                              setVendorReview('');
                              setRatingModalOpen(true);
                            }}
                            className="btn-primary"
                            style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <Star size={14} fill="currentColor" /> Rate Vendor
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {ratingModalOpen && selectedVendor && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '450px', borderRadius: '24px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.5rem' }}>Rate Vendor</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
              How was your experience with <strong>{selectedVendor.vendor_business_name || selectedVendor.vendor_username}</strong>?
            </p>
            <form onSubmit={handleRateVendor} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      size={32} 
                      color={star <= vendorRating ? "var(--primary)" : "var(--glass-border)"} 
                      fill={star <= vendorRating ? "var(--primary)" : "none"}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setVendorRating(star)}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Review (Optional)</label>
                <textarea 
                  rows={4}
                  value={vendorReview} 
                  onChange={e => setVendorReview(e.target.value)} 
                  style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--surface)', color: 'var(--on-surface)', outline: 'none', resize: 'vertical' }} 
                  placeholder="Share your experience..." 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setRatingModalOpen(false)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submittingRating} className="btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {submittingRating ? <Loader2 size={20} className="animate-spin" /> : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '1.5rem' }}>Transfer Ticket</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
              Transferring this ticket will revoke your access to this event and assign it to the new user. This action cannot be undone.
            </p>
            <form onSubmit={handleTransferTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Recipient Name</label>
                <input required type="text" value={transferName} onChange={e => setTransferName(e.target.value)} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--surface)', color: 'var(--on-surface)', outline: 'none' }} placeholder="e.g. John Doe" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Recipient Email</label>
                <input required type="email" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--surface)', color: 'var(--on-surface)', outline: 'none' }} placeholder="e.g. john@example.com" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setTransferModalOpen(false)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={transferring} className="btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {transferring ? <Loader2 size={20} className="animate-spin" /> : 'Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventConsole;
