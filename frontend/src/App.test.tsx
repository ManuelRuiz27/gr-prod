import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App smoke routing tests', () => {
  it('renders access screen on /access', () => {
    window.history.pushState({}, '', '/access');
    render(<App />);
    expect(screen.getByRole('heading', { name: /Accede a tu graduación/i })).toBeInTheDocument();
  });

  it('renders login screen on /login', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByRole('heading', { name: /Plataforma GR/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  it('renders admin login screen on /admin/login', () => {
    window.history.pushState({}, '', '/admin/login');
    render(<App />);
    expect(screen.getByRole('heading', { name: /Administración/i })).toBeInTheDocument();
  });
});
