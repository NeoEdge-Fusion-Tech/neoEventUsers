import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, Calendar, Camera, Cpu, ArrowLeft, Search,
  ChevronRight, Loader2, Download, Image, CheckCircle, Clock,
  AlertTriangle, X, Play, RefreshCw, Filter, Mail, Phone,
  Shield, Activity, TrendingUp, Database
} from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

/* ── helpers ─────────────────────────────────────────── */
const aiColors = {
  PENDING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  FACES_DETECTED: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  MAPPED_TO_USERS: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  FAILED: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};
const roleColor = {
  ADMIN: '#a855f7',
  OWNER: 'var(--primary)',
  VENDOR: '#3b82f6',
  ATTENDEE: '#22c55e',
  VALIDATOR: '#94a3b8',
};
const StatCard = ({ icon: Icon, label, value, sub, color = 'var(--primary)' }) => (
  <div className="glass" style={{ padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--on-surface-variant)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
      <Icon size={18} color={color} />
      {label}
    </div>
    <div style={{ fontSize: '2.4rem', fontWeight: 950, letterSpacing: '-1px', color }}>{value}</div>
    {sub && <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{sub}</div>}
  </div>
);

const AiBadge = ({ status }) => {
  const c = aiColors[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
  return (
    <span style={{ background: c.bg, color: c.color, padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, border: `1px solid ${c.color}44`, whiteSpace: 'nowrap' }}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

/* ── main component ───────────────────────────────────── */
const NeoAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('overview'); // overview | events | users
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventSearch, setEventSearch] = useState('');

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [eventDetailLoading, setEventDetailLoading] = useState(false);
  const [galleryPhotographer, setGalleryPhotographer] = useState('');
  const [triggeringAI, setTriggeringAI] = useState(false);
  const [aiTriggerMsg, setAITriggerMsg] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  /* ── redirect non-admins ── */
  useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/');
  }, [user]);

  /* ── fetch stats ── */
  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get('/neo-admin/stats/');
        setStats(r.data);
      } catch (e) {
        console.error(e);
      } finally {
        setStatsLoading(false);
      }
    };
    load();
  }, []);

  /* ── fetch events ── */
  const fetchEvents = async (search = '') => {
    setEventsLoading(true);
    try {
      const r = await api.get(`/neo-admin/events/${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setEvents(r.data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'events') fetchEvents(eventSearch);
  }, [activeSection]);

  /* ── fetch event detail ── */
  const openEventDetail = async (ev, photographerId = '') => {
    setSelectedEvent(ev);
    setEventDetailLoading(true);
    setAITriggerMsg('');
    try {
      const params = photographerId ? `?photographer=${photographerId}` : '';
      const r = await api.get(`/neo-admin/events/${ev.id}/${params}`);
      setEventDetail(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setEventDetailLoading(false);
    }
  };

  /* ── trigger AI ── */
  const triggerAI = async () => {
    if (!selectedEvent) return;
    setTriggeringAI(true);
    setAITriggerMsg('');
    try {
      const r = await api.post(`/neo-admin/events/${selectedEvent.id}/trigger-ai/`);
      setAITriggerMsg(`✅ ${r.data.message}`);
      openEventDetail(selectedEvent, galleryPhotographer);
    } catch (e) {
      setAITriggerMsg('❌ ' + (e.response?.data?.detail || 'Failed to trigger AI.'));
    } finally {
      setTriggeringAI(false);
    }
  };

  /* ── fetch users ── */
  const fetchUsers = async (search = '', role = '') => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      const r = await api.get(`/neo-admin/users/?${params.toString()}`);
      setUsers(r.data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'users') fetchUsers(userSearch, userRoleFilter);
  }, [activeSection]);

  /* ─────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--on-surface)', fontFamily: 'var(--font-body, Inter, sans-serif)' }}>

      {/* ── Sidebar ── */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ width: '260px', minHeight: '100vh', background: 'rgba(8,12,20,0.95)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem', gap: '0.5rem', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>
          {/* Logo */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #FFB173, #FF6B35)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} color="#080C14" />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff', letterSpacing: '-0.5px' }}>NeoAdmin</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Internal Console</div>
              </div>
            </div>
          </div>

          {[
            { id: 'overview', icon: BarChart3, label: 'Overview' },
            { id: 'events', icon: Calendar, label: 'Events' },
            { id: 'users', icon: Users, label: 'Users' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setActiveSection(id); setSelectedEvent(null); setEventDetail(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.9rem 1.2rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', textAlign: 'left', transition: 'all 0.2s',
                background: activeSection === id ? 'rgba(255,177,115,0.12)' : 'transparent',
                color: activeSection === id ? 'var(--primary)' : 'var(--on-surface-variant)',
                borderLeft: activeSection === id ? '3px solid var(--primary)' : '3px solid transparent',
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: '0.4rem' }}>Logged in as</div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{user?.username}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>ADMIN</div>
          </div>
        </aside>

        {/* ── Main content area ── */}
        <main style={{ marginLeft: '260px', flex: 1, padding: '3rem', maxWidth: 'calc(100vw - 260px)', overflowX: 'hidden' }}>

          {/* ── OVERVIEW ── */}
          {activeSection === 'overview' && (
            <div>
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>System Overview</div>
                <h1 style={{ fontSize: '2.8rem', fontWeight: 950, letterSpacing: '-1px' }}>Dashboard</h1>
              </div>

              {statsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>
              ) : stats ? (
                <>
                  {/* User stats */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Users</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                      <StatCard icon={Users} label="Total Users" value={stats.users.total} color="#fff" />
                      <StatCard icon={Shield} label="Admins" value={stats.users.admins} color="#a855f7" />
                      <StatCard icon={Calendar} label="Event Owners" value={stats.users.owners} color="var(--primary)" />
                      <StatCard icon={Camera} label="Vendors" value={stats.users.vendors} color="#3b82f6" />
                      <StatCard icon={Users} label="Attendees" value={stats.users.attendees} color="#22c55e" />
                    </div>
                  </div>

                  {/* Event + Photo stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Events</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <StatCard icon={Database} label="Total Events" value={stats.events.total} />
                        <StatCard icon={Activity} label="Published" value={stats.events.active} color="#22c55e" />
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>AI Processing</h3>
                      <div className="glass" style={{ padding: '2rem', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <div style={{ fontSize: '2rem', fontWeight: 950 }}>{stats.photos.total.toLocaleString()}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 700 }}>total photos</div>
                        </div>
                        {/* Progress bar */}
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--on-surface-variant)' }}>AI Processed</span>
                            <span style={{ color: 'var(--primary)' }}>{stats.photos.ai_processed_percent}%</span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${stats.photos.ai_processed_percent}%`, background: 'linear-gradient(90deg, var(--primary), #22c55e)', borderRadius: '10px', transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                        {Object.entries(stats.photos.by_status).map(([status, count]) => {
                          const c = aiColors[status] || { color: '#94a3b8', bg: '' };
                          return (
                            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <AiBadge status={status} />
                              <span style={{ fontWeight: 800, color: c.color }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--on-surface-variant)' }}>Failed to load stats.</p>
              )}
            </div>
          )}

          {/* ── EVENTS ── */}
          {activeSection === 'events' && !selectedEvent && (
            <div>
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Management</div>
                <h1 style={{ fontSize: '2.8rem', fontWeight: 950, letterSpacing: '-1px' }}>All Events</h1>
              </div>

              {/* Search */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0 1.2rem', borderRadius: '12px', border: '1px solid var(--glass-border)', flex: 1 }}>
                  <Search size={18} color="var(--primary)" />
                  <input
                    placeholder="Search by event title or owner email…"
                    value={eventSearch}
                    onChange={e => setEventSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchEvents(eventSearch)}
                    style={{ border: 'none', background: 'transparent', padding: '12px 0', fontSize: '0.9rem', color: 'var(--on-surface)', outline: 'none', fontWeight: 600, width: '100%' }}
                  />
                </div>
                <button onClick={() => fetchEvents(eventSearch)} className="btn-primary" style={{ padding: '0 2rem', borderRadius: '12px', fontWeight: 800 }}>Search</button>
              </div>

              {eventsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}><Loader2 className="animate-spin" size={36} color="var(--primary)" /></div>
              ) : (
                <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                        {['Event', 'Owner', 'Status', 'Photos', 'AI Progress', 'Date', ''].map(h => (
                          <th key={h} style={{ padding: '1rem 1.2rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {events.length === 0 ? (
                        <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No events found.</td></tr>
                      ) : events.map(ev => {
                        const total = ev.photos.total;
                        const done = ev.photos.mapped + ev.photos.faces_detected;
                        const pct = total ? Math.round((done / total) * 100) : 0;
                        return (
                          <tr key={ev.id} style={{ borderTop: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'background 0.15s' }} onClick={() => openEventDetail(ev)}>
                            <td style={{ padding: '1rem 1.2rem' }}>
                              <div style={{ fontWeight: 800 }}>{ev.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{ev.venue_name}</div>
                            </td>
                            <td style={{ padding: '1rem 1.2rem' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ev.owner.full_name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{ev.owner.email}</div>
                            </td>
                            <td style={{ padding: '1rem 1.2rem' }}>
                              <span style={{ background: ev.status === 'PUBLISHED' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', color: ev.status === 'PUBLISHED' ? '#22c55e' : 'var(--on-surface-variant)', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>{ev.status}</span>
                            </td>
                            <td style={{ padding: '1rem 1.2rem', fontWeight: 800 }}>{total}</td>
                            <td style={{ padding: '1rem 1.2rem', minWidth: '120px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--primary), #22c55e)', borderRadius: '4px' }} />
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', minWidth: '32px' }}>{pct}%</span>
                              </div>
                            </td>
                            <td style={{ padding: '1rem 1.2rem', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{ev.start_date ? new Date(ev.start_date).toLocaleDateString() : '—'}</td>
                            <td style={{ padding: '1rem 1.2rem' }}><ChevronRight size={18} color="var(--primary)" /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── EVENT DETAIL ── */}
          {activeSection === 'events' && selectedEvent && (
            <div>
              {/* Back */}
              <button onClick={() => { setSelectedEvent(null); setEventDetail(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', marginBottom: '2.5rem' }}>
                <ArrowLeft size={16} /> BACK TO EVENTS
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Event Detail</div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1px' }}>{selectedEvent.title}</h1>
                  <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Owner: <strong style={{ color: 'var(--on-surface)' }}>{selectedEvent.owner?.full_name}</strong>
                    {selectedEvent.owner?.email && <> · <span>{selectedEvent.owner.email}</span></>}
                    {selectedEvent.owner?.phone && <> · <span>{selectedEvent.owner.phone}</span></>}
                  </div>
                </div>
                {/* Trigger AI button */}
                <button
                  onClick={triggerAI}
                  disabled={triggeringAI}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 2rem', borderRadius: '14px', background: 'linear-gradient(135deg, #FFB173, #FF6B35)', color: '#080C14', fontWeight: 900, fontSize: '0.95rem', border: 'none', cursor: triggeringAI ? 'not-allowed' : 'pointer', opacity: triggeringAI ? 0.7 : 1 }}
                >
                  {triggeringAI ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                  Trigger AI Processing
                </button>
              </div>

              {aiTriggerMsg && (
                <div style={{ padding: '1rem 1.5rem', borderRadius: '12px', background: aiTriggerMsg.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: aiTriggerMsg.startsWith('✅') ? '#22c55e' : '#ef4444', fontWeight: 700, marginBottom: '2rem' }}>
                  {aiTriggerMsg}
                </div>
              )}

              {eventDetailLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={36} color="var(--primary)" /></div>
              ) : eventDetail ? (
                <>
                  {/* AI Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {Object.entries(eventDetail.ai_stats).map(([status, count]) => {
                      const c = aiColors[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
                      return (
                        <div key={status} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: `4px solid ${c.color}` }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: c.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{status.replace(/_/g, ' ')}</div>
                          <div style={{ fontSize: '2rem', fontWeight: 950 }}>{count}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Photographer filter */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <Image size={20} color="var(--primary)" /> Gallery
                      <span style={{ background: 'rgba(255,177,115,0.1)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800 }}>{eventDetail.total_photos}</span>
                    </h2>
                    <select
                      value={galleryPhotographer}
                      onChange={e => { setGalleryPhotographer(e.target.value); openEventDetail(selectedEvent, e.target.value); }}
                      style={{ padding: '0.6rem 1rem', borderRadius: '10px', background: 'var(--surface-highest)', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 600, outline: 'none' }}
                    >
                      <option value="">All Photographers</option>
                      {eventDetail.photographers.map(p => (<option key={p.id} value={p.id}>{p.full_name} ({p.photo_count})</option>))}
                    </select>
                  </div>

                  {/* Photographer pills */}
                  {eventDetail.photographers.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                      {eventDetail.photographers.map(p => (
                        <button key={p.id} onClick={() => { setGalleryPhotographer(p.id); openEventDetail(selectedEvent, p.id); }}
                          style={{ padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, background: galleryPhotographer === p.id ? 'var(--primary)' : 'rgba(255,177,115,0.08)', color: galleryPhotographer === p.id ? '#080C14' : 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Camera size={12} />{p.full_name} · {p.photo_count}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Photo grid */}
                  {eventDetail.photos.length === 0 ? (
                    <div className="glass" style={{ padding: '4rem', borderRadius: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                      <Camera size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <p style={{ fontWeight: 600 }}>No photos found for this filter.</p>
                    </div>
                  ) : (
                    <div style={{ columns: '4 220px', columnGap: '1rem' }}>
                      {eventDetail.photos.map(photo => {
                        const imgSrc = photo.media_file_url || photo.thumbnail_url || photo.media_file;
                        const c = aiColors[photo.ai_status] || { color: '#94a3b8', bg: '' };
                        return (
                          <div key={photo.id} style={{ marginBottom: '1rem', breakInside: 'avoid', borderRadius: '12px', overflow: 'hidden', position: 'relative', cursor: 'pointer', border: '1px solid var(--glass-border)' }} onClick={() => setLightboxPhoto(photo)}>
                            {imgSrc ? (
                              <img src={imgSrc} alt="" style={{ width: '100%', display: 'block' }} />
                            ) : (
                              <div style={{ height: '160px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Camera size={24} style={{ opacity: 0.3 }} /></div>
                            )}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.6rem', background: 'linear-gradient(transparent, rgba(8,12,20,0.9))', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                              <AiBadge status={photo.ai_status} />
                              <a href={imgSrc} download onClick={e => e.stopPropagation()} style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }} title="Download">
                                <Download size={14} />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* ── USERS ── */}
          {activeSection === 'users' && (
            <div>
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Management</div>
                <h1 style={{ fontSize: '2.8rem', fontWeight: 950, letterSpacing: '-1px' }}>All Users</h1>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0 1.2rem', borderRadius: '12px', border: '1px solid var(--glass-border)', flex: 1, minWidth: '200px' }}>
                  <Search size={18} color="var(--primary)" />
                  <input
                    placeholder="Search by name or email…"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchUsers(userSearch, userRoleFilter)}
                    style={{ border: 'none', background: 'transparent', padding: '12px 0', fontSize: '0.9rem', color: 'var(--on-surface)', outline: 'none', fontWeight: 600, width: '100%' }}
                  />
                </div>
                <select value={userRoleFilter} onChange={e => { setUserRoleFilter(e.target.value); fetchUsers(userSearch, e.target.value); }}
                  style={{ padding: '0 1.2rem', borderRadius: '12px', background: 'var(--surface-highest)', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 600, outline: 'none' }}>
                  <option value="">All Roles</option>
                  {['ADMIN', 'OWNER', 'VENDOR', 'ATTENDEE', 'VALIDATOR'].map(r => (<option key={r} value={r}>{r}</option>))}
                </select>
                <button onClick={() => fetchUsers(userSearch, userRoleFilter)} className="btn-primary" style={{ padding: '0 2rem', borderRadius: '12px', fontWeight: 800 }}>Search</button>
              </div>

              {usersLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}><Loader2 className="animate-spin" size={36} color="var(--primary)" /></div>
              ) : (
                <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                        {['User', 'Email', 'Role', 'Status', 'Phone', 'Joined'].map(h => (
                          <th key={h} style={{ padding: '1rem 1.2rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No users found.</td></tr>
                      ) : users.map(u => (
                        <tr key={u.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                          <td style={{ padding: '1rem 1.2rem' }}>
                            <div style={{ fontWeight: 800 }}>{u.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>@{u.username}</div>
                          </td>
                          <td style={{ padding: '1rem 1.2rem', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{u.email}</td>
                          <td style={{ padding: '1rem 1.2rem' }}>
                            <span style={{ background: roleColor[u.role] + '22', color: roleColor[u.role] || 'var(--primary)', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, border: `1px solid ${roleColor[u.role]}44` }}>{u.role}</span>
                          </td>
                          <td style={{ padding: '1rem 1.2rem' }}>
                            <span style={{ background: u.onboarding_status === 'ACTIVE' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', color: u.onboarding_status === 'ACTIVE' ? '#22c55e' : 'var(--on-surface-variant)', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                              {u.onboarding_status?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.2rem', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{u.phone || '—'}</td>
                          <td style={{ padding: '1rem 1.2rem', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{new Date(u.date_joined).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── Lightbox ── */}
      {lightboxPhoto && (
        <div onClick={() => setLightboxPhoto(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '2rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
            {(lightboxPhoto.media_file_url || lightboxPhoto.media_file) && (
              <img src={lightboxPhoto.media_file_url || lightboxPhoto.media_file} alt="" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '16px', display: 'block' }} />
            )}
            <div style={{ position: 'absolute', bottom: '-3rem', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', color: '#CBD5E1' }}>
              <div><span style={{ fontWeight: 700 }}>{lightboxPhoto.uploader_full_name}</span><span style={{ marginLeft: '0.8rem', opacity: 0.6, fontSize: '0.85rem' }}><AiBadge status={lightboxPhoto.ai_status} /></span></div>
              <a href={lightboxPhoto.media_file_url || lightboxPhoto.media_file} download onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700 }}><Download size={16} /> Download</a>
            </div>
            <button onClick={() => setLightboxPhoto(null)} style={{ position: 'absolute', top: '-2.5rem', right: 0, background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 800 }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeoAdminDashboard;
