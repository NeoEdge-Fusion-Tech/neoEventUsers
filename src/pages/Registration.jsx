import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Mail, Shield, Camera, Calendar, MapPin, Loader2, CheckCircle, Ticket, Users, Plus, Trash2, ArrowLeft } from 'lucide-react';
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

const Registration = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [regDetails, setRegDetails] = useState(null);
  
  // Tab: 'individual' or 'group'
  const [purchaseType, setPurchaseType] = useState('individual');
  
  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: ''
  });
  
  // Group states
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([
    { first_name: '', last_name: '', email: '', phone_number: '' }
  ]);

  const [referenceImage, setReferenceImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventRes = await api.get(`/events/${eventId}/`);
        const eventData = eventRes.data;
        setEvent(eventData);

        let tickets = [];
        try {
          const resolvedId = eventData.id || eventId;
          const ticketsRes = await api.get(`/tickets/events/${resolvedId}/tickets/`);
          tickets = ticketsRes.data.results || ticketsRes.data || [];
        } catch (ticketErr) {
          console.warn('Using nested ticket types fallback:', ticketErr);
        }

        if (!tickets || tickets.length === 0) {
          tickets = eventData.ticket_types || [];
        }

        setTicketTypes(tickets);
        if (tickets.length > 0) {
          setSelectedTicket(tickets[0]);
        }
      } catch (err) {
        console.error('Failed to fetch registration data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const handleAddMember = () => {
    setGroupMembers([...groupMembers, { first_name: '', last_name: '', email: '', phone_number: '' }]);
  };

  const handleRemoveMember = (idx) => {
    if (groupMembers.length > 1) {
      setGroupMembers(groupMembers.filter((_, i) => i !== idx));
    }
  };

  const handleMemberChange = (idx, field, value) => {
    const updated = [...groupMembers];
    updated[idx][field] = value;
    setGroupMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) {
      setErrorMsg('Please select a ticket category.');
      return;
    }

    setRegistering(true);
    setErrorMsg('');

    const form = new FormData();
    form.append('event', event.id);
    form.append('ticket_type', selectedTicket.id);

    if (purchaseType === 'group') {
      form.append('group_name', groupName);
      
      const mappedMembers = groupMembers.map(m => ({
        full_name: `${m.first_name} ${m.last_name}`.trim(),
        email: m.email,
        phone_number: m.phone_number
      }));
      form.append('attendees', JSON.stringify(mappedMembers));
    } else {
      form.append('full_name', `${formData.first_name} ${formData.last_name}`.trim());
      form.append('email', formData.email);
      form.append('phone_number', formData.phone_number);
      if (referenceImage) {
        form.append('reference_image', referenceImage);
      }
    }

    try {
      const response = await api.post('/tickets/register/', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setRegDetails(response.data);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      const d = err.response?.data;
      setErrorMsg(d?.email?.[0] || d?.ticket_type?.[0] || d?.non_field_errors?.[0] || d?.detail || d?.error || 'Registration failed. Please verify your details and try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;
  if (!event) return <div style={{ textAlign: 'center', padding: '10rem' }}>Event not found.</div>;

  if (success) {
    return (
      <div className="registration-container" style={{ textAlign: 'center', padding: '8rem 2rem' }}>
        <div className="glass" style={{ maxWidth: '650px', margin: '0 auto', padding: '4rem', borderRadius: '40px' }}>
          <CheckCircle size={80} color="#22c55e" style={{ marginBottom: '2rem' }} />
          <h1 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '1.5rem', letterSpacing: '-1px' }}>Registration <span style={{ color: 'var(--primary)' }}>Successful!</span></h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.15rem', marginBottom: '2rem', lineHeight: '1.7', fontWeight: 500 }}>
            Your digital pass sequence has been synthesized and dispatched. 
            {purchaseType === 'group' ? (
              <span> All registered members under <strong>{groupName}</strong> will receive their entry codes in their respective mailboxes.</span>
            ) : (
              <span> See you at <strong>{event.title}</strong>!</span>
            )}
          </p>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '3rem', textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Receipt Code <span style={{ textTransform: 'none', fontSize: '0.75rem', color: 'var(--on-surface-variant)', letterSpacing: 'normal' }}>(Kindly save it)</span></div>
            <code style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--on-surface)' }}>{regDetails?.registration_code || 'NE-SYNTH-PASS'}</code>
          </div>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ padding: '1.2rem 3rem', borderRadius: '16px', fontWeight: 900 }}>Return to Terminal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container" style={{ padding: '4rem 6rem', maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: '6rem', color: 'var(--on-surface)' }}>
      {/* Event Details */}
      <div>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', marginBottom: '3rem' }}>
          <ArrowLeft size={16} /> BACK
        </Link>
        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '4px' }}>ACCESS GATEWAY</span>
        <h1 style={{ fontSize: '4rem', fontWeight: 950, marginBottom: '2rem', letterSpacing: '-1.5px', marginTop: '0.5rem' }}>{event.title}</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--on-surface-variant)' }}>
            <Calendar size={22} color="var(--primary)" />
            <span style={{ fontSize: '1.15rem', fontWeight: 600 }}>{new Date(event.start_date).toLocaleDateString()} ({event.number_of_days} {event.number_of_days === 1 ? 'day' : 'days'})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--on-surface-variant)' }}>
            <MapPin size={22} color="var(--primary)" />
            <span style={{ fontSize: '1.15rem', fontWeight: 600 }}>{event.venue_name || event.location}</span>
          </div>
        </div>

        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '4rem', fontWeight: 500 }}>
          {event.description}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="glass" style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', border: '1px solid var(--glass-border)' }}>
              <Shield size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.3rem' }}>Encrypted Ticketing</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', fontWeight: 500 }}>High security digital signature tokens generated for each visitor.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="glass" style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', border: '1px solid var(--glass-border)' }}>
              <Camera size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.3rem' }}>Biometric Sorting</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', fontWeight: 500 }}>AI indexing automatically matches photographs using references.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Purchase Interactive Module */}
      <div className="glass" style={{ padding: '3.5rem', borderRadius: '40px' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '2.5rem', letterSpacing: '-0.5px' }}>Acquire Access</h2>

        {errorMsg && (
          <div className="glass" style={{ padding: '1.2rem', borderRadius: '16px', border: '1px solid #ef4444', color: '#ef4444', background: 'rgba(239,68,68,0.08)', fontWeight: 700, marginBottom: '2rem' }}>
            {errorMsg}
          </div>
        )}

        {/* 1. Ticket Type Selection */}
        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', display: 'block' }}>1. Select Ticket Category</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ticketTypes.map(t => (
              <div 
                key={t.id} 
                onClick={() => setSelectedTicket(t)}
                className="glass" 
                style={{ 
                  padding: '1.5rem', 
                  borderRadius: '20px', 
                  cursor: 'pointer', 
                  border: selectedTicket?.id === t.id ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>{t.description || 'Access ticket'}</div>
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 950, color: 'var(--primary)' }}>
                  {parseFloat(t.price || 0) === 0 ? (
                    <span style={{ color: '#22c55e', fontWeight: 900 }}>FREE</span>
                  ) : (
                    `${getCurrencySymbol(event?.currency)}${parseFloat(t.price).toFixed(2)}`
                  )}
                </div>
              </div>
            ))}
            {ticketTypes.length === 0 && (
              <p style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>No tickets available for registration.</p>
            )}
          </div>
        </div>

        {/* 2. Purchase Strategy Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <button 
            type="button" 
            onClick={() => setPurchaseType('individual')}
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '12px', 
              fontWeight: 800, 
              border: 'none', 
              cursor: 'pointer',
              background: purchaseType === 'individual' ? 'var(--primary)' : 'var(--surface-highest)',
              color: purchaseType === 'individual' ? '#fff' : 'var(--on-surface)'
            }}
          >
            <User size={16} style={{ marginRight: '6px' }} /> Individual
          </button>
          <button 
            type="button" 
            onClick={() => setPurchaseType('group')}
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '12px', 
              fontWeight: 800, 
              border: 'none', 
              cursor: 'pointer',
              background: purchaseType === 'group' ? 'var(--primary)' : 'var(--surface-highest)',
              color: purchaseType === 'group' ? '#fff' : 'var(--on-surface)'
            }}
          >
            <Users size={16} style={{ marginRight: '6px' }} /> Group Pass
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {purchaseType === 'individual' ? (
            <>
              {/* Individual Form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <label style={styles.label}>First Name</label>
                  <div className="glass" style={styles.inputWrapper}>
                    <User size={20} color="var(--primary)" />
                    <input 
                      type="text" 
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      placeholder="First Name" 
                      style={styles.input} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <label style={styles.label}>Last Name</label>
                  <div className="glass" style={styles.inputWrapper}>
                    <User size={20} color="var(--primary)" />
                    <input 
                      type="text" 
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      placeholder="Last Name" 
                      style={styles.input} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={styles.label}>Email Address</label>
                <div className="glass" style={styles.inputWrapper}>
                  <Mail size={20} color="var(--primary)" />
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address" 
                    style={styles.input} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={styles.label}>Phone Number</label>
                <div className="glass" style={styles.inputWrapper}>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    placeholder="Enter phone number" 
                    style={{...styles.input, paddingLeft: '1.2rem'}} 
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Group Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={styles.label}>Group / Organization Name</label>
                <div className="glass" style={styles.inputWrapper}>
                  <Users size={20} color="var(--primary)" />
                  <input 
                    type="text" 
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Cyberdyne Systems" 
                    style={styles.input} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={styles.label}>Members Registry</label>
                  <button type="button" onClick={handleAddMember} className="glass" style={{ ...styles.actionBtn, padding: '6px 12px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800 }}>+ Member</button>
                </div>

                {groupMembers.map((m, idx) => (
                  <div key={idx} className="glass" style={{ padding: '1.2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>Member #{idx + 1}</span>
                      {groupMembers.length > 1 && (
                        <button type="button" onClick={() => handleRemoveMember(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div style={styles.grid2}>
                      <input 
                        placeholder="First Name" 
                        value={m.first_name} 
                        onChange={e => handleMemberChange(idx, 'first_name', e.target.value)} 
                        required 
                        style={styles.inputPlain} 
                      />
                      <input 
                        placeholder="Last Name" 
                        value={m.last_name} 
                        onChange={e => handleMemberChange(idx, 'last_name', e.target.value)} 
                        required 
                        style={styles.inputPlain} 
                      />
                      <input 
                        type="email"
                        placeholder="Email Address" 
                        value={m.email} 
                        onChange={e => handleMemberChange(idx, 'email', e.target.value)} 
                        required 
                        style={styles.inputPlain} 
                      />
                      <input 
                        type="tel"
                        placeholder="Phone Number" 
                        value={m.phone_number} 
                        onChange={e => handleMemberChange(idx, 'phone_number', e.target.value)} 
                        required 
                        style={styles.inputPlain} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Selfie Reference (Biometrics consent) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label style={styles.label}>Selfie Signature (Optional)</label>
            <div className="glass" style={styles.dropzone}>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setReferenceImage(e.target.files[0])}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              {referenceImage ? (
                <>
                  <CheckCircle size={28} color="#22c55e" />
                  <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{referenceImage.name}</span>
                </>
              ) : (
                <>
                  <Camera size={32} color="var(--primary)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>Click to upload selfie signature</span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginTop: '1rem' }}>
            <input type="checkbox" required={!!referenceImage} style={{ marginTop: '0.4rem', width: '18px', height: '18px' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
              I authorize NeoEvent to process reference images to deliver AI event photos directly to my portfolio vault. {!!referenceImage && <span style={{ color: 'var(--primary)' }}>*</span>}
            </p>
          </div>

          <button 
            type="submit" 
            disabled={registering || !selectedTicket}
            className="btn-primary" 
            style={{ marginTop: '1.5rem', height: '64px', fontSize: '1.15rem', fontWeight: 900, borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}
          >
            {registering ? <Loader2 className="animate-spin" size={24} /> : `Acquire ${purchaseType === 'group' ? `${groupMembers.length} ` : ''}Passes`}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  label: { fontSize: '0.8rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' },
  inputWrapper: { display: 'flex', alignItems: 'center', padding: '0 1.2rem', borderRadius: '14px' },
  input: { background: 'transparent', border: 'none', padding: '1.1rem', color: 'var(--on-surface)', width: '100%', outline: 'none', fontWeight: 600, fontSize: '1rem' },
  inputPlain: { padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', fontSize: '0.9rem', outline: 'none', fontWeight: 600 },
  dropzone: { height: '120px', border: '2px dashed rgba(255, 177, 115, 0.3)', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', position: 'relative', cursor: 'pointer' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }
};

export default Registration;
