import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LocationPicker from '../LocationPicker';

describe('LocationPicker', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders input label and initial value correctly', () => {
    const handleChange = vi.fn();
    render(
      <LocationPicker
        label="Pickup Point"
        value={{ lat: 19.076, lng: 72.8777, address: 'Mumbai Central' }}
        onChange={handleChange}
        id="pickup-input"
      />
    );

    const input = screen.getByLabelText('Pickup Point');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Mumbai Central');
  });

  it('fetches and displays suggestions when user types a query', async () => {
    const handleChange = vi.fn();
    const mockSuggestions = [
      { place_id: 1, lat: '19.076', lon: '72.8777', display_name: 'Mumbai Central Station' },
      { place_id: 2, lat: '19.080', lon: '72.8800', display_name: 'Mumbai Airport' },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => mockSuggestions,
    });

    render(
      <LocationPicker
        label="Pickup Point"
        value={null}
        onChange={handleChange}
        id="pickup-input"
      />
    );

    const input = screen.getByLabelText('Pickup Point');
    fireEvent.change(input, { target: { value: 'Mumbai' } });

    await waitFor(
      () => {
        expect(screen.getAllByText('Mumbai Central Station').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Mumbai Airport').length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );
  });

  it('calls onChange with selected suggestion location data', async () => {
    const handleChange = vi.fn();
    const mockSuggestions = [
      { place_id: 1, lat: '19.076', lon: '72.8777', display_name: 'Mumbai Central Station' },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => mockSuggestions,
    });

    render(
      <LocationPicker
        label="Pickup Point"
        value={null}
        onChange={handleChange}
        id="pickup-input"
      />
    );

    const input = screen.getByLabelText('Pickup Point');
    fireEvent.change(input, { target: { value: 'Mumbai' } });

    await waitFor(
      () => {
        expect(screen.getAllByText('Mumbai Central Station').length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );

    fireEvent.click(screen.getAllByText('Mumbai Central Station')[0]);

    expect(handleChange).toHaveBeenCalledWith({
      lat: 19.076,
      lng: 72.8777,
      address: 'Mumbai Central Station',
    });
  });
});
