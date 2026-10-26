import { test, expect } from './fixtures.js';
import { loginViaUi, newUser, signupViaApi } from './helpers.js';

test.describe('privacy and terms pages', () => {
  test('signed-out visitors get a header, working Back, jump links and a link to the other page', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
    await expect(page.getByText('Last updated 26 October 2026')).toBeVisible();

    // Jump chips go to their section
    await page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: /Messages/ }).click();
    await expect(page.getByRole('heading', { name: /Messages/ })).toBeInViewport();

    // Link between the two documents
    await page.getByRole('link', { name: 'Terms and Conditions' }).click();
    await expect(page).toHaveURL(/terms-and-conditions/);
    await expect(page.getByRole('heading', { level: 1, name: 'Terms and Conditions' })).toBeVisible();

    // Opened directly (a fresh tab) there is no history, so Back goes to the home page instead of nowhere
    const fresh = await page.context().newPage();
    await fresh.goto('/terms-and-conditions');
    await fresh.getByRole('button', { name: 'Back' }).click();
    await expect(fresh).toHaveURL(/localhost:\d+\/$/);
    await expect(fresh.getByRole('heading', { level: 1 })).toContainText('A private notebook for two people.');
  });

  test('Back returns to where you came from', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('link', { name: 'Terms', exact: true }).click();
    await expect(page).toHaveURL(/terms-and-conditions/);
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('signed-in people keep the app layout and Back falls back to the dashboard', async ({ page, request }) => {
    const user = await signupViaApi(request, newUser('legal'));
    await loginViaUi(page, user);
    await page.goto('/privacy-policy');
    await expect(page.getByRole('link', { name: 'Get started' })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Main' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
