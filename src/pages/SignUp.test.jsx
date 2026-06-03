import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Signup from './SignUp';
import { authService } from '../api/auth';
import { vendorService } from '../api/vendor';

// Mock useNavigate and useParams
const mockNavigate = vi.fn();
let mockParams = { type: 'attendee' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

// Mock authService and vendorService
vi.mock('../api/auth', () => ({
  authService: {
    registerAttendee: vi.fn(),
    registerVendor: vi.fn(),
    registerOwner: vi.fn(),
  },
}));

vi.mock('../api/vendor', () => ({
  vendorService: {
    getVendorTypes: vi.fn(),
  },
}));

describe('SignUp Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { type: 'attendee' };
  });

  it('renders SignUp form for Attendee role', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    expect(screen.getByText('Create Attendee Account')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('submits attendee form and redirects to /verify-email', async () => {
    authService.registerAttendee.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    const firstNameInput = screen.getByText('First Name').nextSibling;
    const lastNameInput = screen.getByText('Last Name').nextSibling;
    const emailInput = screen.getByText('Email').nextSibling;
    const passwordInput = screen.getByText('Password').nextSibling.querySelector('input');
    const confirmPasswordInput = screen.getByText('Confirm Password').nextSibling.querySelector('input');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.registerAttendee).toHaveBeenCalled();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/verify-email', {
      state: { email: 'john@example.com' }
    });
  });

  it('submits vendor form with basic details', async () => {
    mockParams = { type: 'vendor' };
    vendorService.getVendorTypes.mockResolvedValueOnce({ data: ['PHOTOGRAPHER', 'PLANNER'] });
    authService.registerVendor.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create Vendor Account')).toBeInTheDocument();
    });

    const firstNameInput = screen.getByText('First Name').nextSibling;
    const lastNameInput = screen.getByText('Last Name').nextSibling;
    const emailInput = screen.getByText('Email').nextSibling;
    const phoneInput = screen.getByText('Phone Number').nextSibling;
    const businessInput = screen.getByText('Business Name').nextSibling;
    const addressInput = screen.getByText('Address').nextSibling;
    const cityInput = screen.getByText('City').nextSibling;
    const stateInput = screen.getByText('State/County').nextSibling;
    const passwordInput = screen.getByText('Password').nextSibling.querySelector('input');
    const confirmPasswordInput = screen.getByText('Confirm Password').nextSibling.querySelector('input');

    fireEvent.change(firstNameInput, { target: { value: 'Alice' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.change(emailInput, { target: { value: 'alice@vendor.com' } });
    fireEvent.change(phoneInput, { target: { value: '+123456789' } });
    fireEvent.change(businessInput, { target: { value: 'Alice Photo' } });
    fireEvent.change(addressInput, { target: { value: '123 Main St' } });
    fireEvent.change(cityInput, { target: { value: 'New York' } });
    fireEvent.change(stateInput, { target: { value: 'NY' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });

    // Select country
    const countrySelect = screen.getByText('Country').nextSibling;
    fireEvent.change(countrySelect, { target: { value: 'Andorra' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.registerVendor).toHaveBeenCalled();
    });
  });

  it('renders SignUp form for Owner role', async () => {
    mockParams = { type: 'owner' };
    authService.registerOwner.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    expect(screen.getByText('Create Owner Account')).toBeInTheDocument();

    const firstNameInput = screen.getByText('First Name').nextSibling;
    const lastNameInput = screen.getByText('Last Name').nextSibling;
    const emailInput = screen.getByText('Email').nextSibling;
    const phoneInput = screen.getByText('Phone Number').nextSibling;
    const stateInput = screen.getByText('State/County').nextSibling;
    const passwordInput = screen.getByText('Password').nextSibling.querySelector('input');
    const confirmPasswordInput = screen.getByText('Confirm Password').nextSibling.querySelector('input');

    fireEvent.change(firstNameInput, { target: { value: 'Bob' } });
    fireEvent.change(lastNameInput, { target: { value: 'Jones' } });
    fireEvent.change(emailInput, { target: { value: 'bob@owner.com' } });
    fireEvent.change(phoneInput, { target: { value: '+987654321' } });
    fireEvent.change(stateInput, { target: { value: 'London' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });

    // Select country
    const countrySelect = screen.getByText('Country').nextSibling;
    fireEvent.change(countrySelect, { target: { value: 'Andorra' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.registerOwner).toHaveBeenCalled();
    });
  });

  it('shows error message if signup request fails', async () => {
    authService.registerAttendee.mockRejectedValueOnce({
      response: {
        data: {
          detail: 'Email is already taken.'
        }
      }
    });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    const firstNameInput = screen.getByText('First Name').nextSibling;
    const lastNameInput = screen.getByText('Last Name').nextSibling;
    const emailInput = screen.getByText('Email').nextSibling;
    const passwordInput = screen.getByText('Password').nextSibling.querySelector('input');
    const confirmPasswordInput = screen.getByText('Confirm Password').nextSibling.querySelector('input');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Email is already taken/i)).toBeInTheDocument();
    });
  });
});
