import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { vendorService } from '../api/vendor';
import { MapPin, Mail, Phone, Loader2, CheckCircle, Disc } from 'lucide-react';

const PublicVendorProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={styles.container}>
      {/* Header Profile Section */}
      <div className="glass" style={styles.headerCard}>
        <div style={styles.headerInfo}>
          <div style={styles.avatarBox}>
            <Disc size={50} color="var(--primary)" />
          </div>
          <div>
            <h1 style={styles.businessName}>{profile.business_name}</h1>
            <div style={styles.contactRow}>
              <span style={styles.contactItem}><MapPin size={16}/> {profile.city}, {profile.country}</span>
              <span style={styles.contactItem}><Mail size={16}/> {profile.email}</span>
              <span style={styles.contactItem}><Phone size={16}/> {profile.phone_number}</span>
            </div>
            {profile.is_registered && <div style={styles.registeredBadge}><CheckCircle size={16}/> Registered Business</div>}
          </div>
        </div>
      </div>

      {/* Galleries & Events */}
      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Portfolio</h2>
        {profile.gallery_categories?.length === 0 ? (
          <p>No portfolio items yet.</p>
        ) : (
          profile.gallery_categories?.map(category => (
            <div key={category.id} style={styles.categorySection}>
              <h3 style={styles.categoryTitle}>{category.name}</h3>
              <p style={styles.categoryDesc}>{category.description}</p>

              {category.events?.map(event => (
                <div key={event.id} style={styles.eventSection}>
                  <h4 style={styles.eventTitle}>{event.name}</h4>
                  <p style={styles.eventInfo}>{event.location} • {event.date}</p>
                  
                  <div style={styles.grid}>
                    {event.media?.map(media => (
                      <div key={media.id} className="glass hover-card" style={styles.mediaCard}>
                        {media.file_type === 'IMAGE' ? (
                          <img src={media.media_file} alt={media.caption} style={styles.mediaContent} />
                        ) : (
                          <video src={media.media_file} controls style={styles.mediaContent} />
                        )}
                        {media.caption && <p style={styles.caption}>{media.caption}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', color: 'var(--on-surface)' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--on-surface)' },
  headerCard: { padding: '40px', borderRadius: '32px', marginBottom: '40px' },
  headerInfo: { display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' },
  avatarBox: { width: '120px', height: '120px', borderRadius: '30px', backgroundColor: 'var(--surface-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  businessName: { fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px' },
  contactRow: { display: 'flex', gap: '20px', flexWrap: 'wrap', color: 'var(--on-surface-variant)', marginBottom: '15px' },
  contactItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' },
  registeredBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 },
  content: { display: 'flex', flexDirection: 'column', gap: '40px' },
  sectionTitle: { fontSize: '2rem', fontWeight: 800, borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' },
  categorySection: { display: 'flex', flexDirection: 'column', gap: '20px' },
  categoryTitle: { fontSize: '1.6rem', color: 'var(--primary)' },
  categoryDesc: { color: 'var(--on-surface-variant)', fontSize: '1rem', marginTop: '-10px' },
  eventSection: { background: 'var(--surface)', padding: '30px', borderRadius: '24px', border: '1px solid var(--glass-border)' },
  eventTitle: { fontSize: '1.3rem', fontWeight: 700, marginBottom: '5px' },
  eventInfo: { color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  mediaCard: { borderRadius: '16px', overflow: 'hidden', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' },
  mediaContent: { width: '100%', height: '250px', objectFit: 'cover', borderRadius: '12px' },
  caption: { fontSize: '0.9rem', color: 'var(--on-surface-variant)', textAlign: 'center' }
};

export default PublicVendorProfile;
