# Plataforma GR — Plan de ejecución Codex: UX Simplification

**Fecha:** 5 de septiembre de 2026  
**Estado:** AUTORIZADO para ejecución incremental  
**Scope:** `frontend/**` + tests/documentación subordinada necesaria  
**No autorizado:** cambios de backend, Prisma, API, permisos, reglas financieras o modelo de datos salvo ticket separado.

> [!IMPORTANT]
> Este plan implementa las correcciones definidas en:
>
> 1. `docs/GRADUATE_UX_SIMPLIFICATION_AUDIT.md`
> 2. `docs/ADMIN_UX_SIMPLIFICATION_AUDIT.md`
>
> Ambos documentos prevalecen sobre el baseline visual anterior cuando exista conflicto de composición, prioridad de información, navegación visible o responsive.

---

# 1. Lectura obligatoria antes de tocar código

En este orden:

1. `docs/PRODUCT_SCOPE.md`
2. `docs/BUSINESS_RULES.md`
3. `docs/ROLES_PERMISSIONS.md`
4. `docs/GRADUATE_UX_SIMPLIFICATION_AUDIT.md`
5. `docs/ADMIN_UX_SIMPLIFICATION_AUDIT.md`
6. `docs/UX_FLOWS.md`
7. `docs/UI_DESIGN_SYSTEM.md`
8. `docs/SCREEN_VISUAL_SPECIFICATIONS.md`
9. `docs/FINANCIAL_DOMAIN.md`
10. `docs/SEATING_MAP.md`
11. `docs/REPOSITORY_SOURCE_OF_TRUTH.md`
12. `.agents/rules/gr-frontend.md`
13. `.agents/rules/ui-ux-v2.md`

Si existe contradicción visual, aplicar los dos documentos `*_UX_SIMPLIFICATION_AUDIT.md`.

---

# 2. Principio de ejecución

NO hacer otro refactor masivo de nombres/clases por estética.

La corrección debe reducir:

- información visible no requerida;
- secciones completas sin valor operacional;
- tabs y rutas duplicadas;
- KPIs que preceden una tarea;
- Card/card-like containers;
- bordes y divisores usados como layout;
- demo/debug UI visible al cliente.

La métrica de éxito NO es “menos componentes Card”. La métrica es:

> menos decisiones, menos información simultánea y más claridad de la acción real del cliente.

---

# 3. Reglas de seguridad funcional

1. No cambiar reglas financieras para ajustar la UI.
2. No inventar datos ni fallbacks numéricos.
3. No usar fixtures `VISUAL_QA_*` como fuente productiva fuera de modo demo/QA claramente aislado.
4. No borrar capacidades backend/documentadas al ocultarlas del MVP.
5. No hacer que el frontend confirme pagos por sí mismo.
6. `Registrar abono` debe permitir monto diferente al monto exacto de una mensualidad; cualquier validación mínima/allocations pertenece al backend/contrato financiero.
7. No romper privacidad del croquis GRADUATE.
8. No exponer enums técnicos si existe lenguaje natural.

---

# 4. Fases autorizadas

## Fase A — Shells y superficies demo internas (P0)

### GRADUATE

- corregir responsive de `GraduateLayout`;
- eliminar borde lateral estructural;
- navegación `Inicio | Mi grupo | Pagos | Más`;
- simplificar `GraduateHeader`;
- ocultar notificaciones si no tienen flujo MVP confirmado;
- retirar `DemoFlowPanel` de superficies cliente.

### ADMIN

- eliminar/ocultar `Showcase` y `DemoControls` de experiencia cliente;
- simplificar `AdminHeader`;
- reducir `AdminEventNav` a 6 destinos + `Más`;
- mover Reportes/Configuración/Historial a `Más`;
- no borrar rutas técnicas todavía si son usadas por tests: primero redirigir/retirar navegación.

### Acceptance

- ningún `DemoFlowPanel` visible en rutas cliente;
- ningún `Showcase` visible en navegación ADMIN;
- shells funcionan en 390, 768, 1024, 1440 px sin parecer móvil estirado ni depender de scroll horizontal de navegación.

---

## Fase B — GRADUATE simplification (P0)

Orden:

