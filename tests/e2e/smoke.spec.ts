import { expect, test } from '@playwright/test';

test('home page renders the brand slogan', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Le matériel BTP');
  await expect(page).toHaveTitle(/GSET Location/);
});
