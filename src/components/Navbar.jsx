import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search, Calendar, Ticket, User, LogOut,
  Disc, Sun, Moon, Camera, Image as ImageIcon,
  Briefcase, Shield, Menu, X // Added for generic Vendor icon, Admin icon, and mobile menu
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from "../hooks/useAuth"; // Point to the hook file
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const NavItem = ({ to, label, icon: Icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={closeMenu}
        className="navbar-link"
        style={{
          color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
          background: isActive ? 'rgba(255, 177, 115, 0.1)' : 'transparent',
        }}
      >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} /> {label}
      </Link>
    );
  };

  const navLinks = (
    <>
      <NavItem to="/" label="Explore" icon={Search} />
      {user && user.role === 'ATTENDEE' && (
        <NavItem to="/tickets" label="Dashboard" icon={Ticket} />
      )}
      {user && user.role === 'VENDOR' && (
        <>
          <NavItem to="/vendor/dashboard" label="Dashboard" icon={Briefcase} />
          <NavItem to={user.vendor_business_id ? `/vendor/profile/${user.vendor_business_id}` : "#"} label="Portfolio" icon={ImageIcon} />
        </>
      )}
      {user && user.role === 'OWNER' && (
        <NavItem to="/owner/dashboard" label="Events" icon={Calendar} />
      )}
      {user && user.role === 'ADMIN' && (
        <NavItem to="/neo-admin" label="Dashboard" icon={Shield} />
      )}
      {user && <NavItem to="/settings" label="Settings" icon={User} />}
    </>
  );

  const profileSection = user ? (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid var(--primary)', overflow: 'hidden', flexShrink: 0 }}>
          {user.profile_image ? (
            <img src={user.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={24} color="var(--primary)" />
          )}
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--on-surface)' }}>{user.username}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>{user.role}</div>
        </div>
      </div>

      <button onClick={() => { closeMenu(); logout(); }} className="navbar-link" style={{ background: 'transparent', color: 'var(--on-surface-variant)', width: '100%' }}>
        <LogOut size={20} /> Log out
      </button>
    </>
  ) : (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Link to="/login" onClick={closeMenu} style={{ textDecoration: 'none', color: 'var(--on-surface)', fontWeight: 700, fontSize: '0.9rem' }}>
        LOGIN
      </Link>
      <Link
        to="/signup"
        onClick={closeMenu}
        style={{
          textDecoration: 'none',
          padding: '0.8rem 1.5rem',
          borderRadius: '12px',
          background: 'var(--on-surface)',
          color: 'var(--bg-color)',
          fontSize: '0.85rem',
          fontWeight: 700,
        }}
        className="hover-scale"
      >
        JOIN NEO
      </Link>
    </div>
  );

  return (
    <nav className="glass navbar">
      <div className="navbar-bar">
        <div className="logo" style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.7rem', flexShrink: 0 }}>
          <Disc size={32} strokeWidth={3} style={{ color: 'var(--primary)' }} />
          <span style={{ letterSpacing: '-1px' }}>NEOEVENT</span>
        </div>

        <div className="navbar-desktop-group">
          <div style={{ display: 'flex', gap: '1.2rem', background: 'rgba(0, 0, 0, 0.02)', padding: '0.6rem', borderRadius: '20px' }}>
            {navLinks}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
            <button
              onClick={toggleTheme}
              style={{
                width: '44px', height: '44px', borderRadius: '14px', display: 'flex',
                justifyContent: 'center', alignItems: 'center', color: 'var(--primary)',
                background: 'rgba(255, 177, 115, 0.1)', border: '1px solid rgba(255, 177, 115, 0.2)',
              }}
            >
              {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            {profileSection}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button
            onClick={toggleTheme}
            className="navbar-hamburger"
            style={{ color: 'var(--primary)' }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setMenuOpen(o => !o)} className="navbar-hamburger" aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={`navbar-mobile-panel ${menuOpen ? 'open' : ''}`}>
        {navLinks}
        <div className="navbar-mobile-divider" />
        {profileSection}
      </div>
    </nav>
  );
};

export default Navbar;
