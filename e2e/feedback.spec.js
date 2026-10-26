import { test, expect } from './fixtures.js';
import { API, authHeader, loginViaUi, newUser, signupViaApi } from './helpers.js';

const unique = () => Math.random().toString(36).slice(2, 8);

test.describe('feedback and suggestions', () => {
  test('share a problem, see it listed, and a second person adds their voice', async ({ browser, request }) => {
    const maya = await signupViaApi(request, { ...newUser('fb'), firstName: 'Maya', lastName: 'Hidden' });
    const jonas = await signupViaApi(request, { ...newUser('fb'), firstName: 'Jonas', lastName: 'Hidden' });
    const title = `Reminder before due ${unique()}`;

    const mayaCtx = await browser.newContext();
    const mayaPage = await mayaCtx.newPage();
    await loginViaUi(mayaPage, maya);
    await mayaPage.goto('/feedback');
    await mayaPage.getByRole('button', { name: 'Share feedback' }).first().click();

    // Missing details are explained, not just refused
    await mayaPage.getByRole('button', { name: 'Post feedback' }).click();
    await expect(mayaPage.getByText('Give it a short title, at least 4 characters.')).toBeVisible();
    await expect(mayaPage.getByText('Add a few details, at least 10 characters.')).toBeVisible();

    await mayaPage.getByRole('form', { name: 'Share feedback' }).getByRole('button', { name: /^Problem/ }).click();
    await mayaPage.getByLabel('Title').fill(title);
    await mayaPage.getByLabel('Details').fill('I forgot a milestone and the app did not remind me.');
    await mayaPage.getByRole('button', { name: 'Post feedback' }).click();
    await expect(mayaPage.getByText('Thank you! Your feedback is posted.').first()).toBeVisible();
    const card = mayaPage.getByRole('listitem').filter({ hasText: title });
    await expect(card).toBeVisible();
    await expect(card.getByText('Problem', { exact: true })).toBeVisible();
    await expect(card.getByText('You', { exact: false }).first()).toBeVisible();
    await expect(card.getByRole('button', { name: /Me too/ })).toHaveAttribute('aria-pressed', 'true'); // the author counts once

    // Jonas sees it with Maya's first name only, and adds his voice
    const jonasCtx = await browser.newContext();
    const jonasPage = await jonasCtx.newPage();
    await loginViaUi(jonasPage, jonas);
    await jonasPage.goto('/feedback');
    const jonasCard = jonasPage.getByRole('listitem').filter({ hasText: title });
    await expect(jonasCard).toBeVisible();
    await expect(jonasCard.getByText('Maya', { exact: false })).toBeVisible();
    await expect(jonasCard.getByText('Hidden')).toHaveCount(0); // her last name is never shown
    const meToo = jonasCard.getByRole('button', { name: /Me too/ });
    await expect(meToo).toHaveAttribute('aria-pressed', 'false');
    await meToo.click();
    await expect(meToo).toHaveAttribute('aria-pressed', 'true');
    await expect(jonasCard.getByText('2 people said this')).toBeVisible();

    // Taking it back works, and a reload shows what the server holds
    await meToo.click();
    await expect(jonasCard.getByText('1 person said this')).toBeVisible();
    await meToo.click();
    await jonasPage.reload();
    await expect(jonasPage.getByRole('listitem').filter({ hasText: title }).getByText('2 people said this')).toBeVisible();

    await mayaCtx.close();
    await jonasCtx.close();
  });

  test('a similar post is suggested while typing, and "me too" there counts', async ({ page, request }) => {
    const author = await signupViaApi(request, newUser('fb'));
    const visitor = await signupViaApi(request, newUser('fb'));
    const word = `calendar${unique()}`;
    const made = await request.post(`${API}/feedback`, { headers: authHeader(author), data: { type: 'idea', title: `A ${word} view`, body: 'Show milestones on a calendar please.' } });
    expect(made.status()).toBe(201);
    const id = (await made.json()).feedback.id;

    await loginViaUi(page, visitor);
    await page.goto('/feedback');
    await page.getByRole('button', { name: 'Share feedback' }).first().click();
    await page.getByLabel('Title').fill(`I want a ${word} too`);
    const hint = page.getByRole('status').filter({ hasText: 'Someone may have said this already' });
    await expect(hint).toBeVisible();
    await hint.getByRole('button', { name: /Me too/ }).click();
    await expect(hint.getByRole('button', { name: /Me too/ })).toHaveAttribute('aria-pressed', 'true');

    const seen = await request.get(`${API}/feedback?q=${word}`, { headers: authHeader(visitor) });
    expect((await seen.json()).feedback.find((f) => f.id === id).supportCount).toBe(2);
  });

  test('anonymous posts hide the name, own posts can be removed, and filters narrow the list', async ({ page, request }) => {
    const me = await signupViaApi(request, { ...newUser('fb'), firstName: 'Sam', lastName: 'Showy' });
    const other = await signupViaApi(request, newUser('fb'));
    const token = unique();
    const post = (user, data) => request.post(`${API}/feedback`, { headers: authHeader(user), data });
    await post(me, { type: 'idea', title: `Quiet idea ${token}`, body: 'Posted without my name attached.', anonymous: true });
    await post(other, { type: 'problem', title: `Loud problem ${token}`, body: 'Something is broken for me today.' });

    await loginViaUi(page, me);
    await page.goto('/feedback');
    await page.getByLabel('Search feedback').fill(token);
    await expect(page.getByRole('listitem').filter({ hasText: `Quiet idea ${token}` })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: `Loud problem ${token}` })).toBeVisible();

    await page.getByRole('button', { name: 'Problems' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: `Quiet idea ${token}` })).toHaveCount(0);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByRole('button', { name: 'My posts' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: `Loud problem ${token}` })).toHaveCount(0);

    // Remove my own post; there is no remove button on someone else's
    const mine = page.getByRole('listitem').filter({ hasText: `Quiet idea ${token}` });
    await mine.getByRole('button', { name: /Remove/ }).click();
    await page.getByRole('button', { name: 'Remove', exact: true }).click();
    await expect(mine).toHaveCount(0);
    await page.getByRole('button', { name: 'My posts' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: `Loud problem ${token}` }).getByRole('button', { name: /Remove/ })).toHaveCount(0);
  });

  test('an empty search says so and offers to share', async ({ page, request }) => {
    const user = await signupViaApi(request, newUser('fb'));
    await loginViaUi(page, user);
    await page.goto('/feedback');
    await page.getByLabel('Search feedback').fill(`nothing-matches-${unique()}`);
    await expect(page.getByText('Nothing matches')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share feedback' }).last()).toBeVisible();
  });

  test('the owner can set a status and reply, and everyone sees it', async ({ browser, request }) => {
    // The owner account is fixed (it is named in the test server's settings), so sign in if it already exists from an earlier run
    const owner = { username: 'owner_e2e', email: 'owner-e2e@example.com', password: 'E2ePassword1', firstName: 'Olive', lastName: 'Owner' };
    const created = await request.post(`${API}/auth/signup`, { data: owner });
    const session = await (created.ok() ? created : await request.post(`${API}/auth/login`, { data: { email: owner.email, password: owner.password } })).json();
    const ownerUser = { ...owner, token: session.token };
    const author = await signupViaApi(request, newUser('fb'));
    const title = `Owner reply ${unique()}`;
    await request.post(`${API}/feedback`, { headers: authHeader(author), data: { type: 'idea', title, body: 'Please let me export my messages.' } });

    const ownerCtx = await browser.newContext();
    const ownerPage = await ownerCtx.newPage();
    await loginViaUi(ownerPage, ownerUser);
    await ownerPage.goto('/feedback');
    await ownerPage.getByLabel('Search feedback').fill(title);
    const card = ownerPage.getByRole('listitem').filter({ hasText: title });
    await card.getByRole('button', { name: 'Reply or set status' }).click();
    await card.getByLabel('Status').selectOption('planned');
    await card.getByLabel('Reply everyone can see').fill('Good idea. This is planned for next month.');
    await card.getByRole('button', { name: 'Save' }).click();
    await expect(card.getByText('Planned', { exact: true })).toBeVisible();

    // An ordinary person has no such controls, and sees the reply
    const authorCtx = await browser.newContext();
    const authorPage = await authorCtx.newPage();
    await loginViaUi(authorPage, author);
    await authorPage.goto('/feedback');
    await authorPage.getByLabel('Search feedback').fill(title);
    const seen = authorPage.getByRole('listitem').filter({ hasText: title });
    await expect(seen.getByText('Planned', { exact: true })).toBeVisible();
    await expect(seen.getByText('Good idea. This is planned for next month.')).toBeVisible();
    await expect(seen.getByRole('button', { name: 'Reply or set status' })).toHaveCount(0);

    await ownerCtx.close();
    await authorCtx.close();
  });
});
