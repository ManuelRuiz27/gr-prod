# Plataforma GR — Auditoría y correcciones UX ADMIN

**Fecha:** 5 de septiembre de 2026  
**Estado:** VINCULANTE para la siguiente iteración de frontend  
**Objetivo:** reducir dashboardización, módulos no prioritarios, navegación excesiva, cardificación y ruido visual en ADMIN; reenfocar la interfaz en la operación real de las dos propietarias del negocio.

> [!IMPORTANT]
> Este documento corrige la **composición, prioridad de información, navegación visible, densidad operativa y responsive** del baseline visual anterior. No elimina capacidades backend ya definidas salvo autorización explícita. Cuando una función se marca `DEFER UI`, debe ocultarse del MVP visible sin borrar su dominio técnico.

---

# 1. Problema detectado

La aplicación ADMIN se comporta como una suite ERP/event-management genérica. El cliente, en cambio, necesita principalmente:

- localizar graduados por nombre/folio;
- registrar abonos externos;
- validar comprobantes;
- revisar saldo/mora;
- corregir mesa/platillo;
- controlar producción/entrega de termos;
- aplicar cancelaciones;
- operar croquis;
- generar cortes y exportaciones por evento/escuela.

El frontend actual añade demasiados dashboards, filtros, KPIs, tabs y módulos de control secundario.

La pregunta que debe resolver ADMIN es:

```text
¿Qué necesito atender?
¿De qué graduado/evento?
¿Qué acción debo ejecutar?
```

---

# 2. Reglas transversales obligatorias

## 2.1 No convertir operación en analítica

Si una pantalla existe para ejecutar una acción, no debe comenzar con un dashboard de métricas.

Ejemplos:
- Croquis → canvas primero.
- Termos → lista operativa primero.
- Platillos → personas/especiales primero.
- Pagos → cartera/comprobantes primero.

## 2.2 Cards

- `Card` no es contenedor predeterminado.
- No crear grids de módulos/card families.
- No poner una card por métrica, mesa, graduado, sección de settings o reporte.

## 2.3 Líneas

Priorizar espacio, jerarquía y alineación. Usar bordes principalmente en:

- inputs;
- tablas densas;
- canvas/workspace;
- evidencia/documentos cuando ayude.

Evitar `border-*`, `divide-y` y `<hr>` como estructura omnipresente.

## 2.4 Demo interna

Ocultar de experiencia cliente:

- `DemoControls`;
- `DemoFlowPanel`;
- `Showcase`;
- mensajes “preview/backend/no guardado” salvo que sean imprescindibles para evitar una falsa confirmación durante demo interna.

Para cliente, una advertencia global de entorno demo es suficiente.

## 2.5 Responsive

### Desktop >= 1200
- sidebar;
- tablas completas;
- drawers laterales;
- croquis canvas + inspector.

### Tablet 768–1199
- sidebar → drawer;
- navegación evento compacta;
- ocultar columnas secundarias;
- drawers 40–50vw;
- croquis casi full-screen.

### Mobile < 768
No intentar mostrar tablas de 7–10 columnas con solo `overflow-x-auto`.

Priorizar funcionamiento de:

```text
Buscar graduado
Registrar abono
Revisar comprobante
Abrir expediente
Modificar platillo
Consultar termo
```

Tabla desktop → lista densa, no cards.

---

# 3. Shell ADMIN — P0

## Problema

Actualmente se acumulan:

```text
Sidebar
Header
breadcrumb/header context
EventNav con 9 tabs
breadcrumb de página
título/subtítulo
```

## Corrección

### Sidebar global

```text
GR

Inicio
Eventos

────────
Reportes
```

### Header

Eliminar de la experiencia cliente:
- `Showcase`;
- `DemoControls`;
- campana sin flujo real;
- badge/label `ADMIN` redundante;
- breadcrumb repetitivo.

Propuesta:

```text
[☰]        Buscar folio o nombre...                  Manuel
```

### Event navigation

Reducir de 9 tabs a:

