import { test, expect } from './fixtures.js';
import { loginViaUi, newUser, signupViaApi } from './helpers.js';

test.describe('landing page', () => {
  test('explains the idea in plain words and leads to sign up and sign in', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('A private notebook for two people.');
    for (const name of ['What is Twogether?', 'See an example', 'How it works', 'Words we use', 'Questions']) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }

    // The example changes when you pick a different situation
    await page.getByRole('navigation', { name: 'Page sections' }).getByRole('link', { name: 'See an example' }).click();
    await expect(page.getByText('Leave the trailhead by 8am').first()).toBeVisible();
    await page.getByRole('tab', { name: 'Flatmates' }).click();
    await expect(page.getByRole('tab', { name: 'Flatmates' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel').getByText('Dishes done before bed')).toBeVisible();

    // Steps, dictionary and answers are all there
    await expect(page.getByRole('heading', { name: 'Create your account', level: 3 })).toBeVisible();
    await expect(page.getByText('Registration ID', { exact: true }).first()).toBeVisible();
    await page.getByText('Do I have to invite someone to use it?').click();
    await expect(page.getByText(/Twogether is built for two people/)).toBeVisible();

    await page.getByRole('link', { name: 'Create your account' }).first().click();
    await expect(page).toHaveURL(/\/signup/);
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign in' }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('fits a phone screen without sideways scrolling', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const page = await ctx.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await ctx.close();
  });

  test('signed-in people go straight to their dashboard', async ({ page, request }) => {
    const user = await signupViaApi(request, newUser('land'));
    await loginViaUi(page, user);
    await page.goto('/');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
