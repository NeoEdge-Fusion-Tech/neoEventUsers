import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Camera, Mail, Plus, Loader2, ArrowLeft, Trash2, CheckCircle, Clock, ShieldCheck, UserPlus, Info, Calendar, MapPin } from 'lucide-react';
import api from '../api';

const OrganizerEventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [invitationError, setInvitationError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await api.get(`/events/${eventId}/`);
        setEvent(response.data);
      } catch (err) {
        console.error('Failed to fetch event data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [eventId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setInvitationError('');
    try {
      await api.post('/events/photographer/invite/', {
        event: eventId,
        email: inviteEmail
      });
      setInviteEmail('');
      // Refresh event data to show new invite
      const res = await api.get(`/events/${eventId}/`);
      setEvent(res.data);
    } catch (err) {
      setInvitationError('Failed to send invite. Please check the email.');
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;
  if (!event) return <div style={{ textAlign: 'center', padding: '10rem' }}>Event not found.</div>;

  return (
    <div className="organizer-event-details" style={{ padding: '4rem 6rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <Link to="/organizer/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> BACK TO MANAGEMENT
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Event Management</span>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-1px' }}>{event.title}</h1>
          </div>
          <div className="glass" style={{ padding: '0.6rem 1.4rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontWeight: 800, border: '1px solid var(--primary)' }}>
            <ShieldCheck size={18} /> OWNER ACCESS
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {/* Overview Info */}
          <div className="glass" style={{ borderRadius: '40px', overflow: 'hidden' }}>
            <div style={{ height: '350px', width: '100%' }}>
              <img src={event.banner_image || '/placeholder.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '3.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
               <div>
                 <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem', color: 'var(--on-surface-variant)' }}>
                    <Info size={18} color="var(--primary)" /> ABOUT SESSION
                 </h4>
                 <p style={{ color: 'var(--on-surface)', lineHeight: '1.8' }}>{event.description}</p>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Calendar size={20} color="var(--primary)" /> {new Date(event.start_date).toLocaleDateString()}</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><MapPin size={20} color="var(--primary)" /> {event.location}</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Plus size={20} color="var(--primary)" /> {event.status}</div>
               </div>
            </div>
          </div>

          {/* Combined Photographer and Attendee insights could go here */}
        </div>

        {/* Sidebar: Photographer Management */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div className="glass" style={{ padding: '3rem', borderRadius: '40px', border: '1px solid var(--glass-border)' }}>
             <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <Camera size={26} color="var(--primary)" /> Vendors
             </h3>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3.5rem' }}>
                {event.event_photographers?.length === 0 ? (
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', textAlign: 'center', padding: '2rem 0' }}>No photographers assigned yet.</p>
                ) : (
                  event.event_photographers.map(p => (
                    <div key={p.id} className="glass" style={{ padding: '1.2rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--accent-glow)' }}>
                       <div>
                         <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{p.photographer_name || p.email}</div>
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

             <div style={{ padding: '2.5rem', background: 'rgba(255,177,115,0.05)', borderRadius: '28px', border: '1px solid rgba(255,177,115,0.1)' }}>
               <h4 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                 <UserPlus size={18} color="var(--primary)" /> INVITE VENDOR
               </h4>
               <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                    <input 
                      type="email" 
                      placeholder="Enter vendor email..." 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', background: 'var(--surface-highest)', border: '1px solid var(--glass-border)', color: 'var(--on-surface)', fontWeight: 600, fontSize: '0.9rem', outline: 'none' }}
                    />
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
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OrganizerEventDetails;
