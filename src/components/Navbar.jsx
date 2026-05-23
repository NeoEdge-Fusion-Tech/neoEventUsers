import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search, Calendar, Ticket, User, LogOut,
  Disc, Sun, Moon, Camera, Image as ImageIcon,
  Briefcase // Added for generic Vendor icon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from "../hooks/useAuth"; // Point to the hook file

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const NavItem = ({ to, label, icon: Icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} style={{
        color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontWeight: 700,
        fontSize: '0.9rem',
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        background: isActive ? 'rgba(255, 177, 115, 0.1)' : 'transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} /> {label}
      </Link>
    );
  };

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 4rem',
      height: '90px'
    }}>
      <div className="logo" style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
        <Disc size={32} strokeWidth={3} style={{ color: 'var(--primary)' }} />
        <span style={{ letterSpacing: '-1px' }}>NEOEVENT</span>
      </div>

      <div className="nav-links" style={{ display: 'flex', gap: '1.2rem', background: 'rgba(0, 0, 0, 0.02)', padding: '0.6rem', borderRadius: '20px' }}>
        <NavItem to="/" label="Explore" icon={Search} />

        {/* Attendee Links */}
        {user && user.role === 'ATTENDEE' && (
          <>
            <NavItem to="/tickets" label="My Tickets" icon={Ticket} />
          </>
        )}

        {/* Vendor Links (Photographers, Planners, etc) */}
        {user && user.role === 'VENDOR' && (
          <>
            <NavItem to="/vendor/dashboard" label="Dashboard" icon={Briefcase} />
            <NavItem to={`/p/${user.username}`} label="Portfolio" icon={ImageIcon} />
          </>
        )}

        {/* Event Owner Links */}
        {user && user.role === 'OWNER' && (
          <>
            <NavItem to="/owner/dashboard" label="Events" icon={Calendar} />
          </>
        )}

        {user && <NavItem to="/settings" label="Settings" icon={User} />}
      </div>

      <div className="nav-profile" style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
        <button
          onClick={toggleTheme}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'var(--primary)',
            background: 'rgba(255, 177, 115, 0.1)',
            border: '1px solid rgba(255, 177, 115, 0.2)',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </button>

        {user ? (
          <>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--on-surface)' }}>{user.username}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>{user.role}</div>
            </div>

            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid var(--primary)', overflow: 'hidden' }}>
              {user.profile_image ? (
                <img src={user.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={24} color="var(--primary)" />
              )}
            </div>

            <button onClick={logout} style={{ background: 'transparent', cursor: 'pointer', border: 'none', color: '#666' }}>
              <LogOut size={20} />
            </button>
          </>
        ) : (

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/login" style={{
              textDecoration: 'none',
              color: 'var(--on-surface)',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              LOGIN
            </Link>

            {/* Point this to the selection page we just created */}
            <Link to="/signup" style={{
              textDecoration: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '12px',
              background: 'var(--on-surface)',
              color: 'var(--bg-color)',
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'transform 0.2s'
            }}
              className="hover-scale"
            >
              JOIN NEO
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

