import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, Save, Loader2, ShieldCheck, Fingerprint, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';
import { getCurrentUser } from '../api/auth';

const ProfileSettings = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    setIsError(false);
    
    const data = new FormData();
    data.append('username', formData.username);
    if (profileImage) data.append('profile_image', profileImage);
    if (referenceImage) data.append('reference_image', referenceImage);

    try {
      const response = await api.patch('/accounts/profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update local storage and state
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage('Identity Synchronized Successfully');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Update failed', err);
      setIsError(true);
      setMessage('Synchronization Failed. Please verify credentials.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="settings-container" style={{ padding: '4rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '5rem' }}>
        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '4px' }}>System Configuration</span>
        <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-2px', marginTop: '0.5rem' }}>Account <span style={{ color: 'var(--primary)' }}>Identity</span></h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem', fontWeight: 500, marginTop: '0.5rem' }}>Manage your global credentials and biometric signatures.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 450px', gap: '5rem' }}>
        <section>
            <div className="glass" style={{ padding: '4rem', borderRadius: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '4rem' }}>
                 <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-glow)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', border: '1px solid var(--glass-border)' }}>
                    <User size={28} strokeWidth={2.5} />
                 </div>
                 <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Profile Details</h2>
              </div>

              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Username</label>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                      <User size={20} color="var(--primary)" />
                      <input 
                        type="text" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Verified Email</label>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px', opacity: 0.6 }}>
                      <Mail size={20} color="var(--on-surface-variant)" />
                      <input 
                        type="email" 
                        value={formData.email}
                        disabled
                        style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Profile Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ width: '130px', height: '130px', borderRadius: '32px', background: 'var(--surface-highest)', overflow: 'hidden', border: '2px solid var(--primary)', position: 'relative' }}>
                      {user?.profile_image ? <img src={user.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><User size={48} color="var(--primary)" /></div>}
                    </div>
                    <label className="btn-primary" style={{ padding: '1.2rem 2.5rem', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 900, fontSize: '0.95rem' }}>
                      <Camera size={22} /> {profileImage ? 'IMAGE STAGED' : 'CHANGE AVATAR'}
                      <input type="file" hidden onChange={(e) => setProfileImage(e.target.files[0])} />
                    </label>
                  </div>
                </div>

                {message && (
                  <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: isError ? '#ef4444' : '#22c55e', display: 'flex', alignItems: 'center', gap: '1.2rem', fontWeight: 800, fontSize: '1rem', border: `1px solid ${isError ? '#ef4444' : '#22c55e'}` }}>
                    {isError ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
                    {message}
                  </div>
                )}

                <button type="submit" disabled={updating} className="btn-primary" style={{ marginTop: '2.5rem', padding: '1.5rem', borderRadius: '22px', fontSize: '1.15rem', fontWeight: 900, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.2rem' }}>
                  {updating ? <Loader2 className="animate-spin" size={26} /> : <Save size={26} />}
                  {updating ? 'SYNCHRONIZING...' : 'UPDATE IDENTITY'}
                </button>
              </form>
            </div>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div className="glass" style={{ padding: '3.5rem', borderRadius: '40px', border: '1px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '180px', height: '180px', background: 'var(--primary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(50px)' }}></div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '3rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-glow)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', border: '1px solid var(--glass-border)' }}>
                       <Fingerprint size={28} strokeWidth={2.5} />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Biometric Vault</h3>
                 </div>
                 
                 <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '3.5rem', fontWeight: 500 }}>
                    Upload your master reference image. This biometric data is used by our global AI network to curate your personal memories.
                 </p>

                 <div style={{ marginBottom: '3.5rem' }}>
                    <div onClick={() => document.getElementById('ref-img').click()} style={{ width: '100%', height: '320px', borderRadius: '32px', background: 'var(--bg-color)', border: '2px dashed var(--primary)', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', position: 'relative', cursor: 'pointer' }}>
                      {referenceImage ? (
                        <>
                          <CheckCircle2 size={56} color="#22c55e" />
                          <span style={{ fontSize: '1rem', fontWeight: 900, color: '#22c55e' }}>NEW SIGNATURE STAGED</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{referenceImage.name}</span>
                        </>
                      ) : user?.reference_image ? (
                        <img src={user.reference_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <>
                          <ShieldCheck size={56} style={{ opacity: 0.2, color: 'var(--on-surface)' }} />
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface-variant)', opacity: 0.6 }}>NO SIGNATURE DETECTED</span>
                        </>
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', opacity: 0.4 }}></div>
                      <input type="file" hidden id="ref-img" onChange={(e) => setReferenceImage(e.target.files[0])} />
                    </div>
                    <label htmlFor="ref-img" style={{ display: 'block', marginTop: '1.5rem' }}>
                      <div className="glass" style={{ padding: '1.2rem', borderRadius: '18px', textAlign: 'center', fontWeight: 900, cursor: 'pointer', background: 'var(--accent-glow)', color: 'var(--on-surface)', border: '1px solid var(--primary)', fontSize: '0.95rem' }}>
                        {referenceImage ? 'CHANGE STAGED SIGNATURE' : 'UPDATE BIOMETRIC REF'}
                      </div>
                    </label>
                 </div>

                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem', fontWeight: 700, opacity: 0.7 }}>
                    <Lock size={18} /> DATA IS END-TO-END ENCRYPTED
                 </div>
              </div>
            </div>
          </aside>
      </div>
    </div>
  );
};

export default ProfileSettings;
