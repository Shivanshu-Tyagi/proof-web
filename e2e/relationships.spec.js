import { test, expect } from './fixtures.js';
import { API, authHeader, loginViaUi, makeActiveRelationship, newUser, signupViaApi } from './helpers.js';

test.describe('relationships', () => {
  test('invitee accepts an invitation from the relationships page', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('alice'));
    const bob = await signupViaApi(request, newUser('bob'));
    const created = await request.post(`${API}/relationships`, {
      headers: authHeader(alice),
      data: { partnerEmail: bob.email, title: 'Study buddies', type: 'friend' },
    });
    expect(created.status()).toBe(201);

    await loginViaUi(page, bob);
    await page.goto('/relationships');
    await expect(page.getByText('Study buddies')).toBeVisible();
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.getByRole('button', { name: 'Accept' })).toHaveCount(0);

    const list = await request.get(`${API}/relationships`, { headers: authHeader(bob) });
    const rel = (await list.json()).relationships.find((r) => r.title === 'Study buddies');
    expect(rel.status).toBe('active');
  });

  test('lookups find people without ever exposing email addresses', async ({ request }) => {
    const alice = await signupViaApi(request, newUser('lookup'));
    const bob = await signupViaApi(request, newUser('target'));

    const byId = await request.get(`${API}/auth/search?registrationId=${bob.registrationId}`, { headers: authHeader(alice) });
    expect(byId.status()).toBe(200);
    const found = (await byId.json()).user;
    expect(found.username).toBe(bob.username);
    expect(found.email).toBeUndefined();

    // Email lookups are exact: a full address finds the person, a fragment finds no one
    const exact = await request.get(`${API}/auth/search/email?q=${encodeURIComponent(bob.email)}`, { headers: authHeader(alice) });
    expect((await exact.json()).users.map((u) => u.username)).toEqual([bob.username]);
    const fragment = await request.get(`${API}/auth/search/email?q=${bob.email.slice(0, 8)}`, { headers: authHeader(alice) });
    expect((await fragment.json()).users).toEqual([]);
  });
});

test.describe('inviting', () => {
  test('invites someone by Registration ID through the form', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('inv'));
    const bob = await signupViaApi(request, newUser('inv'));

    await loginViaUi(page, alice);
    await page.goto('/relationships/invite');
    await page.getByLabel('Their Registration ID').fill(bob.registrationId);
    await page.getByRole('button', { name: 'Find', exact: true }).click();
    await expect(page.getByText(/found/i).first()).toBeVisible();
    await page.getByLabel('Give it a name').fill('Registration ID pair');
    await page.getByRole('button', { name: 'Friend', exact: true }).click();
    await page.getByRole('button', { name: 'Send invitation' }).click();

    await expect(page).toHaveURL(/\/relationships$/);
    const list = await request.get(`${API}/relationships`, { headers: authHeader(bob) });
    const titles = (await list.json()).relationships.map((r) => r.title);
    expect(titles).toContain('Registration ID pair');
  });
});

test.describe('inviting by email', () => {
  test('a full email finds the person, then the invitation goes out by ID', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('em'));
    const bob = await signupViaApi(request, newUser('em'));

    await loginViaUi(page, alice);
    await page.goto('/relationships/invite');
    await page.getByRole('button', { name: 'Email', exact: true }).click();
    await page.getByLabel('Their email address').fill(bob.email);
    await expect(page.getByText(/found/i).first()).toBeVisible();
    await page.getByLabel('Give it a name').fill('Email pair');
    await page.getByRole('button', { name: 'Send invitation' }).click();
    await expect(page).toHaveURL(/\/relationships$/);

    const list = await request.get(`${API}/relationships`, { headers: authHeader(bob) });
    expect((await list.json()).relationships.map((r) => r.title)).toContain('Email pair');
  });

  test('find someone searches names and never shows emails', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('fs'));
    const bob = await signupViaApi(request, newUser('fs'));
    await loginViaUi(page, alice);
    await page.goto('/find-someone');
    await page.getByLabel('Search people').fill(bob.username.slice(0, 6));
    await expect(page.getByText(`@${bob.username}`)).toBeVisible();
    await expect(page.getByText(bob.email)).toHaveCount(0);
    await page.getByRole('button', { name: 'Invite' }).first().click();
    await expect(page).toHaveURL(/\/relationships\/invite/);
    await expect(page.getByText(`@${bob.username}`)).toBeVisible();
  });
});

