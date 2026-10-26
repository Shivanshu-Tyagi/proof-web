import { test, expect } from './fixtures.js';
import { loginViaUi, newUser, signupViaApi } from './helpers.js';

test.describe('a friend joins through an invite link', () => {
  test('open the link, sign up, send the request, and the first person accepts', async ({ browser, request }) => {
    const alice = await signupViaApi(request, { ...newUser('link'), firstName: 'Alice', lastName: 'Sender' });

    // Alice has a link she can share, and a short guide because she has no relationships yet
    const aliceCtx = await browser.newContext();
    const alicePage = await aliceCtx.newPage();
    await loginViaUi(alicePage, alice);
    await expect(alicePage.getByRole('heading', { name: 'Get started in three steps' })).toBeVisible();
    const link = (await alicePage.getByLabel('Your invite link').textContent()).trim();
    expect(link).toMatch(/\/connect\/.+/);

    // Her friend has no account. The link says who invited them, in plain words
    const friendCtx = await browser.newContext();
    const friend = await friendCtx.newPage();
    await friend.goto(link);
    await expect(friend.getByRole('heading', { name: 'Alice invited you to Twogether' })).toBeVisible();
    await expect(friend.getByText('Only the two of you can see it. Nothing is public.')).toBeVisible();

    // They sign up, and land on a request that is already addressed to Alice
    await friend.getByRole('link', { name: 'Create your account' }).click();
    const bob = newUser('linkfriend');
    await friend.getByLabel('First name').fill('Bob');
    await friend.getByLabel('Last name').fill('Friend');
    await friend.getByLabel('Username').fill(bob.username);
    await friend.getByLabel('Email', { exact: true }).fill(bob.email);
    await friend.getByLabel(/^Password/).fill(bob.password);
    await friend.getByLabel('Confirm password').fill(bob.password);
    await friend.locator('#agree-terms').check();
    await friend.getByRole('button', { name: 'Create account' }).click();
    await expect(friend).toHaveURL(/\/relationships\/invite/);
    await expect(friend.getByText('Alice Sender')).toBeVisible();
    await friend.getByLabel('Give it a name').fill('Weekend hikers');
    await friend.getByRole('button', { name: 'Send invitation' }).click();
    await expect(friend).toHaveURL(/\/relationships$/);

    // Alice sees it under "Needs you" and accepts
    await alicePage.goto('/dashboard');
    await expect(alicePage.getByRole('heading', { name: 'Needs you' })).toBeVisible();
    await alicePage.getByRole('button', { name: 'Accept' }).click();
    await expect(alicePage.getByText('Weekend hikers').first()).toBeVisible();

    await aliceCtx.close();
    await friendCtx.close();
  });

  test('an existing user who opens the link goes straight to the request', async ({ page, request }) => {
    const alice = await signupViaApi(request, { ...newUser('link'), firstName: 'Alice', lastName: 'Sender' });
    const carol = await signupViaApi(request, newUser('linkcarol'));
    await loginViaUi(page, carol);
    await page.goto(`/connect/${alice.registrationId}`);
    await expect(page).toHaveURL(/\/relationships\/invite/);
    await expect(page.getByText('Alice Sender')).toBeVisible();
  });

  test('your own link and a wrong link are explained, not broken', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('link'));
    await page.goto('/connect/NOTAREALID1');
    await expect(page.getByText('This invite link is not valid')).toBeVisible();
    await loginViaUi(page, alice);
    await page.goto(`/connect/${alice.registrationId}`);
    await expect(page.getByText('This is your own invite link')).toBeVisible();
  });
});

test.describe('first steps are guided', () => {
  test('creating something with no relationship says what to do first, instead of showing a dead form', async ({ page, request }) => {
    const lonely = await signupViaApi(request, newUser('lonely'));
    await loginViaUi(page, lonely);
    for (const path of ['/terms/create', '/milestones/create', '/activities/create']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: 'First, connect with someone' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Invite someone' })).toBeVisible();
    }
  });

  test('the phone tab bar has five labelled tabs that fit', async ({ browser, request }) => {
    const user = await signupViaApi(request, newUser('tabs'));
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const page = await ctx.newPage();
    await loginViaUi(page, user);
    const tabs = page.getByRole('navigation', { name: 'Main' }).last().getByRole('link');
    await expect(tabs).toHaveCount(5);
    const boxes = await tabs.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.right]; }));
    for (let i = 1; i < boxes.length; i += 1) expect(boxes[i][0]).toBeGreaterThanOrEqual(boxes[i - 1][1] - 1); // no overlaps
    await ctx.close();
  });
});