```text
Resumen
Graduados
Pagos
Mesas
Platillos
Termos
Más ▾
```

`Más`:

```text
Reportes
Configuración
Historial
```

Auditoría no es pestaña primaria.

---

# 4. Inicio `/admin` — P0

## Objetivo

Debe ser bandeja operativa + búsqueda global, no dashboard corporativo.

## Composición objetivo

```text
Buenas tardes

Buscar graduado, folio o escuela...
[________________________________]

Registrar abono        Revisar comprobantes        + Evento

Pendientes
3 comprobantes por revisar
Derecho 2027                                  Revisar →

6 contratos con pago vencido
Administración 2027                           Revisar →

Eventos
Derecho 2027
UASLP · 19 junio                              →
```

## Quitar

- 5 métricas globales permanentes;
- total global de graduados;
- porcentajes globales;
- gráficos.

---

# 5. Eventos `/admin/events` — P1

La tabla es una base correcta.

## Mantener

- búsqueda;
- tabla;
- CTA Crear evento;
- fecha;
- escuela;
- estado.

## Simplificar filtros

Principal:

```text
Todos | Activos | Cerrados
```

Otros estados → filtro secundario.

Agregar escuela como filtro relevante.

## Tabla objetivo

```text
Evento
Escuela
Fecha
Graduados
Cobranza
Estado
```

Si toda la fila es clicable, eliminar botón `Entrar`.

---

# 6. Crear evento `/admin/events/new` — P0

## Reducir de 6 a 4 pasos

```text
1 Datos
2 Boletos y precios
3 Plan de pagos
4 Operación
```

### 1 Datos

- escuela;
- carrera;
- generación;
- fecha;
- salón.

### 2 Boletos y precios

```text
Adulto       $____
Niño         $____
Sin cena     $____
```

### 3 Plan de pagos

```text
Pago inicial
$____

Abonos
Fecha                Mínimo
15 enero             $500
15 febrero           $800
15 marzo             $1,000

+ Agregar fecha
```

Las parcialidades pueden tener montos distintos.

No crear una card por mensualidad.

### 4 Operación

- fecha de liquidación;
- umbral termo;
- opciones de platillo;
- política cancelación;
- croquis se configura después desde Mesas.

No incluir lifecycle como paso del wizard.

---

# 7. Resumen de evento — P0

## Problema

Vuelve a listar módulos ya presentes en navegación y funciona como pequeño dashboard.

## Composición objetivo

```text
Derecho · Generación 2027
19 junio · Centro de Convenciones

Cobranza
$482,500 cobrados
$86,000 pendientes
$12,500 vencidos

Necesita atención
3 pagos vencidos                          Revisar →
2 platillos especiales pendientes        Revisar →
```

Opcional: próxima fecha de cobro si aporta valor.

## Quitar

- sección `Preparación` como lista de módulos;
- indicadores de termos si no requieren acción;
- lugares libres como alerta permanente;
- lifecycle visible.

Lifecycle → menú `···`.

---

# 8. Graduados del evento — P0

## Objetivo

Localizar a una persona y conocer su situación operativa básica.

### Búsqueda principal

```text
folio
nombre
teléfono
```

### Tabla objetivo

```text
Folio
Nombre
Personas
Total
Abonado
Saldo
Mesa
Alerta
```

`Personas` puede resumir:

```text
6
4 adultos · 1 niño · 1 sin cena
```

### Filtros rápidos

```text
Todos
Saldo vencido
Comprobante por revisar
Sin mesa
```

Filtros secundarios → drawer opcional.

## Quitar como filtros primarios

- termo;
- platillo;
- membership status técnico;
- email visible permanente.

---

# 9. `/admin/graduates` global legacy — P0

Eliminar/retirar de navegación la implementación duplicada `AdminEventGraduatesScreen`.

La fuente principal debe ser:

```text
/admin/events/:eventId/graduates
```

Para búsqueda global, usar búsqueda en Inicio/Header, no otra tabla paralela.

