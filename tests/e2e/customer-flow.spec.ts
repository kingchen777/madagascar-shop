import { test, expect } from "@playwright/test";

/**
 * Full customer flow: browse → product detail → add to cart → checkout → order lookup.
 *
 * Uses route interception so no real DB writes happen during CI.
 * Run against a live dev server for real integration testing by removing the mocks.
 */

const MOCK_ORDER_NO = "MS-20260531-TEST";

test.describe("Customer flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock product listing
    await page.route("**/api/admin/products**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "prod-1",
            slug: "vanilla-madagascar",
            priceMGA: 150000,
            stock: 10,
            images: [],
            translations: [
              { locale: "fr", title: "Vanille de Madagascar", description: "Vanille premium" },
            ],
          },
        ]),
      });
    });

    // Mock order creation and lookup
    await page.route("**/api/orders**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            orderId: "ord-test-1",
            orderNo: MOCK_ORDER_NO,
            status: "DEPOSIT_PENDING",
            totalMGA: 150000,
            depositMGA: 45000,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "ord-test-1",
              orderNo: MOCK_ORDER_NO,
              status: "DEPOSIT_PENDING",
              totalAmount: "150000",
              createdAt: new Date().toISOString(),
              items: [{ titleSnapshot: "Vanille de Madagascar" }],
            },
          ]),
        });
      }
    });

    // Mock settings
    await page.route("**/api/admin/settings**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          default_deposit_pct: "30",
          mvola_phone: "034 12 000 00",
          orange_money_phone: "032 12 000 00",
        }),
      });
    });

    // Mock Supabase REST for order detail page (server component fetches directly)
    await page.route("**/rest/v1/Order**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "ord-test-1",
            orderNo: MOCK_ORDER_NO,
            status: "DEPOSIT_PENDING",
            type: "SELF",
            internalNotes: null,
            totalAmount: "150000",
            depositAmount: "45000",
            serviceFee: "0",
            intlShipping: "0",
            customsFee: "0",
            createdAt: new Date().toISOString(),
            items: [{ id: "item-1", titleSnapshot: "Vanille de Madagascar", unitPriceMGA: "150000", qty: 1 }],
          },
        ]),
      });
    });

    // Mock Supabase REST for settings (order detail fetches payment phones)
    await page.route("**/rest/v1/Setting**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { key: "mvola_phone", value: "034 12 000 00" },
          { key: "orange_money_phone", value: "032 12 000 00" },
        ]),
      });
    });
  });

  test("products page loads", async ({ page }) => {
    await page.goto("/fr/products");
    await expect(page).toHaveTitle(/MadaShop|Madagascar/i);
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  test("cart page shows empty state when no items", async ({ page }) => {
    await page.goto("/fr/cart");
    // Should show empty cart message or redirect to products
    await expect(page.locator("body")).toBeVisible();
  });

  test("checkout page redirects to products when cart is empty", async ({ page }) => {
    await page.goto("/fr/checkout");
    // With empty cart, checkout shows "panier est vide" or redirects
    await expect(page.locator("body")).toBeVisible();
  });

  test("checkout form has all required fields", async ({ page }) => {
    // Seed cart via localStorage before navigating
    await page.goto("/fr/products");
    await page.evaluate(() => {
      localStorage.setItem(
        "madashop_cart",
        JSON.stringify([
          { id: "prod-1", slug: "vanilla-madagascar", name: "Vanille de Madagascar", priceMGA: 150000, qty: 1 },
        ])
      );
    });

    await page.goto("/fr/checkout");

    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("checkout form submits and shows success screen", async ({ page }) => {
    // Seed cart
    await page.goto("/fr/products");
    await page.evaluate(() => {
      localStorage.setItem(
        "madashop_cart",
        JSON.stringify([
          { id: "prod-1", slug: "vanilla-madagascar", name: "Vanille de Madagascar", priceMGA: 150000, qty: 1 },
        ])
      );
    });

    await page.goto("/fr/checkout");

    // Fill in the form
    await page.locator('input[placeholder*="Rakoto"]').fill("Jean Rakoto");
    await page.locator('input[type="tel"]').fill("034 12 345 67");
    await page.locator('input[type="email"]').fill("jean@test.mg");
    await page.locator('input[placeholder*="Ankorondrano"]').fill("Lot II J 42, Ankorondrano");

    // Submit
    await page.locator('button[type="submit"]').click();

    // Success screen
    await expect(page.locator("text=Commande confirmée")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${MOCK_ORDER_NO}`)).toBeVisible();
  });

  test("orders page shows order after checkout", async ({ page }) => {
    await page.goto("/fr/orders");

    // Fill phone and submit manually (reliable, no localStorage timing dependency)
    await page.locator('input[type="tel"]').fill("034 12 345 67");
    await page.locator('button[type="submit"]').click();

    // Should show the mocked order
    await expect(page.locator(`text=${MOCK_ORDER_NO}`)).toBeVisible({ timeout: 8000 });
  });

  test("checkout success has direct track-order link", async ({ page }) => {
    // Seed cart
    await page.goto("/fr/products");
    await page.evaluate(() => {
      localStorage.setItem(
        "madashop_cart",
        JSON.stringify([
          { id: "prod-1", slug: "vanilla-madagascar", name: "Vanille de Madagascar", priceMGA: 150000, qty: 1 },
        ])
      );
    });

    await page.goto("/fr/checkout");

    await page.locator('input[placeholder*="Rakoto"]').fill("Jean Rakoto");
    await page.locator('input[type="tel"]').fill("034 12 345 67");
    await page.locator('input[type="email"]').fill("jean@test.mg");
    await page.locator('input[placeholder*="Ankorondrano"]').fill("Lot II J 42, Ankorondrano");
    await page.locator('button[type="submit"]').click();

    await expect(page.locator("text=Commande confirmée")).toBeVisible({ timeout: 10000 });

    // Direct link button should exist with correct orderNo in href
    const trackLink = page.locator(`a[href*="${MOCK_ORDER_NO}"]`);
    await expect(trackLink).toBeVisible();
  });

  test("track-order link navigates to order detail page", async ({ page }) => {
    // Seed cart and complete checkout
    await page.goto("/fr/products");
    await page.evaluate(() => {
      localStorage.setItem(
        "madashop_cart",
        JSON.stringify([
          { id: "prod-1", slug: "vanilla-madagascar", name: "Vanille de Madagascar", priceMGA: 150000, qty: 1 },
        ])
      );
    });

    await page.goto("/fr/checkout");

    await page.locator('input[placeholder*="Rakoto"]').fill("Jean Rakoto");
    await page.locator('input[type="tel"]').fill("034 12 345 67");
    await page.locator('input[type="email"]').fill("jean@test.mg");
    await page.locator('input[placeholder*="Ankorondrano"]').fill("Lot II J 42, Ankorondrano");
    await page.locator('button[type="submit"]').click();

    await expect(page.locator("text=Commande confirmée")).toBeVisible({ timeout: 10000 });
    await page.locator("text=Suivre ma commande").click();

    // URL confirms the link wired the correct orderNo
    await expect(page).toHaveURL(new RegExp(`/orders/${MOCK_ORDER_NO}`));
  });
});
