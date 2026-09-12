import { test, expect } from '@playwright/test';

test.describe('Search and Book Trip E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    const mockUser = {
      _id: 'user-789',
      name: 'David Miller',
      email: 'david@example.com',
      role: 'rider',
    };

    // Mock Nominatim geocoding endpoints
    await page.route('https://nominatim.openstreetmap.org/search**', async (route) => {
      const url = route.request().url();
      const isOrigin = url.includes('Mumbai');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            place_id: isOrigin ? 1 : 2,
            lat: isOrigin ? '19.076' : '18.5362',
            lon: isOrigin ? '72.8777' : '73.8940',
            display_name: isOrigin ? 'Mumbai Central, Mumbai' : 'Swargate, Pune',
          },
        ]),
      });
    });

    // Intercept refresh auth and me endpoints for active session
    await page.route('**/api/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'mock-session-token' }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: mockUser }),
      });
    });

    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ notifications: [] }),
      });
    });
  });

  test('allows user to search for trips and book a seat', async ({ page }) => {
    const mockTrips = [
      {
        _id: 'trip-101',
        driverId: { _id: 'driver-1', name: 'Alice Walker', ratingAverage: 4.9 },
        origin: { address: 'Mumbai Central, Mumbai' },
        destination: { address: 'Swargate, Pune' },
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        seatsTotal: 4,
        seatsBooked: 1,
        pricePerSeat: 450,
        status: 'scheduled',
      },
    ];

    // Mock trips search GET request strictly matching API pathname
    await page.route(
      (url) => url.pathname === '/api/trips' || url.pathname.startsWith('/api/trips/'),
      async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ trips: mockTrips }),
          });
        } else {
          await route.continue();
        }
      }
    );

    // Mock booking request POST
    await page.route('**/api/requests', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          request: {
            _id: 'req-999',
            trip: 'trip-101',
            rider: 'user-789',
            seatsBooked: 1,
            status: 'pending',
          },
        }),
      });
    });

    await page.goto('/search');

    await page.locator('#search-pickup').fill('Mumbai');
    await page.click('text=Mumbai Central, Mumbai');

    await page.locator('#search-dropoff').fill('Swargate');
    await page.click('text=Swargate, Pune');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Alice Walker')).toBeVisible();
    await expect(page.locator('text=₹450')).toBeVisible();

    await page.click('button:has-text("Book Seat")');

    // Confirm booking in modal
    await expect(page.locator('text=Book Seat Request')).toBeVisible();
    await page.click('button:has-text("Confirm Booking")');

    await expect(page.locator('text=Requested ✓')).toBeVisible();
  });
});
