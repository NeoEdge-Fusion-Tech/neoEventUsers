import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom's Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: vi.fn(({ to }) => <div data-testid="navigate" data-to={to}>Redirected to {to}</div>),
  };
});

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Loading... when authentication state is loading', () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="child">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="child">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    const navigateEl = screen.getByTestId('navigate');
    expect(navigateEl).toBeInTheDocument();
    expect(navigateEl.getAttribute('data-to')).toBe('/login');
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('redirects to /verify-email when user email is not verified', () => {
    useAuth.mockReturnValue({
      user: { email: 'test@example.com', is_email_verified: false, role: 'attendee' },
      loading: false
    });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="child">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    const navigateEl = screen.getByTestId('navigate');
    expect(navigateEl).toBeInTheDocument();
    expect(navigateEl.getAttribute('data-to')).toContain('/verify-email');
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('redirects to /unauthorized when user role is not allowed', () => {
    useAuth.mockReturnValue({
      user: { email: 'test@example.com', is_email_verified: true, role: 'attendee' },
      loading: false
    });
    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['owner']}>
          <div data-testid="child">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    const navigateEl = screen.getByTestId('navigate');
    expect(navigateEl).toBeInTheDocument();
    expect(navigateEl.getAttribute('data-to')).toBe('/unauthorized');
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated, verified, and has an allowed role', () => {
    useAuth.mockReturnValue({
      user: { email: 'test@example.com', is_email_verified: true, role: 'owner' },
      loading: false
    });
    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['owner']}>
          <div data-testid="child">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
});
