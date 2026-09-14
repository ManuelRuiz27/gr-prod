# DEMO-01 — Mock API interactivo

## Acceso

### Croquis: pruebas con los usuarios correspondientes

En desarrollo con `VITE_DATA_MODE=mock`, el acceso local reconoce estas dos cuentas de prueba existentes en el seed. No requiere levantar NestJS.

| Usuario | Entrada | Correo | Contraseña de prueba | Pantalla |
|---|---|---|---|---|
| Andrea Martínez · graduada | `/login` | `andrea.martinez@ejemplo.com` | `GraduatePass123!` | `/graduate/table` |
| Administrador Principal | `/admin/login` | `admin@plataformagr.com` | `AdminPass123!` | `/admin/events/evt-derecho-2027/tables` |

Ambos ven el selector **Caso de prueba** en su pantalla habitual de mesas. Incluye vista previa, disponibilidad, ocupación parcial, mesas completas o bloqueadas, pago pendiente, fecha cerrada, pérdida de cupo al confirmar, cambio de versión en otra sesión y falla de red con reintento. El caso inicial es ocupación parcial: Andrea tiene 8 lugares confirmados, 2 ubicados y 6 pendientes; son cifras exclusivamente sintéticas. La mesa 4 permite probar mesas circulares.

1. Entra como Andrea, elige la mesa 4, agrega 3 lugares y confirma la distribución. Su total ubicado pasa a 5.
2. Usa **Entrar con el otro usuario**, inicia sesión como administrador y abre las mesas del evento. La mesa 4 muestra 3 lugares ocupados y 12 disponibles. El administrador consulta los conteos; no modifica la distribución de Andrea.
3. Cambia **Caso de prueba** para verificar las restricciones y errores. **Reiniciar caso** restaura sus datos iniciales, incluida la falla de una sola ejecución.

El caso seleccionado y sus cantidades se comparten entre ambos roles en el mismo origen del navegador y persisten al recargar. Las claves empiezan con `gr.demo.seating-accounts.v1`; no modifican la base de datos ni los pagos. Cada caso conserva su propio estado hasta reiniciarlo. La actualización de ocupación usa el ciclo de consulta del visor (5 segundos, foco y confirmación). El inicio de sesión de la aplicación se comparte por origen: prueba el cambio de usuario de forma secuencial.

Las cuentas y el selector solo se conectan en `DEV` + modo mock. Una sesión real conserva el adaptador configurado y el croquis original con capacidades pendientes; producción no incorpora estas credenciales ni los escenarios. El selector anterior de la demo de pagos no controla los casos del croquis. La página `/__qa/seating` continúa disponible como banco de pruebas aislado.

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
