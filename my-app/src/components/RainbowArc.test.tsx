import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RainbowArc from './RainbowArc';

describe('RainbowArc component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders an SVG element (inline, not an external image)', () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId('rainbow-arc');
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('has data-testid="rainbow-arc" on the SVG element', () => {
    render(<RainbowArc />);
    expect(screen.getByTestId('rainbow-arc')).toBeInTheDocument();
  });

  it('has role="img" on the SVG element', () => {
    render(<RainbowArc />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('data-testid', 'rainbow-arc');
  });

  it('has aria-label="Decorative rainbow"', () => {
    render(<RainbowArc />);
    const svg = screen.getByLabelText('Decorative rainbow');
    expect(svg).toBeInTheDocument();
  });

  it('renders exactly seven <path> elements for ROYGBIV arcs', () => {
    const { container } = render(<RainbowArc />);
    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(7);
  });

  it('renders arcs with the correct ROYGBIV stroke colors', () => {
    const { container } = render(<RainbowArc />);
    const paths = container.querySelectorAll('path');
    const expectedColors = [
      '#FF0000',
      '#FF7F00',
      '#FFFF00',
      '#00FF00',
      '#0000FF',
      '#4B0082',
      '#9400D3',
    ];
    paths.forEach((path, index) => {
      expect(path.getAttribute('stroke')?.toUpperCase()).toBe(
        expectedColors[index].toUpperCase()
      );
    });
  });

  it('each arc path has stroke-width of 8', () => {
    const { container } = render(<RainbowArc />);
    const paths = container.querySelectorAll('path');
    paths.forEach((path) => {
      expect(path.getAttribute('stroke-width')).toBe('8');
    });
  });

  it('each arc path has fill="none"', () => {
    const { container } = render(<RainbowArc />);
    const paths = container.querySelectorAll('path');
    paths.forEach((path) => {
      expect(path.getAttribute('fill')).toBe('none');
    });
  });

  it('each arc path uses an SVG arc command (A command in d attribute)', () => {
    const { container } = render(<RainbowArc />);
    const paths = container.querySelectorAll('path');
    paths.forEach((path) => {
      const d = path.getAttribute('d') ?? '';
      // SVG arc command contains 'A' or 'a'
      expect(d).toMatch(/[Aa]/);
    });
  });

  it('the outermost (red) arc has a radius of approximately 150px', () => {
    const { container } = render(<RainbowArc />);
    const paths = container.querySelectorAll('path');
    const firstPath = paths[0];
    const d = firstPath.getAttribute('d') ?? '';
    // The arc command format: A rx,ry ... — extract rx value
    // e.g. "M 10,160 A 150,150 0 0,1 310,160"
    const match = d.match(/A\s*([\d.]+),/);
    expect(match).not.toBeNull();
    const rx = parseFloat(match![1]);
    expect(rx).toBeCloseTo(150, 0);
  });

  it('each inner arc has a radius 10px less than the previous one', () => {
    const { container } = render(<RainbowArc />);
    const paths = container.querySelectorAll('path');
    const radii: number[] = [];
    paths.forEach((path) => {
      const d = path.getAttribute('d') ?? '';
      const match = d.match(/A\s*([\d.]+),/);
      if (match) radii.push(parseFloat(match[1]));
    });
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i - 1] - radii[i]).toBeCloseTo(10, 0);
    }
  });

  it('SVG has a viewBox attribute that frames all arcs', () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId('rainbow-arc');
    const viewBox = svg.getAttribute('viewBox');
    expect(viewBox).not.toBeNull();
    expect(viewBox).toBeTruthy();
    // viewBox should have 4 numeric values
    const parts = (viewBox ?? '').trim().split(/\s+/);
    expect(parts).toHaveLength(4);
    parts.forEach((p) => expect(isNaN(parseFloat(p))).toBe(false));
  });

  it('starts with opacity 0 (fade-in not yet triggered)', () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId('rainbow-arc');
    expect(svg).toHaveStyle({ opacity: '0' });
  });

  it('has an opacity CSS transition of 1 second', () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId('rainbow-arc');
    const transition = (svg as HTMLElement).style.transition;
    expect(transition).toMatch(/opacity/);
    expect(transition).toMatch(/1s/);
  });

  it('fades in to opacity 1 after mount (timer fires)', async () => {
    render(<RainbowArc />);
    const svg = screen.getByTestId('rainbow-arc');
    expect(svg).toHaveStyle({ opacity: '0' });

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    expect(svg).toHaveStyle({ opacity: '1' });
  });
});
