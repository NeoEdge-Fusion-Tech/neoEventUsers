import React, { useState } from 'react';
import { Download, Share2, Camera, User, Globe } from 'lucide-react';

const PhotoGallery = () => {
  const [activeCategory, setActiveCategory] = useState('personal'); // 'personal' or 'public'

  return (
    <div className="gallery-container" style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Event <span style={{ color: 'var(--primary)' }}>Gallery</span></h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>
            {activeCategory === 'personal' 
              ? "Photos of you, automatically detected using AI." 
              : "General event photos curated by the organizer."}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="glass" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
            <Download size={18} /> Download All
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={18} /> Upload Photo
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        <button 
          onClick={() => setActiveCategory('personal')}
          className="glass" 
          style={{ 
            padding: '0.8rem 1.5rem', 
            borderRadius: '50px', 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: activeCategory === 'personal' ? 'var(--primary)' : 'var(--on-surface-variant)', 
            border: activeCategory === 'personal' ? '1px solid var(--primary)' : '1px solid transparent',
            background: activeCategory === 'personal' ? 'rgba(255, 177, 115, 0.1)' : 'var(--glass-bg)'
          }}
        >
          <User size={18} /> Personal Folder
        </button>
        <button 
          onClick={() => setActiveCategory('public')}
          className="glass" 
          style={{ 
            padding: '0.8rem 1.5rem', 
            borderRadius: '50px', 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: activeCategory === 'public' ? 'var(--primary)' : 'var(--on-surface-variant)', 
            border: activeCategory === 'public' ? '1px solid var(--primary)' : '1px solid transparent',
            background: activeCategory === 'public' ? 'rgba(255, 177, 115, 0.1)' : 'var(--glass-bg)'
          }}
        >
          <Globe size={18} /> Public Gallery
        </button>
      </div>

      <div style={{ columns: '3 300px', columnGap: '1.5rem' }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="gallery-item glass" style={{ 
            marginBottom: '1.5rem', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            breakInside: 'avoid',
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{ 
              height: i % 2 === 0 ? '400px' : '250px', 
              background: `linear-gradient(${45 + i*10}deg, var(--surface), var(--bg-color))` 
            }}></div>
            <div className="item-overlay" style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              padding: '1.5rem',
              background: 'linear-gradient(transparent, rgba(13, 32, 64, 0.9))',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: 0.9
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                <Camera size={14} style={{ marginRight: '0.4rem' }} /> {activeCategory === 'personal' ? 'Detecting...' : 'Photographer'}
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <Download size={18} color="var(--primary)" />
                <Share2 size={18} color="var(--on-surface)" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;
