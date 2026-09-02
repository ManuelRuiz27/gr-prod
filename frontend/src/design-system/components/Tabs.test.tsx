import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from './Tabs';

describe('Design System — Tabs', () => {
  const tabsData = [
    { id: 'all', label: 'Todos', count: 15 },
    { id: 'paid', label: 'Pagados', count: 10 },
    { id: 'pending', label: 'Pendientes', count: 5 },
    { id: 'disabled', label: 'Deshabilitado', disabled: true },
  ];

  it('renders tab items with labels and counts', () => {
    render(<Tabs tabs={tabsData} activeTab="all" onChange={() => {}} />);
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Pagados')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calls onChange when a tab is clicked', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={tabsData} activeTab="all" onChange={handleChange} />);
    fireEvent.click(screen.getByRole('tab', { name: /pagados/i }));
    expect(handleChange).toHaveBeenCalledWith('paid');
  });

  it('navigates tabs with ArrowRight key', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={tabsData} activeTab="all" onChange={handleChange} />);
    const activeTabButton = screen.getByRole('tab', { name: /todos/i });
    fireEvent.keyDown(activeTabButton, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith('paid');
  });

  it('navigates tabs with ArrowLeft key', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={tabsData} activeTab="paid" onChange={handleChange} />);
    const activeTabButton = screen.getByRole('tab', { name: /pagados/i });
    fireEvent.keyDown(activeTabButton, { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenCalledWith('all');
  });

  it('navigates to last enabled tab with End key', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={tabsData} activeTab="all" onChange={handleChange} />);
    const activeTabButton = screen.getByRole('tab', { name: /todos/i });
    fireEvent.keyDown(activeTabButton, { key: 'End' });
    // Last enabled tab is 'pending' (disabled is skipped)
    expect(handleChange).toHaveBeenCalledWith('pending');
  });

  it('navigates to first enabled tab with Home key', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={tabsData} activeTab="pending" onChange={handleChange} />);
    const activeTabButton = screen.getByRole('tab', { name: /pendientes/i });
    fireEvent.keyDown(activeTabButton, { key: 'Home' });
    expect(handleChange).toHaveBeenCalledWith('all');
  });

  it('sets aria-selected correctly for active tab', () => {
    render(<Tabs tabs={tabsData} activeTab="paid" onChange={() => {}} />);
    const paidTab = screen.getByRole('tab', { name: /pagados/i });
    const allTab = screen.getByRole('tab', { name: /todos/i });
    expect(paidTab).toHaveAttribute('aria-selected', 'true');
    expect(allTab).toHaveAttribute('aria-selected', 'false');
  });

  it('disabled tab has disabled attribute', () => {
    render(<Tabs tabs={tabsData} activeTab="all" onChange={() => {}} />);
    const disabledTab = screen.getByRole('tab', { name: /deshabilitado/i });
    expect(disabledTab).toBeDisabled();
  });
});
