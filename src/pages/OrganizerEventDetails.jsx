import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Camera, Mail, Plus, Loader2, ArrowLeft, CheckCircle, Clock,
  ShieldCheck, UserPlus, Info, Calendar, MapPin, Search, Ticket,
  DollarSign, Check, X, FileText, Group, User, Briefcase, Edit, Trash2, Save,
  Image, Download, Filter
} from 'lucide-react';
import api from '../api/axios';
import { eventService } from '../api/event';
import { vendorService } from '../api/vendor';

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

  const [vendorTypes, setVendorTypes] = useState([]);

  // Vendor Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState('PHOTOGRAPHER');
  const [customInviteRole, setCustomInviteRole] = useState('');
  const [inviting, setInviting] = useState(false);
  const [invitationError, setInvitationError] = useState('');

  // Search and Filter registrations
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInFilter, setCheckInFilter] = useState('ALL');
  const [checkedInDateFilter, setCheckedInDateFilter] = useState('ALL');
  const [selectedHistoryUser, setSelectedHistoryUser] = useState(null);
  const [expandedVendorId, setExpandedVendorId] = useState(null);

  // Admin Check-in Modal
  const [adminCheckInTarget, setAdminCheckInTarget] = useState(null);
  const [adminCheckInDate, setAdminCheckInDate] = useState('');

  // Expanded inline history rows
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

  // Gallery state
  const [galleryData, setGalleryData] = useState({ photos: [], photographers: [], total: 0 });
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryPhotographer, setGalleryPhotographer] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  // Edit event state
  const [editForm, setEditForm] = useState(null);
  const [editTickets, setEditTickets] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchEventData();
    fetchRegistrations();
    fetchVendorTypes();
  }, [eventId]);

  useEffect(() => {
    if (activeTab === 'gallery') fetchOwnerGallery(galleryPhotographer);
  }, [activeTab]);

  const fetchVendorTypes = async () => {
    try {
      const res = await vendorService.getVendorTypes();
      setVendorTypes(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOwnerGallery = async (photographerId = '') => {
    setGalleryLoading(true);
    try {
      const params = photographerId ? `?photographer=${photographerId}` : '';
      const res = await api.get(`/photos/events/${eventId}/owner-gallery/${params}`);
      setGalleryData(res.data);
    } catch (err) {
      console.error('Failed to load gallery', err);
    } finally {
      setGalleryLoading(false);
    }
  };

  const initEditForm = (ev) => {
    setEditForm({
      title: ev.title || '',
      description: ev.description || '',
      venue_name: ev.venue_name || '',
      venue_address: ev.venue_address || '',
      country: ev.country || '',
      state_or_county: ev.state_or_county || '',
      start_date: ev.start_date ? ev.start_date.slice(0, 16) : '',
      end_date: ev.end_date ? ev.end_date.slice(0, 16) : '',
      registration_start: ev.registration_start ? ev.registration_start.slice(0, 16) : '',
      registration_deadline: ev.registration_deadline ? ev.registration_deadline.slice(0, 16) : '',
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
      const data = response.data;
      // Handle both paginated and non-paginated responses
      const list = Array.isArray(data) ? data : (data.results || []);
      setRegistrations(list);
    } catch (err) {
      console.error('Failed to fetch registrations', err.response?.status, err.response?.data);
    } finally {
      setRegsLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setInvitationError('');
    try {
      let finalRole = inviteRole;
      if (inviteRole === 'OTHER' && customInviteRole) {
        finalRole = customInviteRole;
      }
      await api.post(`/events/${eventId}/vendors/invite/`, {
        vendor_email: inviteEmail,
        vendor_name: inviteName,
        vendor_phone: invitePhone,
        role: finalRole
      });
      setInviteEmail('');
      setInviteName('');
      setInvitePhone('');
      setInviteRole('PHOTOGRAPHER');
      setCustomInviteRole('');
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
      // Upload new graphics via presigned URLs if provided
      const filesToUpload = [];
      if (editForm.banner_image_file) {
        filesToUpload.push({ file_name: editForm.banner_image_file.name, file_type: editForm.banner_image_file.type, fileObj: editForm.banner_image_file, key: 'banner_image' });
      }
      if (editForm.banner_portrait_file) {
        filesToUpload.push({ file_name: editForm.banner_portrait_file.name, file_type: editForm.banner_portrait_file.type, fileObj: editForm.banner_portrait_file, key: 'banner_portrait' });
      }
      if (editForm.banner_video_file) {
        filesToUpload.push({ file_name: editForm.banner_video_file.name, file_type: editForm.banner_video_file.type, fileObj: editForm.banner_video_file, key: 'banner_video' });
      }

      const uploadedUrls = {};
      if (filesToUpload.length > 0) {
        const presignedRes = await eventService.generatePresignedUrl({
          files: filesToUpload.map(f => ({ file_name: f.file_name, file_type: f.file_type }))
        });
        const presignedUrls = presignedRes.data.urls;
        for (const fileItem of filesToUpload) {
          const presignedInfo = presignedUrls.find(p => p.original_name === fileItem.file_name);
          if (!presignedInfo) throw new Error(`Failed to get upload signature for ${fileItem.file_name}`);
          await fetch(presignedInfo.presigned_url, {
            method: 'PUT',
            body: fileItem.fileObj,
            headers: { 'Content-Type': fileItem.file_type }
          });
          uploadedUrls[fileItem.key] = presignedInfo.full_url;
        }
      }

      const formData = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (!['banner_image_file', 'banner_portrait_file', 'banner_video_file'].includes(k)) {
          formData.append(k, v);
        }
      });
      if (uploadedUrls.banner_image) formData.append('banner_image', uploadedUrls.banner_image);
      if (uploadedUrls.banner_portrait) formData.append('banner_portrait', uploadedUrls.banner_portrait);
      if (uploadedUrls.banner_video) formData.append('banner_video', uploadedUrls.banner_video);

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

  const handleAdminCheckIn = async (e) => {
    e.preventDefault();
    if (!adminCheckInTarget || !adminCheckInDate) return;

    try {
      await api.post(`/check-in/${adminCheckInTarget.registration_code}/`, {
        device_id: 'admin',
        date: adminCheckInDate
      });
      // Refresh registrations
      setAdminCheckInTarget(null);
      fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to check in attendee.");
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    if (checkInFilter === 'CHECKED_IN' && !r.checked_in) return false;
    if (checkInFilter === 'NOT_CHECKED_IN' && r.checked_in) return false;

    const query = (searchQuery || '').toLowerCase();
    const name = (r.attendee_name_display || '').toLowerCase();
    const email = (r.attendee_email_display || '').toLowerCase();
    const ticket = (r.ticket_type_name || '').toLowerCase();
    const group = (r.group_name || '').toLowerCase();
    return name.includes(query) || email.includes(query) || ticket.includes(query) || group.includes(query);
  });

  const totalRevenue = registrations.reduce((sum, r) => sum + parseFloat(r.ticket_type_price || 0), 0);
  const registeredCount = registrations.length;
  const checkedInCount = registrations.filter(r => r.checked_in).length;
  const notCheckedInCount = registeredCount - checkedInCount;

  const getEventDaysList = () => {
    if (!event || !event.start_date) return [];
    const days = event.number_of_days || 1;
    const startDate = new Date(event.start_date);
    const dateList = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });

      dateList.push({
        value: dateString,
        label: `Day ${i + 1} (${dateString}, ${weekday})`
      });
    }
    return dateList;
  };

  const eventDays = getEventDaysList();

  // Given a YYYY-MM-DD date string, compute Day N, weekday, formatted date
  const getEventDayInfo = (checkinDateStr) => {
    if (!checkinDateStr || !event?.start_date) return null;
    const [sy, sm, sd] = event.start_date.substring(0, 10).split('-').map(Number);
    const [cy, cm, cd] = checkinDateStr.split('-').map(Number);
    const startUTC = Date.UTC(sy, sm - 1, sd);
    const ciUTC = Date.UTC(cy, cm - 1, cd);
    const dayNum = Math.floor((ciUTC - startUTC) / 86400000) + 1;
    const ciDate = new Date(cy, cm - 1, cd);
    const weekday = ciDate.toLocaleDateString(undefined, { weekday: 'long' });
    const dateStr = ciDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return { dayNum: Math.max(1, dayNum), weekday, dateStr };
  };

  // Given a registration, return event days not yet checked in
  const getRemainingDays = (r) => {
    const checkedDates = new Set((r.checkin_history || []).map(ch => ch.date));
    return eventDays.filter(d => !checkedDates.has(d.value));
  };

  const handleExport = async () => {
    try {
      const type = activeTab === 'participants' ? 'registrations' : 'daily_checkins';
      let endpoint = `/events/${eventId}/export/?type=${type}`;

      if (type === 'daily_checkins' && checkedInDateFilter !== 'ALL') {
        endpoint += `&date=${checkedInDateFilter}`;
      } else if (type === 'registrations' && checkInFilter !== 'ALL') {
        endpoint += `&status=${checkInFilter}`;
      }

      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${eventId}_${type}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export data.');
    }
  };

  const filteredCheckedInAttendees = registrations.filter(r => {
    if (!r.checked_in) return false;
    if (checkedInDateFilter !== 'ALL') {
      const hasCheckedInOnDate = (r.checkin_history || []).some(ch => ch.date === checkedInDateFilter);
      if (!hasCheckedInOnDate) return false;
    }

    const query = (searchQuery || '').toLowerCase();
    const name = (r.attendee_name_display || '').toLowerCase();
    const email = (r.attendee_email_display || '').toLowerCase();
    const ticket = (r.ticket_type_name || '').toLowerCase();
    return name.includes(query) || email.includes(query) || ticket.includes(query);
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;
  if (!event) return <div style={{ textAlign: 'center', padding: '10rem' }}>Event not found.</div>;

  return (
    <div className="organizer-event-details" style={{ padding: '2rem 3rem', maxWidth: '1600px', margin: '0 auto', color: 'var(--on-surface)' }}>
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
      <div style={{ ...styles.statsRow, gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
        <div className="glass" style={styles.statCard}>
          <div style={styles.statHeader}>
            <Ticket size={24} color="var(--primary)" />
            <span>Registered</span>
          </div>
          <div style={styles.statVal}>{registeredCount}</div>
          <div style={styles.statBarBg}>
            <div style={{ ...styles.statBarFill, width: `${Math.min((registeredCount / (event.max_participants || 100)) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="glass" style={styles.statCard}>
          <div style={styles.statHeader}>
            <CheckCircle size={24} color="var(--primary)" />
            <span>Checked In</span>
          </div>
          <div style={styles.statVal}>{checkedInCount}</div>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>
            {registeredCount ? `${Math.round((checkedInCount / registeredCount) * 100)}%` : '0%'}
          </p>
        </div>

        <div className="glass" style={styles.statCard}>
          <div style={styles.statHeader}>
            <Clock size={24} color="var(--primary)" />
            <span>Not Checked In</span>
          </div>
          <div style={styles.statVal}>{notCheckedInCount}</div>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>
            {registeredCount ? `${Math.round((notCheckedInCount / registeredCount) * 100)}%` : '0%'}
          </p>
        </div>

        <div className="glass" style={styles.statCard}>
          <div style={styles.statHeader}>
            <DollarSign size={24} color="var(--primary)" />
            <span>Revenue</span>
          </div>
          <div style={styles.statVal}>{getCurrencySymbol(event?.currency)}{totalRevenue.toFixed(2)}</div>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>Gross sales</p>
        </div>
      </div>

      <div style={styles.tabs}>
        {[
          ['participants', `Participants (${registrations.length})`],
          ['checked_in', `Checked In Attendee (${checkedInCount})`],
          ['vendors', `Vendors (${(event.vendors || []).length})`],
          ['edit', 'Edit Event'],
          ['gallery', `Gallery (${galleryData.total})`]
        ].map(([tab, label]) => (
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
        <div style={{ minWidth: 0 }}>
          {activeTab === 'participants' && (
            <div className="glass" style={{ padding: '3rem', borderRadius: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-0.5px' }}>Registered Attendees</h2>
                  <button onClick={handleExport} className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, border: '1px solid var(--primary)', color: 'var(--primary)', cursor: 'pointer' }}>
                    DOWNLOAD CSV
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <select
                    value={checkInFilter}
                    onChange={e => setCheckInFilter(e.target.value)}
                    style={{ ...styles.searchInput, border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'var(--surface-highest)' }}
                  >
                    <option value="ALL">All Registered</option>
                    <option value="CHECKED_IN">Checked In</option>
                    <option value="NOT_CHECKED_IN">Not Checked In</option>
                  </select>
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
                        <th style={styles.th}>Last Checked In</th>
                        {event?.number_of_days > 1 && <th style={styles.th}>Days Attended</th>}
                        <th style={styles.th}>Date Registered</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map(r => {
                        const lastCI = r.checkin_history && r.checkin_history.length > 0 ? r.checkin_history[0] : null;
                        const lastDayInfo = lastCI ? getEventDayInfo(lastCI.date) : null;
                        const remainingDays = getRemainingDays(r);
                        const isExpanded = expandedRows[r.id];

                        return (
                          <React.Fragment key={r.id}>
                            <tr style={styles.tr}>
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
                                    <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>Code: {r.group_code?.slice(0, 8)}</span>
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
                                    <Clock size={12} /> Pending
                                  </span>
                                )}
                              </td>
                              {/* Last Checked In */}
                              <td style={styles.td}>
                                {lastCI && lastDayInfo ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                    <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '0.8rem' }}>Day {lastDayInfo.dayNum}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--on-surface)' }}>{lastDayInfo.weekday}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>{lastDayInfo.dateStr}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>{lastCI.time.substring(0, 5)}</span>
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>—</span>
                                )}
                              </td>
                              {event?.number_of_days > 1 && (
                                <td style={{ ...styles.td, fontWeight: 800 }}>
                                  {r.attendance_days_count || 0} / {event.number_of_days}
                                </td>
                              )}
                              <td style={{ ...styles.td, fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                                {new Date(r.registered_at).toLocaleDateString()}
                              </td>
                              {/* Actions */}
                              <td style={{ ...styles.td }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                                  {remainingDays.length > 0 && (
                                    <button
                                      onClick={() => {
                                        setAdminCheckInTarget(r);
                                        setAdminCheckInDate(remainingDays[0].value);
                                      }}
                                      className="glass"
                                      style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, border: '1px solid var(--primary)', color: 'var(--primary)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                    >
                                      CHECK IN
                                    </button>
                                  )}
                                  {r.checkin_history && r.checkin_history.length > 0 && (
                                    <button
                                      onClick={() => toggleRow(r.id)}
                                      style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', padding: 0, whiteSpace: 'nowrap', textDecoration: 'underline' }}
                                    >
                                      {isExpanded ? '▲ Hide Records' : '▼ Check-in Records'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* Inline expandable check-in history sub-table */}
                            {isExpanded && r.checkin_history && r.checkin_history.length > 0 && (
                              <tr style={{ background: 'rgba(0,0,0,0.12)' }}>
                                <td colSpan={7 + (event?.number_of_days > 1 ? 1 : 0)} style={{ padding: '0 1.2rem 1.5rem 3rem' }}>
                                  <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>Check-In Records</div>
                                    <table style={{ ...styles.table, fontSize: '0.8rem' }}>
                                      <thead>
                                        <tr>
                                          <th style={{ ...styles.th, fontSize: '0.7rem', padding: '0.6rem 1rem' }}>Day</th>
                                          <th style={{ ...styles.th, fontSize: '0.7rem', padding: '0.6rem 1rem' }}>Date</th>
                                          <th style={{ ...styles.th, fontSize: '0.7rem', padding: '0.6rem 1rem' }}>Day of Week</th>
                                          <th style={{ ...styles.th, fontSize: '0.7rem', padding: '0.6rem 1rem' }}>Timestamp</th>
                                          <th style={{ ...styles.th, fontSize: '0.7rem', padding: '0.6rem 1rem' }}>Device</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {r.checkin_history.map((ch, idx) => {
                                          const info = getEventDayInfo(ch.date);
                                          return (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                              <td style={{ padding: '0.6rem 1rem', fontWeight: 900, color: 'var(--primary)' }}>
                                                {info ? `Day ${info.dayNum}` : ch.date}
                                              </td>
                                              <td style={{ padding: '0.6rem 1rem', color: 'var(--on-surface)' }}>
                                                {info ? info.dateStr : ch.date}
                                              </td>
                                              <td style={{ padding: '0.6rem 1rem', color: 'var(--on-surface-variant)' }}>
                                                {info ? info.weekday : '—'}
                                              </td>
                                              <td style={{ padding: '0.6rem 1rem', color: 'var(--on-surface-variant)' }}>
                                                {ch.time.substring(0, 8)}
                                              </td>
                                              <td style={{ padding: '0.6rem 1rem', color: 'var(--on-surface-variant)' }}>
                                                {ch.device_id || 'Unknown'}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'checked_in' && (
            <div className="glass" style={{ padding: '3rem', borderRadius: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-0.5px' }}>Checked In Attendees</h2>
                  <button onClick={handleExport} className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, border: '1px solid var(--primary)', color: 'var(--primary)', cursor: 'pointer' }}>
                    DOWNLOAD CSV
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <select
                    value={checkedInDateFilter}
                    onChange={e => setCheckedInDateFilter(e.target.value)}
                    style={{ ...styles.searchInput, border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'var(--surface-highest)' }}
                  >
                    <option value="ALL">All Days</option>
                    {eventDays.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
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
              </div>

              {regsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={32} /></div>
              ) : filteredCheckedInAttendees.length === 0 ? (
                <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center', padding: '3rem 0', fontWeight: 600 }}>No checked in attendees found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Attendee</th>
                        <th style={styles.th}>Ticket Type</th>
                        <th style={styles.th}>Group</th>
                        <th style={styles.th}>Days Attended</th>
                        <th style={styles.th}>Event Day</th>
                        <th style={styles.th}>Check-In Time</th>
                        <th style={styles.th}>Device Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCheckedInAttendees.map(r => {
                        const checkinForDate = (r.checkin_history || []).find(ch => ch.date === (checkedInDateFilter !== 'ALL' ? checkedInDateFilter : r.checkin_history[0]?.date));

                        // Compute event day number, full date, and weekday from checkin date
                        const getEventDayInfo = (checkinDate) => {
                          if (!checkinDate || !event?.start_date) return null;
                          const start = new Date(event.start_date);
                          start.setHours(0, 0, 0, 0);
                          const ci = new Date(checkinDate);
                          ci.setHours(0, 0, 0, 0);
                          const diffMs = ci - start;
                          const dayNum = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
                          const weekday = ci.toLocaleDateString(undefined, { weekday: 'long' });
                          const dateStr = ci.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                          return { dayNum, weekday, dateStr };
                        };

                        const dayInfo = checkinForDate ? getEventDayInfo(checkinForDate.date) : null;

                        return (
                          <tr key={r.id} style={styles.tr}>
                            <td style={styles.td}>
                              <div style={{ fontWeight: 'bold' }}>{r.attendee_name_display}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{r.attendee_email_display}</div>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.ticketBadge}>{r.ticket_type_name || 'Regular'}</span>
                            </td>
                            <td style={styles.td}>
                              {r.group_name ? (
                                <span style={styles.groupBadge}><Group size={12} /> {r.group_name}</span>
                              ) : '-'}
                            </td>
                            <td style={{ ...styles.td, fontWeight: 800, textAlign: 'center' }}>
                              <span style={{ background: 'rgba(255,177,115,0.1)', color: 'var(--primary)', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 900 }}>
                                {r.attendance_days_count || 1} / {event.number_of_days || 1}
                              </span>
                            </td>
                            <td style={styles.td}>
                              {dayInfo ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '0.9rem' }}>
                                    Day {dayInfo.dayNum}
                                  </span>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                                    {dayInfo.weekday}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                                    {dayInfo.dateStr}
                                  </span>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>—</span>
                              )}
                            </td>
                            <td style={{ ...styles.td, fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                              {checkinForDate ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <Clock size={14} color="#22c55e" />
                                  {checkinForDate.time.substring(0, 5)}
                                </div>
                              ) : '—'}
                            </td>
                            <td style={{ ...styles.td, fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                              {checkinForDate?.device_id || 'Unknown Device'}
                            </td>
                          </tr>
                        );
                      })}
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
                  {[['title', 'Title', 'text'], ['venue_name', 'Venue Name', 'text'], ['venue_address', 'Venue Address', 'text'], ['country', 'Country', 'text'], ['state_or_county', 'State / County', 'text'], ['max_participants', 'Max Participants', 'number'], ['currency', 'Currency', 'text']].map(([field, label, type]) => (
                    <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={styles.editLabel}>{label}</label>
                      <input type={type} value={editForm[field] || ''} onChange={e => setEditForm({ ...editForm, [field]: e.target.value })} style={styles.editInput} />
                    </div>
                  ))}
                  {[['start_date', 'Start Date'], ['end_date', 'End Date'], ['registration_start', 'Registration Start'], ['registration_deadline', 'Registration Deadline']].map(([field, label]) => (
                    <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={styles.editLabel}>{label}</label>
                      <input type="datetime-local" value={editForm[field] || ''} onChange={e => setEditForm({ ...editForm, [field]: e.target.value })} style={styles.editInput} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={styles.editLabel}>Description</label>
                  <textarea rows={4} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ ...styles.editInput, resize: 'vertical' }} />
                </div>

                {/* Event Graphics Update */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
                  <label style={{ ...styles.editLabel, fontSize: '1rem' }}>Event Graphics (Leave empty to keep existing)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={styles.editLabel}>Landscape Banner (16:9)</label>
                      <input type="file" accept="image/*" onChange={e => setEditForm({ ...editForm, banner_image_file: e.target.files[0] })} style={styles.editInput} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={styles.editLabel}>Portrait Flyer</label>
                      <input type="file" accept="image/*" onChange={e => setEditForm({ ...editForm, banner_portrait_file: e.target.files[0] })} style={styles.editInput} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={styles.editLabel}>Promo Video</label>
                      <input type="file" accept="video/*" onChange={e => setEditForm({ ...editForm, banner_video_file: e.target.files[0] })} style={styles.editInput} />
                    </div>
                  </div>
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
                        <input placeholder="Name" value={t.name} onChange={e => handleTicketChange(idx, 'name', e.target.value)} style={styles.editInput} />
                        <input placeholder="Description" value={t.description} onChange={e => handleTicketChange(idx, 'description', e.target.value)} style={styles.editInput} />
                        <input type="number" placeholder="Price" value={t.price} onChange={e => handleTicketChange(idx, 'price', e.target.value)} style={styles.editInput} />
                        <input type="number" placeholder="Qty" value={t.quantity} onChange={e => handleTicketChange(idx, 'quantity', e.target.value)} style={styles.editInput} />
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


          {activeTab === 'gallery' && (
            <div className="glass" style={{ padding: '3rem', borderRadius: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Image size={22} color="var(--primary)" />
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-0.5px' }}>Event Gallery</h2>
                  <span style={{ background: 'rgba(255,177,115,0.1)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800 }}>{galleryData.total} photos</span>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <Filter size={16} color="var(--primary)" />
                  <select value={galleryPhotographer} onChange={e => { setGalleryPhotographer(e.target.value); fetchOwnerGallery(e.target.value); }} style={{ padding: '0.6rem 1rem', borderRadius: '10px', background: 'var(--surface-highest)', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 600, fontSize: '0.9rem', outline: 'none' }}>
                    <option value="">All Photographers ({galleryData.total})</option>
                    {galleryData.photographers.map(p => (<option key={p.id} value={p.id}>{p.full_name} ({p.photo_count})</option>))}
                  </select>
                </div>
              </div>

              {galleryData.photographers.length > 0 && (
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  <button onClick={() => { setGalleryPhotographer(''); fetchOwnerGallery(''); }} style={{ padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, background: !galleryPhotographer ? 'var(--primary)' : 'rgba(255,177,115,0.08)', color: !galleryPhotographer ? '#080C14' : 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>All</button>
                  {galleryData.photographers.map(p => (
                    <button key={p.id} onClick={() => { setGalleryPhotographer(p.id); fetchOwnerGallery(p.id); }} style={{ padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, background: galleryPhotographer === p.id ? 'var(--primary)' : 'rgba(255,177,115,0.08)', color: galleryPhotographer === p.id ? '#080C14' : 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Camera size={12} />{p.full_name} · {p.photo_count}
                    </button>
                  ))}
                </div>
              )}

              {galleryLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={36} color="var(--primary)" /></div>
              ) : galleryData.photos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--on-surface-variant)' }}>
                  <Camera size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No photos uploaded yet.</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Photographers assigned to this event can upload from their dashboard.</p>
                </div>
              ) : (
                <div style={{ columns: '3 280px', columnGap: '1.2rem' }}>
                  {galleryData.photos.map(photo => {
                    const imgSrc = photo.media_file_url || photo.thumbnail_url || photo.media_file;
                    const aiColor = { PENDING: '#f59e0b', FACES_DETECTED: '#3b82f6', MAPPED_TO_USERS: '#22c55e', FAILED: '#ef4444' }[photo.ai_status] || '#94a3b8';
                    return (
                      <div key={photo.id} style={{ marginBottom: '1.2rem', breakInside: 'avoid', borderRadius: '16px', overflow: 'hidden', position: 'relative', cursor: 'pointer', border: '1px solid var(--glass-border)' }} onClick={() => setLightboxPhoto(photo)}>
                        {imgSrc ? (<img src={imgSrc} alt={photo.caption || 'Event photo'} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />) : (<div style={{ height: '200px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Camera size={32} style={{ opacity: 0.3 }} /></div>)}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.8rem 1rem', background: 'linear-gradient(transparent, rgba(8,12,20,0.92))', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
                            <div style={{ fontWeight: 700 }}>{photo.uploader_full_name}</div>
                            <div style={{ opacity: 0.7 }}>{new Date(photo.created_at).toLocaleDateString()}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ background: aiColor + '22', color: aiColor, padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, border: `1px solid ${aiColor}44` }}>{photo.ai_status?.replace(/_/g, ' ')}</span>
                            <a href={imgSrc} download onClick={e => e.stopPropagation()} style={{ background: 'rgba(255,177,115,0.15)', color: 'var(--primary)', padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center' }} title="Download"><Download size={14} /></a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="glass" style={{ padding: '3rem', borderRadius: '32px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-0.5px', marginBottom: '2rem' }}>Assigned Vendors</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(event.vendors || []).length === 0 ? (
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', textAlign: 'center', padding: '2rem 0' }}>No vendors assigned yet.</p>
                ) : (
                  (event.vendors || []).map(p => (
                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div 
                        onClick={() => setExpandedVendorId(expandedVendorId === p.id ? null : p.id)} 
                        className="glass" 
                        style={{...styles.vendorCard, cursor: 'pointer', transition: 'all 0.2s', border: expandedVendorId === p.id ? '1px solid var(--primary)' : '1px solid var(--glass-border)'}}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                            {p.vendor_username || p.vendor_email} 
                            <span style={{ color: 'var(--primary)', fontSize: '0.8rem', marginLeft: '8px', textTransform: 'uppercase' }}>({p.role_display || p.role})</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: p.is_confirmed ? '#22c55e' : 'var(--on-surface-variant)', fontWeight: 850 }}>
                            {p.is_confirmed ? 'ACCOUNT REGISTERED' : 'PENDING REGISTRATION'}
                          </div>
                        </div>
                        <div style={{ color: 'var(--primary)' }}>
                          {p.is_confirmed ? <CheckCircle size={18} /> : <Clock size={18} />}
                        </div>
                      </div>

                      {expandedVendorId === p.id && (
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.15)', borderLeft: '3px solid var(--primary)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Business Name</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{p.vendor_business_name || 'N/A'}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Contact Name</div>
                              <div style={{ fontSize: '1rem', fontWeight: 600 }}>{p.vendor_username}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Email Address</div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 600, wordBreak: 'break-all' }}>{p.vendor_email}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Phone Number</div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{p.vendor_phone || 'N/A'}</div>
                            </div>
                          </div>
                          
                          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Business Verification Status</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: p.vendor_is_verified ? '#22c55e' : '#ef4444', fontWeight: 900, fontSize: '0.85rem' }}>
                              {p.vendor_is_verified ? <><CheckCircle size={16} /> VERIFIED</> : <><X size={16} /> UNVERIFIED</>}
                            </div>
                          </div>
                        </div>
                      )}
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
                    placeholder="Enter vendor name..."
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    required
                    style={{ ...styles.asideInput, paddingLeft: '3rem' }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    placeholder="Enter vendor phone..."
                    value={invitePhone}
                    onChange={e => setInvitePhone(e.target.value)}
                    required
                    style={{ ...styles.asideInput }}
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
                    {vendorTypes.map(vt => (
                      <option key={vt} value={vt} style={{ background: 'var(--surface-highest, #1a1a1a)', color: 'var(--on-surface)' }}>{vt.replace('_', ' ')}</option>
                    ))}
                    <option value="OTHER" style={{ background: 'var(--surface-highest, #1a1a1a)', color: 'var(--on-surface)' }}>Others (Specify)</option>
                  </select>
                  <Briefcase size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }} />
                </div>
                
                {inviteRole === 'OTHER' && (
                  <div style={{ position: 'relative' }}>
                    <input
                      placeholder="Specify Custom Service Type (e.g. DJ)"
                      value={customInviteRole}
                      onChange={e => setCustomInviteRole(e.target.value)}
                      required
                      style={styles.asideInput}
                    />
                  </div>
                )}
                {invitationError && <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700 }}>{invitationError}</div>}
                <button
                  disabled={inviting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem' }}
                >
                  {inviting ? 'SENDING...' : 'SEND INVITE'}
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



      {/* Photo Lightbox */}
      {lightboxPhoto && (
        <div onClick={() => setLightboxPhoto(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '2rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
            {(lightboxPhoto.media_file_url || lightboxPhoto.media_file) && (<img src={lightboxPhoto.media_file_url || lightboxPhoto.media_file} alt="" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '16px', display: 'block' }} />)}
            <div style={{ position: 'absolute', bottom: '-3rem', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#CBD5E1' }}>
              <div><span style={{ fontWeight: 700 }}>{lightboxPhoto.uploader_full_name}</span><span style={{ opacity: 0.6, marginLeft: '0.8rem', fontSize: '0.85rem' }}>{new Date(lightboxPhoto.created_at).toLocaleDateString()}</span></div>
              <a href={lightboxPhoto.media_file_url || lightboxPhoto.media_file} download onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}><Download size={16} /> Download</a>
            </div>
            <button onClick={() => setLightboxPhoto(null)} style={{ position: 'absolute', top: '-2.5rem', right: 0, background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 800 }}>✕</button>
          </div>
        </div>
      )}

      {/* Check-in History Modal */}
      {selectedHistoryUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '24px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>Check-in History</h3>
              <button onClick={() => setSelectedHistoryUser(null)} style={{ background: 'none', border: 'none', color: 'var(--on-surface)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 800 }}>{selectedHistoryUser.attendee_name_display}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{selectedHistoryUser.attendee_email_display}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(selectedHistoryUser.checkin_history || []).map((ch, idx) => {
                const dayMatch = eventDays.find(d => d.value === ch.date);
                const dayLabel = dayMatch ? dayMatch.label : ch.date;
                return (
                  <div key={idx} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{dayLabel}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--on-surface-variant)' }}>Time:</span>
                      <span>{ch.time.substring(0, 5)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--on-surface-variant)' }}>Device:</span>
                      <span>{ch.device_id || 'Unknown Device'}</span>
                    </div>
                  </div>
                );
              })}
              {(!selectedHistoryUser.checkin_history || selectedHistoryUser.checkin_history.length === 0) && (
                <p style={{ textAlign: 'center', color: 'var(--on-surface-variant)' }}>No check-in records found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Check-in Modal */}
      {adminCheckInTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>Admin Check-In</h3>
              <button onClick={() => setAdminCheckInTarget(null)} style={{ background: 'none', border: 'none', color: 'var(--on-surface)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.3rem' }}>Checking in:</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>{adminCheckInTarget.attendee_name_display}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{adminCheckInTarget.ticket_type_name || 'Regular'}</div>
            </div>

            <form onSubmit={handleAdminCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={styles.editLabel}>Select Event Day</label>
                {(() => {
                  const remainingDays = getRemainingDays(adminCheckInTarget);
                  return remainingDays.length > 0 ? (
                    <select
                      value={adminCheckInDate}
                      onChange={(e) => setAdminCheckInDate(e.target.value)}
                      required
                      style={styles.editInput}
                    >
                      <option value="" disabled>Select a day...</option>
                      {remainingDays.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(34,197,94,0.08)', color: '#22c55e', fontWeight: 700, fontSize: '0.9rem' }}>
                      ✓ All days checked in
                    </div>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setAdminCheckInTarget(null)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 800, cursor: 'pointer' }}>
                  CANCEL
                </button>
                {getRemainingDays(adminCheckInTarget).length > 0 && (
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 800 }}>
                    CHECK IN
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
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
  th: { padding: '0.8rem 0.5rem', borderBottom: '2px solid var(--glass-border)', fontSize: '0.7rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid var(--glass-border)' },
  td: { padding: '1rem 0.5rem', verticalAlign: 'middle', fontSize: '0.85rem' },
  ticketBadge: { display: 'inline-block', background: 'rgba(255,255,255,0.05)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap', border: '1px solid var(--glass-border)' },
  groupBadge: { background: 'rgba(0,0,0,0.06)', color: 'var(--on-surface)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 900, whiteSpace: 'nowrap' },
  vendorCard: { padding: '1.4rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 177, 115, 0.03)', border: '1px solid var(--glass-border)' },
  asideInput: { width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', background: 'var(--surface-highest)', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 600, fontSize: '0.9rem', outline: 'none' },
  editInput: { padding: '0.9rem 1rem', borderRadius: '10px', background: 'var(--surface-highest)', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 600, fontSize: '0.9rem', outline: 'none', width: '100%' },
  editLabel: { fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }
};

export default OrganizerEventDetails;