test.describe('history access', () => {
  test('request, grant, view, then deny', async ({ browser, request }) => {
    const alice = await signupViaApi(request, newUser('hist'));
    const bob = await signupViaApi(request, newUser('hist'));
    const relId = await makeActiveRelationship(request, alice, bob, 'History pair');

    const bobCtx = await browser.newContext();
    const aliceCtx = await browser.newContext();
    const bobPage = await bobCtx.newPage();
    const alicePage = await aliceCtx.newPage();

    // Bob asks to see Alice's history
    await loginViaUi(bobPage, bob);
    await bobPage.goto(`/relationships/${relId}`);
    await bobPage.getByRole('button', { name: /request history access/i }).click();
    await expect(bobPage.getByText(/history request sent/i).first()).toBeVisible();

    // Alice sees the request, and must not be able to view Bob's history
    await loginViaUi(alicePage, alice);
    await alicePage.goto(`/relationships/${relId}`);
    await expect(alicePage.getByRole('button', { name: /grant access/i })).toBeVisible();
    await alicePage.goto(`/history/${bob.id}`);
    await expect(alicePage.getByText(/access to this user.s history is denied/i)).toBeVisible();

    // Alice grants; Bob can open her history
    await alicePage.goto(`/relationships/${relId}`);
    await alicePage.getByRole('button', { name: '7 days' }).click();
    await alicePage.getByRole('button', { name: /grant access/i }).click();
    await bobPage.goto(`/relationships/${relId}`);
    await expect(bobPage.getByText(/access ends in 7 days/i)).toBeVisible();
    await bobPage.getByRole('link', { name: /view history/i }).click();
    await expect(bobPage).toHaveURL(new RegExp(`/history/${alice.id}`));
    await expect(bobPage.getByRole('heading', { name: new RegExp(`${alice.firstName}'s history`) })).toBeVisible();
    await expect(bobPage.getByText(/allowing you to see this until|letting you see this until/i)).toBeVisible();
    await expect(bobPage.getByText(/Started · History pair/)).toBeVisible();
    // The other person's name is never shown to the viewer unless it is theirs
    await expect(bobPage.getByText(/Someone|E2E/).first()).toBeVisible();

    // Revoke: Bob loses access
    const denied = await request.post(`${API}/relationships/${relId}/grant-history-access`, {
      headers: authHeader(alice),
      data: { granted: false },
    });
    expect(denied.status()).toBe(200);
    await bobPage.goto(`/history/${alice.id}`);
    await expect(bobPage.getByText(/access to this user.s history is denied/i)).toBeVisible();

    await bobCtx.close();
    await aliceCtx.close();
  });
});

test.describe('settings that do something', () => {
  test('turning off "Add moments" blocks both people, and turning it on restores it', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('set'));
    const bob = await signupViaApi(request, newUser('set'));
    const relId = await makeActiveRelationship(request, alice, bob, 'Settings pair');
    const add = (user) => request.post(`${API}/activities`, { headers: authHeader(user), data: { relationshipId: relId, title: 'Moment', type: 'memory' } });

    expect((await add(bob)).status()).toBe(201);

    await loginViaUi(page, alice);
    await page.goto(`/relationships/${relId}/settings`);
    await page.getByRole('switch', { name: 'Add moments' }).click();
    await page.getByRole('button', { name: 'Save settings' }).click();
    await expect(page.getByText('Settings saved')).toBeVisible();

    for (const user of [alice, bob]) {
      const blocked = await add(user);
      expect(blocked.status()).toBe(403);
      expect((await blocked.json()).message).toMatch(/turned off/i);
    }

    // It persists across a reload, and can be switched back on
    await page.reload();
    await expect(page.getByRole('switch', { name: 'Add moments' })).toHaveAttribute('aria-checked', 'false');
    await page.getByRole('switch', { name: 'Add moments' }).click();
    await page.getByRole('button', { name: 'Save settings' }).click();
    await expect(page.getByText('Settings saved')).toBeVisible();
    expect((await add(bob)).status()).toBe(201);
  });

  test('a personal notification choice is saved and respected', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('nt'));
    const bob = await signupViaApi(request, newUser('nt'));
    const relId = await makeActiveRelationship(request, alice, bob, 'Notify pair');

    await loginViaUi(page, alice);
    await page.goto('/profile?tab=notifications');
    await page.getByRole('switch', { name: 'Milestones' }).click();
    await expect(page.getByText('Turned off')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('switch', { name: 'Milestones' })).toHaveAttribute('aria-checked', 'false');

    await request.post(`${API}/milestones`, { headers: authHeader(bob), data: { relationshipId: relId, title: 'Quiet', category: 'communication', difficulty: 'easy' } });
    const inbox = await request.get(`${API}/notifications`, { headers: authHeader(alice) });
    const categories = (await inbox.json()).notifications.map((n) => n.category);
    expect(categories).not.toContain('milestone');
  });
});