1. `GraduateHomeScreen`
2. `GraduateGroupScreen`
3. `GraduatePaymentsScreen`
4. `GraduateTableScreen`
5. `GraduateMealsScreen`
6. `GraduateThermoScreen`
7. `GraduateContractScreen`
8. `GraduateMoreScreen`
9. rutas Notificaciones/Profile/Help

### Reglas específicas

- Inicio: un siguiente paso prioritario + lista breve.
- Grupo: lista de personas/lugares; no 3 KPIs.
- Pagos: `Abonar`, mínimo actual, saldo, calendario, historial.
- Mesa: canvas default/protagonista; lista fallback.
- Platillos: persona → elección; no catálogo duplicado.
- Termo: estado + acción; corregir navegación `Ver pagos`.
- Contrato: documento continuo; no scroll interno.
- Más: solo destinos reales.

### Acceptance

Cada pantalla debe pasar los criterios de sección 15 de `GRADUATE_UX_SIMPLIFICATION_AUDIT.md`.

---

## Fase C — ADMIN core operation (P0)

Orden:

1. `AdminDashboardScreen`
2. `AdminEventOverviewScreen`
3. `AdminEventGraduatesListScreen`
4. `AdminGraduateOverviewScreen`
5. `AdminEventPaymentsScreen`
6. `EventPortfolioTab`
7. `ManualPaymentModal`
8. `EventProofQueueTab`
9. retirar `EventFinancialSummaryTab` como tab independiente
10. ocultar `EventReconciliationTab` del MVP

### Reglas específicas

#### Inicio

Búsqueda + pendientes + accesos operativos + eventos. No 5 KPIs globales.

#### Overview

Cobranza + pendientes accionables. No volver a listar todos los módulos.

#### Graduados

Tabla objetivo:

```text
Folio | Nombre | Personas | Total | Abonado | Saldo | Mesa | Alerta
```

Filtros principales:

```text
Todos | Saldo vencido | Comprobante por revisar | Sin mesa
```

#### Expediente

Eliminar arquitectura de 9 tabs. Crear una única ficha operativa con menú secundario `···`.

#### Pagos

Tabs MVP:

```text
Cartera | Movimientos | Comprobantes
```

`Resumen` financiero se integra arriba de Cartera como tres totales compactos.

#### Registrar abono

NO exigir mensualidad exacta. El operador captura monto recibido y método.

- Efectivo → responsable obligatorio según contrato/regla aplicable.
- Transferencia/Depósito → referencia/evidencia según configuración.

No implementar nuevas reglas de allocations en frontend.

#### Conciliación

Ocultar de navegación/tabs MVP. Mantener código si borrar rompe contratos/tests.

---

## Fase D — ADMIN operational modules (P0)

1. `AdminEventTablesScreen`
2. `AdminEventMealsScreen` + `MealSummary`
3. `AdminEventThermosScreen` + `ThermoSummary`/`ThermoTable`
4. `AdminEventReportsScreen`
5. `AdminEventSettingsScreen`

### Mesas

- eliminar KPI strip;
- canvas 75–80% desktop;
- inspector contextual;
- tablet drawer;
- móvil canvas + bottom sheet;
- añadir/reservar filtro útil para menores, sin exponer PII de terceros a GRADUATE.

### Platillos

Header compacto:

```text
Normal N | Vegetariano N | Vegano N | Sin elegir N
```

Filtros:

```text
Todos | Especiales | Pendientes
```

### Termos

Eliminar `ThermoSummary` como dashboard.

Priorizar tabla operativa y preparar CTA/salida `Imprimir lista de entrega` con:

```text
Mesa | Folio | Nombre | Personalización | Firma de recibido
```

Si la exportación/impresión real requiere backend no disponible, implementar UI honesta y contrato/test sin fingir descarga exitosa.

### Reportes

Rehacer alrededor de:

```text
Escuela
Periodo semanal/mensual/personalizado
Método
Tabla de movimientos
Exportar Excel
```

El Excel completo del evento debe contemplar, según disponibilidad normativa:

```text
Mesa
Número de contrato
Nombre
Adultos
Niños
Sin cena
Abonos
Total a pagar
Total abonado
Saldo pendiente
Vegetarianos
Veganos
Datos generales del evento
```

No mantener grid de 7 report cards.

### Configuración

Formulario continuo de una columna/secciones por heading, no grid de cards.

---

## Fase E — Secondary ADMIN cleanup (P1/P2)

