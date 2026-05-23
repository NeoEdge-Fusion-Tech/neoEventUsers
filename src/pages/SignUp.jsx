import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';
import { User, Mail, Lock, Phone, Camera, Loader2, ArrowLeft } from 'lucide-react';
import { getNames } from 'country-list';

const COUNTRIES = getNames();

const Signup = () => {
  const { type } = useParams(); // 'owner' or 'vendor'
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone_number: '', 
    password: '', password_confirm: '', vendor_subtype: 'PHOTOGRAPHER',
    business_name: '', is_registered: false, registration_number: '',
    country_of_registration: '', address: '', city: '', state_or_county: '', country: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: inputType === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === 'vendor') {
        await authService.registerVendor(formData);
      } else if (type === 'attendee') {
        const {
          vendor_subtype, business_name, is_registered, registration_number,
          country_of_registration, address, city, country, state_or_county,
          ...attendeeData
        } = formData;
        await authService.registerAttendee(attendeeData);
      } else {
        // Owner doesn't need phone, subtype or business details
        const { 
          vendor_subtype, phone_number, business_name, is_registered, 
          registration_number, country_of_registration, address, city, 
          ...ownerData 
        } = formData;
        await authService.registerOwner(ownerData);
      }
      navigate('/login', { state: { message: "Account created! Please login." } });
    } catch (err) {
      setError(err.response?.data || { detail: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass" style={styles.formCard}>
        <button type="button" onClick={() => navigate('/signup')} style={styles.backBtn}><ArrowLeft size={18}/> Back</button>
        
        <h2 style={styles.title}>Create {type === 'vendor' ? 'Vendor' : type === 'attendee' ? 'Attendee' : 'Owner'} Account</h2>

        {error && <div style={styles.errorBox}>{JSON.stringify(error)}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputRow}>
            <div style={styles.field}>
              <label style={styles.label}>First Name</label>
              <input name="first_name" onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last Name</label>
              <input name="last_name" onChange={handleChange} required style={styles.input} />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" name="email" onChange={handleChange} required style={styles.input} />
          </div>

          {type === 'attendee' && (
            <div style={styles.field}>
              <label style={styles.label}>Phone Number (Optional)</label>
              <input name="phone_number" placeholder="+234..." onChange={handleChange} style={styles.input} />
            </div>
          )}

          {type === 'owner' && (
            <div style={styles.inputRow}>
              <div style={styles.field}>
                <label style={styles.label}>Country</label>
                <select name="country" onChange={handleChange} required style={styles.input} value={formData.country}>
                  <option value="" disabled>Select a country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>State/County</label>
                <input name="state_or_county" onChange={handleChange} required style={styles.input} />
              </div>
            </div>
          )}

          {type === 'vendor' && (
            <>
              <div style={styles.inputRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Phone Number</label>
                  <input name="phone_number" placeholder="+234..." onChange={handleChange} required style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Service Type</label>
                  <select name="vendor_subtype" onChange={handleChange} style={styles.input}>
                    <option value="PHOTOGRAPHER">Photographer</option>
                    <option value="VIDEOGRAPHER">Videographer</option>
                    <option value="DECORATOR">Decorator</option>
                    <option value="CATERER">Caterer</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Business Name</label>
                  <input name="business_name" onChange={handleChange} required style={styles.input} />
                </div>
                <div style={{ ...styles.field, flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" name="is_registered" id="is_registered" onChange={handleChange} style={{ width: 'auto' }} />
                  <label htmlFor="is_registered" style={{ ...styles.label, marginBottom: 0 }}>Is Business Registered?</label>
                </div>
              </div>

              {formData.is_registered && (
                <div style={styles.inputRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Registration Number</label>
                    <input name="registration_number" onChange={handleChange} required style={styles.input} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Country of Registration</label>
                    <select name="country_of_registration" onChange={handleChange} required style={styles.input} value={formData.country_of_registration}>
                      <option value="" disabled>Select a country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label}>Address</label>
                <input name="address" onChange={handleChange} required style={styles.input} />
              </div>

              <div style={styles.inputRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Country</label>
                  <select name="country" onChange={handleChange} required style={styles.input} value={formData.country}>
                    <option value="" disabled>Select a country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>State/County</label>
                  <input name="state_or_county" onChange={handleChange} required style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>City</label>
                  <input name="city" onChange={handleChange} required style={styles.input} />
                </div>
              </div>
            </>
          )}

          <div style={styles.inputRow}>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input type="password" name="password" onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <input type="password" name="password_confirm" onChange={handleChange} required style={styles.input} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? <Loader2 className="spinner" /> : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backgroundColor: 'var(--bg-color)', color: 'var(--on-surface)' },
  formCard: { width: '100%', maxWidth: '700px', padding: '40px', borderRadius: '24px', position: 'relative' },
  backBtn: { position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--on-surface-variant)' },
  title: { fontSize: '1.8rem', fontWeight: 800, marginBottom: '30px', textAlign: 'center', color: 'var(--on-surface)' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputRow: { display: 'flex', gap: '15px' },
  field: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--surface)', color: 'var(--on-surface)', outline: 'none' },
  submitBtn: { padding: '15px', borderRadius: '12px', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '10px' },
  errorBox: { padding: '15px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '10px', fontSize: '0.8rem', border: '1px solid rgba(239, 68, 68, 0.2)' }
};

export default Signup;
