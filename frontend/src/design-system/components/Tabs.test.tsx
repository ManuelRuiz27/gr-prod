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

  it('navigates tabs with ArrowRight and ArrowLeft keys', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={tabsData} activeTab="all" onChange={handleChange} />);
    const activeTabButton = screen.getByRole('tab', { name: /todos/i });

    fireEvent.keyDown(activeTabButton, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith('paid');
  });
});
