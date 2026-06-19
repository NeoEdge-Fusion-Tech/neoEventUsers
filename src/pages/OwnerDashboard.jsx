import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getNames } from 'country-list';
import { eventService } from '../api/event';
import { vendorService } from '../api/vendor';
import { uploadEventBannerAssets } from '../utils/eventAssetUpload';
import { 
  Loader2, Plus, Users, Trash2, Calendar, MapPin, Ticket, 
  Image as ImageIcon, Video, Clock, Eye, ShieldCheck, Info, X 
} from 'lucide-react';

const OwnerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Event Form state
  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    venue_name: '',
    venue_address: '',
    country: '',
    state_or_county: '',
    start_date: '',
    end_date: '',
    number_of_days: 1,
    registration_start: '',
    registration_deadline: '',
    max_participants: 100,
    is_public: true,
    currency: 'USD'
  });
  
  // Ticket Categories
  const [ticketTypes, setTicketTypes] = useState([
    { name: 'Regular', price: '0.00', quantity: 100, description: 'General admission access' }
  ]);

  // Event Vendors
  const [eventVendors, setEventVendors] = useState([]);
  const [vendorTypes, setVendorTypes] = useState([]);
  
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPortrait, setBannerPortrait] = useState(null);
  const [bannerVideo, setBannerVideo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchVendorTypes();
  }, []);

  const fetchVendorTypes = async () => {
    try {
      const res = await vendorService.getVendorTypes();
      setVendorTypes(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-calculate number of days when dates change
  useEffect(() => {
    if (newEvent.start_date && newEvent.end_date) {
      const start = new Date(newEvent.start_date);
      const end = new Date(newEvent.end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNewEvent(prev => ({ ...prev, number_of_days: diffDays || 1 }));
    }
  }, [newEvent.start_date, newEvent.end_date]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getMyEvents();
      setEvents(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await eventService.deleteEvent(deleteTarget.id);
      setDeleteTarget(null);
      fetchEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleAddTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', price: '0.00', quantity: 50, description: '' }]);
  };

  const handleRemoveTicketType = (index) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index));
    }
  };

  const handleTicketTypeChange = (index, field, value) => {
    const updated = [...ticketTypes];
    updated[index][field] = value;
    setTicketTypes(updated);
  };

  const handleAddVendor = () => {
    setEventVendors([...eventVendors, { role: 'PHOTOGRAPHER', vendor_name: '', vendor_email: '', vendor_phone: '' }]);
  };

  const handleRemoveVendor = (index) => {
    setEventVendors(eventVendors.filter((_, i) => i !== index));
  };

  const handleVendorChange = (index, field, value) => {
    const updated = [...eventVendors];
    updated[index][field] = value;
    setEventVendors(updated);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');

    // Capacity Validation
    const maxCapacity = parseInt(newEvent.max_participants) || 0;
    const totalCapacity = ticketTypes.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0);
    if (totalCapacity > maxCapacity) {
      setErrorMsg(`The total ticket capacity across all categories (${totalCapacity}) cannot exceed the event's max capacity (${maxCapacity}).`);
      setCreating(false);
      return;
    }

    // Handle Custom Vendor Roles
    const finalVendors = eventVendors.map(v => {
      if (v.role === 'OTHER' && v.custom_role) {
        return { ...v, role: v.custom_role };
      }
      return v;
    });

    try {
      // Upload banner assets directly to storage first (bypasses our API's
      // body-size limit on serverless hosting) — only the resulting URLs
      // travel in the create request below.
      const bannerUrls = await uploadEventBannerAssets({
        banner_image: bannerImage,
        banner_portrait: bannerPortrait,
        banner_video: bannerVideo,
      });

      const payload = {};
      Object.entries(newEvent).forEach(([k, v]) => {
        if (v !== null && v !== undefined && k !== 'ticket_types' && k !== 'vendors' && !k.endsWith('_file')) {
          payload[k] = v;
        }
      });
      payload.status = 'PUBLISHED';
      payload.ticket_types = ticketTypes;
      if (finalVendors.length > 0) {
        payload.vendors = finalVendors;
      }
      Object.assign(payload, bannerUrls);

      await eventService.createEvent(payload);
      setShowCreate(false);
      
      // Reset State
      setNewEvent({
        title: '',
        description: '',
        venue_name: '',
        venue_address: '',
        country: '',
        state_or_county: '',
        start_date: '',
        end_date: '',
        number_of_days: 1,
        registration_start: '',
        registration_deadline: '',
        max_participants: 100,
        is_public: true,
        currency: 'USD'
      });
      setTicketTypes([{ name: 'Regular', price: '0.00', quantity: 100, description: 'General admission access' }]);
      setEventVendors([]);
      setBannerImage(null);
      setBannerPortrait(null);
      setBannerVideo(null);
      fetchEvents();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to create event. Please verify all date sequences.');
    } finally {
      setCreating(false);
    }
  };

  const maxCapacityVal = parseInt(newEvent.max_participants) || 0;
  const currentTotalCapacity = ticketTypes.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0);
  const capacityExceeded = currentTotalCapacity > maxCapacityVal;

  if (loading) return <div style={styles.center}><Loader2 className="spinner" size={40} color="var(--primary)" /></div>;

  return ( <>
    <div style={styles.container}>
      <header className="responsive-row" style={styles.header}>
        <div>
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '4px' }}>ORGANIZER PANEL</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', fontWeight: 900, letterSpacing: '-1.5px', marginTop: '0.2rem' }}>Event <span style={{ color: 'var(--primary)' }}>Console</span></h1>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ ...styles.addBtn, alignSelf: 'flex-start' }}>
          <Plus size={20} /> New Event
        </button>
      </header>

      {/* Modal dialog for Creation */}
      {showCreate && (
        <div style={styles.modalOverlay}>
          <div className="glass" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ fontSize: '2rem', fontWeight: 950, letterSpacing: '-1px' }}>Create New Event</h2>
              <button onClick={() => setShowCreate(false)} style={styles.closeBtn}><X size={24} /></button>
            </div>
            
            {errorMsg && (
              <div className="glass" style={{ padding: '1.2rem', margin: '1.5rem 0', borderRadius: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', color: '#ef4444', fontWeight: 700, fontSize: '0.95rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateEvent} style={styles.form}>
              <div className="responsive-2col" style={styles.grid2}>
                {/* Event Identity */}
                <div style={styles.formSection}>
                  <h3 style={styles.sectionTitle}>
                    <span style={styles.iconBadge}><Info size={18} /></span> Core Setup
                  </h3>
                  <input placeholder="Event Title (e.g. Neo-Glow Gala)" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required style={styles.input} />
                  <textarea placeholder="Event Description" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} required style={{...styles.input, minHeight: '80px'}} />
                  <input placeholder="Venue Name (e.g. Nexus Arena)" value={newEvent.venue_name} onChange={e => setNewEvent({...newEvent, venue_name: e.target.value})} required style={styles.input} />
                  <textarea placeholder="Venue Complete Address" value={newEvent.venue_address} onChange={e => setNewEvent({...newEvent, venue_address: e.target.value})} required style={{...styles.input, minHeight: '60px'}} />
                  <div className="responsive-2col" style={styles.grid2}>
                    <select 
                      value={newEvent.country} 
                      onChange={e => setNewEvent({...newEvent, country: e.target.value})} 
                      required 
                      style={{ ...styles.input, width: '100%', cursor: 'pointer', backgroundColor: 'var(--surface)' }}
                    >
                      <option value="" disabled style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}>Select Country</option>
                      {getNames().map(name => (
                        <option key={name} value={name} style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}>{name}</option>
                      ))}
                    </select>
                    <input placeholder="State / County" value={newEvent.state_or_county} onChange={e => setNewEvent({...newEvent, state_or_county: e.target.value})} required style={styles.input} />
                  </div>
                </div>

                {/* Scheduling and Capacity */}
                <div style={styles.formSection}>
                  <h3 style={styles.sectionTitle}>
                    <span style={styles.iconBadge}><Calendar size={18} /></span> Scheduling & Volume
                  </h3>
                  <div className="responsive-2col" style={styles.grid2}>
                    <div>
                      <label style={styles.label}>Start Date & Time</label>
                      <input type="datetime-local" value={newEvent.start_date} onChange={e => setNewEvent({...newEvent, start_date: e.target.value})} required style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.label}>End Date & Time</label>
                      <input type="datetime-local" value={newEvent.end_date} onChange={e => setNewEvent({...newEvent, end_date: e.target.value})} required style={styles.input} />
                    </div>
                  </div>

                  <div className="responsive-3col" style={{ gap: '1.5rem' }}>
                    <div>
                      <label style={styles.label}>Number of Days</label>
                      <input type="number" min="1" value={newEvent.number_of_days} onChange={e => setNewEvent({...newEvent, number_of_days: parseInt(e.target.value) || 1})} required style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.label}>Max Capacity</label>
                      <input 
                        type="number" 
                        min="1" 
                        placeholder="e.g. 500" 
                        value={newEvent.max_participants} 
                        onChange={e => setNewEvent({...newEvent, max_participants: parseInt(e.target.value) || 100})} 
                        required 
                        style={{ 
                          ...styles.input, 
                          borderColor: capacityExceeded ? '#ef4444' : 'var(--glass-border)',
                          boxShadow: capacityExceeded ? '0 0 10px rgba(239, 68, 68, 0.25)' : 'none',
                          transition: 'all 0.3s ease'
                        }} 
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Event Currency</label>
                      <select 
                        value={newEvent.currency} 
                        onChange={e => setNewEvent({...newEvent, currency: e.target.value})} 
                        required 
                        style={{ ...styles.input, width: '100%', cursor: 'pointer', backgroundColor: 'var(--surface)' }}
                      >
                        <option value="USD" style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}>USD ($)</option>
                        <option value="NGN" style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}>NGN (₦)</option>
                        <option value="EUR" style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}>EUR (€)</option>
                        <option value="GBP" style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}>GBP (£)</option>
                        <option value="CAD" style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}>CAD (CA$)</option>
                      </select>
                    </div>
                  </div>

                  <div className="responsive-2col" style={styles.grid2}>
                    <div>
                      <label style={styles.label}>Registration Open Date</label>
                      <input type="datetime-local" value={newEvent.registration_start} onChange={e => setNewEvent({...newEvent, registration_start: e.target.value})} required style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.label}>Registration Deadline</label>
                      <input type="datetime-local" value={newEvent.registration_deadline} onChange={e => setNewEvent({...newEvent, registration_deadline: e.target.value})} required style={styles.input} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphics Upload */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>
                  <span style={styles.iconBadge}><ImageIcon size={18} /></span> Event Graphics
                </h3>
                <div className="responsive-3col" style={styles.grid3}>
                  <div>
                    <label style={styles.label}>Landscape Banner (16:9)</label>
                    <input type="file" accept="image/*" onChange={e => setBannerImage(e.target.files[0])} required style={{ ...styles.input, width: '100%' }} />
                  </div>
                  <div>
                    <label style={styles.label}>Portrait Flyer (Public Screens)</label>
                    <input type="file" accept="image/*" onChange={e => setBannerPortrait(e.target.files[0])} required style={{ ...styles.input, width: '100%' }} />
                  </div>
                  <div>
                    <label style={styles.label}>Promo Video (Optional)</label>
                    <input type="file" accept="video/*" onChange={e => setBannerVideo(e.target.files[0])} style={{ ...styles.input, width: '100%' }} />
                  </div>
                </div>
              </div>

              {/* Ticket Categories Builder */}
              <div style={styles.formSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={styles.sectionTitle}>
                    <span style={styles.iconBadge}><Ticket size={18} /></span> Ticket Categories
                  </h3>
                  <button 
                    type="button" 
                    onClick={handleAddTicketType} 
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px', 
                      fontSize: '0.85rem', 
                      fontWeight: 800,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: 'rgba(255, 177, 115, 0.12)', 
                      border: '1px solid var(--primary)', 
                      color: 'var(--primary)',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    + Add Category
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {/* Category Headers */}
                  <div className="hide-on-mobile" style={{ ...styles.ticketBuilderRow, backgroundColor: 'transparent', border: '1px solid transparent', paddingBottom: 0, paddingTop: 0, marginBottom: '-0.5rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    <div style={{ flex: 2, paddingLeft: '19px' }}>Category Name</div>
                    <div style={{ flex: 1, paddingLeft: '19px' }}>Price ({newEvent.currency === 'NGN' ? '₦' : newEvent.currency === 'EUR' ? '€' : newEvent.currency === 'GBP' ? '£' : newEvent.currency === 'CAD' ? 'CA$' : '$'})</div>
                    <div style={{ flex: 1, paddingLeft: '19px' }}>Capacity</div>
                    <div style={{ flex: 3, paddingLeft: '19px' }}>Description</div>
                    {ticketTypes.length > 1 && <div style={{ width: '34px' }}></div>}
                  </div>

                  {ticketTypes.map((t, idx) => (
                    <div key={idx} className="responsive-builder-row" style={styles.ticketBuilderRow}>
                      <input placeholder="Category (e.g. VIP, Early Bird)" value={t.name} onChange={e => handleTicketTypeChange(idx, 'name', e.target.value)} required style={{...styles.input, flex: 2}} />
                      <input type="number" min="0" step="0.01" placeholder="Price" value={t.price} onChange={e => handleTicketTypeChange(idx, 'price', e.target.value)} required style={{...styles.input, flex: 1}} />
                      <input type="number" min="1" placeholder="Capacity" value={t.quantity} onChange={e => handleTicketTypeChange(idx, 'quantity', parseInt(e.target.value) || 0)} required style={{...styles.input, flex: 1}} />
                      <input placeholder="Description" value={t.description} onChange={e => handleTicketTypeChange(idx, 'description', e.target.value)} style={{...styles.input, flex: 3}} />
                      {ticketTypes.length > 1 && (
                        <button type="button" onClick={() => handleRemoveTicketType(idx)} style={styles.deleteTicketBtn}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Dynamic Capacity Allocation Status Panel */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1.2rem 2rem', 
                    borderRadius: '20px', 
                    background: capacityExceeded ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 177, 115, 0.05)', 
                    border: capacityExceeded ? '1px solid #ef4444' : '1px solid var(--glass-border)',
                    marginTop: '1.5rem',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Allocation Status
                    </span>
                    <span style={{ 
                      fontSize: '1rem', 
                      fontWeight: 900, 
                      color: capacityExceeded ? '#ef4444' : 'var(--primary)',
                      textShadow: capacityExceeded ? '0 0 10px rgba(239, 68, 68, 0.15)' : 'none'
                    }}>
                      {currentTotalCapacity} / {maxCapacityVal} Tickets Allocated 
                      {capacityExceeded && ' (Exceeds Max Capacity!)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Services & Vendors Builder */}
              <div style={styles.formSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={styles.sectionTitle}>
                    <span style={styles.iconBadge}><Users size={18} /></span> Services & Vendors
                  </h3>
                  <button 
                    type="button" 
                    onClick={handleAddVendor} 
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '10px', cursor: 'pointer', background: 'rgba(255, 177, 115, 0.12)', border: '1px solid var(--primary)', color: 'var(--primary)', transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    + Add Vendor
                  </button>
                </div>
                
                {eventVendors.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div className="hide-on-mobile" style={{ ...styles.ticketBuilderRow, backgroundColor: 'transparent', border: '1px solid transparent', paddingBottom: 0, paddingTop: 0, marginBottom: '-0.5rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                      <div style={{ flex: 1.5, paddingLeft: '19px' }}>Service Type</div>
                      <div style={{ flex: 2, paddingLeft: '19px' }}>Vendor Name</div>
                      <div style={{ flex: 2, paddingLeft: '19px' }}>Vendor Email</div>
                      <div style={{ flex: 1.5, paddingLeft: '19px' }}>Vendor Phone</div>
                      <div style={{ width: '34px' }}></div>
                    </div>

                    {eventVendors.map((v, idx) => (
                      <div key={`vendor-${idx}`} style={{...styles.ticketBuilderRow, flexDirection: 'column', alignItems: 'stretch', gap: '0.8rem'}}>
                        <div className="responsive-builder-row" style={{ gap: '1rem', alignItems: 'center' }}>
                          <select value={v.role} onChange={e => handleVendorChange(idx, 'role', e.target.value)} required style={{...styles.input, flex: 1.5, backgroundColor: 'var(--bg-color)', cursor: 'pointer'}}>
                            {vendorTypes.map(vt => (
                              <option key={vt} value={vt}>{vt.replace('_', ' ')}</option>
                            ))}
                            <option value="OTHER">Others (Specify)</option>
                          </select>
                          <input placeholder="Vendor Name" value={v.vendor_name} onChange={e => handleVendorChange(idx, 'vendor_name', e.target.value)} required style={{...styles.input, flex: 2}} />
                          <input type="email" placeholder="Email Address" value={v.vendor_email} onChange={e => handleVendorChange(idx, 'vendor_email', e.target.value)} required style={{...styles.input, flex: 2}} />
                          <input type="tel" placeholder="Phone" value={v.vendor_phone} onChange={e => handleVendorChange(idx, 'vendor_phone', e.target.value)} style={{...styles.input, flex: 1.5}} />
                          
                          <button type="button" onClick={() => handleRemoveVendor(idx)} style={styles.deleteTicketBtn}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {v.role === 'OTHER' && (
                          <div style={{ paddingLeft: '0' }}>
                            <input placeholder="Specify Custom Service Type (e.g. DJ)" value={v.custom_role || ''} onChange={e => handleVendorChange(idx, 'custom_role', e.target.value)} required style={{...styles.input, width: '40%'}} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCreate(false)} 
                  style={{ 
                    ...styles.addBtn, 
                    padding: '15px 30px', 
                    background: 'var(--surface-tint)', 
                    border: '1px solid var(--glass-border)', 
                    color: 'var(--on-surface)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary" style={{ ...styles.submitBtn, padding: '15px 40px' }}>
                  {creating ? <Loader2 className="animate-spin" size={20} /> : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <div style={styles.list}>
        {events.map(ev => (
          <div key={ev.id} className="glass hover-card" style={styles.listItem}>
            <div style={styles.imageWrapper}>
              <img src={ev.banner_image || '/placeholder.jpg'} alt="" style={styles.bannerImg} />
              <div style={styles.dayBadge}>
                {ev.number_of_days || 1} {ev.number_of_days === 1 ? 'DAY' : 'DAYS'}
              </div>
            </div>
            
            <div style={styles.itemContent}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.8rem' }}>{ev.title}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--primary)" /> {ev.venue_name || ev.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="var(--primary)" /> {new Date(ev.start_date).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  <Users size={16} /> Registered: {ev.registered_count || 0} participants
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                <Link to={`/organizer/event/${ev.id}`} className="btn-primary" style={{ ...styles.actionBtn, flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Eye size={18} /> Manage Event
                </Link>
                <button
                  onClick={() => setDeleteTarget({ id: ev.id, title: ev.title })}
                  style={{
                    ...styles.actionBtn,
                    flex: 'none',
                    padding: '12px 16px',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    borderRadius: '12px', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  title="Delete event"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="glass" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>No active events created yet.</p>
          </div>
        )}
      </div>
    </div>

      {/* ── Delete Confirmation Modal ─────────────────── */}
      {deleteTarget && (
        <div style={styles.modalOverlay}>
          <div className="glass" style={{
            width: '100%', maxWidth: '480px', borderRadius: '28px',
            padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
            border: '1px solid rgba(239,68,68,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trash2 size={22} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.2rem' }}>Delete Event</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>This action cannot be undone</p>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
              Are you sure you want to permanently delete{' '}
              <span style={{ color: 'var(--on-surface)', fontWeight: 800 }}>"{deleteTarget.title}"</span>?
              All associated tickets, registrations, and vendor assignments will also be removed.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{
                  padding: '12px 24px', borderRadius: '12px', fontWeight: 800,
                  fontSize: '0.9rem', cursor: 'pointer',
                  background: 'var(--surface-tint)', border: '1px solid var(--glass-border)',
                  color: 'var(--on-surface)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={deleting}
                style={{
                  padding: '12px 28px', borderRadius: '12px', fontWeight: 900,
                  fontSize: '0.9rem', cursor: deleting ? 'not-allowed' : 'pointer',
                  background: '#ef4444', border: 'none', color: '#fff',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  opacity: deleting ? 0.7 : 1, transition: 'all 0.2s ease',
                }}
              >
                {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
  </> );
};

const styles = {
  container: { padding: 'clamp(1.5rem, 6vw, 4rem) clamp(1.2rem, 6vw, 6rem)', maxWidth: '1400px', margin: '0 auto', color: 'var(--on-surface)' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  header: { justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', gap: '1.5rem' },
  title: { fontSize: '2.5rem' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer', border: 'none' },
  list: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(400px, 100%), 1fr))', gap: '3rem' },
  listItem: { borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' },
  imageWrapper: { height: '240px', width: '100%', position: 'relative' },
  bannerImg: { width: '100%', height: '100%', objectFit: 'cover' },
  dayBadge: { position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--primary)', color: 'var(--on-primary)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px' },
  itemContent: { padding: '2.5rem', display: 'flex', flexDirection: 'column', flex: 1 },
  actionBtn: { flex: 1, padding: '12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', border: 'none', textAlign: 'center' },
  modalOverlay: { position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflowY: 'auto', padding: 'clamp(1rem, 4vw, 2rem) 0' },
  modalContent: { width: '90%', maxWidth: '1350px', borderRadius: '40px', padding: 'clamp(1.5rem, 5vw, 3.5rem)', overflowY: 'auto', maxHeight: '90vh' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' },
  closeBtn: { background: 'transparent', border: 'none', color: 'var(--on-surface)', cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  formSection: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  grid2: { gap: '2rem' },
  grid3: { gap: '2rem' },
  input: { padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', fontSize: '1rem', outline: 'none', fontWeight: 600 },
  label: { fontSize: '0.8rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem', display: 'block' },
  ticketBuilderRow: { padding: '1.2rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--surface-tint)', border: '1px solid var(--glass-border)' },
  deleteTicketBtn: { background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' },
  submitBtn: { borderRadius: '16px', fontSize: '1rem', fontWeight: 900, cursor: 'pointer' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.25rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '0.5rem' },
  iconBadge: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 177, 115, 0.1)', border: '1px solid rgba(255, 177, 115, 0.25)', color: 'var(--primary)' }
};

export default OwnerDashboard;
