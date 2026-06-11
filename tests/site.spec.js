import { test, expect } from '@playwright/test';

test.describe('Page d\'accueil', () => {

  test('se charge correctement', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TauxComores/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('affiche le tableau comparatif avec tous les opérateurs', async ({ page }) => {
    await page.goto('/');
    const rows = page.locator('#comparison-tbody tr');
    await expect(rows).toHaveCount(7);
  });

  test('calculateur recalcule en temps réel', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('#montant-input');
    await expect(input).toBeVisible();

    await input.fill('500');
    await expect(page.locator('#calc-note')).toContainText('500');
  });

  test('calculateur affiche 4 chiffres sur mobile', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('#montant-input');
    await input.fill('1000');
    const box = await input.boundingBox();
    expect(box.width).toBeGreaterThan(70);
  });

  test('les liens opérateurs redirigent vers les bons sites', async ({ page, context }) => {
    await page.goto('/');
    const links = page.locator('a[href*="wise.com"]');
    await expect(links.first()).toBeVisible();
  });

});

test.describe('Navigation', () => {

  test('le menu fonctionne', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await page.locator('a[href="guide.html"]').first().click();
    await expect(page).toHaveURL(/guide/);
  });

  test('page guide se charge', async ({ page }) => {
    await page.goto('/guide.html');
    await expect(page).toHaveTitle(/TauxComores/);
  });

  test('page à propos se charge', async ({ page }) => {
    await page.goto('/a-propos.html');
    await expect(page.locator('h1')).toContainText('propos');
  });

  test('page politique de confidentialité se charge', async ({ page }) => {
    await page.goto('/politique-confidentialite.html');
    await expect(page).toHaveTitle(/confidentialit/i);
  });

});

test.describe('SEO & technique', () => {

  test('balise canonical présente', async ({ page }) => {
    await page.goto('/');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /tauxcomores\.com/);
  });

  test('Google Analytics chargé', async ({ page }) => {
    await page.goto('/');
    const ga = page.locator('script[src*="googletagmanager"]');
    await expect(ga).toHaveCount(1);
  });

  test('sitemap accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response.status()).toBe(200);
  });

});
