import { expect, test } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

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
