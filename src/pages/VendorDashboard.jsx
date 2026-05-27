import React, { useState, useEffect, useContext } from 'react';
import { vendorService } from '../api/vendor';
import { FolderPlus, Image as ImageIcon, Video, CalendarPlus, Loader2, Plus, UploadCloud } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const VendorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [systemEvents, setSystemEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newEvent, setNewEvent] = useState({ category: '', system_event: '', name: '', location: '', date: '' });
  const [newMedia, setNewMedia] = useState({ event: '', file_type: 'IMAGE', caption: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [invitedMediaFile, setInvitedMediaFile] = useState(null);
  const [uploadingInvited, setUploadingInvited] = useState(false);
  
  const vendorSubtype = user?.vendor_profile?.subtype || '';
  const isMediaVendor = vendorSubtype === 'PHOTOGRAPHER' || vendorSubtype === 'VIDEOGRAPHER';
  
  const tabs = ['assignments', 'categories', 'events', 'gallery'];
  if (isMediaVendor) {
    tabs.push('invited_events');
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, evRes, galRes, sysEvRes, asgRes] = await Promise.all([
        vendorService.getCategories(),
        vendorService.getEvents(),
        vendorService.getGallery(),
        vendorService.getAllSystemEvents().catch(() => ({ data: [] })),
        vendorService.getMyAssignments().catch(() => ({ data: [] }))
      ]);
      setCategories(catRes.data.results || catRes.data || []);
      setEvents(evRes.data.results || evRes.data || []);
      setGallery(galRes.data.results || galRes.data || []);
      setSystemEvents(sysEvRes.data.results || sysEvRes.data || []);
      setAssignments(asgRes.data.results || asgRes.data || []);
    } catch (error) {
      console.error("Failed to fetch vendor data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await vendorService.createCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await vendorService.createEvent(newEvent);
      setNewEvent({ category: '', system_event: '', name: '', location: '', date: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleSystemEventSelect = (e) => {
    const evId = e.target.value;
    const sysEv = systemEvents.find(ev => ev.id === evId);
    if (sysEv) {
      setNewEvent({
        ...newEvent,
        system_event: sysEv.id,
        name: sysEv.title || sysEv.name,
        location: sysEv.location,
        date: sysEv.date || sysEv.start_date
      });
    } else {
      setNewEvent({ ...newEvent, system_event: '' });
    }
  };

  const handleUploadMedia = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('event', newMedia.event);
    formData.append('file_type', newMedia.file_type);
    formData.append('caption', newMedia.caption);
    formData.append('media_file', selectedFile);

    try {
      await vendorService.uploadMedia(formData);
      setNewMedia({ event: '', file_type: 'IMAGE', caption: '' });
      setSelectedFile(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleRespondInvite = async (code, accept) => {
    try {
      await vendorService.respondToInvite(code, accept);
      fetchData();
    } catch (err) {
      alert("Error responding to invite.");
    }
  };

  const handleUploadInvitedMedia = async (assignmentId) => {
    if (!invitedMediaFile) return;
    setUploadingInvited(true);
    const formData = new FormData();
    formData.append('raw_image', invitedMediaFile);
    try {
      await vendorService.uploadInvitedEventMedia(assignmentId, formData);
      setInvitedMediaFile(null);
      alert('Media uploaded successfully! It will be watermarked shortly.');
      // Optionally re-fetch if we display the gallery here
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error uploading media.');
    } finally {
      setUploadingInvited(false);
    }
  };

  if (loading) return <div style={styles.center}><Loader2 className="spinner" size={40} color="var(--primary)" /></div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Vendor Dashboard</h1>
      
      <div style={styles.tabs}>
        {tabs.map(tab => {
          const isActive = activeTab === tab;
          const labels = {
            assignments: 'Event Assignments',
            categories: 'Categories',
            events: 'Events',
            gallery: 'Gallery',
            invited_events: 'Invited Events (Upload)'
          };
          return (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={isActive ? 'btn-primary' : 'glass'}
              style={{
                ...styles.tabBtn,
                background: isActive 
                  ? 'linear-gradient(135deg, var(--primary), var(--primary-container))' 
                  : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#080C14' : 'var(--on-surface-variant)',
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                boxShadow: isActive ? '0 0 15px rgba(255, 177, 115, 0.3)' : 'none',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {activeTab === 'assignments' && (
        <div style={styles.section}>
          <div style={styles.list}>
            {assignments.length === 0 ? <p>No assignments yet.</p> : assignments.map(a => (
              <div key={a.id} className="glass hover-card" style={styles.listItem}>
                <h3>Event ID: {a.event}</h3>
                <p>Role: {a.role_display}</p>
                <p>Status: {a.is_confirmed ? "Confirmed" : "Pending"}</p>
                {!a.is_confirmed && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => handleRespondInvite(a.invitation_code || a.id, true)} className="btn-primary" style={{...styles.submitBtn, padding: '10px', fontSize: '0.9rem'}}>Accept</button>
                    <button onClick={() => handleRespondInvite(a.invitation_code || a.id, false)} className="glass" style={{...styles.tabBtn, padding: '10px', fontSize: '0.9rem'}}>Decline</button>
                  </div>
                )}
                {a.is_confirmed && (
                  <p style={{ marginTop: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>You can link this event in the Events tab.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div style={styles.section}>
          <div className="glass" style={styles.card}>
            <h2><FolderPlus size={20} /> Add Category</h2>
            <form onSubmit={handleCreateCategory} style={styles.form}>
              <input placeholder="Category Name (e.g. Weddings)" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} required style={styles.input} />
              <input placeholder="Description" value={newCategory.description} onChange={e => setNewCategory({...newCategory, description: e.target.value})} style={styles.input} />
              <button type="submit" className="btn-primary" style={styles.submitBtn}>Create Category</button>
            </form>
          </div>
          <div style={styles.list}>
            {categories.map(c => (
              <div key={c.id} className="glass hover-card" style={styles.listItem}>
                <h3>{c.name}</h3>
                <p>{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div style={styles.section}>
          <div className="glass" style={styles.card}>
            <h2><CalendarPlus size={20} /> Add Event</h2>
            <form onSubmit={handleCreateEvent} style={styles.form}>
              <select value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})} required style={styles.input}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              
              <select value={newEvent.system_event} onChange={handleSystemEventSelect} style={styles.input}>
                <option value="">-- Optional: Link from System Events --</option>
                {systemEvents.map(se => <option key={se.id} value={se.id}>{se.title || se.name}</option>)}
              </select>

              <input placeholder="Event Name" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} required style={styles.input} />
              <input placeholder="Location" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} style={styles.input} />
              <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} style={styles.input} />
              <button type="submit" className="btn-primary" style={styles.submitBtn}>Add Event</button>
            </form>
          </div>
          <div style={styles.list}>
            {events.map(e => (
              <div key={e.id} className="glass hover-card" style={styles.listItem}>
                <h3>{e.name}</h3>
                <p>{e.location} - {e.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div style={styles.section}>
          <div className="glass" style={styles.card}>
            <h2><ImageIcon size={20} /> Upload Media</h2>
            <form onSubmit={handleUploadMedia} style={styles.form}>
              <select value={newMedia.event} onChange={e => setNewMedia({...newMedia, event: e.target.value})} required style={styles.input}>
                <option value="">Select Event</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
              <select value={newMedia.file_type} onChange={e => setNewMedia({...newMedia, file_type: e.target.value})} required style={styles.input}>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
              </select>
              <input type="file" accept="image/*,video/*" onChange={e => setSelectedFile(e.target.files[0])} required style={styles.input} />
              <input placeholder="Caption" value={newMedia.caption} onChange={e => setNewMedia({...newMedia, caption: e.target.value})} style={styles.input} />
              <button type="submit" className="btn-primary" style={styles.submitBtn}>Upload</button>
            </form>
          </div>
          <div style={styles.grid}>
            {gallery.map(g => (
              <div key={g.id} className="glass hover-card" style={styles.mediaCard}>
                {g.file_type === 'IMAGE' ? (
                  <img src={g.media_file} alt={g.caption} style={styles.mediaImage} />
                ) : (
                  <video src={g.media_file} controls style={styles.mediaImage} />
                )}
                <p style={{padding: '10px'}}>{g.caption || 'No caption'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'invited_events' && isMediaVendor && (
        <div style={styles.section}>
          <div className="glass" style={styles.card}>
            <h2><UploadCloud size={20} style={{ marginRight: '10px' }} /> Upload to Assigned Events</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '20px' }}>
              As a {vendorSubtype.toLowerCase()}, you can upload raw media directly to the events you have accepted. 
              The system will automatically apply a "PREVIEW ONLY" watermark to your images for event owners and attendees.
            </p>
            <div style={styles.list}>
              {assignments.filter(a => a.is_confirmed).map(a => (
                <div key={a.id} className="glass hover-card" style={styles.listItem}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{a.event_title || `Event ID: ${a.event}`}</h3>
                  <p style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '20px' }}>Role: {a.role_display}</p>
                  
                  <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setInvitedMediaFile(e.target.files[0])} 
                        style={styles.input} 
                      />
                      <button 
                        onClick={() => handleUploadInvitedMedia(a.id)}
                        disabled={!invitedMediaFile || uploadingInvited}
                        className="btn-primary" 
                        style={{...styles.submitBtn, opacity: (!invitedMediaFile || uploadingInvited) ? 0.5 : 1}}
                      >
                        {uploadingInvited ? 'Uploading...' : 'Upload Watermarked Media'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {assignments.filter(a => a.is_confirmed).length === 0 && (
                <p>You have no confirmed event assignments to upload to.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', color: 'var(--on-surface)' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  title: { fontSize: '2.5rem', marginBottom: '30px' },
  tabs: { display: 'flex', gap: '15px', marginBottom: '30px' },
  tabBtn: { padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', border: 'none' },
  section: { display: 'flex', flexDirection: 'column', gap: '30px' },
  card: { padding: '30px', borderRadius: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  input: { padding: '15px', borderRadius: '12px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', fontSize: '1rem', outline: 'none' },
  submitBtn: { padding: '15px', borderRadius: '12px', fontSize: '1rem', cursor: 'pointer' },
  list: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  listItem: { padding: '20px', borderRadius: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  mediaCard: { borderRadius: '16px', overflow: 'hidden' },
  mediaImage: { width: '100%', height: '200px', objectFit: 'cover' }
};

export default VendorDashboard;