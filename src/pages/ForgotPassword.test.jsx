import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import API from '../api/axios';

// Mock the API axios instance
vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the ForgotPassword form structure', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(screen.getByText('Reset your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
    expect(screen.getByText('Remember your password? Login')).toBeInTheDocument();
  });

  it('submits the form successfully and displays success message', async () => {
    API.post.mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith('auth/password-reset/', { email: 'user@example.com' });
    });

    expect(screen.getByText('Check your email')).toBeInTheDocument();
    expect(screen.getByText('Back to Login')).toBeInTheDocument();
  });

  it('displays API error message when post request fails', async () => {
    const errorMessage = 'Email address not found.';
    API.post.mockRejectedValueOnce({
      response: {
        data: {
          detail: errorMessage,
        },
      },
    });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });

    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith('auth/password-reset/', { email: 'wrong@example.com' });
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
