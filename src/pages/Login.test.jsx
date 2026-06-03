import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './Login';
import { useAuth } from '../hooks/useAuth';

// Mock useNavigate and useLocation
const mockNavigate = vi.fn();
let mockLocationState = null;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: mockLocationState
    }),
  };
});

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('LoginPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState = null;
    useAuth.mockReturnValue({
      login: mockLogin,
      loading: false,
    });
  });

  it('renders login form properly', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('toggles password visibility when the eye icon button is clicked', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput.type).toBe('password');

    // Click toggle button
    const toggleBtn = screen.getByRole('button', { name: '' }); // the button wrapping Lucide icon
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('password');
  });

  it('calls login function on form submission and redirects ATTENDEE to /tickets', async () => {
    mockLogin.mockResolvedValueOnce({
      user: { role: 'ATTENDEE', is_email_verified: true }
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'attendee@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'attendee@example.com',
        password: 'password123'
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/tickets', { replace: true });
    });
  });

  it('redirects OWNER to /owner/dashboard', async () => {
    mockLogin.mockResolvedValueOnce({
      user: { role: 'OWNER', is_email_verified: true }
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'owner@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/owner/dashboard', { replace: true });
    });
  });

  it('redirects VENDOR to /vendor/dashboard', async () => {
    mockLogin.mockResolvedValueOnce({
      user: { role: 'VENDOR', is_email_verified: true }
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'vendor@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/vendor/dashboard', { replace: true });
    });
  });

  it('redirects to /verify-email if user is not verified', async () => {
    mockLogin.mockResolvedValueOnce({
      user: { role: 'ATTENDEE', is_email_verified: false }
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'notverified@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/verify-email?email=notverified%40example.com',
        { replace: true }
      );
    });
  });

  it('shows error alert on login failure', async () => {
    const errorMsg = 'Invalid email or password.';
    mockLogin.mockRejectedValueOnce({
      response: {
        data: {
          detail: errorMsg
        }
      }
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });
  });
});
