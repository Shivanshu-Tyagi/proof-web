import { test, expect } from './fixtures.js';
import { API, authHeader, loginViaUi, makeActiveRelationship, newUser, signupViaApi } from './helpers.js';

test.describe('the certificate', () => {
  test('is shown as real artwork, matches the download, and reveals less when shared', async ({ page, request, browser }) => {
    const alice = await signupViaApi(request, { ...newUser('cert'), firstName: 'Maya', lastName: 'Chen' });
    const bob = await signupViaApi(request, { ...newUser('cert'), firstName: 'Jonas', lastName: 'Keller' });
    const relId = await makeActiveRelationship(request, alice, bob, 'Weekend hikers');
    const generated = await request.post(`${API}/certificates/relationship/${relId}/generate`, { headers: authHeader(alice), data: {} });
    const cert = (await generated.json()).certificate;

    await loginViaUi(page, alice);

    // The list shows the artwork on each card
    await page.goto('/certificates');
    const thumb = page.getByRole('img', { name: /Gold level certificate for Maya Chen and Jonas Keller/ });
    await expect(thumb).toBeVisible();
    await expect.poll(() => thumb.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);

    // The certificate page shows it large, with the number in the description
    await page.goto(`/certificates/${cert._id}/display`);
    const art = page.getByRole('img', { name: /Gold level certificate for Maya Chen and Jonas Keller/ });
    await expect(art).toBeVisible();
    await expect(art).toHaveAttribute('alt', new RegExp(cert.metadata?.certificateNumber ?? 'CERT-'));
    const box = await art.boundingBox();
    expect(box.width / box.height).toBeCloseTo(1400 / 990, 1);

    // Download gives a PNG
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download' }).click()]);
    expect(download.suggestedFilename()).toMatch(/^certificate-.*\.png$/);

    // The shared version leaves out the relationship name
    await page.getByRole('switch', { name: /public verify link/i }).click();
    const number = (await page.getByLabel('Verify link', { exact: true }).inputValue()).split('/verify/')[1];
    const anon = await browser.newContext();
    const shared = await anon.request.get(`${API}/verify/${number}/image`);
    expect(shared.status()).toBe(200);
    const svg = await shared.text();
    expect(svg).toContain('Maya Chen');
    expect(svg).not.toContain('Weekend hikers');
    await anon.close();
  });

  test('a certificate preview that fails to load can be retried', async ({ page, request }) => {
    const alice = await signupViaApi(request, newUser('cert'));
    const bob = await signupViaApi(request, newUser('cert'));
    const relId = await makeActiveRelationship(request, alice, bob, 'Retry pair');
    const cert = (await (await request.post(`${API}/certificates/relationship/${relId}/generate`, { headers: authHeader(alice), data: {} })).json()).certificate;
    await loginViaUi(page, alice);

    let fail = true;
    await page.route(`**/certificates/${cert._id}/image`, (route) => (fail ? route.abort() : route.continue()));
    await page.goto(`/certificates/${cert._id}/display`);
    await expect(page.getByText('The certificate preview did not load.')).toBeVisible();
    fail = false;
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('img', { name: /certificate for/ })).toBeVisible();
  });
});