1. Simplificar Create Event Wizard a 4 pasos sin cambiar datos requeridos.
2. Simplificar UI de política de cancelación; mantener versionado backend.
3. Evaluar/reconvertir `/admin/payments` a cobro rápido por folio.
4. Mover Auditoría a `Más → Historial`.
5. Retirar/redirect rutas globales duplicadas.
6. No implementar Notas internas como protagonista hasta confirmación del cliente.

---

# 5. Responsive acceptance matrix

Codex debe verificar como mínimo:

## GRADUATE

- 390×844
- 768×1024
- 1440×900

Rutas:

```text
/graduate
/graduate/group
/graduate/payments
/graduate/table
/graduate/meals
/graduate/thermo
/graduate/contract
/graduate/more
```

## ADMIN

- 390×844 para tareas críticas
- 768×1024
- 1024×768
- 1440×900

Rutas mínimas:

```text
/admin
/admin/events
/admin/events/:eventId
/admin/events/:eventId/graduates
/admin/events/:eventId/graduates/:graduateId
/admin/events/:eventId/payments
/admin/events/:eventId/tables
/admin/events/:eventId/meals
/admin/events/:eventId/thermos
/admin/events/:eventId/reports
/admin/events/:eventId/settings
```

### No se acepta como responsive si:

- solo existe `overflow-x-auto` para resolver todo;
- nav tabs requieren scroll horizontal permanente en tablet;
- botones se salen del viewport;
- tablas críticas son ilegibles en móvil;
- canvas queda relegado por headers/KPIs;
- desktop es una columna mobile simplemente más ancha.

---

# 6. Visual QA obligatorio

No aprobar solo por tests/build.

Usar navegador real o headless con screenshots y revisar:

- jerarquía;
- cardificación residual;
- cantidad de datos visibles;
- líneas/bordes;
- responsive;
- CTA dominante;
- overflow;
- navegación;
- duplicación de contexto;
- aparición accidental de demo/debug UI.

Tomar evidencia de al menos las rutas de la matriz responsive.

---

# 7. QA técnico obligatorio por fase

Desde `frontend/` cuando aplique:

```bash
npx tsc -b --noEmit
npm run lint
npm test
npm run build
```

Actualizar tests para la nueva UX. No conservar DOM oculto, `sr-only` falso o tokens de compatibilidad únicamente para mantener tests legacy.

---

# 8. Restricciones de implementación

- No crear segundo design system.
- Reusar primitives existentes cuando aporten valor.
- Se permite retirar primitives visuales de una pantalla si no corresponden.
- No reemplazar Card por `div` conservando exactamente la misma composición: eso NO cumple.
- No introducir nuevas métricas para rellenar espacios.
- No inventar copy o funcionalidades “enterprise”.
- No mostrar datos solo porque existen en el modelo.
- No borrar backend/domain por decisión de visibilidad MVP.

---

# 9. Definition of Done de la iniciativa

La iniciativa `UX Simplification` queda DONE cuando:

1. GRADUATE prioriza tarea/siguiente paso y deja de parecer dashboard.
2. ADMIN prioriza bandeja operativa y acciones de negocio.
3. Croquis domina sus pantallas.
4. `Registrar abono` acepta monto operativo sin obligar cuota exacta.
5. Reportes refleja cortes/exportaciones requeridos por cliente.
6. Termos contempla lista de entrega.
7. Conciliación/Auditoría/Notas/Notificaciones no dominan el MVP sin requerimiento confirmado.
8. No hay DemoFlowPanel/Showcase visible al cliente.
9. Líneas y cards dejan de ser el sistema principal de layout.
10. Responsive fue inspeccionado en móvil/tablet/desktop.
11. Typecheck/lint/tests/build pasan.
12. No existen cambios no autorizados en backend/API/Prisma/reglas de negocio.

---

# 10. Entrega esperada de Codex

En cada fase reportar:

```text
- fase implementada
- pantallas modificadas
- elementos eliminados por no aportar a requerimientos
- decisiones de responsive
- rutas verificadas visualmente
- screenshots/evidencia
- tests actualizados
- typecheck/lint/tests/build
- backend diff = 0 (o explicación si ticket separado)
- commit SHA
```

No declarar DONE con frases generales como “UI modernizada”. Reportar contra los criterios concretos de estos documentos.
