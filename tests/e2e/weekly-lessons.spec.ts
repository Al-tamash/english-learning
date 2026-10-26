import { expect, test } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

type Week = { number: number; slug: string; title: string };

const weeks = [
  { number: 2, slug: 'daily-routine-and-small-talk', title: 'Daily routine and small talk' },
  { number: 3, slug: 'asking-and-clarifying', title: 'Asking and clarifying' },
  { number: 4, slug: 'client-kickoff-call', title: 'Client kickoff call' },
  { number: 5, slug: 'project-updates-and-status', title: 'Project updates and status' },
  { number: 6, slug: 'explain-technical-work-simply', title: 'Explain technical work simply' },
  { number: 7, slug: 'calls-and-messages', title: 'Calls and messages' },
  { number: 8, slug: 'in-person-meetings', title: 'In-person meetings' },
  { number: 9, slug: 'problems-delays-apologies', title: 'Problems, delays, apologies' },
  { number: 10, slug: 'money-quotes-follow-ups', title: 'Money, quotes, follow-ups' },
  { number: 11, slug: 'opinions-and-suggestions', title: 'Opinions and suggestions' },
  { number: 12, slug: 'fluency-and-real-calls', title: 'Fluency and real calls' },
];

const lessonFile = (week: Week) =>
  pathToFileURL(
    path.resolve(
      `lessons/${String(week.number).padStart(4, '0')}-week-${week.number}-${week.slug}.html`,
    ),
  ).href;

const referenceFile = (week: Week) =>
  pathToFileURL(
    path.resolve(
      `reference/${String(week.number).padStart(4, '0')}-week-${week.number}-patterns.html`,
    ),
  ).href;

test('every weekly lesson has the full teaching structure', async ({ page }) => {
  for (const week of weeks) {
    await page.goto(lessonFile(week));
    await expect(page).toHaveTitle(`Week ${week.number} · ${week.title} | Bol`);
    await expect(page.getByRole('heading', { level: 1, name: week.title })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The 6 patterns' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Grammar corner' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Common mistakes' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Listen and repeat' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Model dialogue' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '60-second self-check' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pronunciation quick check' })).toBeVisible();

    expect(await page.locator('.pattern-card').count()).toBe(6);
    expect(await page.locator('.mistake-card').count()).toBe(6);
    expect(await page.locator('[data-quiz]').count()).toBe(16);
    expect(await page.locator('.checklist input[type="checkbox"]').count()).toBe(6);
    expect(await page.locator('[data-say]').count()).toBeGreaterThanOrEqual(16);
    await expect(page.getByRole('link', { name: `Week ${week.number} patterns` })).toHaveAttribute(
      'href',
      `../reference/${String(week.number).padStart(4, '0')}-week-${week.number}-patterns.html`,
    );
  }
});

test('checks answers in the final weekly lesson', async ({ page }) => {
  const week = weeks[weeks.length - 1];
  await page.goto(lessonFile(week));

  const fill = page.locator('.quiz-card').filter({ hasText: 'Let me ___ the main points.' });
  await fill.getByRole('textbox').fill('summarize');
  await fill.getByRole('button', { name: 'Check' }).click();
  await expect(fill.getByText('Sahi')).toBeVisible();

  const translate = page
    .locator('.quiz-card')
    .filter({ hasText: 'Main point deadline hai.' });
  await translate.getByRole('textbox').fill('The main point is the deadline.');
  await translate.getByRole('button', { name: 'Check' }).click();
  await expect(translate.getByText('Sahi')).toBeVisible();

  await expect(page.getByRole('link', { name: '← Week 11' })).toHaveAttribute(
    'href',
    '0011-week-11-opinions-and-suggestions.html',
  );
  await expect(page.getByRole('link', { name: 'All weeks' })).toHaveAttribute('href', 'index.html');
});

test('every weekly reference prints the pattern sheet', async ({ page }) => {
  for (const week of weeks) {
    await page.goto(referenceFile(week));
    await expect(page).toHaveTitle(`Week ${week.number} patterns | Bol reference`);
    await expect(page.getByRole('heading', { name: 'Grammar quick rules' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Common mistakes' })).toBeVisible();
    expect(await page.locator('.ref-pattern').count()).toBe(6);
    expect(await page.locator('.mistake-table tbody tr').count()).toBe(6);
    expect(await page.locator('.phrase-list').first().locator('li').count()).toBeGreaterThanOrEqual(
      10,
    );
  }

  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(referenceFile(weeks[weeks.length - 1]));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  await page.goto(lessonFile(weeks[weeks.length - 1]));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('serves the new weekly lessons and course index from the build', async ({ page }) => {
  const response = await page.goto('/lessons/0002-week-2-daily-routine-and-small-talk.html');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Week 2 · Daily routine and small talk | Bol');

  await page.goto('/lessons/index.html');
  await expect(page).toHaveTitle('Weekly lessons | Bol');
  await expect(page.getByRole('link', { name: 'Fluency and real calls' })).toBeVisible();

  await page.goto('/reference/0012-week-12-patterns.html');
  await expect(page).toHaveTitle('Week 12 patterns | Bol reference');
});
