# DEMO-01 — Mock API interactivo

## Acceso

La demo se ejecuta sin NestJS desde `frontend/`:

```bash
npm install
npm run dev
```

Abre `/graduate/payments` para la vista GRADUATE y `/admin/events/evt-derecho-2027/payments?tab=comprobantes` para ADMIN. Ambas pestañas comparten el estado persistido en `localStorage` bajo `gr.demo.mock-api.v1`.

`VITE_DATA_MODE=mock` activa MSW y `VITE_DEMO_MODE=true` muestra el selector de escenario y **Reset demo** en los encabezados. El selector no se renderiza fuera del modo demo.

## Flujo verificable

1. En GRADUATE, abre **Reportar transferencia**, completa los campos y envía el comprobante. Queda `PENDING_REVIEW` y el saldo no cambia.
2. En ADMIN, abre la cola de comprobantes y aprueba el nuevo registro.
3. Regresa a GRADUATE: el comprobante es aprobado, aparece una única transacción y cambian saldo y avance.
4. Abre `/admin/events/evt-derecho-2027/audit` para ver la auditoría generada.

La idempotencia de aprobación se resuelve en la capa mock: el mismo `PaymentSubmission` no puede crear más de una transacción.

## Escenarios

El selector permite reiniciar a: `NORMAL`, `CONTRACT_PENDING`, `PROOF_PENDING`, `PROOF_REJECTED`, `PAYMENT_OVERDUE`, `SEATING_LOCKED`, `SEATING_READY`, `MEALS_PENDING`, `THERMO_AVAILABLE`, `CANCELLATION_REFUND`, `CANCELLATION_DEBT` y `CANCELLED`.

Todos se crean desde la capa mock utilizando los fixtures existentes. La cotización de cancelación se entrega desde el handler `POST /admin/events/{eventId}/graduates/{membershipId}/cancellation-quote`; los componentes no calculan penalidades ni reembolsos.

## Cobertura API mock

MSW intercepta contratos de pagos, comprobantes, intento de pago electrónico, contrato, platillos, termo, croquis, cotización de cancelación y auditoría. Los endpoints conservan las rutas de `API_CONTRACTS.md`; el backend NestJS sigue siendo la autoridad conceptual y no es reemplazado por esta demo.

## Reset

Usa **Reset demo** para reconstruir el escenario actual, o cambia de escenario. También puedes borrar la clave `gr.demo.mock-api.v1` del `localStorage` del navegador.
