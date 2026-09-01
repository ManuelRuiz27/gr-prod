import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, SkeletonText, SkeletonKpi, SkeletonCard, SkeletonTable } from './Skeleton';

describe('Design System — Skeleton', () => {
  it('renders base skeleton with aria-hidden', () => {
    const { container } = render(<Skeleton height={20} width={100} />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveClass('animate-pulse');
  });

  it('renders SkeletonText with specified line count', () => {
    const { container } = render(<SkeletonText lines={4} />);
    const lines = container.querySelectorAll('.bg-obsidian-800\\/80');
    expect(lines.length).toBe(4);
  });

  it('renders SkeletonKpi, SkeletonCard and SkeletonTable without crashing', () => {
    const { container: kpi } = render(<SkeletonKpi />);
    expect(kpi.firstChild).toBeInTheDocument();

    const { container: card } = render(<SkeletonCard />);
    expect(card.firstChild).toBeInTheDocument();

    const { container: table } = render(<SkeletonTable rows={3} cols={3} />);
    expect(table.firstChild).toBeInTheDocument();
  });
});