No borrar dominio/datos por esta corrección; retirar superficie duplicada.

---

# 10. Expediente de graduado — P0 / REHACER

## Problema

Actualmente es un mini ERP con 9 tabs y KPIs.

## Objetivo

Responder en segundos:

- folio/contacto;
- saldo;
- último/próximo pago;
- grupo;
- mesas;
- platillos especiales;
- termo;
- contrato;
- acciones administrativas.

## Composición objetivo

```text
← Graduados

Andrea Martínez
Folio GR-00429 · 444 000 0000

                         Registrar abono
                         ···

$12,500 abonados de $18,500
Restan $6,000
Próximo mínimo: $2,500 · 15 septiembre

Grupo
6 lugares
Andrea                     Mesa 12
Laura                      Mesa 12
Carlos · Niño              Mesa 14

Platillos
1 vegetariano · 5 normales

Termo
Solicitado

Contrato
Aceptado · Ver contrato →
```

## Menú `···`

```text
Editar datos
Cambiar mesa
Modificar platillo
Cancelar contrato
Ver historial
```

## Quitar

- 9 tabs;
- KPI cards;
- banner-card principal;
- Notas como pestaña primaria;
- Historial como pestaña primaria.

Notas internas deben permanecer deferidas hasta confirmación del cliente; no borrar backend si existe.

---

# 11. Pagos — P0

## Nueva navegación

```text
Cartera
Movimientos
Comprobantes
```

CTA persistente:

```text
Registrar abono
```

No mantener `Resumen` como dashboard separado.

---

# 12. Resumen financiero actual — ELIMINAR COMO TAB

El resumen actual muestra contratado/recaudado/pendiente/vencido, porcentajes, distribución, barra y vencimientos críticos.

Conservar solo lo útil, integrado arriba de Cartera:

```text
$482,500 cobrado    $86,000 pendiente    $12,500 vencido
```

No crear una pantalla analítica separada para ello.

---

# 13. Cartera — P0 / CASI BIEN

## Tabla objetivo

```text
Folio
Graduado
Abonado
Saldo
Próximo mínimo
Fecha
Estado
```

Fila clicable → expediente.

Acción secundaria:

```text
Abonar
```

## Quitar

- avatar con iniciales;
- `Total pendiente en vista` salvo modo corte/reporte;
- exceso de botones de filtro.

---

# 14. Registrar abono — P0 / CORRECCIÓN FUNCIONAL UX

El operador NO debe estar obligado a elegir una mensualidad exacta.

La regla de negocio permite cubrir mínimo o una cantidad mayor.

## Flujo objetivo

```text
Registrar abono

GR-00429
Andrea Martínez

Saldo                    $6,000
Mínimo actual            $2,500

Monto recibido
[ $____________ ]

Método
Efectivo | Transferencia | Depósito

Fecha
[             ]
```

Si Efectivo:

```text
Recibido por *
```

Si Transferencia/Depósito:

```text
Referencia
Comprobante
```

El backend distribuye el abono contra obligaciones según las reglas financieras. La UI no debe asumir `pago = mensualidad exacta`.

---

# 15. Comprobantes — P0 / MANTENER

La superficie sí responde a una tarea cliente real.

## Default

Mostrar solo `Pendientes de validar`.

Histórico:

```text
Ver historial
```

## Layout

Desktop: lista + evidencia/drawer amplio.  
Mobile/tablet: fila → detalle/bottom sheet.

La imagen/PDF del comprobante debe dominar la vista de revisión.

---

# 16. Conciliación — P0 / DEFER UI

Sacar `Conciliación de Pasarelas` del MVP visible.

Razón:

El modelo actual compara pago recibido contra monto esperado de una cuota y puede marcar como diferencia un pago mayor al mínimo, aunque sea válido.

Conciliación futura debe comparar:

```text
transacción interna ↔ confirmación del gateway/banco
```

No:

```text
monto pagado ↔ monto exacto de mensualidad
```

