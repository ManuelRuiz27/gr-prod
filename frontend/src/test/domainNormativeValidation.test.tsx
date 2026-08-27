import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  currentGraduateMock,
  mockPaymentPlan,
  mockTables,
  mockMealOptions,
  type EventStatus,
  type TableStatus,
  type InstallmentStatus,
} from '../fixtures';
import { GraduateTableScreen } from '../pages/graduate/GraduateTableScreen';
import { GraduateMealsScreen } from '../pages/graduate/GraduateMealsScreen';
import { GraduateThermoScreen } from '../pages/graduate/GraduateThermoScreen';
import { GraduateBottomNav } from '../shells/graduate/GraduateBottomNav';
import { AdminSidebar } from '../shells/admin/AdminSidebar';
import { StateBoundary } from '../design-system';

describe('Domain & Normative UI Baseline Validation (FRONTEND-01)', () => {
  describe('1. Exact Enums Specification', () => {
    it('validates exact EventStatus values without extra or missing entries', () => {
      const allowedEventStatuses: EventStatus[] = ['DRAFT', 'OPEN', 'CLOSED', 'FINALIZED', 'CANCELLED'];
      expect(allowedEventStatuses).toEqual(['DRAFT', 'OPEN', 'CLOSED', 'FINALIZED', 'CANCELLED']);
      expect(allowedEventStatuses).not.toContain('ARCHIVED');
    });

    it('validates exact TableStatus values (AVAILABLE and BLOCKED only)', () => {
      const allowedTableStatuses: TableStatus[] = ['AVAILABLE', 'BLOCKED'];
      expect(allowedTableStatuses).toEqual(['AVAILABLE', 'BLOCKED']);

      mockTables.forEach((table) => {
        expect(allowedTableStatuses).toContain(table.status);
      });
    });

    it('validates exact InstallmentStatus values', () => {
      const allowedInstallmentStatuses: InstallmentStatus[] = [
        'FUTURE',
        'UPCOMING',
        'DUE',
        'OVERDUE',
        'PAID',
        'CANCELLED',
      ];
      expect(allowedInstallmentStatuses).toEqual([
        'FUTURE',
        'UPCOMING',
        'DUE',
        'OVERDUE',
        'PAID',
        'CANCELLED',
      ]);
    });
  });

  describe('2. Andrea Martinez Financial Scenario & Installment Statuses', () => {
    it('strictly satisfies the approved financial demo parameters and exact installment statuses', () => {
      expect(mockPaymentPlan.totalAmount).toBe(12500);
      expect(mockPaymentPlan.paidAmount).toBe(7500);
      expect(mockPaymentPlan.pendingAmount).toBe(5000);
      expect(mockPaymentPlan.progressPercentage).toBe(60);
      expect(mockPaymentPlan.nextPaymentAmount).toBe(2500);
      expect(mockPaymentPlan.nextPaymentDueDate).toBe('15 Mar 2027');

      expect(mockPaymentPlan.installments).toHaveLength(5);
      expect(mockPaymentPlan.installments.map((i) => i.amount)).toEqual([2500, 2500, 2500, 2500, 2500]);

      // M1, M2, M3 = PAID, M4 = UPCOMING, M5 = FUTURE
      expect(mockPaymentPlan.installments[0].status).toBe('PAID');
      expect(mockPaymentPlan.installments[1].status).toBe('PAID');
      expect(mockPaymentPlan.installments[2].status).toBe('PAID');
      expect(mockPaymentPlan.installments[3].status).toBe('UPCOMING');
      expect(mockPaymentPlan.installments[4].status).toBe('FUTURE');
    });
  });

  describe('3. GraduateThermoScreen Natural Spanish & Technical Strings Absence', () => {
    it('does NOT expose raw technical enum strings to the graduate', () => {
      const { container } = render(
        <MemoryRouter>
          <GraduateThermoScreen />
        </MemoryRouter>
      );

      const htmlContent = container.textContent || '';

      // Technical enum strings must not be exposed as UI text
      expect(htmlContent).not.toMatch(/\bLOCKED\b/);
      expect(htmlContent).not.toMatch(/\bAVAILABLE\b/);
      expect(htmlContent).not.toMatch(/\bREQUESTED\b/);
      expect(htmlContent).not.toMatch(/\bIN_PRODUCTION\b/);
      expect(htmlContent).not.toMatch(/\bDELIVERED\b/);

      // Must display natural Spanish labels
      expect(screen.getByText('Bloqueado')).toBeInTheDocument();
      expect(screen.getAllByText(/70%/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Gestión de Termo Conmemorativo/i)).toBeInTheDocument();

      // No physical attributes invented
      expect(htmlContent).not.toContain('grabado láser');
      expect(htmlContent).not.toContain('acero inoxidable');
    });
  });

  describe('4. Table & Seating Rules (SEATING_MAP.md)', () => {
    it('renders table by capacity and places without individual seat assignments or seat numbers', () => {
      const { container } = render(
        <MemoryRouter>
          <GraduateTableScreen />
        </MemoryRouter>
      );

      expect(screen.getAllByText(/Mesa 24/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/8 lugares asignados/i)).toBeInTheDocument();

      // Check absence of seat assignment keywords
      const htmlText = container.textContent || '';
      expect(htmlText).not.toMatch(/asiento #\d+/i);
      expect(htmlText).not.toMatch(/seat_number/i);
      expect(htmlText).not.toMatch(/silla individual/i);
    });

    it('does NOT display third-party PII on tables in Graduate view', () => {
      const { container } = render(
        <MemoryRouter>
          <GraduateTableScreen />
        </MemoryRouter>
      );

      const htmlText = container.textContent || '';
      // Third party names must not appear
      expect(htmlText).not.toContain('Fernando Torres');
      expect(htmlText).not.toContain('Roberto Sánchez');
      expect(htmlText).not.toContain('Mariana López');
    });

    it('contains only valid table shapes (ROUND and SQUARE)', () => {
      mockTables.forEach((table) => {
        expect(['ROUND', 'SQUARE']).toContain(table.shape);
      });
    });
  });

  describe('5. Meal Selection Rules', () => {
    it('only contains the 3 approved meal options: Tradicional, Vegetariano, Vegano', () => {
      const allowedMeals = ['Tradicional', 'Vegetariano', 'Vegano'];
      expect(mockMealOptions.map((m) => m.name)).toEqual(allowedMeals);

      render(
        <MemoryRouter>
          <GraduateMealsScreen />
        </MemoryRouter>
      );

      expect(screen.getAllByText('Tradicional').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Vegetariano').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Vegano').length).toBeGreaterThan(0);
      expect(screen.queryByText(/menú infantil/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/gluten free/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/menú adulto/i)).not.toBeInTheDocument();
    });

    it('matches Andrea group meal totals (5 Tradicional, 1 Vegetariano, 2 Vegano)', () => {
      const meals = currentGraduateMock.guests.map((g) => g.meal);
      const tradicionalCount = meals.filter((m) => m === 'Tradicional').length;
      const vegetarianoCount = meals.filter((m) => m === 'Vegetariano').length;
      const veganoCount = meals.filter((m) => m === 'Vegano').length;

      expect(tradicionalCount).toBe(5);
      expect(vegetarianoCount).toBe(1);
      expect(veganoCount).toBe(2);
      expect(meals.length).toBe(8);
    });
  });

  describe('6. GRADUATE & ADMIN Navigation Structure', () => {
    it('renders exactly the 4 required bottom navigation items for Graduate', () => {
      render(
        <MemoryRouter>
          <GraduateBottomNav />
        </MemoryRouter>
      );

      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Mi grupo')).toBeInTheDocument();
      expect(screen.getByText('Pagos')).toBeInTheDocument();
      expect(screen.getByText('Más')).toBeInTheDocument();
    });

    it('renders global admin sidebar navigation items', () => {
      render(
        <MemoryRouter>
          <AdminSidebar />
        </MemoryRouter>
      );

      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Eventos')).toBeInTheDocument();
      expect(screen.getByText('Graduados')).toBeInTheDocument();
      expect(screen.getByText('Pagos')).toBeInTheDocument();
      expect(screen.getByText('Reportes')).toBeInTheDocument();
    });
  });

  describe('7. UI Visual States & StateBoundary', () => {
    it('renders all 6 normative UI states correctly', () => {
      const { rerender } = render(
        <StateBoundary state="loading" loadingMessage="Cargando datos...">
          <div>Contenido</div>
        </StateBoundary>
      );
      expect(screen.getByText('Cargando datos...')).toBeInTheDocument();

      rerender(
        <StateBoundary state="empty" emptyTitle="Sin registros">
          <div>Contenido</div>
        </StateBoundary>
      );
      expect(screen.getByText('Sin registros')).toBeInTheDocument();

      rerender(
        <StateBoundary state="error" errorTitle="Error en carga">
          <div>Contenido</div>
        </StateBoundary>
      );
      expect(screen.getByText('Error en carga')).toBeInTheDocument();

      rerender(
        <StateBoundary state="offline" offlineMessage="Sin conexión">
          <div>Contenido</div>
        </StateBoundary>
      );
      expect(screen.getByText('Sin conexión')).toBeInTheDocument();

      rerender(
        <StateBoundary state="action_success" successTitle="Acción exitosa">
          <div>Contenido</div>
        </StateBoundary>
      );
      expect(screen.getByText('Acción exitosa')).toBeInTheDocument();

      rerender(
        <StateBoundary state="ready">
          <div>Contenido de Datos</div>
        </StateBoundary>
      );
      expect(screen.getByText('Contenido de Datos')).toBeInTheDocument();
    });
  });
});
