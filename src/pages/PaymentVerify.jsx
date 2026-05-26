import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import paymentService from '../api/payment';

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [message, setMessage] = useState('');

  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found.');
      return;
    }

    const verify = async () => {
      try {
        const response = await paymentService.verifyPayment({ reference });
        if (response.data.status === 'success') {
          setStatus('success');
        } else {
          setStatus('failed');
          setMessage('Payment could not be verified or failed.');
        }
      } catch (err) {
        setStatus('failed');
        setMessage(err.response?.data?.detail || 'An error occurred during verification.');
      }
    };

    verify();
  }, [reference]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass" 
        style={{ maxWidth: '500px', width: '100%', padding: '4rem 3rem', borderRadius: '40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
      >
        {status === 'verifying' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '2rem' }}>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '4px solid rgba(255,177,115,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}
              />
              <ShieldCheck size={32} color="var(--primary)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>Securing Transaction</h2>
            <p style={{ color: 'var(--on-surface-variant)', lineHeight: '1.6', fontWeight: 500 }}>Please wait while we establish a secure handshake and verify your digital pass.</p>
          </motion.div>
        )}
        
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            >
              <CheckCircle size={80} color="#22c55e" style={{ margin: '0 auto 1.5rem' }} />
            </motion.div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1rem', color: '#22c55e', letterSpacing: '-1px' }}>Payment Successful</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.5rem', fontSize: '1.1rem', fontWeight: 500 }}>
              Your digital pass sequence is now active and ready.
            </p>
            <Link to="/tickets" className="btn-primary" style={{ textDecoration: 'none', padding: '1.2rem 2.5rem', borderRadius: '16px', fontWeight: 900, display: 'inline-block', fontSize: '1.1rem' }}>
              Access My Passes
            </Link>
          </motion.div>
        )}

        {status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <XCircle size={72} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem', color: '#ef4444', letterSpacing: '-0.5px' }}>Transaction Failed</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.5rem', fontWeight: 500 }}>
              {message}
            </p>
            <button onClick={() => navigate(-1)} className="glass" style={{ border: '2px solid var(--glass-border)', padding: '1rem 2.5rem', borderRadius: '16px', fontWeight: 800, color: 'var(--on-surface)', background: 'transparent', cursor: 'pointer', fontSize: '1.05rem' }}>
              Return to Checkout
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentVerify;
