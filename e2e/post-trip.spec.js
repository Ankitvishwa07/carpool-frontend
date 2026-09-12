import { test, expect } from '@playwright/test';

test.describe('Post a Trip E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    const mockDriver = {
      _id: 'driver-999',
      name: 'Carlos Sainz',
      email: 'carlos@example.com',
      role: 'driver',
    };

    // Mock Nominatim geocoding endpoints
    await page.route('https://nominatim.openstreetmap.org/search**', async (route) => {
      const url = route.request().url();
      const isOrigin = url.includes('Bandra');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            place_id: isOrigin ? 1 : 2,
            lat: isOrigin ? '19.0596' : '18.5362',
            lon: isOrigin ? '72.8295' : '73.8940',
            display_name: isOrigin ? 'Bandra, Mumbai' : 'Koregaon Park, Pune',
          },
        ]),
      });
    });

    // Intercept refresh auth and me endpoints with active driver session
    await page.route('**/api/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'mock-driver-token' }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: mockDriver }),
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

  test('allows driver to create and post a new trip', async ({ page }) => {
    // Mock POST /api/trips endpoint with strict pathname check
    await page.route(
      (url) => url.pathname === '/api/trips' || url.pathname.startsWith('/api/trips/'),
      async (route) => {
        if (route.request().method() === 'POST') {
          const postData = JSON.parse(route.request().postData());
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              trip: {
                _id: 'trip-new-555',
                driver: 'driver-999',
                origin: postData.origin,
                destination: postData.destination,
                departureTime: postData.departureTime,
                availableSeats: postData.availableSeats,
                pricePerSeat: postData.pricePerSeat,
                status: 'scheduled',
              },
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ trips: [] }),
          });
        }
      }
    );

    await page.route('**/api/requests/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requests: [] }),
      });
    });

    await page.goto('/post-trip');

    await expect(page.locator('#post-origin')).toBeVisible();

    // Fill origin and pick suggestion
    await page.locator('#post-origin').fill('Bandra');
    await page.click('text=Bandra, Mumbai');

    // Fill destination and pick suggestion
    await page.locator('#post-destination').fill('Koregaon');
    await page.click('text=Koregaon Park, Pune');

    // Fill Date & Departure Time
    await page.fill('#post-date', '2026-10-15');
    await page.fill('#post-dept-time', '09:00');

    // Submit form
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/my-trips/);
  });
});
