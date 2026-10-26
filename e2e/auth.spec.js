import { test, expect } from './fixtures.js';
import { newUser, signupViaApi, loginViaUi, PASSWORD } from './helpers.js';

test.describe('authentication', () => {
  test('signs up through the form and lands on the dashboard', async ({ page }) => {
    const user = newUser('signup');
    await page.goto('/signup');
    await page.getByLabel('First name').fill(user.firstName);
    await page.getByLabel('Last name').fill(user.lastName);
    await page.getByLabel('Username').fill(user.username);
    await page.getByLabel('Email', { exact: true }).fill(user.email);
    await page.getByLabel(/^Password/).fill(user.password);
    await page.getByLabel('Confirm password').fill(user.password);
    await page.locator('#agree-terms').check();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: new RegExp(`Good (morning|afternoon|evening), ${user.firstName}`) })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Get started in three steps' })).toBeVisible();
    await expect(page.getByLabel('Your invite link')).toContainText('/connect/');
  });

  test('rejects a wrong password and accepts the right one', async ({ page, request }) => {
    const user = await signupViaApi(request);
    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password', { exact: true }).fill('WrongPassword9');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid credentials/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/login/);

    await loginViaUi(page, user);
  });

  test('redirects anonymous visitors away from protected pages', async ({ page }) => {
    await page.goto('/relationships');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows a real 404 page for unknown routes', async ({ page }) => {
    await page.goto('/definitely-not-a-page');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  });

  test('stays signed in after a reload', async ({ page, request }) => {
    const user = await signupViaApi(request);
    await loginViaUi(page, user);
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe('password management', () => {
  test('forgot password shows the same confirmation for any email', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /forgot your password/i }).click();
    await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible();
    await page.getByLabel(/email address/i).fill('nobody-here@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    await expect(page.getByText(/we.ve sent a link/i)).toBeVisible();
  });

  test('an invalid reset link is rejected', async ({ page }) => {
    await page.goto(`/reset-password/${'a'.repeat(64)}`);
    await page.getByLabel('New password', { exact: true }).fill('BrandNewPass1');
    await page.getByLabel('Confirm new password').fill('BrandNewPass1');
    await page.getByRole('button', { name: /reset password/i }).click();
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });

  test('changes the password from the profile page', async ({ page, request }) => {
    const user = await signupViaApi(request);
    await loginViaUi(page, user);
    await page.goto('/profile?tab=security');
    await page.getByLabel('Current password').fill(user.password);
    await page.getByLabel('New password', { exact: true }).fill('ChangedPass123');
    await page.getByLabel('Confirm new password').fill('ChangedPass123');
    await page.getByRole('button', { name: /update password/i }).click();
    await expect(page.getByText(/password changed/i)).toBeVisible();

    const old = await request.post('http://localhost:5002/api/auth/login', { data: { email: user.email, password: PASSWORD } });
    expect(old.status()).toBe(401);
    const fresh = await request.post('http://localhost:5002/api/auth/login', { data: { email: user.email, password: 'ChangedPass123' } });
    expect(fresh.status()).toBe(200);
  });
});

test.describe('your data', () => {
  test('downloads a copy of your data', async ({ page, request }) => {
    const user = await signupViaApi(request);
    await loginViaUi(page, user);
    await page.goto('/profile?tab=security');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download my data' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^proof-data-\d{4}-\d{2}-\d{2}\.json$/);
    const fs = await import('node:fs/promises');
    const data = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
    expect(data.profile.email).toBe(user.email);
    expect(data.profile.password).toBeUndefined();
  });

  test('deleting your account needs the password and an explicit confirmation, then signs you out', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('del'));
    const bob = await signupViaApi(request, newUser('del'));
    await request.post('http://localhost:5002/api/relationships', { headers: { Authorization: `Bearer ${alice.token}` }, data: { partnerEmail: bob.email, title: 'Soon gone', type: 'friend' } });

    await loginViaUi(page, alice);
    await page.goto('/profile?tab=security');
    await page.getByRole('button', { name: 'Delete my account' }).click();
    const confirm = page.getByRole('button', { name: 'Delete forever' });
    await expect(confirm).toBeDisabled();

    await page.getByLabel('Your password').fill('WrongPassword9');
    await page.getByLabel('I understand this is permanent').check();
    await confirm.click();
    await expect(page.getByText('Password is incorrect')).toBeVisible();

    await page.getByLabel('Your password').fill(alice.password);
    await confirm.click();
    await expect(page).toHaveURL(/\/login/);

    const login = await request.post('http://localhost:5002/api/auth/login', { data: { email: alice.email, password: alice.password } });
    expect(login.status()).toBe(401);
    // The invitation they sent no longer lingers for the other person
    const inbox = await request.get('http://localhost:5002/api/relationships', { headers: { Authorization: `Bearer ${bob.token}` } });
    expect((await inbox.json()).relationships.find((r) => r.title === 'Soon gone').status).toBe('declined');
  });
});
