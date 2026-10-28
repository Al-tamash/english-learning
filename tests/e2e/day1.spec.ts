import { expect, test } from '@playwright/test';

test('completes a short Day 1 session and survives reload + offline', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByText('Day 1 · Week 1')).toBeVisible();
  await page.getByRole('button', { name: 'Short 15 min', exact: true }).click();

  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Jawab dekho', exact: true }).click();
    await page.getByRole('button', { name: 'Aaya', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Aage badho', exact: true }).click();

  await page.getByRole('button', { name: 'Nahi, off rakho', exact: true }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: 'Bina record kiye aage', exact: true }).click();
    await page.getByRole('button', { name: 'Jawab dekho', exact: true }).click();
    await page.getByRole('button', { name: 'Aage', exact: true }).click();
  }

  for (const answer of ['at', 'as', 'developer']) {
    await page.getByRole('textbox').fill(answer);
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    await page.getByRole('button', { name: 'Aage', exact: true }).click();
  }
  await page.getByRole('button', { name: '4', exact: true }).click();
  await page.getByRole('button', { name: 'Session khatam', exact: true }).click();
  await expect(page.getByText('Days complete: 1/14')).toBeVisible();

  await page.goto('/');
  await expect(page.getByText('Day 2 · Week 1')).toBeVisible();

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Day 2 · Week 1')).toBeVisible();
});
