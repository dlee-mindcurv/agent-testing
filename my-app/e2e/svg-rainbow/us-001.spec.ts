import { test, expect } from "@playwright/test";

test.describe("US-001: SVG Rainbow Arc on Main Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("RainbowArc renders an inline SVG element", async ({ page }) => {
    const svg = page.locator('[data-testid="rainbow-arc"]');
    await expect(svg).toBeVisible();
    const tagName = await svg.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe("svg");
  });

  test("SVG has role='img' and aria-label='Decorative rainbow'", async ({
    page,
  }) => {
    const svg = page.locator('[data-testid="rainbow-arc"]');
    await expect(svg).toHaveAttribute("role", "img");
    await expect(svg).toHaveAttribute("aria-label", "Decorative rainbow");
  });

  test("SVG contains seven path elements for ROYGBIV arcs", async ({
    page,
  }) => {
    const paths = page.locator('[data-testid="rainbow-arc"] path');
    await expect(paths).toHaveCount(7);
  });

  test("Each arc path uses SVG arc command (A) and has no fill", async ({
    page,
  }) => {
    const paths = page.locator('[data-testid="rainbow-arc"] path');
    const count = await paths.count();
    expect(count).toBe(7);

    for (let i = 0; i < count; i++) {
      const path = paths.nth(i);
      const d = await path.getAttribute("d");
      expect(d).toContain("A");

      const fill = await path.getAttribute("fill");
      expect(fill).toBe("none");
    }
  });

  test("Each arc path has stroke-width of 8", async ({ page }) => {
    const paths = page.locator('[data-testid="rainbow-arc"] path');
    const count = await paths.count();

    for (let i = 0; i < count; i++) {
      const path = paths.nth(i);
      const strokeWidth = await path.getAttribute("stroke-width");
      expect(strokeWidth).toBe("8");
    }
  });

  test("ROYGBIV colors are present on the arcs", async ({ page }) => {
    const expectedColors = [
      "#FF0000",
      "#FF7F00",
      "#FFFF00",
      "#00FF00",
      "#0000FF",
      "#4B0082",
      "#9400D3",
    ];

    const paths = page.locator('[data-testid="rainbow-arc"] path');
    const count = await paths.count();
    const strokes: string[] = [];

    for (let i = 0; i < count; i++) {
      const stroke = await paths.nth(i).getAttribute("stroke");
      if (stroke) strokes.push(stroke.toUpperCase());
    }

    for (const color of expectedColors) {
      expect(strokes).toContain(color.toUpperCase());
    }
  });

  test("SVG has a viewBox attribute that frames the arcs", async ({ page }) => {
    const svg = page.locator('[data-testid="rainbow-arc"]');
    const viewBox = await svg.getAttribute("viewBox");
    expect(viewBox).toBeTruthy();
    // viewBox should have 4 values: minX minY width height
    const parts = viewBox!.trim().split(/\s+/);
    expect(parts).toHaveLength(4);
    // width and height should be positive
    expect(parseFloat(parts[2])).toBeGreaterThan(0);
    expect(parseFloat(parts[3])).toBeGreaterThan(0);
  });

  test("Rainbow is placed below the main heading", async ({ page }) => {
    const heading = page.locator("h1").first();
    const rainbow = page.locator('[data-testid="rainbow-arc"]');

    await expect(heading).toBeVisible();
    await expect(rainbow).toBeVisible();

    const headingBox = await heading.boundingBox();
    const rainbowBox = await rainbow.boundingBox();

    expect(headingBox).not.toBeNull();
    expect(rainbowBox).not.toBeNull();

    // Rainbow top should be below heading top
    expect(rainbowBox!.y).toBeGreaterThan(headingBox!.y);
  });

  test("Rainbow SVG fades in on page load (opacity transition)", async ({
    page,
  }) => {
    // After page load, the SVG should be visible (opacity 1)
    const svg = page.locator('[data-testid="rainbow-arc"]');
    await expect(svg).toBeVisible();

    // Verify opacity transition is applied via inline style
    const transition = await svg.evaluate(
      (el) => (el as HTMLElement).style.transition
    );
    expect(transition).toContain("opacity");

    // After load, opacity should be 1
    const opacity = await svg.evaluate(
      (el) => (el as HTMLElement).style.opacity
    );
    expect(opacity).toBe("1");
  });

  test("Rainbow is horizontally centered on the page", async ({ page }) => {
    const rainbow = page.locator('[data-testid="rainbow-arc"]');
    await expect(rainbow).toBeVisible();

    const rainbowBox = await rainbow.boundingBox();
    expect(rainbowBox).not.toBeNull();

    const viewportSize = page.viewportSize();
    expect(viewportSize).not.toBeNull();

    // Rainbow center X should be roughly in the middle of the viewport
    const rainbowCenterX = rainbowBox!.x + rainbowBox!.width / 2;
    // Allow tolerance of 200px from center given layout constraints
    expect(Math.abs(rainbowCenterX - viewportSize!.width / 2)).toBeLessThan(
      200
    );
  });
});
