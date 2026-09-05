import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { GraduateHomeScreen } from '../pages/graduate/GraduateHomeScreen';

describe('Graduate home — UX simplification', () => {
  it('prioritizes one pending action and brief operational status', () => {
    render(<AuthProvider><MemoryRouter><GraduateHomeScreen /></MemoryRouter></AuthProvider>);
    expect(screen.getByText(/hola, andrea/i)).toBeInTheDocument();
    expect(screen.getByText(/próximo pendiente/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abonar' })).toBeInTheDocument();
    expect(screen.getByText('Mi grupo')).toBeInTheDocument();
    expect(screen.queryByText(/% cubierto/i)).not.toBeInTheDocument();
  });
});
