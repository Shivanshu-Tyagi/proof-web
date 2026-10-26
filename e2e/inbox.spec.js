import { test, expect } from './fixtures.js';
import { API, authHeader, loginViaUi, newUser, signupViaApi } from './helpers.js';

const invite = async (request, from, to, title) => {
  const res = await request.post(`${API}/relationships`, { headers: authHeader(from), data: { partnerId: to.id, title, type: 'friend' } });
  expect(res.status()).toBe(201);
  return (await res.json()).relationship._id;
};
const statusOf = async (request, user, id) => (await (await request.get(`${API}/relationships/${id}`, { headers: authHeader(user) })).json()).relationship;

test.describe('answering requests from the Inbox', () => {
  test('Accept in the Inbox accepts the invitation, instead of opening a missing page', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('inbox'));
    const bob = await signupViaApi(request, newUser('inbox'));
    const id = await invite(request, alice, bob, 'Inbox pair');

    await loginViaUi(page, bob);
    await page.goto('/notifications');
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.getByText('Invitation accepted').first()).toBeVisible();

    // Still on the Inbox, never a 404, and the question has gone
    await expect(page).toHaveURL(/\/notifications$/);
    await expect(page.getByText(/page not found/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Accept' })).toHaveCount(0);
    expect((await statusOf(request, bob, id)).status).toBe('active');
  });

  test('Decline works the same way', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('inbox'));
    const bob = await signupViaApi(request, newUser('inbox'));
    const id = await invite(request, alice, bob, 'Declined pair');

    await loginViaUi(page, bob);
    await page.goto('/notifications');
    await page.getByRole('button', { name: 'Decline' }).click();
    await expect(page.getByText('Invitation declined').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Decline' })).toHaveCount(0);
    expect((await statusOf(request, alice, id)).status).toBe('declined');
  });

  test('answering on the home page also clears the Inbox buttons', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('inbox'));
    const bob = await signupViaApi(request, newUser('inbox'));
    await invite(request, alice, bob, 'Home pair');

    await loginViaUi(page, bob);
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.getByText('Invitation accepted').first()).toBeVisible();
    await page.goto('/notifications');
    await expect(page.getByRole('button', { name: 'Accept' })).toHaveCount(0);
  });

  test('accepting on the People page leaves nothing to accept in the Inbox', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('inbox'));
    const bob = await signupViaApi(request, newUser('inbox'));
    await invite(request, alice, bob, 'People pair');

    await loginViaUi(page, bob);
    await page.goto('/relationships');
    await page.getByRole('button', { name: 'Accept' }).first().click();
    await expect(page.getByText('Relationship accepted successfully!').first()).toBeVisible();

    await page.goto('/notifications');
    await expect(page.getByText('New Relationship Invitation')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Accept' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Decline' })).toHaveCount(0);
  });

  test('an Inbox page left open while the invitation was answered elsewhere explains itself', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('inbox'));
    const bob = await signupViaApi(request, newUser('inbox'));
    const id = await invite(request, alice, bob, 'Stale pair');

    await loginViaUi(page, bob);
    await page.goto('/notifications');
    await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();

    // Answered on another device, while this page still shows the buttons
    await request.post(`${API}/relationships/${id}/accept`, { headers: authHeader(bob) });
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.getByText('That request has already been answered.').first()).toBeVisible();
    await expect(page.getByText(/not pending/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Accept' })).toHaveCount(0);
  });

  test('a request to change what you are to each other reaches the Inbox and can be accepted there', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('inbox'));
    const bob = await signupViaApi(request, newUser('inbox'));
    const id = await invite(request, alice, bob, 'Change pair');
    await request.post(`${API}/relationships/${id}/accept`, { headers: authHeader(bob) });
    const asked = await request.post(`${API}/relationships/${id}/request-type-change`, { headers: authHeader(alice), data: { newType: 'best_friend' } });
    expect(asked.status()).toBe(200);

    await loginViaUi(page, bob);
    await page.goto('/notifications');
    await expect(page.getByText('Type Change Request')).toBeVisible();
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.getByText('Change accepted').first()).toBeVisible();
    expect((await statusOf(request, bob, id)).type).toBe('best_friend');
  });
});
