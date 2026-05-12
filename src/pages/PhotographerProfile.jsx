import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, LayoutGrid, SendHorizontal, Globe, Mail, Loader2, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import api from '../api';

const PhotographerProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userRes = await api.get(`/accounts/photographer/${username}/`);
        setProfile(userRes.data);
        
        // Fetch public photos taken by this photographer
        const photoRes = await api.get(`/photos/photographer-photos/?photographer_username=${username}&is_public=true`);
        setPhotos(photoRes.data);
      } catch (err) {
        console.error('Failed to fetch photographer profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [username]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '10rem' }}>Photographer not found.</div>;

  return (
    <div className="photographer-public-profile" style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Premium Hero Section */}
      <div style={{ height: '400px', background: 'var(--primary-container)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, var(--primary), transparent)', opacity: 0.1 }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, var(--surface), transparent)' }}></div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '-100px auto 0', padding: '0 4rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '5rem' }}>
          {/* Sidebar / Info */}
          <aside>
            <div className="glass" style={{ padding: '3rem', borderRadius: '40px', textAlign: 'center', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-kinetic)' }}>
              <div style={{ width: '180px', height: '180px', borderRadius: '50px', margin: '0 auto 2.5rem', border: '6px solid var(--primary)', padding: '6px', overflow: 'hidden' }}>
                 <img src={profile.profile_image || '/user-placeholder.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '42px' }} />
              </div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '0.8rem', letterSpacing: '-1px' }}>{profile.username}</h1>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', marginBottom: '2rem' }}>
                <Camera size={14} /> Official Vendor
              </div>
              
              <p style={{ color: 'var(--on-surface-variant)', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '3rem' }}>
                {profile.bio || "No professional bio provided yet. Just capturing pure masterpieces."}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <button className="btn-primary" style={{ width: '100%', padding: '1.2rem', borderRadius: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <Mail size={20} /> BOOK TALENT
                </button>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                    {profile.instagram_handle && (
                      <a href={`https://instagram.com/${profile.instagram_handle}`} target="_blank" className="glass" style={{ width: '54px', height: '54px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--on-surface-variant)' }}>
                        <LayoutGrid size={22} />
                      </a>
                    )}
                    {profile.twitter_handle && (
                      <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank" className="glass" style={{ width: '54px', height: '54px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--on-surface-variant)' }}>
                        <SendHorizontal size={22} />
                      </a>
                    )}
                   {profile.portfolio_website && (
                     <a href={profile.portfolio_website} target="_blank" className="glass" style={{ width: '54px', height: '54px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--on-surface-variant)' }}>
                       <Globe size={22} />
                     </a>
                   )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main style={{ paddingTop: '2rem' }}>
            <div style={{ marginBottom: '4rem' }}>
               <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.2rem' }}>NeoEvent <span style={{ color: 'var(--primary)' }}>Chronicles</span></h2>
               <div style={{ height: '2px', width: '80px', background: 'var(--primary)', borderRadius: '2px' }}></div>
            </div>

            {photos.length === 0 ? (
              <div className="glass" style={{ padding: '8rem', textAlign: 'center', borderRadius: '48px', opacity: 0.6 }}>
                 <ImageIcon size={64} style={{ marginBottom: '2rem', opacity: 0.2 }} />
                 <p style={{ fontSize: '1.2rem', color: 'var(--on-surface-variant)' }}>No masterpieces shared in this archive yet.</p>
              </div>
            ) : (
              <div style={{ columns: '3 300px', gap: '1.5rem', paddingBottom: '6rem' }}>
                {photos.map(photo => (
                  <div key={photo.id} className="glass" style={{ marginBottom: '1.5rem', breakInside: 'avoid', borderRadius: '24px', overflow: 'hidden', cursor: 'zoom-in' }}>
                    <img src={photo.image} alt="" style={{ width: '100%', display: 'block' }} />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PhotographerProfile;
