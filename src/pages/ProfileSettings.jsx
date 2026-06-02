import React, { useState, useContext, useEffect } from 'react';
import { User, Mail, Camera, Save, Loader2, ShieldCheck, Fingerprint, Lock, CheckCircle2, AlertCircle, Building2, Globe, FileText, Briefcase, MapPin, DollarSign, Clock as ClockIcon, Phone } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const { user: authUser, setUser: setAuthUser } = useContext(AuthContext);
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  const getFullName = (u) => u ? (`${u.first_name || ''} ${u.last_name || ''}`.trim() || (u.username && !u.username.includes('@') ? u.username : '')) : '';

  const getProfileImage = (u) => {
    if (!u) return null;
    if (u.role === 'VENDOR') return u.vendor_profile?.profile_image;
    if (u.role === 'OWNER') return u.owner_profile?.organisation_logo;
    return u.profile_image;
  };

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    organisation_name: '',
    organisation_website: '',
    business_registration_number: '',
    bio: '',
    service_title: '',
    service_areas: '',
    base_rate: '',
    years_of_experience: ''
  });

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setFormData({
        first_name: authUser.first_name || '',
        last_name: authUser.last_name || '',
        email: authUser.email || '',
        phone_number: authUser.phone_number || '',
        organisation_name: authUser.owner_profile?.organisation_name || '',
        organisation_website: authUser.owner_profile?.organisation_website || '',
        business_registration_number: authUser.owner_profile?.business_registration_number || '',
        bio: authUser.vendor_profile?.bio || '',
        service_title: authUser.vendor_profile?.service_title || '',
        service_areas: authUser.vendor_profile?.service_areas || '',
        base_rate: authUser.vendor_profile?.base_rate || '',
        years_of_experience: authUser.vendor_profile?.years_of_experience || ''
      });
    }
  }, [authUser]);

  const [profileImage, setProfileImage] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    setIsError(false);
    
    const data = new FormData();
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    data.append('phone_number', formData.phone_number);

    // Append role-specific fields
    if (user?.role === 'OWNER') {
      if (formData.organisation_name) data.append('organisation_name', formData.organisation_name);
      if (formData.organisation_website) data.append('organisation_website', formData.organisation_website);
      if (formData.business_registration_number) data.append('business_registration_number', formData.business_registration_number);
      if (profileImage) data.append('organisation_logo', profileImage);
    } else if (user?.role === 'VENDOR') {
      if (formData.bio) data.append('bio', formData.bio);
      if (formData.service_title) data.append('service_title', formData.service_title);
      if (formData.service_areas) data.append('service_areas', formData.service_areas);
      if (formData.base_rate) data.append('base_rate', formData.base_rate);
      if (formData.years_of_experience) data.append('years_of_experience', formData.years_of_experience);
      if (profileImage) data.append('profile_image', profileImage);
    } else {
      if (profileImage) data.append('profile_image', profileImage);
    }

    if (referenceImage) data.append('reference_image', referenceImage);

    let endpoint = 'profile/';
    if (user?.role === 'VENDOR') endpoint = 'vendor/profile/';
    if (user?.role === 'OWNER') endpoint = 'me/';

    try {
      const response = await api.patch(endpoint, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedProfile = response.data;
      let updatedUser = { ...user };
      
      if (user?.role === 'VENDOR') {
        updatedUser.vendor_profile = { ...updatedUser.vendor_profile, ...updatedProfile };
        if (updatedProfile.first_name) updatedUser.first_name = updatedProfile.first_name;
        if (updatedProfile.last_name) updatedUser.last_name = updatedProfile.last_name;
        if (updatedProfile.phone_number !== undefined) updatedUser.phone_number = updatedProfile.phone_number;
      } else if (user?.role === 'OWNER') {
        updatedUser.owner_profile = { ...updatedUser.owner_profile, ...updatedProfile };
        if (updatedProfile.first_name) updatedUser.first_name = updatedProfile.first_name;
        if (updatedProfile.last_name) updatedUser.last_name = updatedProfile.last_name;
        if (updatedProfile.phone_number !== undefined) updatedUser.phone_number = updatedProfile.phone_number;
      } else {
        updatedUser = { ...updatedUser, ...updatedProfile };
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAuthUser(updatedUser);
      
      setMessage('Identity Synchronized Successfully');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Update failed', err);
      setIsError(true);
      setMessage(err.response?.data?.detail || 'Synchronization Failed. Please verify data.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="settings-wrapper">
      <header className="settings-header">
        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '4px' }}>System Configuration</span>
        <h1 className="settings-header-title">Account <span style={{ color: 'var(--primary)' }}>Identity</span></h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem', fontWeight: 500, marginTop: '0.5rem' }}>Manage your global credentials and system signature.</p>
      </header>

      <div className="settings-grid">
        <section>
            <div className="glass" style={{ padding: '3rem', borderRadius: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                 <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-glow)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', border: '1px solid var(--glass-border)' }}>
                    <User size={28} strokeWidth={2.5} />
                 </div>
                 <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Profile Details</h2>
              </div>

              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div className="settings-form-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      First Name
                    </label>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                      <User size={20} color="var(--primary)" />
                      <input 
                        type="text" 
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Last Name
                    </label>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                      <User size={20} color="var(--primary)" />
                      <input 
                        type="text" 
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-form-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px', opacity: 0.6 }}>
                      <Mail size={20} color="var(--on-surface-variant)" />
                      <input 
                        type="email" 
                        value={formData.email}
                        disabled
                        style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', cursor: 'not-allowed', width: '100%' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone Number</label>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                      <Phone size={20} color="var(--primary)" />
                      <input 
                        type="text" 
                        value={formData.phone_number}
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                        placeholder="+1..."
                        style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }}
                      />
                    </div>
                  </div>
                </div>

                {user?.role === 'OWNER' && (
                  <>
                    <div className="settings-form-grid">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Organization Name</label>
                        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                          <Building2 size={20} color="var(--primary)" />
                          <input 
                            type="text" 
                            value={formData.organisation_name}
                            onChange={(e) => setFormData({...formData, organisation_name: e.target.value})}
                            style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Organization Website</label>
                        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                          <Globe size={20} color="var(--primary)" />
                          <input 
                            type="url" 
                            value={formData.organisation_website}
                            onChange={(e) => setFormData({...formData, organisation_website: e.target.value})}
                            placeholder="https://"
                            style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Business Registration Number</label>
                      <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                        <FileText size={20} color="var(--primary)" />
                        <input 
                          type="text" 
                          value={formData.business_registration_number}
                          onChange={(e) => setFormData({...formData, business_registration_number: e.target.value})}
                          style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {user?.role === 'VENDOR' && (
                  <>
                    <div className="settings-form-grid">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Service Title</label>
                        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                          <Briefcase size={20} color="var(--primary)" />
                          <input 
                            type="text" 
                            value={formData.service_title}
                            onChange={(e) => setFormData({...formData, service_title: e.target.value})}
                            style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Service Areas</label>
                        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                          <MapPin size={20} color="var(--primary)" />
                          <input 
                            type="text" 
                            value={formData.service_areas}
                            onChange={(e) => setFormData({...formData, service_areas: e.target.value})}
                            placeholder="e.g. Lagos, Abuja"
                            style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="settings-form-grid">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Base Rate (₦)</label>
                        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                          <DollarSign size={20} color="var(--primary)" />
                          <input 
                            type="number" 
                            value={formData.base_rate}
                            onChange={(e) => setFormData({...formData, base_rate: e.target.value})}
                            style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Years of Experience</label>
                        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                          <ClockIcon size={20} color="var(--primary)" />
                          <input 
                            type="number" 
                            value={formData.years_of_experience}
                            onChange={(e) => setFormData({...formData, years_of_experience: e.target.value})}
                            style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Bio</label>
                      <div className="glass" style={{ display: 'flex', alignItems: 'flex-start', padding: '1.5rem', borderRadius: '16px' }}>
                        <input 
                          type="text" 
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          placeholder="Tell us about your services..."
                          style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {user?.role === 'OWNER' ? 'Organization Logo' : 'Profile Image'}
                  </label>
                  <div className="profile-img-container">
                    <div className="profile-img-box">
                      {getProfileImage(user) ? <img src={getProfileImage(user)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><User size={48} color="var(--primary)" /></div>}
                    </div>
                    <label className="btn-primary" style={{ padding: '1.2rem 2.5rem', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 900, fontSize: '0.95rem' }}>
                      <Camera size={22} /> {profileImage ? 'IMAGE STAGED' : (user?.role === 'OWNER' ? 'UPLOAD LOGO' : 'CHANGE AVATAR')}
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

            <div className="glass" style={{ padding: '3rem', borderRadius: '40px', marginTop: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                 <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-glow)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', border: '1px solid var(--glass-border)' }}>
                    <Lock size={28} strokeWidth={2.5} />
                 </div>
                 <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Security</h2>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const oldPassword = formData.get('old_password');
                const newPassword = formData.get('new_password');
                const newPasswordConfirm = formData.get('new_password_confirm');
                
                if (newPassword !== newPasswordConfirm) {
                   setMessage('New passwords do not match');
                   setIsError(true);
                   return;
                }
                
                setUpdating(true);
                try {
                  await api.post('auth/password/change/', {
                    old_password: oldPassword,
                    new_password: newPassword,
                    new_password_confirm: newPasswordConfirm
                  });
                  setMessage('Password changed successfully');
                  setIsError(false);
                  e.target.reset();
                } catch (err) {
                  setMessage(err.response?.data?.detail || 'Failed to change password');
                  setIsError(true);
                } finally {
                  setUpdating(false);
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Password</label>
                  <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                    <Lock size={20} color="var(--on-surface-variant)" />
                    <input name="old_password" type="password" required style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>New Password</label>
                  <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                    <Lock size={20} color="var(--primary)" />
                    <input name="new_password" type="password" required style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Confirm New Password</label>
                  <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '16px' }}>
                    <Lock size={20} color="var(--primary)" />
                    <input name="new_password_confirm" type="password" required style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', padding: '1.2rem', flex: 1, fontSize: '1.1rem', fontWeight: 600, outline: 'none', width: '100%' }} />
                  </div>
                </div>

                <button type="submit" disabled={updating} className="btn-primary" style={{ marginTop: '1rem', padding: '1.5rem', borderRadius: '22px', fontSize: '1.15rem', fontWeight: 900, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.2rem', background: 'transparent', border: '2px solid var(--primary)', color: 'var(--primary)' }}>
                  {updating ? <Loader2 className="animate-spin" size={26} /> : <Lock size={26} />}
                  {updating ? 'UPDATING...' : 'CHANGE PASSWORD'}
                </button>
              </form>
            </div>
          </section>

          {user?.role === 'ATTENDEE' && (
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
                          <span style={{ fontSize: '1rem', fontWeight: 900, color: '#22c55e' }}>NEW PHOTO STAGED</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{referenceImage.name}</span>
                        </>
                      ) : user?.reference_image ? (
                        <img src={user.reference_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <>
                          <ShieldCheck size={56} style={{ opacity: 0.2, color: 'var(--on-surface)' }} />
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface-variant)', opacity: 0.6 }}>NO REFERENCE PHOTO</span>
                        </>
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', opacity: 0.4 }}></div>
                      <input type="file" hidden id="ref-img" onChange={(e) => setReferenceImage(e.target.files[0])} />
                    </div>
                    <label htmlFor="ref-img" style={{ display: 'block', marginTop: '1.5rem' }}>
                      <div className="glass" style={{ padding: '1.2rem', borderRadius: '18px', textAlign: 'center', fontWeight: 900, cursor: 'pointer', background: 'var(--accent-glow)', color: 'var(--on-surface)', border: '1px solid var(--primary)', fontSize: '0.95rem' }}>
                        {referenceImage ? 'CHANGE STAGED PHOTO' : 'UPLOAD REFERENCE PHOTO'}
                      </div>
                    </label>
                 </div>
              </div>
            </div>
          </aside>
          )}
      </div>
    </div>
  );
};

export default ProfileSettings;
