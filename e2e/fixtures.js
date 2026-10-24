import { test as base, expect } from '@playwright/test';

// Every test fails if the app throws an uncaught error or the error boundary shows,
// even when the assertions themselves would have passed.
export const test = base.extend({
  page: async ({ page }, run) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    // Errors caught by the React error boundary are logged, not thrown
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Unhandled UI error')) errors.push(msg.text().slice(0, 400));
    });
    await run(page);
    expect(errors, 'uncaught browser errors').toEqual([]);
    await expect(page.getByText('Something went wrong')).toHaveCount(0);
  },
});

export { expect };
