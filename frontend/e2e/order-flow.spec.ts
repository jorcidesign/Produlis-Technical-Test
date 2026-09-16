import { test, expect } from "@playwright/test";

const suffix = Date.now();
const customerName = `Cliente E2E ${suffix}`;
const customerEmail = `e2e-${suffix}@example.com`;
const productName = `Producto E2E ${suffix}`;
const productPrice = 42;

test.describe("Order flow: create customer -> create order -> cancel", () => {
  test("full flow", async ({ page }) => {
    // 0. Seed a product through the real UI/Server Action (not a raw API call)
    // so the mutation properly invalidates Next's cached products list —
    // a direct API write wouldn't call updateTag("products").
    await page.goto("/products/new");
    await page.getByLabel("Nombre del producto").fill(productName);
    await page.getByLabel("Precio").fill(String(productPrice));
    await page.getByRole("button", { name: "Crear producto" }).click();
    await page.waitForURL("**/products");

    // 1. Create a customer
    await page.goto("/customers/new");
    await page.getByLabel("Nombre").fill(customerName);
    await page.getByLabel("Email").fill(customerEmail);
    await page.getByRole("button", { name: "Crear cliente" }).click();
    await page.waitForURL("**/customers");
    await expect(page.getByText(customerName)).toBeVisible();

    // 2. Create an order with one product for that customer
    await page.goto("/orders/new");
    await page.getByRole("combobox", { name: "Cliente" }).click();
    await page.getByRole("option", { name: new RegExp(customerName) }).click();

    await page.getByRole("combobox", { name: "Producto" }).click();
    await page.getByRole("option", { name: new RegExp(productName) }).click();

    await page.getByRole("button", { name: "Crear orden" }).click();
    await page.waitForURL(/\/orders\/\d+/);

    // 3. Verify it shows up in the listing with the correct total
    const expectedTotal = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(productPrice);

    await page.goto("/orders");
    const row = page.getByRole("row").filter({ hasText: customerName });
    await expect(row).toBeVisible();
    await expect(row).toContainText(expectedTotal);
    await expect(row.getByText("Pendiente")).toBeVisible();

    // 4. Cancel it from the detail page
    await row.getByRole("link", { name: "Ver detalle" }).click();
    await page.getByRole("button", { name: "Cancelar orden" }).click();
    await expect(page.getByText("Cancelada")).toBeVisible();
    await expect(page.getByRole("button", { name: "Marcar completada" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Cancelar orden" })).toHaveCount(0);

    // 5. Verify the badge/status persists back in the listing
    await page.goto("/orders");
    const cancelledRow = page.getByRole("row").filter({ hasText: customerName });
    await expect(cancelledRow.getByText("Cancelada")).toBeVisible();
  });
});
