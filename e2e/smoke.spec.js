import { test, expect } from './fixtures.js';
import { API, authHeader, loginViaUi, makeActiveRelationship, newUser, signupViaApi } from './helpers.js';

// Visits every page with real data on both sides of a relationship. The fixture
// fails the test if any page throws or falls back to the error boundary.
test('every page renders for both people in a relationship', async ({ browser, request }) => {
  test.setTimeout(180_000);
  const alice = await signupViaApi(request, newUser('smoke'));
  const bob = await signupViaApi(request, newUser('smoke'));
  const relId = await makeActiveRelationship(request, alice, bob, 'Smoke pair');

  const post = async (path, data, user = alice) => {
    const res = await request.post(`${API}${path}`, { headers: authHeader(user), data });
    expect(res.ok(), `${path}: ${await res.text()}`).toBe(true);
    return res.json();
  };

  const { term } = await post('/terms', { relationshipId: relId, title: 'Smoke term', description: 'd', category: 'communication' });
  const { milestone } = await post('/milestones', { relationshipId: relId, title: 'Smoke milestone', description: 'd', category: 'trust_based', difficulty: 'hard' });
  const { activity } = await post('/activities', { relationshipId: relId, title: 'Smoke activity', description: 'd', type: 'date' });
  const { certificate } = await post(`/certificates/relationship/${relId}/generate`, {});

  const paths = [
    '/dashboard', '/relationships', `/relationships/${relId}`, `/relationships/${relId}/summary`, `/relationships/${relId}/settings`,
    '/relationships/invite', '/find-someone',
    '/terms', '/terms/create', `/terms/${term._id}`,
    '/milestones', '/milestones/create', `/milestones/${milestone._id}`,
    '/activities', '/activities/create', `/activities/${activity._id}`,
    '/certificates', `/certificates/${certificate._id}`, `/certificates/${certificate._id}/display`,
    '/messages', '/messages/${relId}', '/notifications', '/profile', '/profile?tab=privacy', '/profile?tab=security', '/privacy-policy', '/terms-and-conditions', '/contact-us',
  ];

  for (const user of [alice, bob]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && m.text().includes('Unhandled UI error')) errors.push(m.text().slice(0, 300));
    });

    await loginViaUi(page, user);
    for (const path of paths) {
      errors.length = 0;
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page.getByText('Something went wrong'), `${user.lastName}: ${path}`).toHaveCount(0);
      expect(errors, `${path} threw`).toEqual([]);
    }
    await context.close();
  }
});
