import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import RainbowArc from "./RainbowArc";

// Mock requestAnimationFrame so the fade-in state can be tested
let rafCallback: FrameRequestCallback | null = null;

beforeEach(() => {
  rafCallback = null;
  vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
    rafCallback = cb;
    return 1;
  });
  vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});
});

describe("RainbowArc component", () => {
  it("renders an SVG element (inline, no external image)", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    expect(svg.tagName.toLowerCase()).toBe("svg");
  });

  it("has data-testid='rainbow-arc' on the SVG element", () => {
    render(<RainbowArc />);
    expect(screen.getByTestId("rainbow-arc")).toBeDefined();
  });

  it("has role='img' on the SVG element for accessibility", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    expect(svg.getAttribute("role")).toBe("img");
  });

  it("has aria-label='Decorative rainbow' on the SVG element", () => {
    render(<RainbowArc />);
    const svg = screen.getByRole("img", { name: "Decorative rainbow" });
    expect(svg).toBeDefined();
  });

  it("contains exactly seven <path> elements", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");
    expect(paths).toHaveLength(7);
  });

  it("uses the correct ROYGBIV stroke colors on each arc", () => {
    const expectedColors = [
      "#FF0000", // red
      "#FF7F00", // orange
      "#FFFF00", // yellow
      "#00FF00", // green
      "#0000FF", // blue
      "#4B0082", // indigo
      "#9400D3", // violet
    ];

    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");

    expectedColors.forEach((color, index) => {
      expect(paths[index].getAttribute("stroke")).toBe(color);
    });
  });

  it("each path has stroke-width of 8", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");

    paths.forEach((path) => {
      const strokeWidth = path.getAttribute("stroke-width");
      expect(Number(strokeWidth)).toBe(8);
    });
  });

  it("each path has fill='none'", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");

    paths.forEach((path) => {
      expect(path.getAttribute("fill")).toBe("none");
    });
  });

  it("each path uses an SVG arc command (contains 'A' in the d attribute)", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");

    paths.forEach((path) => {
      const d = path.getAttribute("d") ?? "";
      expect(d).toMatch(/A/i);
    });
  });

  it("outermost arc (red, first path) has a radius of approximately 150px", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");

    // The arc path is: "M startX,startY A rx,ry 0 0,1 endX,endY"
    // rx = ry = radius; the horizontal span = 2 * radius
    const firstPath = paths[0];
    const d = firstPath.getAttribute("d") ?? "";
    // Extract the arc radii from the A command
    const arcMatch = d.match(/A\s+([\d.]+),([\d.]+)/);
    expect(arcMatch).not.toBeNull();
    const rx = Number(arcMatch![1]);
    expect(rx).toBeCloseTo(150, 0);
  });

  it("each subsequent arc radius decreases by 10px from the previous", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const paths = svg.querySelectorAll("path");

    const radii: number[] = [];
    paths.forEach((path) => {
      const d = path.getAttribute("d") ?? "";
      const arcMatch = d.match(/A\s+([\d.]+),([\d.]+)/);
      expect(arcMatch).not.toBeNull();
      radii.push(Number(arcMatch![1]));
    });

    for (let i = 1; i < radii.length; i++) {
      expect(radii[i - 1] - radii[i]).toBeCloseTo(10, 0);
    }
  });

  it("SVG has a viewBox attribute that properly frames all arcs", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    const viewBox = svg.getAttribute("viewBox");
    expect(viewBox).toBeTruthy();
    // viewBox should have 4 numeric parts
    const parts = (viewBox ?? "").split(/\s+/);
    expect(parts).toHaveLength(4);
    parts.forEach((part) => {
      expect(Number(part)).not.toBeNaN();
    });
  });

  it("starts with opacity 0 before the animation frame fires", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");
    // Before rAF callback runs, opacity should be 0
    expect((svg as HTMLElement).style.opacity).toBe("0");
  });

  it("transitions to opacity 1 after the animation frame fires", async () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");

    // Fire the requestAnimationFrame callback
    act(() => {
      if (rafCallback) rafCallback(0);
    });

    expect((svg as HTMLElement).style.opacity).toBe("1");
  });

  it("applies a CSS opacity transition of 1 second for the fade-in", async () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc");

    act(() => {
      if (rafCallback) rafCallback(0);
    });

    const transition = (svg as HTMLElement).style.transition;
    expect(transition).toMatch(/opacity/);
    expect(transition).toMatch(/1s/);
  });

  it("cancels the animation frame on unmount", () => {
    const { unmount } = render(<RainbowArc />);
    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
  });

  it("is centered with display block and auto margins", () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId("rainbow-arc") as HTMLElement;
    expect(svg.style.display).toBe("block");
    expect(svg.style.margin).toBe("0px auto");
  });
});
