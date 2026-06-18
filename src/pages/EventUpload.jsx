import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api';

const EventUpload = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const startUpload = async () => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setProgress(0);
    setStatusText('Generating secure upload passes...');

    try {
      // Step 1: Request Bulk Pre-Signed URLs
      const fileData = files.map(f => ({
        file_name: f.name,
        file_type: f.type
      }));
      
      const res = await api.post(`/photos/events/${eventId}/generate-upload-urls/`, {
        files: fileData
      });
      
      const presignedUrls = res.data.urls;
      const successfulFullUrls = [];
      
      setStatusText('Uploading directly to S3 (Bypassing Server)...');
      
      // Step 2: Upload to S3 in parallel batches (Limit concurrency if thousands)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const presignedInfo = presignedUrls.find(p => p.original_name === file.name);
        
        if (presignedInfo) {
          // Direct PUT to S3
          const uploadRes = await fetch(presignedInfo.presigned_url, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type
            }
          });
          
          let finalUrl = presignedInfo.full_url;
          try {
            if (uploadRes.headers.get('content-type')?.includes('application/json')) {
              const data = await uploadRes.json();
              if (data && data.url) {
                finalUrl = data.url;
              }
            }
          } catch (e) {
            // Ignore parse errors, S3 might not return JSON
          }
          successfulFullUrls.push(finalUrl);
        }
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      
      // Step 3: Confirm with Django
      setStatusText('Confirming upload and triggering AI Mapping...');
      await api.post(`/photos/events/${eventId}/confirm-bulk-s3-upload/`, {
        full_urls: successfulFullUrls
      });
      
      setStatusText('Upload Complete! AI is now mapping faces.');
      setTimeout(() => navigate('/vendor/dashboard'), 3000);
      
    } catch (err) {
      console.error('Upload failed', err);
      setStatusText('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 6rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-1px' }}>
          Mass <span style={{ color: 'var(--primary)' }}>Upload</span>
        </h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem' }}>
          Upload high-res galleries directly to our global CDN.
        </p>
      </header>
      
      <div className="glass" style={{ padding: '4rem', borderRadius: '32px', textAlign: 'center', border: '1px dashed var(--primary)' }}>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          id="file-upload" 
          disabled={isUploading}
        />
        <label htmlFor="file-upload" style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}>
          <UploadCloud size={64} color="var(--primary)" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Select Photos</h2>
          <p style={{ color: 'var(--on-surface-variant)' }}>{files.length} files selected</p>
        </label>
      </div>
      
      {files.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <button 
            className="btn-primary" 
            onClick={startUpload} 
            disabled={isUploading}
            style={{ width: '100%', padding: '1.2rem', borderRadius: '16px', fontWeight: 900, fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem' }}
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
            {isUploading ? 'Uploading...' : `Start Upload (${files.length} files)`}
          </button>
        </div>
      )}
      
      {progress > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700 }}>
            <span>{statusText}</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height: '8px', background: 'var(--glass-border)', borderRadius: '50px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', transition: 'width 0.3s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventUpload;
