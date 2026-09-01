# Plataforma GR — Alcance del Producto

**Documento:** `PRODUCT_SCOPE.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.1  
**Estado:** Baseline funcional aprobado para documentación e implementación  
**Fecha:** 31 de agosto de 2026  
**Propósito:** Definir de forma inequívoca qué producto se construirá, para quién, qué capacidades incluye y qué queda fuera del alcance.

---

# 1. Principio de autoridad

Este documento define la frontera funcional de Plataforma GR. El código existente, prototipos y documentación legacy no pueden ampliar ni reducir este alcance.

Los únicos roles funcionales son:

```text
ADMIN
GRADUATE
```

Plataforma GR es **single-tenant** y es operada por una sola empresa organizadora de graduaciones. Puede administrar múltiples eventos simultáneos y múltiples cuentas ADMIN con el mismo nivel lógico de permisos.

---

# 2. Definición del producto

Plataforma GR es una plataforma web de administración operativa, contractual y financiera para eventos de graduación.

Centraliza:

- eventos;
- cuentas y membresías de graduados;
- contrato individual y folio;
- lugares/productos contratados;
- integrantes nominales;
- plan de pagos;
- cobros electrónicos y manuales;
- comprobantes de transferencia/depósito;
- cartera y vencimientos;
- penalizaciones configurables;
- cancelaciones y reembolsos;
- croquis y mesas;
- asignación de personas a mesas;
- platillos;
- termos;
- cortes y reportes;
- notas internas;
- auditoría.

No incluye invitaciones digitales, RSVP, QR/check-in, scanner, facturación electrónica ni operación multiempresa.

---

# 3. Objetivos de negocio

El sistema debe:

1. sustituir hojas de cálculo y seguimiento manual fragmentado;
2. controlar deuda, cobros, vencimientos y reembolsos de forma trazable;
3. conocer en tiempo real cartera y recaudación por evento/escuela;
4. controlar capacidad total y capacidad por mesa;
5. permitir autoservicio controlado al graduado;
6. reducir errores en asignación de mesas, platillos y termos;
7. producir cortes y reportes operativos exportables;
8. mantener evidencia y auditoría de operaciones críticas;
9. evitar que cambios de configuración alteren retroactivamente contratos ya aceptados.

---

# 4. Modelo conceptual

```text
Plataforma GR
│
├── ADMIN
│   ├── Eventos
│   ├── Graduados / contratos
│   ├── Pagos / comprobantes
│   ├── Cartera / penalizaciones
│   ├── Cancelaciones / reembolsos
│   ├── Mesas / croquis
│   ├── Platillos
│   ├── Termos
│   ├── Reportes / cortes
│   └── Auditoría / notas internas
│
└── GRADUATE
    ├── Mi contrato
    ├── Mi grupo / lugares
    ├── Mis mesas
    ├── Mis platillos
    ├── Mis pagos
    ├── Comprobantes
    ├── Mi termo
    └── Notificaciones
