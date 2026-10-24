import { test, expect } from './fixtures.js';
import { loginViaUi, makeActiveRelationship, newUser, signupViaApi } from './helpers.js';

test.describe('forms say which field is missing', () => {
  test('create agreement: names each empty field, focuses the first, clears as you fix them', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('form'));
    const bob = await signupViaApi(request, newUser('form'));
    await makeActiveRelationship(request, alice, bob, 'Form pair');
    await loginViaUi(page, alice);

    await page.goto('/terms/create');
    await page.getByRole('button', { name: 'Create agreement' }).click();
    await expect(page.getByText('Choose which relationship this agreement is for.')).toBeVisible();
    await expect(page.getByText('Write what the agreement is.')).toBeVisible();
    await expect(page.getByText('Add the details: what does each of you commit to?')).toBeVisible();
    await expect(page.getByLabel('What is the agreement?')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Please fill in all required fields')).toHaveCount(0);

    // Fixing a field removes only its message
    await page.getByRole('radio', { name: /Form pair/ }).click();
    await expect(page.getByText('Choose which relationship this agreement is for.')).toHaveCount(0);
    await page.getByLabel('What is the agreement?').fill('Call every Sunday');
    await expect(page.getByText('Write what the agreement is.')).toHaveCount(0);
    await expect(page.getByText('Add the details: what does each of you commit to?')).toBeVisible();

    await page.getByLabel('The details').fill('Sunday evening, 30 minutes');
    await page.getByRole('button', { name: 'Create agreement' }).click();
    await expect(page).toHaveURL(/\/relationships\//);
  });

  test('create milestone and moment flag the title', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('form'));
    const bob = await signupViaApi(request, newUser('form'));
    const relId = await makeActiveRelationship(request, alice, bob, 'Form pair 2');
    await loginViaUi(page, alice);

    await page.goto(`/milestones/create?relationshipId=${relId}`);
    await page.getByRole('button', { name: 'Create milestone' }).click();
    await expect(page.getByText('Say what you are celebrating.')).toBeVisible();
    await expect(page.getByText('Choose which relationship this milestone is for.')).toHaveCount(0);

    await page.goto(`/activities/create?relationshipId=${relId}`);
    await page.getByRole('button', { name: 'Add moment' }).click();
    await expect(page.getByText('Say what happened.')).toBeVisible();
  });

  test('sign up and sign in name the empty fields', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('button', { name: 'Create account' }).click();
    for (const message of ['Enter your first name.', 'Enter your last name.', 'Choose a username.', 'Enter your email address.', 'Choose a password.', 'Type the password again to confirm it.', 'Tick this to continue.']) {
      await expect(page.getByText(message)).toBeVisible();
    }
    await expect(page.getByLabel('First name')).toBeFocused();

    await page.getByLabel(/^Password/).fill('Password123');
    await page.getByLabel('Confirm password').fill('Different123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('The passwords do not match.')).toBeVisible();

    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText('Enter your email address.')).toBeVisible();
    await expect(page.getByText('Enter your password.')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeFocused();
  });

  test('invite names what is missing', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('form'));
    await loginViaUi(page, alice);
    await page.goto('/relationships/invite');
    await page.getByRole('button', { name: 'Send invitation' }).click();
    await expect(page.getByText('Enter their Registration ID, then press Find.')).toBeVisible();
    await expect(page.getByText('Give this relationship a name.')).toBeVisible();
  });
});
