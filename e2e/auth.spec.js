import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/refresh', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'No refresh token' }),
      });
    });
  });

  test('allows a user to log in and redirect to dashboard', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: {
            _id: 'user-123',
            name: 'Alex Johnson',
            email: 'alex@example.com',
            role: 'rider',
          },
        }),
      });
    });

    await page.route('**/api/trips/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ trips: [] }),
      });
    });

    await page.route('**/api/requests/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requests: [] }),
      });
    });

    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ notifications: [] }),
      });
    });

    await page.goto('/login');

    await expect(page.locator('h1')).toContainText('Current');

    await page.fill('input[name="email"]', 'alex@example.com');
    await page.fill('#login-password', 'Password123!');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('allows a user to sign up a new account', async ({ page }) => {
    await page.route('**/api/auth/signup', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Account created',
          token: 'mock-jwt-token-new',
          user: {
            _id: 'user-456',
            name: 'Sarah Connor',
            email: 'sarah@example.com',
            role: 'rider',
          },
        }),
      });
    });

    await page.route('**/api/trips/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ trips: [] }),
      });
    });

    await page.route('**/api/requests/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requests: [] }),
      });
    });

    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ notifications: [] }),
      });
    });

    await page.goto('/signup');

    await page.fill('input[name="name"]', 'Sarah Connor');
    await page.fill('input[name="email"]', 'sarah@example.com');
    await page.fill('#signup-password', 'SecurePassword123!');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
