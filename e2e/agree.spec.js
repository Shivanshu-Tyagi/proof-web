import { test, expect } from './fixtures.js';
import { API, authHeader, loginViaUi, makeActiveRelationship, newUser, signupViaApi } from './helpers.js';

test('both people press Agree and the agreement becomes "Agreed by both"', async ({ browser, request }) => {
  const alice = await signupViaApi(request, newUser('agree'));
  const bob = await signupViaApi(request, newUser('agree'));
  const relId = await makeActiveRelationship(request, alice, bob, 'Agree pair');
  const created = await request.post(`${API}/terms`, { headers: authHeader(alice), data: { relationshipId: relId, title: 'Leave by 8am', description: 'Start the hike early', category: 'communication' } });
  expect(created.status()).toBe(201);

  const press = async (user) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginViaUi(page, user);
    await page.goto('/terms');
    await page.getByRole('button', { name: 'Agree', exact: true }).click();
    return { ctx, page };
  };

  const bobSide = await press(bob);
  await expect(bobSide.page.getByText('Waiting for them')).toBeVisible();
  await bobSide.ctx.close();

  const aliceSide = await press(alice);
  await expect(aliceSide.page.getByText('Agreed by both')).toBeVisible();
  await aliceSide.ctx.close();
});