```

Una misma cuenta GRADUATE puede tener membresías en más de un evento. Cada membresía conserva de forma independiente contrato, folio, lugares, integrantes, plan financiero, mesas, platillos, termo y estado.

---

# 5. Ciclo de vida del evento

Estados funcionales:

```text
DRAFT
OPEN
CLOSED
FINALIZED
CANCELLED
```

- `DRAFT`: configuración administrativa; sin operación financiera real del graduado.
- `OPEN`: operación normal.
- `CLOSED`: mutaciones ordinarias del graduado bloqueadas; ADMIN puede reabrir.
- `FINALIZED`: evento concluido; conserva históricos y permite correcciones financieras controladas.
- `CANCELLED`: evento cancelado; conserva toda la historia.

---

# 6. Configuración del evento

Cada evento podrá definir, como mínimo:

- nombre;
- fecha;
- lugar;
- escuela/institución;
- carrera/generación cuando aplique;
- capacidad total;
- zona horaria;
- productos/tipos de lugar;
- precios;
- pago inicial;
- calendario e importes de parcialidades;
- periodo de gracia;
- fechas límite de lugares, mesas y platillos;
- reglas/milestones financieros aplicables a operación;
- penalización por liquidación tardía;
- periodo previo a cancelación automática cuando aplique;
- política de cancelación;
- opciones de platillo;
- porcentaje de desbloqueo del termo;
- configuración de personalización del termo.

Los valores son configurables por evento salvo que una regla aprobada indique lo contrario.

---

# 7. Contrato individual y folio

Cada membresía de graduado dentro de un evento tendrá un contrato individual identificable mediante folio único.

El contrato deberá conservar:

- identidad del graduado;
- evento;
- productos/lugares contratados;
- total contratado;
- condiciones financieras aplicables;
- versión de términos;
- versión de política de cancelación;
- fecha/hora de aceptación;
- evidencia técnica de aceptación permitida por seguridad/auditoría.

Una modificación posterior de defaults del evento no puede reescribir retroactivamente un contrato ya aceptado o un plan financiero congelado.

---

# 8. Productos, lugares e integrantes

El sistema soportará productos/lugares configurables por evento. El baseline debe contemplar al menos conceptos equivalentes a:

```text
ADULT
CHILD
NO_DINNER
```

Los nombres comerciales pueden variar por evento.

Cada membresía mantiene:

- cantidad de lugares vigentes;
- detalle de productos contratados;
- integrantes nominales;
- integrante principal/graduado.

El graduado puede agregar productos/lugares posteriores únicamente cuando:

- el evento lo permita;
- exista capacidad;
- no haya vencido el deadline aplicable;
- se satisfagan las reglas financieras vigentes.

Cuando una compra adicional ocurre después de que el plan original ya debería llevar cierto avance, el nuevo importe podrá requerir un **catch-up** para alcanzar el porcentaje financiero exigible a esa fecha. La fórmula exacta se define en `FINANCIAL_DOMAIN.md`.

La reducción de lugares requiere operación ADMIN y no puede destruir historia financiera.

---

# 9. Croquis y mesas

El croquis es una herramienta operativa, no CAD.

Formas MVP:

```text
SQUARE
ROUND
```

El ADMIN puede:

- crear una o múltiples mesas;
- numerarlas/etiquetarlas;
- definir capacidad individual;
- moverlas;
- duplicarlas;
- bloquearlas;
- cambiar capacidad respetando ocupación;
- utilizar JPG/PNG/PDF de una página como fondo de referencia.

La asignación funcional será:

```text
GroupMember → EventTable
```

Es decir, cada persona nominal del grupo puede estar en una mesa distinta.

No existe selección de silla:

```text
NO seat_id
NO chair_id
NO seat_number
```

La selección ordinaria de mesa por GRADUATE se habilitará únicamente cuando se cumpla la condición financiera configurada; en baseline, el primer pago confirmado constituye el desbloqueo comercial de lugares/mesa cuando el evento así lo configure.

La ocupación y disponibilidad se calculan a partir de asignaciones reales y nunca mediante contadores editables.

---

# 10. Platillos

Las opciones pertenecen al evento.

El GRADUATE selecciona un platillo por integrante dentro del plazo permitido.

El ADMIN puede:

- crear/desactivar opciones;
- consultar pendientes;
- obtener totales;
- cambiar selecciones;
- realizar overrides después del deadline con motivo y auditoría.

Las opciones demo no son catálogo global obligatorio.

---

# 11. Dominio financiero

El sistema deberá separar conceptualmente:

```text
Contract / ContractLineItem
PaymentPlan
Installment
PaymentAttempt
PaymentSubmission
PaymentTransaction
PaymentAllocation
Adjustment
PenaltyCharge
Refund
```

La pasarela no es la fuente de verdad de la deuda.

El plan debe permitir calcular:

- total contratado;
- total cobrado;
- total aplicado;
- total pendiente;
- total vencido;
- crédito disponible;
- reembolsado;
- penalizaciones;
- próximo vencimiento.

Los pagos confirmados son inmutables. Correcciones posteriores se modelan mediante movimientos separados.

---

# 12. Formas de pago

## 12.1 Electrónico

Proveedor primario:

```text
Mercado Pago — Checkout Pro
```

Proveedor secundario/alternativo:

```text
OpenPay
```

Plataforma GR no capturará directamente datos completos de tarjeta en el flujo principal.

El retorno del navegador no confirma el pago. La confirmación financiera se obtiene server-to-server y debe ser idempotente.

## 12.2 Manual validado por ADMIN

ADMIN puede registrar:

```text
CASH
TRANSFER
DEPOSIT
```

## 12.3 Comprobante enviado por GRADUATE

El graduado podrá reportar transferencia/depósito y cargar evidencia.

El comprobante tendrá estado propio y **no se considera pago confirmado** hasta que ADMIN lo apruebe.

Estados mínimos:

```text
PENDING_REVIEW
APPROVED
REJECTED
CANCELLED
```

Solo `APPROVED` puede originar la transacción financiera confirmada correspondiente.

---

# 13. Vencimientos, penalización tardía y cancelación automática

El evento puede configurar periodo de gracia para vencimientos ordinarios.

Adicionalmente puede existir una regla de liquidación final tardía:

```text
liquidation_due_date
late_grace_days
late_fee_amount
```

La penalización debe modelarse como movimiento/obligación independiente, nunca editando destructivamente una mensualidad ya existente.

Los valores de días e importe serán configurables por ADMIN por evento. Los ejemplos utilizados durante levantamiento no se hardcodearán.

Cuando se configure cancelación automática por incumplimiento, el sistema podrá cancelar la membresía después de cumplir exactamente las condiciones documentadas. Debe conservarse auditoría y no debe implicar borrado ni reembolso automático.

---

# 14. Política de cancelación dinámica

La política económica de cancelación será administrable por ADMIN mediante rangos dinámicos de días antes del evento.

Cada rango define:

```text
mínimo de días antes del evento
máximo de días antes del evento (opcional)
porcentaje de penalización
```

Ejemplo meramente ilustrativo:

```text
0–29 días   → 100%
30–60 días  → 75%
61–90 días  → 50%
91+ días    → 30%
```

Estos porcentajes **no son valores de sistema**; son campos configurables.

Una política publicada se versiona. Modificarla genera una nueva versión y no altera contratos vinculados a versiones anteriores.

El sistema debe validar que una política activa:

- use porcentajes entre 0 y 100;
- no tenga rangos traslapados;
- no tenga huecos;
- cubra desde día 0;
- tenga un último rango abierto o cobertura completa definida.

La cancelación de una membresía no genera automáticamente un reembolso. El sistema calcula una cotización de cancelación y ADMIN ejecuta/autoriza la operación financiera correspondiente.

---

# 15. Termo

Estados funcionales:

```text
LOCKED
AVAILABLE
REQUESTED
IN_PRODUCTION
DELIVERED
```

El porcentaje de desbloqueo es configurable por evento y se calcula usando avance financiero real.

El producto debe soportar:

- termo incluido cuando aplique;
- solicitud y personalización;
- bloqueo de edición al entrar en producción;
- termo adicional cuando el evento lo permita como producto/line item;
- registro administrativo de entrega;
- evidencia/firma de conformidad de entrega cuando se habilite.

---

# 16. Reportes y cortes

ADMIN tendrá reportes derivados de la fuente transaccional.

Mínimos:

## Financiero

- contratado;
- cobrado;
- pendiente;
- vencido;
- penalizaciones;
- reembolsos;
- movimientos.

## Cartera

- graduado;
- escuela/evento;
- folio;
- saldo;
- próximo vencimiento;
- estado;
- atraso.

## Pagos y comprobantes

- fecha;
- graduado;
- concepto;
- importe;
- método;
- referencia;
- estado;
- ADMIN validador cuando aplique.

## Mesas

- mesa;
- capacidad;
- ocupados;
- disponibles;
- personas asignadas.

## Platillos

- totales por opción;
- pendientes;
- detalle por integrante.

## Termos

- estado;
- personalización;
- entrega;
- pendientes.

## Cortes

El sistema debe poder producir al menos:

- corte diario;
- vista semanal;
- vista mensual;
- filtros por evento/escuela/método;
- concentrado operativo exportable.

Formatos previstos:

```text
XLSX
CSV
PDF resumen cuando corresponda
```

Los layouts exactos se definen en contratos/reportes, no mediante totales manuales independientes.

---

# 17. Notas internas y auditoría

ADMIN podrá registrar notas internas asociadas a graduado/evento cuando sean necesarias para seguimiento operativo.

Las notas no son visibles para GRADUATE salvo requisito explícito futuro.

Se auditarán al menos:

- aceptación contractual;
- cambios de lugares/productos;
- asignaciones de mesa;
- overrides de platillo;
- pagos manuales;
- aprobación/rechazo de comprobantes;
- ajustes;
- penalizaciones administrativas;
- reembolsos;
- cancelaciones;
- cambios/publicación de política de cancelación;
- estados del termo;
- entrega del termo;
- cambios de estado del evento;
- modificaciones financieras sensibles.

---

# 18. Seguridad y privacidad funcional

GRADUATE solo puede consultar y operar recursos de sus propias membresías.

Nunca debe poder acceder a:

- PII de otros graduados;
- finanzas de terceros;
- comprobantes de terceros;
- notas internas;
- auditoría administrativa;
- configuración del evento;
- secretos de proveedores.

El backend es autoridad definitiva de autorización, capacidad, fechas límite, saldos, contratos, pagos y estados.

---

# 19. Fuera de alcance

No forman parte del baseline actual:

- multi-tenant;
- roles distintos de ADMIN/GRADUATE;
- permisos configurables;
- invitaciones digitales;
- RSVP;
- QR/check-in;
- scanner;
- selección individual de silla;
- facturación CFDI;
- captura propia de tarjeta;
- WhatsApp automatizado como requisito base;
- editor CAD;
- reconocimiento de planos por IA.

Cualquier incorporación futura requiere Change Request y actualización documental previa.
