import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Camera, Mail, Plus, Loader2, ArrowLeft, CheckCircle, Clock, 
  ShieldCheck, UserPlus, Info, Calendar, MapPin, Search, Ticket, 
  DollarSign, Check, X, FileText, Group, User, Briefcase, Edit, Trash2, Save
} from 'lucide-react';
import api from '../api/axios';

const getCurrencySymbol = (code) => {
  switch (code) {
    case 'NGN': return '₦';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'CAD': return 'CA$';
    default: return '$';
  }
};

const OrganizerEventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regsLoading, setRegsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('participants'); // 'participants' or 'vendors'
  
  // Vendor Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('PHOTOGRAPHER');
  const [inviting, setInviting] = useState(false);
  const [invitationError, setInvitationError] = useState('');

  // Search registrations
  const [searchQuery, setSearchQuery] = useState('');

  // Edit event state
  const [editForm, setEditForm] = useState(null);
  const [editTickets, setEditTickets] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchEventData();
    fetchRegistrations();
  }, [eventId]);

  const initEditForm = (ev) => {
    setEditForm({
      title: ev.title || '',
      description: ev.description || '',
      venue_name: ev.venue_name || '',
      venue_address: ev.venue_address || '',
      country: ev.country || '',
      state_or_county: ev.state_or_county || '',
      start_date: ev.start_date ? ev.start_date.slice(0,16) : '',
      end_date: ev.end_date ? ev.end_date.slice(0,16) : '',
      registration_deadline: ev.registration_deadline ? ev.registration_deadline.slice(0,16) : '',
      max_participants: ev.max_participants || 100,
      currency: ev.currency || 'USD',
    });
    setEditTickets((ev.ticket_types || []).map(t => ({ ...t, _dirty: false })));
  };

  const fetchEventData = async () => {
    try {
      const response = await api.get(`/events/${eventId}/`);
      setEvent(response.data);
      initEditForm(response.data);
    } catch (err) {
      console.error('Failed to fetch event data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    setRegsLoading(true);
    try {
      const response = await api.get(`/events/${eventId}/registrations/`);
      setRegistrations(response.data.results || response.data || []);
    } catch (err) {
      console.error('Failed to fetch registrations', err);
    } finally {
      setRegsLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setInvitationError('');
    try {
      await api.post(`/events/${eventId}/vendors/invite/`, {
        vendor_email: inviteEmail,
        vendor_name: inviteName,
        role: inviteRole
      });
      setInviteEmail('');
      setInviteName('');
      setInviteRole('PHOTOGRAPHER');
      // Refresh event details
      fetchEventData();
    } catch (err) {
      const errorMsg = err.response?.data?.vendor_email?.[0] || 
                       err.response?.data?.vendor_name?.[0] || 
                       err.response?.data?.role?.[0] ||
                       err.response?.data?.non_field_errors?.[0] ||
                       err.response?.data?.[0] ||
                       err.response?.data?.detail ||
                       'Failed to send invite. Verify email is a valid vendor.';
      setInvitationError(errorMsg);
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

  // Ticket editing helpers
  const handleTicketChange = (idx, field, val) => {
    const updated = [...editTickets];
    updated[idx] = { ...updated[idx], [field]: val, _dirty: true };
    setEditTickets(updated);
  };

  const addTicket = () => {
    setEditTickets([...editTickets, { id: null, name: '', description: '', price: '0.00', quantity: 50, _dirty: true, _new: true }]);
  };

  const removeTicket = (idx) => {
    setEditTickets(editTickets.filter((_, i) => i !== idx));
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg(''); setSaveError('');
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([k, v]) => formData.append(k, v));
      formData.append('ticket_types', JSON.stringify(
        editTickets.map(({ _dirty, _new, ...t }) => t)
      ));
      await api.patch(`/events/${eventId}/update/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSaveMsg('Event updated successfully!');
      fetchEventData();
    } catch (err) {
      const d = err.response?.data;
      setSaveError(d?.detail || JSON.stringify(d) || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const query = searchQuery.toLowerCase();
    const name = (r.attendee_name_display || '').toLowerCase();
    const email = (r.attendee_email_display || '').toLowerCase();
    const ticket = (r.ticket_type_name || '').toLowerCase();
    const group = (r.group_name || '').toLowerCase();
    return name.includes(query) || email.includes(query) || ticket.includes(query) || group.includes(query);
  });

  // Stats calculation
  const totalRevenue = registrations.reduce((sum, r) => sum + parseFloat(r.ticket_type_price || 0), 0);
  const checkedInCount = registrations.filter(r => r.checked_in).length;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;
  if (!event) return <div style={{ textAlign: 'center', padding: '10rem' }}>Event not found.</div>;

  return (
    <div className="organizer-event-details" style={{ padding: '4rem 6rem', maxWidth: '1400px', margin: '0 auto', color: 'var(--on-surface)' }}>
      <header style={{ marginBottom: '3rem' }}>
        <Link to="/owner/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> BACK TO MANAGEMENT
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Event Management</span>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-1px', marginTop: '0.2rem' }}>{event.title}</h1>
          </div>
          <div className="glass" style={{ padding: '0.6rem 1.4rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontWeight: 800, border: '1px solid var(--primary)', fontSize: '0.85rem' }}>
            <ShieldCheck size={18} /> OWNER ACCESS
          </div>
        </div>
      </header>

      {/* High tech stats block */}
      <div style={styles.statsRow}>
        <div className="glass" style={styles.statCard}>
          <div style={styles.statHeader}>
            <Ticket size={24} color="var(--primary)" />
            <span>Tickets Sold</span>
          </div>
          <div style={styles.statVal}>{event.registered_count || 0} / {event.max_participants || 100}</div>
          <div style={styles.statBarBg}>
            <div style={{ ...styles.statBarFill, width: `${Math.min(((event.registered_count || 0) / (event.max_participants || 100)) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="glass" style={styles.statCard}>
          <div style={styles.statHeader}>
            <CheckCircle size={24} color="var(--primary)" />
            <span>Checked In</span>
          </div>
          <div style={styles.statVal}>{checkedInCount}</div>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>
            {event.registered_count ? `${Math.round((checkedInCount / event.registered_count) * 100)}% of total arrivals` : 'No participants registered'}
          </p>
        </div>

        <div className="glass" style={styles.statCard}>
          <div style={styles.statHeader}>
            <DollarSign size={24} color="var(--primary)" />
            <span>Revenue Generated</span>
          </div>
          <div style={styles.statVal}>{getCurrencySymbol(event?.currency)}{totalRevenue.toFixed(2)}</div>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>Gross sales from registrations</p>
        </div>
      </div>

      {/* Tabs switching */}
      <div style={styles.tabs}>
        {[['participants', `Participants (${registrations.length})`], ['vendors', `Vendors (${(event.event_photographers||[]).length})`], ['edit', 'Edit Event']].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'btn-primary' : 'glass'}
            style={{
              ...styles.tabBtn,
              background: activeTab === tab ? 'linear-gradient(135deg,var(--primary),var(--primary-container))' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab ? '#080C14' : 'var(--on-surface-variant)',
              border: activeTab === tab ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
              boxShadow: activeTab === tab ? '0 0 15px rgba(255,177,115,0.3)' : 'none',
            }}
          >{label}</button>
        ))}
      </div>

      {/* Display Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '4rem', alignItems: 'flex-start' }}>
        
        {/* Main section */}
        <div>
          {activeTab === 'participants' && (
            <div className="glass" style={{ padding: '3rem', borderRadius: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-0.5px' }}>Registered Attendees</h2>
                
                <div className="glass" style={styles.searchWrapper}>
                  <Search size={18} color="var(--primary)" />
                  <input 
                    placeholder="Search name, email, group..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
              </div>

              {regsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={32} /></div>
              ) : filteredRegistrations.length === 0 ? (
                <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center', padding: '3rem 0', fontWeight: 600 }}>No participants found matching details.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Attendee</th>
                        <th style={styles.th}>Ticket Type</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Group / Group Code</th>
                        <th style={styles.th}>Check-In Status</th>
                        <th style={styles.th}>Date Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map(r => (
                        <tr key={r.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 'bold' }}>{r.attendee_name_display}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{r.attendee_email_display}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.ticketBadge}>{r.ticket_type_name || 'Regular'}</span>
                          </td>
                          <td style={styles.td}><span style={{ fontWeight: 800 }}>{getCurrencySymbol(event?.currency)}{parseFloat(r.ticket_type_price || 0).toFixed(2)}</span></td>
                          <td style={styles.td}>
                            {r.group_name ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <span style={styles.groupBadge}><Group size={12} /> {r.group_name}</span>
                                <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>Code: {r.group_code?.slice(0,8)}</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Individual Ticket</span>
                            )}
                          </td>
                          <td style={styles.td}>
                            {r.checked_in ? (
                              <span style={{ ...styles.statusBadge, color: '#22c55e', background: 'rgba(34,197,94,0.1)' }}>
                                <Check size={12} /> Checked In
                              </span>
                            ) : (
                              <span style={{ ...styles.statusBadge, color: 'var(--primary)', background: 'rgba(255,177,115,0.1)' }}>
                                <Clock size={12} /> Confirmed
                              </span>
                            )}
                          </td>
                          <td style={{ ...styles.td, fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                            {new Date(r.registered_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'edit' && editForm && (
            <div className="glass" style={{ padding: '3rem', borderRadius: '32px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-0.5px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Edit size={24} color="var(--primary)" /> Edit Event
              </h2>
              {saveMsg && <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontWeight: 700, marginBottom: '1.5rem' }}>{saveMsg}</div>}
              {saveError && <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontWeight: 700, marginBottom: '1.5rem' }}>{saveError}</div>}
              <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {[['title','Title','text'],['venue_name','Venue Name','text'],['venue_address','Venue Address','text'],['country','Country','text'],['state_or_county','State / County','text'],['max_participants','Max Participants','number'],['currency','Currency','text']].map(([field, label, type]) => (
                    <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={styles.editLabel}>{label}</label>
                      <input type={type} value={editForm[field] || ''} onChange={e => setEditForm({...editForm, [field]: e.target.value})} style={styles.editInput} />
                    </div>
                  ))}
                  {[['start_date','Start Date'],['end_date','End Date'],['registration_deadline','Registration Deadline']].map(([field, label]) => (
                    <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={styles.editLabel}>{label}</label>
                      <input type="datetime-local" value={editForm[field] || ''} onChange={e => setEditForm({...editForm, [field]: e.target.value})} style={styles.editInput} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={styles.editLabel}>Description</label>
                  <textarea rows={4} value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ ...styles.editInput, resize: 'vertical' }} />
                </div>

                {/* Ticket Categories */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ ...styles.editLabel, fontSize: '1rem' }}>Ticket Categories</label>
                    <button type="button" onClick={addTicket} className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>
                      <Plus size={14} /> Add Ticket
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {editTickets.map((t, idx) => (
                      <div key={idx} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
                        <input placeholder="Name" value={t.name} onChange={e => handleTicketChange(idx,'name',e.target.value)} style={styles.editInput} />
                        <input placeholder="Description" value={t.description} onChange={e => handleTicketChange(idx,'description',e.target.value)} style={styles.editInput} />
                        <input type="number" placeholder="Price" value={t.price} onChange={e => handleTicketChange(idx,'price',e.target.value)} style={styles.editInput} />
                        <input type="number" placeholder="Qty" value={t.quantity} onChange={e => handleTicketChange(idx,'quantity',e.target.value)} style={styles.editInput} />
                        <button type="button" onClick={() => removeTicket(idx)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    ))}
                    {editTickets.length === 0 && <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No ticket categories. Add one above.</p>}
                  </div>
                </div>

                <button type="submit" disabled={saving} className="btn-primary" style={{ height: '56px', borderRadius: '14px', fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginTop: '0.5rem' }}>
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Changes</>}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="glass" style={{ padding: '3rem', borderRadius: '32px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-0.5px', marginBottom: '2rem' }}>Assigned Photographers & Planners</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(event.event_photographers || []).length === 0 ? (
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', textAlign: 'center', padding: '2rem 0' }}>No photographers assigned yet.</p>
                ) : (
                  (event.event_photographers || []).map(p => (
                    <div key={p.id} className="glass" style={styles.vendorCard}>
                       <div>
                         <div style={{ fontWeight: 800, fontSize: '1rem' }}>{p.photographer_name || p.email}</div>
                         <div style={{ fontSize: '0.75rem', color: p.invitation_sent ? '#22c55e' : 'var(--on-surface-variant)', fontWeight: 850 }}>
                           {p.invitation_sent ? 'ASSIGNED & ACTIVE' : 'PENDING ACCEPTANCE'}
                         </div>
                       </div>
                       <div style={{ color: 'var(--primary)' }}>
                         {p.photographer_name ? <CheckCircle size={18} /> : <Clock size={18} />}
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar details */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* Quick invite block */}
          {activeTab === 'vendors' && (
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '28px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <UserPlus size={18} color="var(--primary)" /> INVITE VENDOR
              </h4>
              <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ position: 'relative' }}>
                   <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                   <input 
                     type="text" 
                     placeholder="Enter vendor name..." 
                     value={inviteName}
                     onChange={(e) => setInviteName(e.target.value)}
                     required
                     style={styles.asideInput}
                   />
                </div>
                <div style={{ position: 'relative' }}>
                   <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                   <input 
                     type="email" 
                     placeholder="Enter vendor email..." 
                     value={inviteEmail}
                     onChange={(e) => setInviteEmail(e.target.value)}
                     required
                     style={styles.asideInput}
                   />
                </div>
                <div style={{ position: 'relative' }}>
                   <select 
                     value={inviteRole}
                     onChange={(e) => setInviteRole(e.target.value)}
                     required
                     style={{
                       ...styles.asideInput,
                       width: '100%',
                       appearance: 'none',
                       background: 'var(--surface-highest, rgba(255,255,255,0.06))',
                       color: 'var(--on-surface)',
                       cursor: 'pointer',
                       border: '1px solid var(--glass-border)',
                       outline: 'none',
                       paddingLeft: '2.8rem'
                     }}
                   >
                     <option value="PHOTOGRAPHER" style={{ background: 'var(--surface-highest, #1a1a1a)', color: 'var(--on-surface)' }}>Photographer</option>
                     <option value="VIDEOGRAPHER" style={{ background: 'var(--surface-highest, #1a1a1a)', color: 'var(--on-surface)' }}>Videographer</option>
                   </select>
                   <Briefcase size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }} />
                </div>
                {invitationError && <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700 }}>{invitationError}</div>}
                <button 
                  disabled={inviting}
                  className="btn-primary" 
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem' }}
                >
                  {inviting ? 'SENDING...' : 'DISPATCH INVITE'}
                </button>
              </form>
            </div>
          )}

          {/* Event profile sidebar */}
          <div className="glass" style={{ borderRadius: '28px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid var(--glass-border)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Landscape Banner (16:9)</div>
                <div style={{ height: '140px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <img src={event.banner_image || '/placeholder.jpg'} alt="Landscape Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Portrait Flyer (Public Display)</div>
                <div style={{ height: '240px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
                  <img src={event.banner_portrait || '/placeholder.jpg'} alt="Portrait Flyer" style={{ height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                 <Info size={16} color="var(--primary)" /> About Session
              </h4>
              <p style={{ color: 'var(--on-surface)', lineHeight: '1.6', fontSize: '0.95rem' }}>{event.description}</p>
              
              <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem' }}>
                <Calendar size={18} color="var(--primary)" /> 
                <span>{new Date(event.start_date).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem' }}>
                <MapPin size={18} color="var(--primary)" /> 
                <span>{event.venue_name || event.location}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const styles = {
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2.5rem', marginBottom: '4rem' },
  statCard: { padding: '2.5rem', borderRadius: '24px', position: 'relative' },
  statHeader: { display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' },
  statVal: { fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1px' },
  statBarBg: { height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', marginTop: '1.5rem', overflow: 'hidden' },
  statBarFill: { height: '100%', background: 'var(--primary)', borderRadius: '10px' },
  tabs: { display: 'flex', gap: '1.5rem', marginBottom: '3rem' },
  tabBtn: { padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', border: 'none' },
  searchWrapper: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0 1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' },
  searchInput: { border: 'none', background: 'transparent', padding: '10px', fontSize: '0.9rem', color: 'var(--on-surface)', outline: 'none', fontWeight: 600, width: '220px' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1.2rem', borderBottom: '2px solid var(--glass-border)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' },
  tr: { borderBottom: '1px solid var(--glass-border)' },
  td: { padding: '1.4rem 1.2rem', verticalAlign: 'middle' },
  ticketBadge: { background: 'var(--primary)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 900 },
  groupBadge: { background: 'rgba(0,0,0,0.06)', color: 'var(--on-surface)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 900 },
  vendorCard: { padding: '1.4rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 177, 115, 0.03)', border: '1px solid var(--glass-border)' },
  asideInput: { width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', background: 'var(--surface-highest)', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 600, fontSize: '0.9rem', outline: 'none' },
  editInput: { padding: '0.9rem 1rem', borderRadius: '10px', background: 'var(--surface-highest)', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 600, fontSize: '0.9rem', outline: 'none', width: '100%' },
  editLabel: { fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }
};

export default OrganizerEventDetails;
