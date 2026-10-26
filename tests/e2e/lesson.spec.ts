import { expect, test } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

test('serves the lesson and reference from the built site', async ({ page }) => {
  const response = await page.goto('/lessons/0001-week-1-introduce-yourself.html');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Week 1 · Introduce yourself and your work | Bol');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Introduce yourself and your work' }),
  ).toBeVisible();
  expect(await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(
    'rgba(0, 0, 0, 0)',
  );

  await page.goto('/reference/0001-week-1-patterns.html');
  await expect(page).toHaveTitle('Week 1 patterns | Bol reference');
});

test('serves the lesson after the service worker takes control', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  await page.goto('/lessons/0001-week-1-introduce-yourself.html');
  await expect(page).toHaveTitle('Week 1 · Introduce yourself and your work | Bol');
});

test('checks a lesson answer and links to the reference', async ({ page }) => {
  const lesson = pathToFileURL(path.resolve('lessons/0001-week-1-introduce-yourself.html')).href;
  await page.goto(lesson);

  await page.getByLabel('I work ___ Edone Solutions.').fill('at');
  await page.getByRole('button', { name: 'Check' }).first().click();
  await expect(page.getByText('Sahi').first()).toBeVisible();

  await page.getByLabel('I work ___ Edone Solutions.').fill('on');
  await page.getByRole('button', { name: 'Check' }).first().click();
  await expect(page.getByText('Phir se').first()).toBeVisible();

  await expect(page.getByRole('link', { name: 'Week 1 patterns' })).toHaveAttribute(
    'href',
    '../reference/0001-week-1-patterns.html',
  );
});
