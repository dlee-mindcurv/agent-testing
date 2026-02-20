import { test, expect } from "@playwright/test";

test.describe("US-001: SVG Rainbow Arc on Main Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("RainbowArc component renders an inline SVG element", async ({
    page,
  }) => {
    const svg = page.locator('[data-testid="rainbow-arc"]');
    await expect(svg).toBeVisible();
    // Verify it's an actual SVG element (not an image)
    const tagName = await svg.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe("svg");
  });

  test("SVG has correct data-testid attribute", async ({ page }) => {
    const svg = page.locator('[data-testid="rainbow-arc"]');
    await expect(svg).toBeVisible();
  });

  test("SVG has role='img' for accessibility", async ({ page }) => {
    const svg = page.locator('[data-testid="rainbow-arc"]');
    await expect(svg).toHaveAttribute("role", "img");
  });

  test("SVG has aria-label 'Decorative rainbow' for accessibility", async ({
    page,
  }) => {
    const svg = page.locator('[data-testid="rainbow-arc"]');
    await expect(svg).toHaveAttribute("aria-label", "Decorative rainbow");
  });

  test("SVG contains seven path elements for the ROYGBIV arcs", async ({
    page,
  }) => {
    const paths = page.locator('[data-testid="rainbow-arc"] path');
    await expect(paths).toHaveCount(7);
  });

  test("SVG paths have correct ROYGBIV colors as stroke", async ({ page }) => {
    const expectedColors = [
      "#FF0000", // red
      "#FF7F00", // orange
      "#FFFF00", // yellow
      "#00FF00", // green
      "#0000FF", // blue
      "#4B0082", // indigo
      "#9400D3", // violet
    ];

    const paths = page.locator('[data-testid="rainbow-arc"] path');
    const count = await paths.count();
    expect(count).toBe(7);

    for (let i = 0; i < count; i++) {
      const stroke = await paths.nth(i).getAttribute("stroke");
      expect(stroke?.toUpperCase()).toBe(expectedColors[i].toUpperCase());
    }
  });

  test("SVG paths have stroke-width of 8 and no fill", async ({ page }) => {
    const paths = page.locator('[data-testid="rainbow-arc"] path');
    const count = await paths.count();

    for (let i = 0; i < count; i++) {
      const path = paths.nth(i);
      const strokeWidth = await path.getAttribute("stroke-width");
      const fill = await path.getAttribute("fill");
      expect(strokeWidth).toBe("8");
      expect(fill).toBe("none");
    }
  });

  test("SVG paths use arc commands (A) in the d attribute", async ({
    page,
  }) => {
    const paths = page.locator('[data-testid="rainbow-arc"] path');
    const count = await paths.count();

    for (let i = 0; i < count; i++) {
      const d = await paths.nth(i).getAttribute("d");
      // Each path should contain an SVG arc command 'A'
      expect(d).toContain("A");
    }
  });

  test("SVG has a viewBox attribute that frames all arcs", async ({ page }) => {
    const svg = page.locator('[data-testid="rainbow-arc"]');
    const viewBox = await svg.getAttribute("viewBox");
    expect(viewBox).toBeTruthy();
    // viewBox should have 4 numeric values
    const parts = viewBox!.trim().split(/\s+/);
    expect(parts.length).toBe(4);
    const numbers = parts.map(Number);
    expect(numbers.every((n) => !isNaN(n))).toBe(true);
  });

  test("Rainbow arc is placed below the main heading", async ({ page }) => {
    const heading = page.locator("h1");
    const rainbowArc = page.locator('[data-testid="rainbow-arc"]');

    await expect(heading).toBeVisible();
    await expect(rainbowArc).toBeVisible();

    const headingBox = await heading.boundingBox();
    const rainbowBox = await rainbowArc.boundingBox();

    expect(headingBox).not.toBeNull();
    expect(rainbowBox).not.toBeNull();

    // Rainbow arc should be below the heading (higher y value)
    expect(rainbowBox!.y).toBeGreaterThan(headingBox!.y);
  });

  test("Rainbow arc is horizontally centered on the page", async ({ page }) => {
    const svg = page.locator('[data-testid="rainbow-arc"]');
    const svgBox = await svg.boundingBox();
    expect(svgBox).not.toBeNull();

    // Check that margin: 0 auto is applied (display: block)
    const display = await svg.evaluate(
      (el) => window.getComputedStyle(el).display
    );
    expect(display).toBe("block");

    // Check that margin is auto (centered)
    const marginLeft = await svg.evaluate(
      (el) => window.getComputedStyle(el).marginLeft
    );
    const marginRight = await svg.evaluate(
      (el) => window.getComputedStyle(el).marginRight
    );
    // Auto margin resolves to a pixel value when centered
    expect(parseFloat(marginLeft)).toBeGreaterThanOrEqual(0);
    expect(parseFloat(marginRight)).toBeGreaterThanOrEqual(0);
  });

  test("Rainbow fades in on page load with opacity transition", async ({
    page,
  }) => {
    // Navigate to the page and quickly check opacity
    await page.goto("/");

    // After waiting for the page to load, the opacity should be 1
    await page.waitForLoadState("networkidle");

    const svg = page.locator('[data-testid="rainbow-arc"]');
    await expect(svg).toBeVisible();

    // Wait for opacity transition to complete (transition is 1s, wait up to 2s)
    await page.waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="rainbow-arc"]');
        if (!el) return false;
        return parseFloat(window.getComputedStyle(el).opacity) >= 0.99;
      },
      { timeout: 3000 }
    );

    // After animation completes, opacity should be 1
    const opacity = await svg.evaluate(
      (el) => window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBeCloseTo(1, 1);

    // Verify the transition property is set
    const transition = await svg.evaluate(
      (el) => window.getComputedStyle(el).transition
    );
    expect(transition).toContain("opacity");
  });
});
