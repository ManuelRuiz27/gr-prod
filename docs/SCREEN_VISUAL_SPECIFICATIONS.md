# Plataforma GR — Especificaciones Visuales por Pantalla

**Documento:** `SCREEN_VISUAL_SPECIFICATIONS.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline visual de pantallas  
**Fecha:** 31 de agosto de 2026  
**Fuentes:** `UX_FLOWS.md`, `UI_DESIGN_SYSTEM.md`, `ROLES_PERMISSIONS.md`, `SRS.md`  
**Propósito:** Traducir flujos aprobados en jerarquía visual, componentes, estados y responsive sin modificar reglas de negocio.

---

# 1. Convenciones

Cada especificación usa:

```text
VS-[ROL]-[DOMINIO]-[NÚMERO]
```

Toda pantalla debe contemplar cuando aplique:

```text
READY
LOADING
EMPTY
ERROR
ACTION_SUCCESS
DISABLED/LOCKED
RESPONSIVE
```

La UI no inventa estados adicionales de negocio.

---

# 2. Shell ADMIN

## VS-A-SHELL-001 — Application shell

**Objetivo:** sostener operación intensiva sin perder contexto.

### Estructura

- sidebar persistente en desktop;
- topbar con contexto y cuenta;
- área de contenido con max-width operativo;
- navegación global separada de navegación contextual del evento;
- breadcrumbs solo cuando reduzcan ambigüedad.

### Navegación global

```text
Inicio
Eventos
Graduados
Pagos
Reportes
Más
```

### Navegación contextual de evento

```text
Resumen
Graduados
Pagos
Mesas
Platillos
Termos
Reportes
Configuración
Auditoría
```

### Responsive

- >= 1280: sidebar completa;
- 1024–1279: sidebar compacta permitida;
- < 1024: drawer de navegación; funcional, aunque ADMIN sigue siendo desktop-first.

---

# 3. Shell GRADUATE

## VS-G-SHELL-001 — Application shell

**Objetivo:** experiencia mobile-first guiada y celebratoria sin ruido.

### Estructura

- topbar simple;
- card/contexto del evento;
- contenido vertical;
- navegación inferior en móvil;
- safe areas y targets táctiles adecuados.

### Navegación primaria

```text
Inicio
Mi grupo
Pagos
Más
```

Rutas secundarias:

```text
Contrato
Mesa
Platillos
Termo
Notificaciones
Perfil
```

### Responsive

- móvil es baseline;
- tablet aumenta whitespace y ancho de cards;
- desktop centra contenido y evita estirar formularios de lectura.

---

# 4. ADMIN — Login

## VS-A-AUTH-001

### Objetivo
Acceso sobrio, institucional y premium.

### Composición

- marca/título;
- panel de login;
- correo;
- contraseña;
- CTA primario;
- recuperación.

### Dirección
Fondo oscuro, detalle metálico/dorado mínimo. Sin animaciones decorativas continuas.

---

# 5. ADMIN — Dashboard global

## VS-A-DASH-001

### Objetivo
Comprender salud global en menos de 10 segundos.

### Jerarquía

1. título/contexto;
2. KPIs;
3. alertas accionables;
4. eventos recientes/activos;
5. pagos por validar / vencidos;
6. actividad reciente cuando exista.

### KPI mínimos

```text
Eventos activos
Graduados
Cobrado
Pendiente
Vencido
```

### Componentes

- `PageHeader`;
- `KpiCard`;
- `AlertCard`;
- tabla/listado de eventos;
- accesos rápidos.

### Estados

- sin eventos: explicar y CTA crear evento;
- sin alertas: no ocupar gran espacio;
- loading: skeleton por bloques;
- error parcial: conservar bloques que sí cargaron.

---

# 6. ADMIN — Eventos

## VS-A-EVT-001 — Listado

### Componentes

- search;
- filtros por estado;
- CTA `Crear evento`;
- tabla.

### Columnas prioritarias

```text
Evento
Escuela
Fecha
Estado
Graduados
Cobrado
Pendiente
Acciones
```

En ancho reducido ocultar primero métricas secundarias, no nombre/estado/fecha.

---

## VS-A-EVT-002 — Crear/editar evento

### Patrón
Wizard o secciones progresivas.

### Secciones

```text
Información general
Escuela / carrera / generación
Productos y precios
Plan de pagos
Pago inicial e hitos
Fechas límite
Mora / penalización tardía
Política de cancelación
Platillos
Termo
Revisión
```

### Reglas visuales

- una sección compleja por paso;
- progreso visible;
- summary lateral/compacto en desktop;
- errores inline;
- no representar defaults editables como si alteraran contratos frozen.

---

## VS-A-EVT-003 — Resumen del evento

### Módulos

- identidad/estado del evento;
- KPIs financieros;
- cartera;
- ocupación de mesas;
- platillos pendientes;
- termos;
- comprobantes pendientes;
- accesos contextuales.

El estado del evento debe ser visible sin dominar toda la página.

---

# 7. ADMIN — Graduados

## VS-A-GRAD-001 — Listado

### Objetivo
Buscar y operar rápidamente expedientes.

### Filtros

```text
estado financiero
mesa
platillos
termo
membresía
comprobante pendiente
```

### Columnas prioritarias

```text
Folio
Nombre
Teléfono
Mesa/resumen
Total
Abonado
Saldo
Estado
Acciones
```

### Interacción

Fila abre expediente; acciones peligrosas no deben vivir como iconos ambiguos sin label/tooltip.

---

## VS-A-GRAD-002 — Expediente

### Objetivo
Una sola vista contextual del graduado sin convertirla en una página infinita desordenada.

### Header

- nombre;
- folio;
- evento;
- estado financiero/membresía;
- acciones principales.

### Secciones/tabs

```text
Resumen
Contrato
Grupo / productos
Pagos
Mesa
Platillos
Termo
Notas
Historial
```

### Acciones

- registrar pago;
- revisar comprobante;
- reasignar mesa;
- override platillo;
- cancelación/refund según flujo.

Acciones críticas requieren modal/step de revisión con cifras claras.

---

# 8. ADMIN — Pagos

## VS-A-PAY-001 — Cartera / pagos

### Jerarquía

1. resumen de cartera;
2. filtros;
3. tabla;
4. acciones.

### Filtros

```text
al corriente
próximos
vencidos
método
fecha
escuela/evento
```

---

## VS-A-PAY-002 — Registrar pago manual

### Orden de campos

```text
Método
Monto
Fecha
Quién recibió (si aplica)
Referencia
Evidencia
Notas
Resumen
Confirmar
```

Método controla campos condicionales. Mostrar saldo antes/después como preview informativo calculado por backend cuando exista.

---

## VS-A-PROOF-001 — Pagos por validar

### Layout desktop

- tabla/listado izquierda/centro;
- preview de evidencia en drawer/panel;
- resumen financiero;
- aprobar/rechazar.

### Columnas

```text
Folio
Graduado
Monto reportado
Método
Fecha
Referencia
Estado
Acción
```

### Aprobar
CTA claro; advertir que aprobar generará movimiento financiero.

### Rechazar
Motivo obligatorio visible; no usar un simple icono rojo sin contexto.

---

# 9. ADMIN — Cancelaciones

## VS-A-CANPOL-001 — Editor de política

### Objetivo
Administrar rangos dinámicos sin permitir configuración ambigua.

### Estructura

- encabezado con versión/estado;
- tabla editable de rangos;
- validación inmediata;
- preview textual;
- CTA validar/publicar.

### Columnas

```text
Desde días antes
Hasta días antes
Penalización %
Acciones
```

Último rango puede representarse como `Sin límite`.

Errores de hueco/traslape deben señalar las filas involucradas.

Una policy `ACTIVE` es read-only y ofrece `Crear nueva versión`.

---

## VS-A-CAN-001 — Simulador/cotización de cancelación

### Jerarquía financiera

```text
Total contratado
Total pagado
Días antes del evento
Rango aplicado
Penalización
Retenido
Reembolso estimado
Saldo remanente
```

### Regla visual
El resultado no debe parecer definitivo hasta confirmar/revalidar. Mostrar identificador/fecha de quote cuando sea útil.

### CTA

- secundario: cancelar flujo;
- primario destructivo: `Confirmar cancelación`;
- usar danger, no dorado celebratorio.

---

# 10. ADMIN — Mesas

## VS-A-SEAT-001 — Croquis

### Layout

- canvas central;
- toolbar compacta;
- panel de inventario/detalle;
- resumen de ocupación.

### Estados de mesa

Deben distinguirse por color + label/tooltip/forma de borde.

### Interacción

- drag fluido;
- persistencia al terminar drag;
- selección clara;
- zoom/pan;
- panel de asignaciones por persona.

### Accesibilidad
Acompañar canvas con listado/tabular que permita localizar mesa y asignaciones sin depender solo del canvas.

---

# 11. ADMIN — Platillos

## VS-A-MEAL-001

### KPI

```text
Total personas
Pendientes
Por opción
```

### Tabla

```text
Folio
Graduado/persona
Tipo de persona
Platillo
Estado
Acción
```

Overrides posteriores al deadline muestran motivo.

---

# 12. ADMIN — Termos

## VS-A-TH-001

### Resumen
Estados por conteo.

### Tabla

```text
Folio
Graduado
Mesa
Estado
Personalización
Entrega
Acción
```

`DELIVERED` no usa una gran decoración celebratoria en tabla; usar badge y detalle.

---

# 13. ADMIN — Reportes y cortes

## VS-A-REP-001

### Estructura

- filtros superiores;
- KPIs;
- visualización/tablas;
- exportar.

### Filtros

```text
Evento
Escuela
Fecha/rango
Método
Estado
```

### Cortes

Tabs o selector:

```text
Diario
Semanal
Mensual
```

El detalle debe reconciliarse visualmente con el total; no ocultar movimientos detrás de charts decorativos.

---

# 14. ADMIN — Auditoría

## VS-A-AUD-001

### Vista
Tabla o timeline administrativo legible.

### Mostrar

```text
Actor/origen
Acción en lenguaje natural
Entidad/contexto
Fecha/hora
Motivo
Detalle antes/después cuando aplique
```

No mostrar JSON crudo por defecto.

---

# 15. GRADUATE — Acceso/registro

## VS-G-AUTH-001

### Dirección
La pantalla más ceremonial del flujo inicial, sin sacrificar claridad.

### Módulos

- contexto del evento;
- formulario corto;
- login alternativo;
- ayuda.

No usar video pesado de fondo.

---

# 16. GRADUATE — Contrato

## VS-G-CON-001

### Objetivo
Leer y aceptar con seriedad, no como checkbox escondido.

### Jerarquía

1. evento + folio cuando exista;
2. resumen contractual/financiero;
3. términos;
4. versión/política aplicable en lenguaje comprensible;
5. aceptación;
6. CTA.

### Estado aceptado
Modo lectura, fecha de aceptación y folio destacados con sobriedad.

---

# 17. GRADUATE — Inicio

## VS-G-HOME-001

### Objetivo
Responder inmediatamente:

```text
¿Qué sigue?
¿Cuánto debo?
¿Cuándo pago?
¿Qué tengo pendiente de mi graduación?
```

### Módulos

- card del evento;
- resumen financiero;
- próximo pago;
- progreso;
- grupo/lugares;
- mesa;
- platillos;
- termo;
- alertas.

### CTA dinámico
Solo derivado del flujo real: pagar, completar mesa, platillos, personalizar termo, etc.

### Liquidado
Permite acento celebratorio dorado + success, corto y no invasivo.

---

# 18. GRADUATE — Mi grupo / productos

## VS-G-GROUP-001

### Módulos

- lugares/productos contratados;
- lista nominal;
- tipo Adulto/Niño/Sin cena según catálogo;
- agregar producto cuando esté permitido;
- impacto financiero mediante quote.

Antes de confirmar compra adicional mostrar:

```text
precio
nuevo total
pago requerido/catch-up
```

---

# 19. GRADUATE — Pagos

## VS-G-PAY-001 — Centro de pagos

### Jerarquía

```text
Saldo
Próximo pago
Estado
Calendario
Historial
Métodos
```

### CTAs

- `Pagar ahora`;
- `Reportar transferencia o depósito` como secundario.

No usar términos técnicos del proveedor como foco de la UX.

---

## VS-G-PROOF-001 — Reportar transferencia/depósito

### Campos

```text
Método
Monto
Referencia
Fecha declarada cuando aplique
Comprobante
```

### Confirmación
Debe explicar claramente:

```text
Enviar comprobante ≠ pago confirmado
```

### Estados posteriores

```text
Pendiente de validación
Aprobado
Rechazado
```

Rechazado muestra motivo seguro y siguiente acción.

---

# 20. GRADUATE — Mesa

## VS-G-SEAT-001

### Precondición visual
Si no es financieramente elegible, mostrar locked state y razón comprensible; no renderizar CTA de confirmación activo.

### Layout

- croquis read-only/selectable;
- lista de integrantes;
- mesa por persona;
- disponibilidad agregada;
- resumen antes de guardar.

### Privacidad
Nunca mostrar nombres de terceros.

### Móvil
La lista de personas y selector no debe depender de precisión de tocar elementos pequeños en canvas; ofrecer selección por lista/drawer.

---

# 21. GRADUATE — Platillos

## VS-G-MEAL-001

Lista de integrantes con selector individual.

Mostrar deadline de manera preventiva.

Cuando esté cerrado:

- read-only;
- explicación;
- contacto/ayuda si está definido en UX.

---

# 22. GRADUATE — Termo

## VS-G-TH-001

### Estados

```text
Bloqueado
Disponible
Solicitado
En producción
Entregado
```

### Bloqueado
Mostrar progreso financiero y regla comprensible, no fórmula técnica.

### Disponible
Tratamiento premium/celebratorio moderado + CTA de personalización.

### En producción
Claramente read-only.

---

# 23. GRADUATE — Más / Perfil / Notificaciones

## VS-G-MORE-001

Menú simple, sin convertirlo en cajón de funcionalidades no documentadas.

## VS-G-PROFILE-001
Campos personales permitidos únicamente.

## VS-G-NOT-001
Notificaciones agrupables por fecha/tipo; unread visible sin depender solo de color.

---

# 24. Criterios transversales

## VS-X-001 — Una acción dominante
Cuando exista siguiente acción natural, máximo una CTA primaria dominante por contexto.

## VS-X-002 — Financial clarity
Montos usan alineación/formatos consistentes y `Inter`; no serif decorativa para cifras densas.

## VS-X-003 — Error recovery
Todo error accionable indica qué ocurrió en lenguaje natural y qué puede hacer el usuario.

## VS-X-004 — Loading
Skeletons reproducen jerarquía; evitar layouts que salten drásticamente.

## VS-X-005 — Empty states
No usar páginas vacías con solo “No data”.

## VS-X-006 — Responsive
No ocultar acciones críticas ni información financiera necesaria por breakpoint.

## VS-X-007 — Fixtures
Los datos demo pueden ilustrar layout, pero no crean reglas ni estados nuevos.

## VS-X-008 — Design review
Toda pantalla final debe compararse contra `UI_DESIGN_SYSTEM.md`, su `VS-*`, el `UX-*` asociado y los `AC-UI-*` antes de aprobarse.