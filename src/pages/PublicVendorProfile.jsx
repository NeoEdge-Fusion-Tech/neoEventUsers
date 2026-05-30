import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { vendorService } from '../api/vendor';
import { MapPin, Mail, Phone, Loader2, CheckCircle, Disc, Camera, Image as ImageIcon, ChevronRight, X, ArrowLeft } from 'lucide-react';

const PublicVendorProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Drill-down State
  const [currentView, setCurrentView] = useState('HOME'); // 'HOME', 'CATEGORY', 'EVENT'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Lightbox State
  const [lightboxMedia, setLightboxMedia] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await vendorService.getPublicProfile(id);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load vendor profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div style={styles.center}><Loader2 className="spinner" size={40} color="var(--primary)" /></div>;
  if (!profile) return <div style={styles.center}><h2>Vendor not found</h2></div>;

  // Navigation Handlers
  const goHome = () => {
    setSelectedCategory(null);
    setSelectedEvent(null);
    setCurrentView('HOME');
  };

  const goToCategory = (category) => {
    setSelectedCategory(category);
    setSelectedEvent(null);
    setCurrentView('CATEGORY');
  };

  const goToEvent = (event) => {
    setSelectedEvent(event);
    setCurrentView('EVENT');
  };

  const renderBreadcrumbs = () => (
    <div style={styles.breadcrumbs}>
      <span style={styles.breadcrumbItem} onClick={goHome}>Portfolio</span>
      
      {currentView !== 'HOME' && selectedCategory && (
        <>
          <ChevronRight size={16} color="var(--on-surface-variant)" />
          <span 
            style={currentView === 'CATEGORY' ? styles.breadcrumbActive : styles.breadcrumbItem} 
            onClick={() => goToCategory(selectedCategory)}
          >
            {selectedCategory.name}
          </span>
        </>
      )}

      {currentView === 'EVENT' && selectedEvent && (
        <>
          <ChevronRight size={16} color="var(--on-surface-variant)" />
          <span style={styles.breadcrumbActive}>{selectedEvent.name}</span>
        </>
      )}
    </div>
  );

  const renderCategories = () => {
    if (!profile.gallery_categories || profile.gallery_categories.length === 0) {
      return (
        <div className="glass" style={styles.emptyState}>
          <ImageIcon size={64} style={styles.emptyIcon} />
          <p style={styles.emptyText}>No portfolio collections added yet.</p>
        </div>
      );
    }

    return (
      <div style={styles.grid}>
        {profile.gallery_categories.map(category => {
          const eventCount = category.events?.length || 0;
          return (
            <div key={category.id} className="glass hover-card" style={styles.card} onClick={() => goToCategory(category)}>
              <div style={styles.cardIconBox}>
                <ImageIcon size={32} color="var(--primary)" />
              </div>
              <h3 style={styles.cardTitle}>{category.name}</h3>
              {category.description && <p style={styles.cardDesc}>{category.description}</p>}
              <div style={styles.cardBadge}>{eventCount} Event{eventCount !== 1 ? 's' : ''}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEvents = () => {
    if (!selectedCategory.events || selectedCategory.events.length === 0) {
      return (
        <div className="glass" style={styles.emptyState}>
          <Camera size={64} style={styles.emptyIcon} />
          <p style={styles.emptyText}>No events in this category yet.</p>
          <button onClick={goHome} className="btn-secondary" style={{ marginTop: '20px' }}><ArrowLeft size={16} /> Back to Categories</button>
        </div>
      );
    }

    return (
      <div style={styles.grid}>
        {selectedCategory.events.map(event => {
          const mediaCount = event.media?.length || 0;
          // Get the first image as a thumbnail if available
          const thumbnail = event.media?.find(m => m.file_type === 'IMAGE')?.media_file;

          return (
            <div key={event.id} className="glass hover-card" style={{...styles.card, padding: 0, overflow: 'hidden'}} onClick={() => goToEvent(event)}>
              <div style={styles.thumbnailContainer}>
                {thumbnail ? (
                  <img src={thumbnail} alt={event.name} style={styles.thumbnailImage} />
                ) : (
                  <div style={styles.thumbnailPlaceholder}><Camera size={32} opacity={0.3} /></div>
                )}
                <div style={styles.mediaCountBadge}><ImageIcon size={14}/> {mediaCount}</div>
              </div>
              <div style={{ padding: '20px' }}>
                <h4 style={styles.eventCardTitle}>{event.name}</h4>
                <p style={styles.eventCardInfo}>{event.location} • {event.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderGallery = () => {
    if (!selectedEvent.media || selectedEvent.media.length === 0) {
      return (
        <div className="glass" style={styles.emptyState}>
          <Camera size={64} style={styles.emptyIcon} />
          <p style={styles.emptyText}>No media captured for this event.</p>
          <button onClick={() => goToCategory(selectedCategory)} className="btn-secondary" style={{ marginTop: '20px' }}><ArrowLeft size={16} /> Back to Events</button>
        </div>
      );
    }

    return (
      <div style={{ columns: '3 280px', gap: '1.5rem' }}>
        {selectedEvent.media.map(media => (
          <div key={media.id} style={styles.masonryItem} onClick={() => setLightboxMedia(media)}>
            {media.file_type === 'IMAGE' ? (
              <img src={media.media_file} alt={media.caption} style={styles.masonryImage} className="zoom-on-hover" />
            ) : (
              <video src={media.media_file} controls style={styles.masonryImage} />
            )}
            {media.caption && (
              <div style={styles.captionOverlay}>
                <p style={styles.captionText}>{media.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.heroBackground}>
        <div style={styles.heroOverlay}></div>
      </div>

      <div style={styles.contentWrapper}>
        {/* Header Card */}
        <div className="glass" style={styles.headerCard}>
          <div style={styles.headerInfo}>
            <div style={styles.avatarBox}>
              <Disc size={60} color="var(--primary)" />
            </div>
            <div style={styles.headerDetails}>
              <h1 style={styles.businessName}>{profile.business_name}</h1>
              <div style={styles.contactRow}>
                {profile.city && profile.country && <span style={styles.contactItem}><MapPin size={16}/> {profile.city}, {profile.country}</span>}
                {profile.email && <span style={styles.contactItem}><Mail size={16}/> {profile.email}</span>}
                {profile.phone_number && <span style={styles.contactItem}><Phone size={16}/> {profile.phone_number}</span>}
              </div>
              {profile.is_registered && (
                <div style={styles.registeredBadge}>
                  <CheckCircle size={16}/> Official Registered Business
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Portfolio Section */}
        <div style={styles.portfolioSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>NeoEvent <span style={{ color: 'var(--primary)' }}>Portfolio</span></h2>
            <div style={styles.titleUnderline}></div>
          </div>

          {/* Breadcrumbs */}
          {renderBreadcrumbs()}

          {/* Dynamic Views */}
          <div style={{ marginTop: '30px' }}>
            {currentView === 'HOME' && renderCategories()}
            {currentView === 'CATEGORY' && renderEvents()}
            {currentView === 'EVENT' && renderGallery()}
          </div>
        </div>
      </div>
      
      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div style={styles.lightboxOverlay} onClick={() => setLightboxMedia(null)}>
          <button style={styles.closeBtn} onClick={() => setLightboxMedia(null)}><X size={32} /></button>
          <div style={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {lightboxMedia.file_type === 'IMAGE' ? (
              <img src={lightboxMedia.media_file} alt={lightboxMedia.caption} style={styles.lightboxImage} />
            ) : (
              <video src={lightboxMedia.media_file} controls autoPlay style={styles.lightboxImage} />
            )}
            {lightboxMedia.caption && <p style={styles.lightboxCaption}>{lightboxMedia.caption}</p>}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .zoom-on-hover {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .zoom-on-hover:hover {
          transform: scale(1.05);
        }
        .hover-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .hover-card:hover {
          box-shadow: var(--shadow-kinetic);
          transform: translateY(-4px);
        }
      `}} />
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--on-surface)' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  heroBackground: { height: '350px', background: 'var(--primary-container)', position: 'relative', overflow: 'hidden' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 150%, var(--primary), transparent)', opacity: 0.15 },
  contentWrapper: { maxWidth: '1200px', margin: '-120px auto 0', padding: '0 2rem', position: 'relative', zIndex: 10, paddingBottom: '4rem' },
  headerCard: { padding: '3rem', borderRadius: '32px', marginBottom: '4rem', display: 'flex', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
  headerInfo: { display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap', width: '100%' },
  avatarBox: { width: '140px', height: '140px', borderRadius: '40px', backgroundColor: 'var(--surface-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid var(--primary)' },
  headerDetails: { flex: 1 },
  businessName: { fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-1px' },
  contactRow: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--on-surface-variant)', marginBottom: '1.5rem' },
  contactItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 500 },
  registeredBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: '24px', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' },
  portfolioSection: { display: 'flex', flexDirection: 'column' },
  sectionHeader: { marginBottom: '1rem' },
  sectionTitle: { fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.8rem', letterSpacing: '-1px' },
  titleUnderline: { height: '4px', width: '60px', background: 'var(--primary)', borderRadius: '2px' },
  
  // Breadcrumbs
  breadcrumbs: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', background: 'var(--surface)', padding: '15px 25px', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '10px' },
  breadcrumbItem: { color: 'var(--on-surface-variant)', cursor: 'pointer', fontWeight: 600, transition: 'color 0.2s' },
  breadcrumbActive: { color: 'var(--primary)', fontWeight: 800 },
  
  // Grid & Cards
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' },
  card: { padding: '30px', borderRadius: '24px', border: '1px solid var(--glass-border)', position: 'relative' },
  cardIconBox: { width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255, 177, 115, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  cardTitle: { fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px' },
  cardDesc: { color: 'var(--on-surface-variant)', fontSize: '1rem', lineHeight: '1.5' },
  cardBadge: { position: 'absolute', top: '30px', right: '30px', background: 'var(--surface-highest)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 },
  
  // Event Cards
  thumbnailContainer: { width: '100%', height: '220px', position: 'relative', backgroundColor: 'var(--surface-highest)' },
  thumbnailImage: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbnailPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-highest)' },
  mediaCountBadge: { position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(5px)' },
  eventCardTitle: { fontSize: '1.4rem', fontWeight: 800, marginBottom: '5px' },
  eventCardInfo: { color: 'var(--on-surface-variant)', fontSize: '0.95rem' },
  
  // Masonry Gallery
  masonryItem: { marginBottom: '1.5rem', breakInside: 'avoid', position: 'relative', borderRadius: '20px', overflow: 'hidden', cursor: 'zoom-in', backgroundColor: 'var(--surface-highest)' },
  masonryImage: { width: '100%', display: 'block', objectFit: 'cover' },
  captionOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 1rem 1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: '#fff', pointerEvents: 'none' },
  captionText: { margin: 0, fontSize: '0.95rem', fontWeight: 500, textAlign: 'center' },
  
  // Empty States
  emptyState: { padding: '6rem', textAlign: 'center', borderRadius: '40px', border: '1px dashed var(--glass-border)' },
  emptyIcon: { marginBottom: '1.5rem', opacity: 0.2, color: 'var(--on-surface)' },
  emptyText: { fontSize: '1.2rem', color: 'var(--on-surface-variant)', fontWeight: 500 },
  
  // Lightbox
  lightboxOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' },
  closeBtn: { position: 'absolute', top: '30px', right: '40px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' },
  lightboxContent: { maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  lightboxImage: { maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
  lightboxCaption: { color: '#fff', marginTop: '20px', fontSize: '1.2rem', fontWeight: 500 }
};

export default PublicVendorProfile;
