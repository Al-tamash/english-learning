import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('exports and imports a progress backup from Settings', async ({ page }) => {
  await page.goto('/settings');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^bol-backup-\d{4}-\d{2}-\d{2}\.json$/);

  const path = await download.path();
  const backup = JSON.parse(await readFile(path, 'utf8'));
  expect(backup.format).toBe('bol-backup');
  expect(backup.version).toBe(1);

  await page.getByLabel('Import JSON').setInputFiles(path);
  await expect(page.getByRole('dialog', { name: 'Backup import karein?' })).toBeVisible();
  await page.getByRole('button', { name: 'Import karo' }).click();
  await expect(page.getByRole('status')).toHaveText('Backup import ho gaya.');
  await expect(page.getByText('Saved locally')).toBeVisible();
});
