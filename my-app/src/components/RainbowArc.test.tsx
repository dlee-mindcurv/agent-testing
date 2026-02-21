import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import RainbowArc from "./RainbowArc";

describe("RainbowArc", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock requestAnimationFrame to call callback immediately
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders an SVG element with data-testid='rainbow-arc'", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    expect(svg).toBeInTheDocument();
    expect(svg.tagName.toLowerCase()).toBe("svg");
  });

  it("has role='img' for accessibility", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    expect(svg).toHaveAttribute("role", "img");
  });

  it("has aria-label='Decorative rainbow' for accessibility", () => {
    render(<RainbowArc />);
    const svg = screen.getByRole("img", { name: "Decorative rainbow" });
    expect(svg).toBeInTheDocument();
  });

  it("renders exactly seven path elements", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");
    expect(paths).toHaveLength(7);
  });

  it("renders paths with ROYGBIV colors in correct order", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");
    const expectedColors = [
      "#FF0000", // red
      "#FF7F00", // orange
      "#FFFF00", // yellow
      "#00FF00", // green
      "#0000FF", // blue
      "#4B0082", // indigo
      "#9400D3", // violet
    ];
    paths.forEach((path, index) => {
      expect(path.getAttribute("stroke")).toBe(expectedColors[index]);
    });
  });

  it("renders paths with stroke-width of 8", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");
    paths.forEach((path) => {
      expect(path.getAttribute("stroke-width")).toBe("8");
    });
  });

  it("renders paths with no fill (fill='none')", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");
    paths.forEach((path) => {
      expect(path.getAttribute("fill")).toBe("none");
    });
  });

  it("renders arcs using SVG arc command (A) in path d attribute", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");
    paths.forEach((path) => {
      const d = path.getAttribute("d") || "";
      // Check that it uses SVG arc command
      expect(d).toMatch(/A/i);
      // Check that it starts with M (moveto)
      expect(d).toMatch(/^M/);
    });
  });

  it("outermost arc (red) has radius of approximately 150px", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");
    const redPath = paths[0]; // first path is red (outermost)
    const d = redPath.getAttribute("d") || "";
    // The arc command format: A rx ry x-rotation large-arc-flag sweep-flag x y
    // We expect rx = ry = 150
    // e.g. "M 10 160 A 150 150 0 0 1 310 160"
    const arcMatch = d.match(/A\s+([\d.]+)\s+([\d.]+)/);
    expect(arcMatch).not.toBeNull();
    if (arcMatch) {
      const rx = parseFloat(arcMatch[1]);
      expect(rx).toBeCloseTo(150, 0);
    }
  });

  it("each inner arc decreases in radius by 10px from outermost", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");
    const radii: number[] = [];
    paths.forEach((path) => {
      const d = path.getAttribute("d") || "";
      const arcMatch = d.match(/A\s+([\d.]+)\s+([\d.]+)/);
      if (arcMatch) {
        radii.push(parseFloat(arcMatch[1]));
      }
    });
    expect(radii).toHaveLength(7);
    // Outermost should be ~150
    expect(radii[0]).toBeCloseTo(150, 0);
    // Each should decrease by 10
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]).toBeCloseTo(radii[i - 1] - 10, 0);
    }
    // Innermost (violet) should be ~90
    expect(radii[6]).toBeCloseTo(90, 0);
  });

  it("has a viewBox attribute that frames all arcs", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const viewBox = svg.getAttribute("viewBox");
    expect(viewBox).not.toBeNull();
    // viewBox should have 4 numeric values
    const parts = (viewBox || "").trim().split(/\s+/);
    expect(parts).toHaveLength(4);
    const [minX, minY, width, height] = parts.map(Number);
    expect(minX).toBe(0);
    expect(minY).toBe(0);
    // Width should be large enough for outermost arc (at least 300)
    expect(width).toBeGreaterThanOrEqual(300);
    // Height should be large enough for semicircle (at least 150)
    expect(height).toBeGreaterThanOrEqual(150);
  });

  it("SVG is horizontally centered using margin auto", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const style = (svg as HTMLElement).style;
    expect(style.margin).toBe("0px auto");
  });

  it("SVG has opacity transition of 1 second", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const style = (svg as HTMLElement).style;
    expect(style.transition).toContain("opacity");
    expect(style.transition).toContain("1s");
  });

  it("SVG fades in on page load (opacity goes from 0 to 1)", () => {
    // Without the RAF mock calling immediately, opacity starts at 0
    vi.restoreAllMocks();
    let rafCallback: FrameRequestCallback | null = null;
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallback = cb;
      return 1;
    });
    vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});

    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    // Before RAF fires, opacity should be 0
    expect((svg as HTMLElement).style.opacity).toBe("0");

    // Trigger the RAF callback
    act(() => {
      if (rafCallback) rafCallback(0);
    });

    // After RAF fires, opacity should be 1
    expect((svg as HTMLElement).style.opacity).toBe("1");
  });
});