test.describe('ending a relationship', () => {
  test('a private note stays with its author', async ({ browser, request }) => {
    const alice = await signupViaApi(request, newUser('end'));
    const bob = await signupViaApi(request, newUser('end'));
    const relId = await makeActiveRelationship(request, alice, bob, 'Ending pair');

    const bobCtx = await browser.newContext();
    const bobPage = await bobCtx.newPage();
    await loginViaUi(bobPage, bob);
    await bobPage.goto(`/relationships/${relId}`);
    await bobPage.getByRole('button', { name: 'End relationship' }).click();
    await bobPage.getByLabel(/private note to yourself/i).fill('Drifted apart. No hard feelings.');
    await bobPage.getByRole('button', { name: 'Send request' }).click();
    await expect(bobPage.getByLabel('Private note')).toHaveValue('Drifted apart. No hard feelings.');

    // The other person has nothing there
    const aliceNote = await request.get(`${API}/relationships/${relId}/note`, { headers: authHeader(alice) });
    expect((await aliceNote.json()).note).toBeNull();
    await bobCtx.close();
  });
});

test.describe('milestones, terms and certificates', () => {
  test('creates a milestone through the form with category and difficulty', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('mile'));
    const bob = await signupViaApi(request, newUser('mile'));
    const relId = await makeActiveRelationship(request, alice, bob, 'Milestone pair');

    await loginViaUi(page, alice);
    await page.goto(`/milestones/create?relationshipId=${relId}`);
    await page.locator('#title').fill('First month together');
    await page.locator('#description').fill('Celebrate the first month');
    await page.getByRole('button', { name: 'Trust', exact: true }).click();
    await page.getByRole('button', { name: /Hard/ }).click();
    await page.getByRole('button', { name: 'Create milestone' }).click();

    await expect(page).toHaveURL(/\/milestones$/);
    await expect(page.getByText('First month together')).toBeVisible();
  });

  test('lists terms across relationships and generates + downloads a certificate', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('cert'));
    const bob = await signupViaApi(request, newUser('cert'));
    const relId = await makeActiveRelationship(request, alice, bob, 'Certificate pair');

    const term = await request.post(`${API}/terms`, {
      headers: authHeader(alice),
      data: { relationshipId: relId, title: 'Weekly call', description: 'Call every Sunday', category: 'communication' },
    });
    expect(term.status()).toBe(201);

    await loginViaUi(page, alice);
    await page.goto('/terms');
    await expect(page.getByText('Weekly call')).toBeVisible();

    const generated = await request.post(`${API}/certificates/relationship/${relId}/generate`, { headers: authHeader(alice), data: {} });
    expect(generated.status()).toBe(201);
    const certId = (await generated.json()).certificate._id;

    const file = await request.get(`${API}/certificates/${certId}/download`, { headers: authHeader(alice) });
    expect(file.status()).toBe(200);
    expect(file.headers()['content-type']).toContain('image/png');

    await page.goto('/certificates');
    await expect(page.getByText(/certificate of certificate pair/i).first()).toBeVisible();
  });
});

test.describe('certificate verify link', () => {
  test('an anonymous visitor can verify a certificate only after the owner switches the link on', async ({ page, browser, request }) => {
    const alice = await signupViaApi(request, newUser('ver'));
    const bob = await signupViaApi(request, newUser('ver'));
    const relId = await makeActiveRelationship(request, alice, bob, 'Verify pair');
    const generated = await request.post(`${API}/certificates/relationship/${relId}/generate`, { headers: authHeader(alice), data: {} });
    const cert = (await generated.json()).certificate;
    const number = cert.metadata.certificateNumber;

    // Before sharing, strangers get nothing
    const stranger = await browser.newContext();
    const anon = await stranger.newPage();
    await anon.goto(`/verify/${number}`);
    await expect(anon.getByText(/could not find that certificate/i)).toBeVisible();

    // Owner switches the link on
    await loginViaUi(page, alice);
    await page.goto(`/certificates/${cert._id}/display`);
    await page.getByRole('switch', { name: /public verify link/i }).click();
    const link = await page.getByLabel('Verify link', { exact: true }).inputValue();
    expect(link).toContain(`/verify/${number}`);

    await anon.goto(`/verify/${number}`);
    await expect(anon.getByText('Verified certificate')).toBeVisible();
    const art = anon.getByRole('img', { name: new RegExp(`certificate for .*${alice.firstName}`) });
    await expect(art).toBeVisible();
    await expect.poll(() => art.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
    await stranger.close();
  });
});

test.describe('contact form', () => {
  test('sends a message', async ({ page }) => {
    await page.goto('/contact-us');
    await page.getByLabel(/name/i).first().fill('Visitor');
    await page.getByLabel(/email/i).first().fill('visitor@example.com');
    await page.getByLabel(/subject/i).fill('Hello');
    await page.getByLabel(/message/i).fill('Testing the contact form');
    await page.getByRole('button', { name: /send/i }).click();
    await expect(page.getByText(/sent successfully/i)).toBeVisible();
  });
});
