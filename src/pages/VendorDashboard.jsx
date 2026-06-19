import React, { useState, useEffect, useContext } from 'react';
import { vendorService } from '../api/vendor';
import { FolderPlus, Image as ImageIcon, Video, CalendarPlus, Loader2, Plus, UploadCloud, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const VendorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [systemEvents, setSystemEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');

  const [newCategory, setNewCategory] = useState({ name: '', description: '', cover_image: null });
  const [editingCategory, setEditingCategory] = useState(null);
  const [newEvent, setNewEvent] = useState({ category: '', system_event: '', name: '', description: '', details: '', location: '', address: '', state: '', date: '' });
  const [newMedia, setNewMedia] = useState({ event: '', file_type: 'IMAGE', caption: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentGallery, setAssignmentGallery] = useState([]);
  const [invitedMediaFiles, setInvitedMediaFiles] = useState([]);
  const [uploadingInvited, setUploadingInvited] = useState(false);
  
  const vendorSubtype = user?.vendor_profile?.subtype || '';
  const isMediaVendor = vendorSubtype === 'PHOTOGRAPHER' || vendorSubtype === 'VIDEOGRAPHER';
  
  const tabs = ['assignments', 'categories', 'events', 'settings'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, evRes, galRes, sysEvRes, asgRes, busRes] = await Promise.all([
        vendorService.getCategories(),
        vendorService.getEvents(),
        vendorService.getGallery(),
        vendorService.getAllSystemEvents().catch(() => ({ data: [] })),
        vendorService.getMyAssignments().catch(() => ({ data: [] })),
        vendorService.getBusinessProfile().catch(() => ({ data: null }))
      ]);
      const eventsData = evRes.data.results || evRes.data || [];
      setCategories(catRes.data.results || catRes.data || []);
      setEvents(eventsData);
      setSystemEvents(sysEvRes.data.results || sysEvRes.data || []);
      setAssignments(asgRes.data.results || asgRes.data || []);
      setBusinessProfile(busRes.data);

      if (selectedEvent) {
        const updatedEvent = eventsData.find(e => e.id === selectedEvent.id);
        if (updatedEvent) setSelectedEvent(updatedEvent);
      }
    } catch (error) {
      console.error("Failed to fetch vendor data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAssignment = async (assignment) => {
    setSelectedAssignment(assignment);
    if (isMediaVendor) {
      fetchAssignmentGallery(assignment.id);
    }
  };

  const fetchAssignmentGallery = async (assignmentId) => {
    try {
      const res = await vendorService.getInvitedEventMedia(assignmentId);
      setAssignmentGallery(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to fetch assignment gallery", err);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newCategory.name);
      if (newCategory.description) formData.append('description', newCategory.description);
      if (newCategory.cover_image instanceof File) formData.append('cover_image', newCategory.cover_image);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editingCategory) {
        await vendorService.updateCategory(editingCategory.id, formData, config);
        setEditingCategory(null);
      } else {
        await vendorService.createCategory(formData, config);
      }
      setNewCategory({ name: '', description: '', cover_image: null });
      const fileInput = document.getElementById('category-cover-input');
      if (fileInput) fileInput.value = '';
      fetchData();
    } catch (err) { 
      console.error(err);
      if (err.response?.status === 400 && err.response?.data?.non_field_errors) {
        alert('A category with this name already exists.');
      } else {
        alert('Error saving category. Names must be unique.');
      }
    }
  };

  const handleEditCategoryClick = (cat) => {
    setEditingCategory(cat);
    setNewCategory({ name: cat.name, description: cat.description || '', cover_image: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setNewCategory({ name: '', description: '', cover_image: null });
    const fileInput = document.getElementById('category-cover-input');
    if (fileInput) fileInput.value = '';
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category? This may affect linked events.")) {
      try {
        await vendorService.deleteCategory(id);
        if (editingCategory && editingCategory.id === id) cancelEditCategory();
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete category.");
      }
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await vendorService.createEvent(newEvent);
      setNewEvent({ category: '', system_event: '', name: '', location: '', address: '', state: '', date: '', details: '', description: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteEvent = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this event and all its media?")) {
      try {
        await vendorService.deleteEvent(id);
        if (selectedEvent && selectedEvent.id === id) setSelectedEvent(null);
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete event.");
      }
    }
  };

  const handleDeleteMedia = async (id) => {
    if (window.confirm("Are you sure you want to delete this media?")) {
      try {
        await vendorService.deleteGalleryMedia(id);
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete media.");
      }
    }
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
        address: sysEv.location, // System events usually combine these
        date: sysEv.date || sysEv.start_date
      });
    } else {
      setNewEvent({ ...newEvent, system_event: '' });
    }
  };

  const handleUploadMedia = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || !selectedEvent) return;
    setUploadingInvited(true);
    try {
      const uploadPromises = Array.from(selectedFiles).map(file => {
        const formData = new FormData();
        formData.append('event', selectedEvent.id);
        formData.append('file_type', newMedia.file_type);
        formData.append('caption', newMedia.caption);
        formData.append('media_file', file);
        return vendorService.uploadMedia(formData);
      });

      await Promise.all(uploadPromises);
      setNewMedia({ event: '', file_type: 'IMAGE', caption: '' });
      setSelectedFiles([]);
      fetchData();
    } catch (err) { 
      console.error(err); 
      alert('Error uploading some media.');
    } finally {
      setUploadingInvited(false);
    }
  };

  const handleUploadInvitedMedia = async (assignmentId) => {
    if (invitedMediaFiles.length === 0) return;
    setUploadingInvited(true);
    try {
      const uploadPromises = Array.from(invitedMediaFiles).map(file => {
        const formData = new FormData();
        formData.append('raw_image', file);
        return vendorService.uploadInvitedEventMedia(assignmentId, formData);
      });

      await Promise.all(uploadPromises);
      setInvitedMediaFiles([]);
      alert('Media uploaded successfully!');
      fetchAssignmentGallery(assignmentId);
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
            settings: 'Settings'
          };
          return (
            <button 
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedAssignment(null);
                setSelectedEvent(null);
                cancelEditCategory();
              }}
              className={isActive ? 'btn-primary' : 'glass'}
              style={{
                ...styles.tabBtn,
                background: isActive 
                  ? 'linear-gradient(135deg, var(--primary), var(--primary-container))' 
                  : 'var(--surface-tint)',
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

      {activeTab === 'assignments' && !selectedAssignment && (
        <div style={styles.section}>
          <div style={styles.list}>
            {assignments.length === 0 ? <p>No assignments yet.</p> : assignments.map(a => (
              <div 
                key={a.id} 
                className="glass hover-card" 
                style={{...styles.listItem, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}
                onClick={() => handleSelectAssignment(a)}
              >
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--primary)' }}>
                  {a.event_title || `Event ID: ${a.event}`}
                </h3>
                <p style={{ fontWeight: 600 }}>Role: {a.role_display}</p>
                <p style={{ color: 'var(--on-surface-variant)', marginTop: '10px' }}>Click to view details {isMediaVendor && '& upload media'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && selectedAssignment && (
        <div style={styles.section}>
          <button 
            className="glass" 
            style={{...styles.tabBtn, width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px'}} 
            onClick={() => setSelectedAssignment(null)}
          >
            <ArrowLeft size={18} /> Back to Assignments
          </button>
          
          <div className="glass" style={styles.card}>
            <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--primary)' }}>
              {selectedAssignment.event_title || `Event ID: ${selectedAssignment.event}`}
            </h2>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Role: {selectedAssignment.role_display}</p>
            
            {isMediaVendor && (
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <UploadCloud size={24} color="var(--primary)" /> 
                  Upload Event Media
                </h3>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      multiple
                      onChange={e => setInvitedMediaFiles(e.target.files)} 
                      style={styles.input} 
                    />
                    <button 
                      onClick={() => handleUploadInvitedMedia(selectedAssignment.id)}
                      disabled={invitedMediaFiles.length === 0 || uploadingInvited}
                      className="btn-primary" 
                      style={{...styles.submitBtn, opacity: (invitedMediaFiles.length === 0 || uploadingInvited) ? 0.5 : 1}}
                    >
                      {uploadingInvited ? <Loader2 className="spinner" size={20} /> : `Upload ${invitedMediaFiles.length > 0 ? invitedMediaFiles.length : ''} Media`}
                    </button>
                  </div>
                </div>

                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '40px', marginBottom: '15px' }}>
                  <ImageIcon size={24} color="var(--primary)" /> 
                  Event Gallery
                </h3>
                {assignmentGallery.length === 0 ? (
                  <p style={{ color: 'var(--on-surface-variant)' }}>No media uploaded yet.</p>
                ) : (
                  <div style={styles.grid}>
                    {assignmentGallery.map(g => (
                      <div key={g.id} className="glass hover-card" style={styles.mediaCard}>
                        {g.raw_image && <img src={g.raw_image} alt="Upload" style={styles.mediaImage} />}
                        <div style={{ padding: '15px' }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '5px' }}>
                            Uploaded: {new Date(g.uploaded_at).toLocaleDateString()}
                          </p>
                          {g.is_processed ? (
                            <span style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.9rem' }}>✓ Watermarked</span>
                          ) : (
                            <span style={{ color: '#facc15', fontWeight: 600, fontSize: '0.9rem' }}>⧗ Processing...</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!isMediaVendor && (
              <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                <p>You are assigned to this event as a {selectedAssignment.role_display}.</p>
                <p style={{ marginTop: '10px', color: 'var(--on-surface-variant)' }}>Please coordinate with the event owner for further instructions.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div style={styles.section}>
          <div className="glass" style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={20} /> {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              {editingCategory && (
                <button onClick={cancelEditCategory} className="glass" style={{ border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                  Cancel
                </button>
              )}
            </div>
            <form onSubmit={handleSaveCategory} style={{...styles.form, marginTop: 0}}>
              <input placeholder="Category Name (e.g. Weddings)" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} required style={styles.input} />
              <input placeholder="Description" value={newCategory.description} onChange={e => setNewCategory({...newCategory, description: e.target.value})} style={styles.input} />
              <label style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginBottom: '-10px' }}>Cover Image (Optional)</label>
              <input 
                id="category-cover-input"
                type="file" 
                accept="image/*" 
                onChange={e => setNewCategory({...newCategory, cover_image: e.target.files[0]})} 
                style={styles.input} 
              />
              <button type="submit" className="btn-primary" style={styles.submitBtn}>
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </form>
          </div>
          <div style={styles.list}>
            {categories.map(c => (
              <div key={c.id} className="glass hover-card" style={{...styles.listItem, position: 'relative'}}>
                <h3 style={{ paddingRight: '140px' }}>{c.name}</h3>
                <p>{c.description}</p>
                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleEditCategoryClick(c)}
                    className="glass"
                    style={{ border: '1px solid var(--primary)', color: 'var(--primary)', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(c.id)}
                    className="glass"
                    style={{ border: '1px solid #ef4444', color: '#ef4444', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && !selectedEvent && (
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
              <input placeholder="Description" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} style={styles.input} />
              <textarea placeholder="Details" value={newEvent.details} onChange={e => setNewEvent({...newEvent, details: e.target.value})} style={{...styles.input, minHeight: '100px'}} />
              <div className="responsive-2col" style={{ gap: '15px' }}>
                <input placeholder="Location (Venue)" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} style={styles.input} />
                <input placeholder="State" value={newEvent.state} onChange={e => setNewEvent({...newEvent, state: e.target.value})} style={styles.input} />
              </div>
              <input placeholder="Address" value={newEvent.address} onChange={e => setNewEvent({...newEvent, address: e.target.value})} style={styles.input} />
              <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} style={styles.input} />
              <button type="submit" className="btn-primary" style={styles.submitBtn}>Add Event</button>
            </form>
          </div>
          <div>
            {categories.map(c => {
               const categoryEvents = events.filter(e => e.category === c.id);
               if (categoryEvents.length === 0) return null;
               return (
                 <div key={c.id} style={{ marginBottom: '40px' }}>
                   <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>{c.name}</h3>
                   <div style={styles.list}>
                     {categoryEvents.map(e => (
                       <div key={e.id} className="glass hover-card" style={{...styles.listItem, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative'}} onClick={() => setSelectedEvent(e)}>
                         <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                           <button 
                             onClick={(evt) => handleDeleteEvent(evt, e.id)}
                             className="glass"
                             style={{ border: '1px solid #ef4444', color: '#ef4444', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', background: 'transparent', fontSize: '0.85rem' }}
                           >
                             Delete
                           </button>
                         </div>
                         <h4 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--primary)', paddingRight: '60px' }}>{e.name}</h4>
                         <p>{e.location} - {e.date}</p>
                         <p style={{ color: 'var(--on-surface-variant)', marginTop: '10px' }}>Click to view details & gallery</p>
                       </div>
                     ))}
                   </div>
                 </div>
               )
            })}
            
            {events.filter(e => !categories.find(c => c.id === e.category)).length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                 <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Uncategorized</h3>
                  <div style={styles.list}>
                   {events.filter(e => !categories.find(c => c.id === e.category)).map(e => (
                     <div key={e.id} className="glass hover-card" style={{...styles.listItem, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative'}} onClick={() => setSelectedEvent(e)}>
                       <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                         <button 
                           onClick={(evt) => handleDeleteEvent(evt, e.id)}
                           className="glass"
                           style={{ border: '1px solid #ef4444', color: '#ef4444', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', background: 'transparent', fontSize: '0.85rem' }}
                         >
                           Delete
                         </button>
                       </div>
                       <h4 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--primary)', paddingRight: '60px' }}>{e.name}</h4>
                       <p>{e.location} - {e.date}</p>
                       <p style={{ color: 'var(--on-surface-variant)', marginTop: '10px' }}>Click to view details & gallery</p>
                     </div>
                   ))}
                 </div>
              </div>
            )}
            
            {events.length === 0 && (
               <p style={{ color: 'var(--on-surface-variant)' }}>No portfolio events added yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'events' && selectedEvent && (
        <div style={styles.section}>
          <button 
            className="glass" 
            style={{...styles.tabBtn, width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px'}} 
            onClick={() => setSelectedEvent(null)}
          >
            <ArrowLeft size={18} /> Back to Events
          </button>
          
          <div className="glass" style={styles.card}>
            <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--primary)' }}>{selectedEvent.name}</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '20px' }}>
              {selectedEvent.date} {selectedEvent.location ? `• ${selectedEvent.location}` : ''} {selectedEvent.state ? `• ${selectedEvent.state}` : ''}
            </p>
            
            {selectedEvent.description && <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '10px' }}>{selectedEvent.description}</p>}
            {selectedEvent.details && <p style={{ marginBottom: '20px' }}>{selectedEvent.details}</p>}
            {selectedEvent.address && <p style={{ marginBottom: '20px', color: 'var(--on-surface-variant)' }}>Address: {selectedEvent.address}</p>}

            <div style={{ marginTop: '40px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <UploadCloud size={24} color="var(--primary)" /> 
                Upload Portfolio Media
              </h3>
              <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                <form onSubmit={handleUploadMedia} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <select value={newMedia.file_type} onChange={e => setNewMedia({...newMedia, file_type: e.target.value})} required style={styles.input}>
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                  </select>
                  <input type="file" accept="image/*,video/*" multiple onChange={e => setSelectedFiles(e.target.files)} required style={styles.input} />
                  <input placeholder="Caption (applied to all)" value={newMedia.caption} onChange={e => setNewMedia({...newMedia, caption: e.target.value})} style={styles.input} />
                  <button type="submit" disabled={uploadingInvited} className="btn-primary" style={{...styles.submitBtn, opacity: uploadingInvited ? 0.5 : 1}}>
                    {uploadingInvited ? <Loader2 className="spinner" size={20} /> : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} Media`}
                  </button>
                </form>
              </div>

              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '40px', marginBottom: '15px' }}>
                <ImageIcon size={24} color="var(--primary)" /> 
                Event Gallery
              </h3>
              {(!selectedEvent.media || selectedEvent.media.length === 0) ? (
                <p style={{ color: 'var(--on-surface-variant)' }}>No media uploaded yet.</p>
              ) : (
                <div style={styles.grid}>
                  {selectedEvent.media.map(g => (
                    <div key={g.id} className="glass hover-card" style={{...styles.mediaCard, position: 'relative'}}>
                      {g.file_type === 'IMAGE' ? (
                        <img src={g.media_file} alt={g.caption} style={styles.mediaImage} />
                      ) : (
                        <video src={g.media_file} controls style={styles.mediaImage} />
                      )}
                      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{g.caption || 'No caption'}</p>
                        <button 
                          onClick={() => handleDeleteMedia(g.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, padding: '5px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {activeTab === 'settings' && (
        <div style={styles.section}>
          <div className="glass" style={styles.card}>
            <h2 style={{ marginBottom: '20px' }}>Portfolio Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '10px' }}>Business Name (Public Portfolio Name)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Business Name" 
                    defaultValue={businessProfile?.business_name || ''} 
                    id="business-name-input"
                    style={{...styles.input, flex: 1}} 
                  />
                  <button 
                    className="btn-primary" 
                    style={{ padding: '15px 25px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    onClick={async () => {
                      const val = document.getElementById('business-name-input').value;
                      try {
                        await vendorService.updateBusinessProfile({ business_name: val });
                        alert('Business name updated successfully!');
                      } catch (err) {
                        console.error(err);
                        alert('Failed to update business name.');
                      }
                    }}
                  >
                    Save Name
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '10px' }}>Custom Portfolio URL</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>{window.location.origin}/p/</span>
                <input 
                  type="text" 
                  placeholder="custom-url" 
                  defaultValue={businessProfile?.custom_url || ''} 
                  id="custom-url-input"
                  style={{...styles.input, flex: 1}} 
                />
                <button 
                  className="btn-primary" 
                  style={{ padding: '15px 25px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  onClick={async () => {
                    const val = document.getElementById('custom-url-input').value;
                    try {
                      await vendorService.updateBusinessProfile({ custom_url: val });
                      alert('Custom URL updated successfully!');
                    } catch (err) {
                      console.error(err);
                      alert('Failed to update URL. It might already be taken.');
                    }
                  }}
                >
                  Save URL
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Set a custom URL to share your portfolio easily. Use letters, numbers, and hyphens only.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 'clamp(1.5rem, 5vw, 2.5rem)', maxWidth: '1200px', margin: '0 auto', color: 'var(--on-surface)' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  title: { fontSize: '2.5rem', marginBottom: '30px' },
  tabs: { display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' },
  tabBtn: { padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', border: 'none' },
  section: { display: 'flex', flexDirection: 'column', gap: '30px' },
  card: { padding: '30px', borderRadius: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  input: { padding: '15px', borderRadius: '12px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', fontSize: '1rem', outline: 'none' },
  submitBtn: { padding: '15px', borderRadius: '12px', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  list: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  listItem: { padding: '20px', borderRadius: '16px', transition: 'all 0.3s ease' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  mediaCard: { borderRadius: '16px', overflow: 'hidden' },
  mediaImage: { width: '100%', height: '200px', objectFit: 'cover' }
};

export default VendorDashboard;