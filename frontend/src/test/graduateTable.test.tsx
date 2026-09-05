import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GraduateTableScreen } from '../pages/graduate/GraduateTableScreen';

describe('Graduate table — UX simplification', () => {
  it('uses the croquis as the default workspace and keeps the list as fallback', () => {
    render(<MemoryRouter><GraduateTableScreen /></MemoryRouter>);
    expect(screen.getByRole('tab', { name: 'Croquis' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Ver como lista' })).toBeInTheDocument();
  });
});
