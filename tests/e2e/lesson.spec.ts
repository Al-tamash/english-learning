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

test('checks grammar practice with explanations, variants, and model answers', async ({ page }) => {
  const lesson = pathToFileURL(path.resolve('lessons/0001-week-1-introduce-yourself.html')).href;
  await page.goto(lesson);

  const grammar = page.locator('.quiz-card').filter({ hasText: 'She ___ at a bank.' });
  await grammar.getByRole('textbox').fill('work');
  await grammar.getByRole('button', { name: 'Check' }).click();
  await expect(grammar.getByText('Phir se')).toBeVisible();
  await expect(grammar.getByText('He/she/it ke saath verb me -s lagta hai.')).toBeVisible();
  await expect(grammar.getByText('Model: She works at a bank.')).toBeVisible();

  await grammar.getByRole('textbox').fill(' works ');
  await grammar.getByRole('button', { name: 'Check' }).click();
  await expect(grammar.getByText('Sahi')).toBeVisible();

  const negative = page.locator('.quiz-card').filter({ hasText: 'He ___ work at a big company.' });
  await negative.getByRole('textbox').fill('does not');
  await negative.getByRole('button', { name: 'Check' }).click();
  await expect(negative.getByText('Sahi')).toBeVisible();

  const build = page
    .locator('.quiz-card')
    .filter({ hasText: 'Build: at / I / Edone Solutions / work / as / a / web developer' });
  await build.getByRole('textbox').fill('I WORK AT EDONE SOLUTIONS AS A WEB DEVELOPER');
  await build.getByRole('button', { name: 'Check' }).click();
  await expect(build.getByText('Sahi')).toBeVisible();

  const translation = page
    .locator('.quiz-card')
    .filter({ hasText: 'Mere paas teen saal ka experience hai.' });
  await translation.getByRole('textbox').fill('i have 3 years of experience.');
  await translation.getByRole('button', { name: 'Check' }).click();
  await expect(translation.getByText('Sahi')).toBeVisible();

  const translationWrong = page
    .locator('.quiz-card')
    .filter({ hasText: 'Mujhe frontend design achha aata hai.' });
  await translationWrong.getByRole('textbox').fill('I am good in frontend design.');
  await translationWrong.getByRole('button', { name: 'Check' }).click();
  await expect(translationWrong.getByText('Phir se')).toBeVisible();
  await expect(translationWrong.getByText('good at + skill.')).toBeVisible();
  await expect(
    translationWrong.getByText("Model: I'm good at frontend design."),
  ).toBeVisible();

  const location = page
    .locator('.quiz-card')
    .filter({ hasText: 'Main Nagpur se hoon, lekin Pune me rehta hoon.' });
  await location.getByRole('textbox').fill('I’m from Nagpur but I live in Pune');
  await location.getByRole('button', { name: 'Check' }).click();
  await expect(location.getByText('Sahi')).toBeVisible();
});