No eliminar infraestructura futura; ocultar tab y no usarla como gate del MVP.

---

# 17. Mesas / croquis — P0

## Objetivo

Workspace visual, no dashboard.

## Quitar

- aforo total;
- ocupados;
- libres;
- bloqueadas como 4 grandes métricas.

## Composición objetivo desktop

```text
Mesas

[Fondo] [+ Mesa] [Crear varias]      Buscar mesa/persona

┌──────────────────────────────────────────────────────┐
│                                                      │
│                    CROQUIS                           │
│                                                      │
└──────────────────────────────────────────────────────┘

                                 Mesa 12
                                 8 / 10
                                 Andrea
                                 Laura
```

Canvas 75–80%; inspector 20–25%.

Tablet → canvas + drawer.  
Mobile → toolbar flotante + canvas + bottom sheet.

## Requerimiento operativo especial

Agregar filtro/resaltado útil:

```text
Mostrar niños
```

para revisar su ubicación por mesa.

---

# 18. Platillos ADMIN — P0

## Objetivo

Atender opciones especiales, pendientes y correcciones administrativas.

## Header compacto

```text
Normal 126     Vegetariano 8     Vegano 4     Sin elegir 4
```

No grandes bloques/KPIs.

## Tabla

```text
Persona
Graduado
Tipo
Platillo
Mesa
```

Filtros principales:

```text
Todos | Especiales | Pendientes
```

ADMIN puede modificar después del deadline con motivo/auditoría si aplica.

Eliminar copy como:

```text
selecciones conocidas
opción configurada
información nominal disponible
```

---

# 19. Termos ADMIN — P0

## Objetivo

Lista operativa para producción y entrega.

## Eliminar

`ThermoSummary` con 5 grandes estados.

## Pantalla objetivo

```text
Termos

Buscar...
Todos | Por solicitar | Producción | Entregados

Folio | Nombre | Mesa | Grabado | Estado | Entrega
```

## Función prioritaria

Agregar:

```text
Imprimir lista de entrega
```

Con columnas:

```text
Mesa
Folio
Nombre
Personalización
Firma de recibido
```

Esta salida es parte de la operación del día del evento.

---

# 20. Reportes — P0 / REHACER

## Problema

Actualmente existen filtros múltiples, periodos y una cuadrícula de familias de reportes/cards.

## Objetivo

Cortes semanales/mensuales y Excel del evento.

### Pantalla objetivo

```text
Reportes

Escuela
[ Derecho UASLP ▾ ]

Periodo
[ Semanal ] [ Mensual ] [ Personalizado ]

Método
[ Todos ▾ ]

                         Exportar Excel

Total del periodo: $128,400

Fecha       Folio       Nombre      Método       Monto
03 Sep      00429       Andrea      Efectivo     $2,500
03 Sep      00512       Carlos      Transfer.    $1,800
```

### Exportación completa del evento

Debe poder incluir:

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

## Eliminar

- `DemoFlowPanel`;
- 7 familias en cards;
- cards dentro de cards;
- métricas repetidas por familia.

---

# 21. Configuración — P0 / REHACER

## Objetivo

Formulario continuo y editable, no grid de módulos.

```text
Configuración

Evento
Nombre
Escuela
Carrera
Fecha
Salón

Boletos y precios
Adulto      $____
Niño        $____
Sin cena    $____

Plan de pagos
...

Fechas límite
...

Platillos
...

Termo
...

Cancelaciones
Ver política →

[Guardar cambios]
```

Separar con headings + espacio, no cards.

## Eliminar de UI principal

- “planes congelados” como bloque permanente;
- lenguaje `defaults`;
- lifecycle;
- botón prominente de auditoría;
- grid 2 columnas de secciones.

Si un cambio solo aplica a nuevas contrataciones, avisarlo al guardar.

---

# 22. Cancelaciones — P1

## Configuración de política MVP

Mostrar tabla simple de rangos/penalización.

No hacer protagonista:
- ACTIVE/DRAFT/ARCHIVED;
- version tabs;
- publicación/versionado enterprise.

