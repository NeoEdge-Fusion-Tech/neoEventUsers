import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock useTheme hook
vi.mock('../context/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

describe('Navbar Component', () => {
  const mockLogout = vi.fn();
  const mockToggleTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTheme.mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
    });
  });

  it('renders login and register links when user is not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('LOGIN')).toBeInTheDocument();
    expect(screen.getByText('JOIN NEO')).toBeInTheDocument();
    expect(screen.queryByText('LOGOUT')).not.toBeInTheDocument();
  });

  it('renders user details and attendee links when user role is ATTENDEE', () => {
    useAuth.mockReturnValue({
      user: { username: 'john_doe', role: 'ATTENDEE', email: 'john@example.com' },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('john_doe')).toBeInTheDocument();
    expect(screen.getByText('ATTENDEE')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('LOGIN')).not.toBeInTheDocument();
  });

  it('renders vendor links when user role is VENDOR', () => {
    useAuth.mockReturnValue({
      user: { username: 'vendor_shop', role: 'VENDOR', email: 'vendor@example.com', vendor_business_id: '123' },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('vendor_shop')).toBeInTheDocument();
    expect(screen.getByText('VENDOR')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });

  it('renders owner links when user role is OWNER', () => {
    useAuth.mockReturnValue({
      user: { username: 'event_owner', role: 'OWNER', email: 'owner@example.com' },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('event_owner')).toBeInTheDocument();
    expect(screen.getByText('OWNER')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('calls toggleTheme when the theme button is clicked', () => {
    useAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // The theme button contains a lucide icon
    const themeBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(themeBtn);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('calls logout when the logout button is clicked', () => {
    useAuth.mockReturnValue({
      user: { username: 'test_user', role: 'ATTENDEE', email: 'test@example.com' },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Select the logout button (which contains LogOut icon)
    // There are two buttons for authenticated user: theme toggler and logout
    const buttons = screen.getAllByRole('button');
    const logoutBtn = buttons[1]; // logout is the second button
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
