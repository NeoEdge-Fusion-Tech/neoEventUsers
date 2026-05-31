import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  
  // Try to get email from router state or query params
  const emailParams = new URLSearchParams(location.search).get('email');
  const [email, setEmail] = useState(location.state?.email || emailParams || '');

  useEffect(() => {
    if (!email) {
      setError("Email address missing. Please request a new verification link.");
    }
  }, [email]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };
  
  const handleKeyDown = (e, index) => {
    // Focus previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await API.post('auth/verify-email/', {
        email: email,
        otp: otpCode
      });
      
      setSuccess("Email verified successfully! Setting up your dashboard...");
      
      // Auto login user
      setUser(data.user);
      if (data.access) {
        sessionStorage.setItem('access_token', data.access);
      }
      
      setTimeout(() => {
         if (data?.user?.role === 'ATTENDEE') navigate('/tickets');
         else if (data?.user?.role === 'OWNER') navigate('/owner/dashboard');
         else if (data?.user?.role === 'VENDOR') navigate('/vendor/dashboard');
         else navigate('/');
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.detail || "Verification failed. Please check your code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 border border-orange-500/20">
              <Mail className="h-6 w-6 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-slate-400">
              We've sent a 6-digit verification code to <br/>
              <span className="font-semibold text-white">{email || 'your email address'}</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="flex justify-between mb-8 space-x-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={e => handleChange(e.target, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  onFocus={e => e.target.select()}
                  className="w-12 h-14 text-center text-2xl font-bold text-white bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Didn't receive the email?{" "}
            <button className="text-orange-500 hover:text-orange-400 font-medium ml-1">
              Click to resend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