El versionado puede mantenerse en backend.

## Cancelar contrato/graduado

Flujo claro:

```text
Cancelar contrato

Total contratado          $18,500
Pagado                     $9,000
Penalización aplicable       50%
Importe retenido           $9,250
Devolución                    $0

Motivo
[...]

Confirmar cancelación
```

Si hay devolución:

```text
Forma de devolución
Efectivo | Transferencia

Fecha acordada
```

---

# 23. Auditoría — P2 / DEFER DE NAVEGACIÓN PRIMARIA

Mantener logs e infraestructura si ya existen.

Mover UI a:

```text
Más → Historial de cambios
```

o

```text
Expediente → ··· → Ver historial
```

No tab principal del evento.

---

# 24. Rutas globales duplicadas — P0

Revisar/retirar superficies globales que solo redirigen a “Selecciona un evento”:

```text
/admin/graduates
/admin/payments
/admin/thermos
/admin/audit
/admin/more
```

Mantener globales útiles:

```text
/admin
/admin/events
/admin/reports
```

## Oportunidad: `/admin/payments`

Puede reconvertirse en `Cobro rápido global` por folio:

```text
Registrar abono

Número de folio
[ GR-________ ]

Buscar

Andrea Martínez
Derecho 2027
Saldo $6,000

Registrar abono
```

---

# 25. Arquitectura objetivo ADMIN

```text
ADMIN
│
├── Inicio
│   ├── Buscar folio/graduado
│   ├── Registrar abono
│   ├── Comprobantes pendientes
│   └── Eventos
│
├── Eventos
│   └── Evento
│       ├── Resumen
│       ├── Graduados
│       │   └── Expediente
│       ├── Pagos
│       │   ├── Cartera
│       │   ├── Movimientos
│       │   └── Comprobantes
│       ├── Mesas
│       ├── Platillos
│       ├── Termos
│       └── Más
│           ├── Reportes
│           ├── Configuración
│           └── Historial
│
└── Reportes
    ├── Semanal
    ├── Mensual
    └── Exportar evento
```

---

# 26. Prioridad de implementación

## P0 — antes de siguiente demo

1. Limpiar shell (`Showcase`, DemoControls, navegación excesiva).
2. Reducir EventNav.
3. Inicio como bandeja operativa.
4. Simplificar Overview.
5. Simplificar lista Graduados.
6. Rehacer expediente de graduado.
7. Reestructurar Pagos.
8. Corregir `Registrar abono` para monto libre >= mínimo según backend.
9. Ocultar Conciliación del MVP.
10. Croquis sin KPIs y canvas dominante.
11. Platillos orientado a especiales/pendientes.
12. Termos orientado a producción/entrega.
13. Reportes según cortes/exportaciones reales.
14. Configuración sin cards.
15. Retirar rutas/superficies duplicadas.

## P1

16. Simplificar creación de evento.
17. Simplificar política de cancelación.
18. Cobro rápido global por folio.
19. Responsive tablet/mobile específico.

## P2

20. Auditoría fuera de navegación primaria.
21. Notas/funciones no confirmadas solo cuando cliente las valide.

---

# 27. Criterios de aceptación ADMIN

Una pantalla ADMIN NO está terminada si:

- comienza con KPIs cuando la tarea principal es operar;
- replica navegación que ya existe arriba;
- usa más de 6 tabs de contexto sin agrupación;
- una tabla móvil depende únicamente de scroll horizontal;
- existen cards por cada configuración/métrica/mesa/reporte;
- aparecen `Showcase`, controles demo o lenguaje técnico;
- la pantalla expone funciones no requeridas como protagonistas;
- una propietaria necesita abrir 3 niveles para registrar un abono o revisar comprobante;
- el croquis ocupa menos espacio que sus métricas;
- Reportes no produce directamente los cortes/exportaciones requeridos;
- la UI obliga a asociar un abono a una mensualidad exacta cuando el negocio permite pagar más del mínimo.
