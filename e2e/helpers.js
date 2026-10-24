import { expect } from '@playwright/test';

export const API = 'http://localhost:5002/api';
export const PASSWORD = 'E2ePassword1';

// Unique per run so tests never collide with data from earlier runs
const run = Date.now().toString(36);
let counter = 0;

export const newUser = (label = 'user') => {
  counter += 1;
  const id = `${label}${counter}${run}`.slice(0, 20);
  return { username: id, email: `${id}@example.com`, password: PASSWORD, firstName: 'E2E', lastName: label };
};

export const signupViaApi = async (request, user = newUser()) => {
  const res = await request.post(`${API}/auth/signup`, { data: user });
  expect(res.status(), await res.text()).toBe(201);
  const body = await res.json();
  return { ...user, id: body.user.id, token: body.token, registrationId: body.user.registrationId };
};

export const authHeader = (user) => ({ Authorization: `Bearer ${user.token}` });

export const loginViaUi = async (page, user) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
};

// Creates an accepted relationship between two API-created users
export const makeActiveRelationship = async (request, a, b, title = 'E2E bond') => {
  const created = await request.post(`${API}/relationships`, {
    headers: authHeader(a),
    data: { partnerEmail: b.email, title, type: 'friend' },
  });
  expect(created.status(), await created.text()).toBe(201);
  const rel = (await created.json()).relationship;
  const accepted = await request.post(`${API}/relationships/${rel._id}/accept`, { headers: authHeader(b) });
  expect(accepted.status()).toBe(200);
  return rel._id;
};
