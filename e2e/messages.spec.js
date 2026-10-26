import { test, expect } from './fixtures.js';
import { API, authHeader, loginViaUi, makeActiveRelationship, newUser, signupViaApi } from './helpers.js';

test.describe('messages between two people', () => {
  test('send, receive, unread badge, and no access for outsiders', async ({ browser, request }) => {
    const alice = await signupViaApi(request, newUser('msg'));
    const bob = await signupViaApi(request, newUser('msg'));
    const eve = await signupViaApi(request, newUser('msg'));
    const relId = await makeActiveRelationship(request, alice, bob, 'Msg pair');

    const aliceCtx = await browser.newContext();
    const alicePage = await aliceCtx.newPage();
    await loginViaUi(alicePage, alice);
    await alicePage.goto(`/relationships/${relId}`);
    await alicePage.getByRole('link', { name: 'Message', exact: true }).click();
    await expect(alicePage).toHaveURL(new RegExp(`/messages/${relId}`));
    await alicePage.getByLabel(/^Message /).fill('Hello Bob');
    await alicePage.keyboard.press('Enter');
    await expect(alicePage.getByRole('list', { name: 'Messages' }).getByText('Hello Bob')).toBeVisible();

    // Bob sees an unread badge, opens the thread and replies
    const bobCtx = await browser.newContext();
    const bobPage = await bobCtx.newPage();
    await loginViaUi(bobPage, bob);
    await bobPage.goto('/messages');
    await expect(bobPage.getByRole('link', { name: /Hello Bob/ })).toBeVisible();
    await expect(bobPage.getByLabel('1 unread').first()).toBeVisible();
    await bobPage.getByRole('link', { name: /Hello Bob/ }).click();
    await expect(bobPage.getByRole('listitem').filter({ hasText: 'Hello Bob' })).toBeVisible();
    await bobPage.getByLabel(/^Message /).fill('Hi Alice');
    await bobPage.getByRole('button', { name: 'Send message' }).click();

    // Alice's open conversation picks the reply up without a reload. A quiet conversation is checked
    // less often (at most every 30 seconds), hence the longer wait.
    await expect(alicePage.getByRole('list', { name: 'Messages' }).getByText('Hi Alice')).toBeVisible({ timeout: 35_000 });

    // Someone outside the relationship cannot read or write
    const peek = await request.get(`${API}/messages/${relId}`, { headers: authHeader(eve) });
    expect(peek.status()).toBe(404);
    const write = await request.post(`${API}/messages/${relId}`, { headers: authHeader(eve), data: { text: 'hi' } });
    expect(write.status()).toBe(404);

    await aliceCtx.close();
    await bobCtx.close();
  });
});
