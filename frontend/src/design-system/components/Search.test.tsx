import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Search } from './Search';

describe('Design System — Search', () => {
  it('renders search input with placeholder and searchbox role', () => {
    render(<Search placeholder="Buscar graduados..." />);
    const input = screen.getByRole('searchbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Buscar graduados...');
  });

  it('updates value and calls onSearch when Enter is pressed', () => {
    const handleSearch = vi.fn();
    render(<Search onSearch={handleSearch} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'Andrea' } });
    expect(input).toHaveValue('Andrea');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleSearch).toHaveBeenCalledWith('Andrea');
  });

  it('shows clear button and clears input when clicked', () => {
    const handleClear = vi.fn();
    render(<Search onClear={handleClear} defaultValue="Texto previo" />);
    const clearButton = screen.getByLabelText(/limpiar búsqueda/i);
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(handleClear).toHaveBeenCalled();
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });
});
