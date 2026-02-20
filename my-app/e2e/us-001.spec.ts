import { test, expect } from "@playwright/test";

test.describe("US-001: SVG Rainbow Arc on Main Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("RainbowArc SVG element is present with correct testid", async ({
    page,
  }) => {
    const svg = page.locator('[data-testid="rainbow-arc"]');
    await expect(svg).toBeVisible();
  });

  test("SVG has correct accessibility attributes: role=img and aria-label", async ({
    page,
  }) => {
    const svg = page.locator('[data-testid="rainbow-arc"]');
    await expect(svg).toHaveAttribute("role", "img");
    await expect(svg).toHaveAttribute("aria-label", "Decorative rainbow");
  });

  test("SVG has a viewBox attribute set", async ({ page }) => {
    const svg = page.locator('[data-testid="rainbow-arc"]');
    const viewBox = await svg.getAttribute("viewBox");
    expect(viewBox).toBeTruthy();
    // Ensure the viewBox is not empty
    expect(viewBox!.trim().length).toBeGreaterThan(0);
  });

  test("SVG contains exactly seven path elements for ROYGBIV arcs", async ({
    page,
  }) => {
    const paths = page.locator('[data-testid="rainbow-arc"] path');
    await expect(paths).toHaveCount(7);
  });

  test("Each path element has correct stroke colors for ROYGBIV spectrum", async ({
    page,
  }) => {
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
      const path = paths.nth(i);
      const stroke = await path.getAttribute("stroke");
      expect(stroke?.toUpperCase()).toBe(expectedColors[i].toUpperCase());
    }
  });

  test("Each path element has stroke-width of 8 and fill of none", async ({
    page,
  }) => {
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

  test("Each path element uses SVG arc command (A command) in its d attribute", async ({
    page,
  }) => {
    const paths = page.locator('[data-testid="rainbow-arc"] path');
    const count = await paths.count();

    for (let i = 0; i < count; i++) {
      const path = paths.nth(i);
      const d = await path.getAttribute("d");
      // SVG arc command 'A' or 'a' should be in the path data
      expect(d).toMatch(/[Aa]/);
    }
  });

  test("Rainbow is placed below the main heading on the page", async ({
    page,
  }) => {
    const heading = page.locator("h1");
    const rainbow = page.locator('[data-testid="rainbow-arc"]');

    await expect(heading).toBeVisible();
    await expect(rainbow).toBeVisible();

    const headingBox = await heading.boundingBox();
    const rainbowBox = await rainbow.boundingBox();

    expect(headingBox).not.toBeNull();
    expect(rainbowBox).not.toBeNull();

    // Rainbow should be below the heading
    expect(rainbowBox!.y).toBeGreaterThan(headingBox!.y);
  });

  test("Rainbow SVG is horizontally centered on the page", async ({ page }) => {
    const rainbow = page.locator('[data-testid="rainbow-arc"]');
    await expect(rainbow).toBeVisible();

    const rainbowBox = await rainbow.boundingBox();
    expect(rainbowBox).not.toBeNull();

    const viewportSize = page.viewportSize();
    expect(viewportSize).not.toBeNull();

    // The SVG should be roughly centered: its center x is within the page
    const rainbowCenterX = rainbowBox!.x + rainbowBox!.width / 2;
    const pageWidth = viewportSize!.width;

    // Center should be within 20% of page center
    const pageCenterX = pageWidth / 2;
    const tolerance = pageWidth * 0.2;
    expect(Math.abs(rainbowCenterX - pageCenterX)).toBeLessThan(tolerance);
  });

  test("Rainbow fades in on page load with CSS opacity transition", async ({
    page,
  }) => {
    // Reload page and check that opacity transition is applied
    await page.reload();
    const rainbow = page.locator('[data-testid="rainbow-arc"]');

    // The element should eventually be visible (opacity: 1) after transition
    await expect(rainbow).toBeVisible();

    // Check the transition style is applied
    const transitionStyle = await rainbow.evaluate(
      (el) => getComputedStyle(el).transition
    );
    // The transition should include opacity
    expect(transitionStyle).toContain("opacity");
  });

  test("SVG renders as inline element (not an external image)", async ({
    page,
  }) => {
    // Confirm the SVG is an inline SVG tag (not an <img> with src pointing to a file)
    const svg = page.locator('[data-testid="rainbow-arc"]');
    const tagName = await svg.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe("svg");

    // Ensure it is not an image element
    const imgWithTestId = page.locator(
      'img[data-testid="rainbow-arc"], image[data-testid="rainbow-arc"]'
    );
    await expect(imgWithTestId).toHaveCount(0);
  });
});
