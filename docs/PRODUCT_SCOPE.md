# PRODUCT_SCOPE.md

# Plataforma GR — Alcance del Producto

**Documento:** `PRODUCT_SCOPE.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline de alcance para documentación e implementación  
**Fecha:** 24 de agosto de 2026  
**Propósito:** Definir de forma inequívoca qué producto se construirá, para quién, qué capacidades incluye y qué elementos quedan fuera del alcance.

---

## 1. Propósito del documento

Este documento establece la **frontera funcional del producto Plataforma GR**.

Su función es servir como fuente de verdad para:

- levantamiento y cierre de requisitos;
- elaboración del SRS;
- definición de reglas de negocio;
- diseño de arquitectura;
- contratos API;
- diseño y validación UX/UI;
- desarrollo frontend y backend;
- QA;
- planeación del roadmap;
- control de cambios de alcance.

Este documento **no sustituye** al SRS, las reglas de negocio, el modelo de datos ni los contratos API.

Ante una contradicción entre una implementación futura y este documento, debe considerarse que la implementación está fuera de alcance hasta que exista una actualización formal de la documentación.

---

## 2. Definición del producto

**Plataforma GR** es una plataforma web para la administración operativa y financiera de eventos de graduación.

El sistema centraliza la relación entre:

1. la empresa organizadora del evento;
2. los eventos de graduación administrados por dicha empresa;
3. los graduados registrados en cada evento;
4. los compromisos financieros de cada graduado;
5. los lugares contratados por cada graduado;
6. la selección de mesa;
7. la selección de platillos;
8. la gestión del termo;
9. los reportes administrativos y financieros.

La plataforma busca sustituir procesos actualmente gestionados mediante hojas de cálculo, mensajes, comprobantes enviados manualmente, listas impresas, croquis físicos y seguimiento financiero fragmentado.

---

## 3. Modelo del producto

Plataforma GR es un sistema:

- **single-tenant**;
- operado por una sola empresa;
- capaz de administrar múltiples eventos simultáneamente;
- capaz de admitir múltiples administradores;
- capaz de admitir múltiples graduados conectados concurrentemente.

No es un SaaS multiempresa.

No existe una jerarquía de organizaciones, planners, salones, agencias o tenants dentro del producto.

La estructura conceptual principal es:

```text
Plataforma GR
    │
    ├── Administradores
    │
    └── Eventos
          │
          ├── Graduados
          │     ├── Grupo / lugares
          │     ├── Mesa
          │     ├── Platillos
          │     ├── Plan de pagos
          │     └── Termo
          │
          ├── Mesas / Croquis
          ├── Pagos
          ├── Platillos
          ├── Termos
          └── Reportes
```

---

## 4. Objetivo principal

Permitir que la empresa operadora de graduaciones administre de forma centralizada y verificable:

- eventos;
- graduados;
- lugares;
- mesas;
- pagos;
- vencimientos;
- platillos;
- termos;
- cortes;
- reportes;
- cambios administrativos;
- trazabilidad de operaciones críticas.

Simultáneamente, el graduado debe contar con una experiencia simple para consultar y gestionar únicamente la información que le corresponde.

---

## 5. Objetivos de negocio

Plataforma GR debe permitir:

1. reducir trabajo administrativo manual;
2. disminuir errores en seguimiento de pagos;
3. conocer en tiempo real la cartera de cada evento;
4. evitar sobreasignación de mesas;
5. centralizar el estado operativo de cada graduado;
6. reducir intercambios manuales de mensajes para consultas recurrentes;
7. mejorar la trazabilidad de pagos y cambios administrativos;
8. facilitar la generación de cortes y reportes;
9. ofrecer al graduado autoservicio controlado;
10. soportar múltiples eventos simultáneos sin mezclar información.

---

## 6. Usuarios y roles

El sistema tendrá únicamente dos roles funcionales:

### 6.1 ADMIN

Usuario administrativo de la empresa operadora.

Todos los administradores pertenecen al mismo rol lógico:

```text
ADMIN
```

Puede haber múltiples cuentas ADMIN nominales.

No existen subroles administrativos en el alcance actual.

El ADMIN puede operar información de todos los eventos y graduados según las reglas del sistema.

### 6.2 GRADUATE

Graduado asociado a un evento.

Cada cuenta GRADUATE puede consultar y operar únicamente la información correspondiente a su propio registro y a las funciones expresamente habilitadas para su evento.

El rol lógico será:

```text
GRADUATE
```

---

## 7. Fuera del modelo de roles

No forman parte del alcance:

- Super Admin;
- Owner;
- Planner;
- Organizer;
- Staff;
- Scanner;
- Hostess;
- Coordinador;
- Cajero;
- Soporte;
- permisos personalizados;
- RBAC configurable por usuario;
- organizaciones;
- equipos;
- tenants.

Si en el futuro se requiere alguno de estos conceptos, deberá tratarse como ampliación formal de alcance.

---

## 8. Alcance funcional — Administrador

### 8.1 Autenticación administrativa

Incluye:

- inicio de sesión;
- cierre de sesión;
- recuperación de contraseña;
- múltiples cuentas administrativas;
- administración básica de cuentas ADMIN.

No incluye configuración granular de permisos.

### 8.2 Dashboard general

Debe permitir conocer el estado global de la operación.

Indicadores mínimos:

- eventos activos;
- graduados registrados;
- total recaudado;
- saldo pendiente;
- saldo vencido;
- alertas operativas relevantes.

Debe permitir acceder rápidamente a eventos y tareas que requieren atención.

### 8.3 Gestión de eventos

El ADMIN puede:

- crear eventos;
- editar configuración;
- consultar eventos;
- gestionar múltiples eventos simultáneamente;
- cerrar eventos;
- reabrir cuando la regla de negocio lo permita;
- finalizar eventos;
- cancelar eventos.

Estados funcionales previstos:

```text
DRAFT
OPEN
CLOSED
FINALIZED
CANCELLED
```

La definición exacta de transiciones se documentará en `BUSINESS_RULES.md`.

### 8.4 Configuración del evento

Cada evento puede configurar al menos:

- nombre;
- fecha;
- lugar;
- capacidad;
- condiciones financieras;
- calendario de pagos;
- fechas límite;
- periodo de gracia;
- porcentaje requerido para desbloquear el termo;
- política de cancelación;
- opciones de platillo disponibles.

Las condiciones financieras aplicables a un graduado deben congelarse conforme a las reglas de negocio definidas para evitar modificaciones retroactivas no controladas.

### 8.5 Gestión de graduados

El ADMIN puede:

- consultar graduados de un evento;
- buscar y filtrar;
- consultar expediente;
- revisar lugares contratados;
- revisar integrantes del grupo;
- consultar mesa;
- consultar platillos;
- consultar estado financiero;
- consultar termo;
- realizar cambios administrativos autorizados;
- cancelar la participación de un graduado.

Las operaciones sensibles deberán quedar auditadas.

### 8.6 Gestión de lugares e integrantes

El sistema debe soportar:

- cantidad de lugares contratados por graduado;
- integrantes nominales del grupo;
- incremento de lugares sujeto a capacidad y reglas del evento;
- reducción de lugares mediante flujo administrativo;
- control de fechas límite;
- actualización del impacto financiero cuando corresponda.

La relación exacta entre lugares y obligaciones financieras se documentará en `BUSINESS_RULES.md` y `FINANCIAL_DOMAIN.md`.

---

## 9. Croquis y selección de mesas

### 9.1 Propósito

El módulo de croquis de Plataforma GR tiene un objetivo deliberadamente sencillo:

> Representar visualmente la distribución de mesas de un evento y permitir asignar el grupo de un graduado a una mesa con capacidad suficiente.

No es una herramienta CAD.

No busca reproducir arquitectónicamente el recinto.

No requiere reconocimiento automático de imágenes.

### 9.2 Croquis administrativo

El ADMIN podrá:

- crear mesas;
- mover mesas mediante drag & drop;
- numerarlas;
- definir capacidad;
- cambiar capacidad;
- duplicarlas;
- bloquearlas;
- eliminarlas cuando las reglas de integridad lo permitan;
- utilizar una imagen del plano como referencia visual;
- consultar ocupación;
- consultar disponibilidad.

### 9.3 Formas soportadas en el MVP

La interfaz de Plataforma GR soportará inicialmente:

```text
SQUARE
ROUND
```

Es decir:

- mesa cuadrada;
- mesa circular.

El motor gráfico puede conservar soporte técnico adicional reutilizado de otros proyectos, pero dichas formas no forman parte del alcance funcional del MVP hasta que se aprueben explícitamente.

### 9.4 Capacidad configurable

Cada mesa tiene una capacidad independiente.

Ejemplo:

```text
Mesa 24
Forma: cuadrada
Capacidad: 10
Ocupados: 2
Disponibles: 8
```

Las mesas no tienen que compartir una capacidad uniforme.

### 9.5 Unidad de asignación

La unidad de selección es:

```text
GRUPO DEL GRADUADO → MESA
```

No existe selección de silla individual.

No existe `seat_id` en el flujo funcional de GR.

Un grupo puede asignarse a una mesa si existe capacidad suficiente.

### 9.6 Grupos divididos

El producto permitirá que un grupo sea dividido entre mesas cuando la operación lo requiera.

La representación final de esta regla y su UX específica se documentarán en `BUSINESS_RULES.md` y `SEATING_MAP.md`.

### 9.7 Imagen de referencia

El ADMIN podrá utilizar:

- JPG;
- PNG;
- PDF convertido a imagen;

como capa de referencia del croquis.

La imagen:

- no representa la fuente definitiva de datos;
- no necesita reconocimiento automático;
- puede permanecer bloqueada;
- sirve únicamente como guía para colocar las mesas operativas.

### 9.8 Reutilización tecnológica

Plataforma GR reutilizará conceptos y componentes del módulo de croquis de:

```text
Soft-Monkey_InvitacionesPremium
```

principalmente:

- canvas basado en React Konva;
- zoom;
- pan;
- drag & drop;
- selección;
- render de mesas;
- coordenadas normalizadas;
- cálculo visual de ocupación;
- capas gráficas cuando sean aplicables.

La reutilización es de **infraestructura gráfica**, no del dominio funcional completo de InvitacionesPremium.

### 9.9 Funciones del croquis excluidas

No forman parte del alcance inicial de Plataforma GR:

- asignación individual de sillas;
- mesas VIP;
- mesa de novios;
- herraduras;
- polígonos personalizados;
- zonas complejas;
- reconocimiento automático de mesas;
- detección automática mediante IA;
- scanner/check-in;
- RSVP;
- mesas premium;
- categorías comerciales de mesa.

---

## 10. Gestión de platillos

El sistema permitirá definir opciones de platillo por evento.

El graduado podrá seleccionar un platillo para cada integrante de su grupo dentro del periodo permitido.

El ADMIN podrá:

- revisar selecciones;
- consultar pendientes;
- obtener totales por opción;
- modificar selecciones cuando tenga autorización;
- realizar cambios posteriores al cierre dejando motivo y trazabilidad.

Las opciones de platillo son configurables por evento.

Los valores utilizados en prototipo —Tradicional, Vegetariano y Vegano— son datos demo y no un catálogo global inmutable.

---

## 11. Gestión financiera

La gestión financiera es uno de los módulos centrales de Plataforma GR.

El modelo conceptual será:

```text
PaymentPlan
    │
    └── Installment[]
            │
            └── PaymentTransaction[]
```

Se debe separar:

- obligación financiera;
- vencimiento;
- intento de pago;
- transacción confirmada;
- pago manual;
- ajuste;
- reembolso.

### 11.1 Plan de pagos

El evento define condiciones financieras.

El plan aplicable al graduado contiene:

- total contratado;
- pago inicial cuando aplique;
- mensualidades;
- vencimientos;
- saldo pagado;
- saldo pendiente;
- saldo vencido.

### 11.2 Pagos anticipados

Se permitirán pagos adelantados.

Un excedente aplicable podrá cubrir obligaciones futuras según las reglas del dominio financiero.

### 11.3 Pagos parciales

En el alcance inicial:

> una obligación individual no se considera parcialmente pagada.

La política exacta de imputación se documentará en `FINANCIAL_DOMAIN.md`.

### 11.4 Pagos manuales

El ADMIN podrá registrar pagos realizados fuera de la pasarela mediante:

- efectivo;
- transferencia.

Debe poder registrarse:

- concepto;
- monto;
- fecha;
- referencia o nota;
- evidencia cuando corresponda.

### 11.5 Pagos confirmados

Un pago confirmado no debe editarse ni eliminarse directamente.

Correcciones posteriores deberán registrarse mediante movimientos independientes:

- ajuste;
- reembolso.

Esto preserva trazabilidad financiera.

---

## 12. Pasarela de pagos

### 12.1 Proveedor primario

La pasarela primaria será:

**Mercado Pago**

Modalidad prevista:

**Checkout Pro**

La experiencia principal utilizará redirección al checkout preconstruido del proveedor.

Plataforma GR no capturará directamente los datos completos de tarjeta para este flujo.

### 12.2 Confirmación financiera

La confirmación de pago debe realizarse desde backend mediante notificaciones y validación con el proveedor.

El retorno del navegador no será considerado por sí solo evidencia definitiva de pago.

### 12.3 Proveedor secundario

**OpenPay** permanecerá como integración secundaria/alternativa.

No constituye el flujo de pago principal del MVP.

### 12.4 Independencia del proveedor

Las obligaciones financieras pertenecen al dominio de Plataforma GR.

No deben depender estructuralmente de Mercado Pago u OpenPay.

Esto permitirá cambiar o ampliar proveedores sin reconstruir el modelo financiero.

---

## 13. Cartera y vencimientos

El ADMIN debe poder identificar:

- graduados al día;
- próximos vencimientos;
- pagos vencidos;
- saldo pendiente;
- cartera total por evento.

El sistema podrá manejar un periodo de gracia configurable.

En el alcance inicial:

- no existen recargos automáticos;
- el atraso genera estado de vencimiento;
- cualquier penalización futura requerirá cambio formal de alcance/reglas.

---

## 14. Conciliación

El sistema incluirá una vista administrativa de conciliación para identificar discrepancias entre:

- obligaciones del plan;
- pagos registrados;
- pagos confirmados por proveedor.

Estados visibles podrán incluir:

- sin diferencias;
- revisión necesaria;
- pendiente de confirmación.

No se expondrán detalles técnicos innecesarios al usuario administrativo.

---

## 15. Gestión del termo

Cada evento podrá definir un porcentaje de avance financiero requerido para desbloquear el termo.

Estados funcionales:

```text
LOCKED
AVAILABLE
REQUESTED
IN_PRODUCTION
DELIVERED
```

Flujo:

```text
Bloqueado
→ Disponible
→ Solicitado
→ En producción
→ Entregado
```

El porcentaje de desbloqueo es configurable por evento.

Una vez que el ADMIN marque el termo como `IN_PRODUCTION`, el graduado ya no podrá modificar su personalización.

---

## 16. Reportes

El ADMIN tendrá acceso como mínimo a:

### 16.1 Reporte financiero

- total contratado;
- total recaudado;
- pendiente;
- vencido;
- movimientos.

### 16.2 Cartera

- saldo por graduado;
- próximo vencimiento;
- estado.

### 16.3 Mesas

- mesas;
- capacidad;
- ocupación;
- disponibilidad;
- asignaciones.

### 16.4 Platillos

- total por opción;
- pendientes;
- selección por graduado/grupo.

### 16.5 Termos

- bloqueados;
- disponibles;
- solicitados;
- en producción;
- entregados.

### 16.6 Exportaciones

El alcance prevé:

- Excel;
- CSV;
- PDF resumen.

La definición exacta de cada layout se realizará en documentos posteriores.

---

## 17. Auditoría

Las operaciones administrativas críticas deben generar trazabilidad.

Como mínimo:

- cambios de mesa;
- cambios de lugares;
- modificaciones financieras;
- pagos manuales;
- ajustes;
- reembolsos;
- cambios de platillo después del cierre;
- cambios de estado del termo;
- cancelación de graduado;
- cambios críticos del evento.

El historial debe identificar:

- administrador;
- acción;
- fecha;
- entidad afectada;
- motivo cuando corresponda.

No debe exponerse al ADMIN como un log técnico de bajo nivel.

---

## 18. Alcance funcional — Graduado

### 18.1 Acceso y cuenta

Incluye:

- acceso mediante mecanismo asociado a evento;
- registro;
- inicio de sesión;
- recuperación de contraseña;
- cierre de sesión;
- múltiples dispositivos permitidos.

El graduado no selecciona roles.

### 18.2 Inicio

Debe mostrar un resumen operativo de su graduación:

- evento;
- fecha;
- lugar;
- avance financiero;
- saldo pendiente;
- próximo vencimiento;
- lugares;
- mesa;
- platillos;
- estado del termo;
- alertas relevantes.

### 18.3 Mi grupo

El graduado puede:

- consultar sus lugares;
- consultar integrantes;
- agregar integrantes cuando la regla lo permita;
- solicitar modificaciones sujetas a capacidad y fecha límite.

No puede consultar información de otros graduados.

### 18.4 Mi mesa

El graduado puede:

- consultar croquis;
- consultar disponibilidad de mesas;
- seleccionar una mesa;
- confirmar selección;
- cambiar mesa dentro del periodo permitido.

El ADMIN puede realizar cambios posteriores con auditoría.

### 18.5 Platillos

El graduado puede seleccionar platillo para los integrantes de su grupo dentro del periodo permitido.

Después del cierre:

- consulta únicamente;
- cambios requieren intervención administrativa.

### 18.6 Mis pagos

El graduado puede consultar:

- total contratado;
- total pagado;
- saldo pendiente;
- mensualidades;
- vencimientos;
- historial;
- estado de cada obligación.

Puede iniciar un pago mediante los proveedores habilitados.

### 18.7 Mi termo

El graduado puede:

- consultar progreso para desbloqueo;
- solicitar el termo cuando esté disponible;
- registrar la personalización permitida;
- consultar su estado.

No puede modificar la personalización una vez en producción.

### 18.8 Resumen

El graduado contará con una vista consolidada de:

- grupo;
- mesa;
- platillos;
- pagos;
- termo;
- estado general de preparación.

---

## 19. Notificaciones

El MVP contempla:

- notificaciones dentro de la plataforma;
- correo electrónico.

Casos relevantes:

- recordatorios de pago;
- pagos confirmados;
- pagos pendientes;
- pagos vencidos;
- cambios importantes del evento;
- cambios de mesa cuando corresponda;
- disponibilidad del termo;
- cambios de estado del termo.

No se considera WhatsApp automatizado como requisito base del MVP.

---

## 20. Privacidad y aislamiento de datos

El GRADUATE debe acceder únicamente a su información autorizada.

Nunca debe poder consultar:

- otros graduados;
- teléfonos de terceros;
- información financiera ajena;
- configuraciones administrativas;
- IDs internos sensibles;
- credenciales de proveedores;
- configuración global del sistema.

El backend es la autoridad de autorización.

No se confiará en identificadores de evento, graduado o rol enviados por el frontend para determinar permisos.

---

## 21. Concurrencia

La plataforma deberá soportar múltiples usuarios conectados simultáneamente.

Las operaciones críticas deberán validarse en backend.

Casos prioritarios:

- selección de mesa;
- incremento de lugares;
- capacidad global del evento;
- registro de pagos;
- confirmación de pagos;
- cambios administrativos sensibles.

En conflictos de disponibilidad, el backend será la fuente definitiva.

Ejemplo:

```text
Dos graduados intentan ocupar los últimos lugares disponibles.
→ Solo una operación puede confirmar.
→ La otra recibe conflicto.
```

La UX deberá informar el cambio sin exponer detalles técnicos.

---

## 22. Alcance de interfaces

### ADMIN

Enfoque:

```text
Desktop-first
```

Debe funcionar también en tablet.

La experiencia administrativa prioriza:

- visión global;
- tablas;
- filtros;
- búsqueda;
- operación por evento;
- contexto por graduado.

### GRADUATE

Enfoque:

```text
Mobile-first
```

La experiencia prioriza:

- baja carga cognitiva;
- navegación corta;
- lenguaje natural;
- acciones guiadas;
- autoservicio.

---

## 23. Fuera de alcance del MVP

Quedan explícitamente excluidos:

- invitaciones digitales;
- invitaciones premium;
- RSVP;
- control de acceso QR;
- check-in;
- scanner;
- hostess;
- álbum de fotografías;
- venta de fotografías;
- wedding planners;
- salones como usuarios;
- organizaciones;
- multi-tenant;
- marketplace;
- paquetes Premium;
- categorías VIP;
- selección individual de silla;
- reconocimiento automático de croquis;
- CAD;
- facturación electrónica;
- recargos automáticos;
- chatbot;
- chat en vivo;
- aplicación móvil nativa;
- roles personalizados;
- permisos configurables por usuario.

La aparición accidental de alguno de estos conceptos en prototipos o código no lo incorpora al producto.

---

## 24. Fuera de alcance técnico

En el MVP no se requiere:

- microservicios distribuidos;
- arquitectura multi-tenant;
- event sourcing completo;
- motor BPM;
- tiempo real mediante WebSocket como requisito general;
- inteligencia artificial para interpretar croquis;
- captura de tarjetas propia;
- aplicación iOS/Android nativa.

Las decisiones arquitectónicas específicas se documentarán posteriormente.

---

## 25. Dependencias externas

El producto podrá depender de servicios externos para:

- Mercado Pago;
- OpenPay;
- correo electrónico;
- almacenamiento de archivos;
- hosting;
- base de datos;
- observabilidad.

Estas dependencias no deberán convertirse en entidades centrales del dominio.

---

## 26. Datos demo vs reglas de producto

Los prototipos UX/UI utilizan datos de demostración.

Ejemplos:

- Andrea Martínez;
- Graduación Facultad de Derecho 2027;
- Mesa 24;
- $12,500 MXN;
- 5 mensualidades;
- umbral de termo del 70%;
- Tradicional / Vegetariano / Vegano.

Estos valores sirven para demostrar el flujo.

No todos son valores globales inmutables.

La configuración real debe estar determinada por las reglas del evento cuando el requisito así lo establezca.

---

## 27. Principios de producto

### 27.1 Backend como autoridad

El frontend no define:

- disponibilidad definitiva;
- capacidad;
- autorización;
- confirmación financiera.

### 27.2 Trazabilidad sobre edición destructiva

Cuando exista impacto financiero u operativo:

> registrar un nuevo movimiento es preferible a modificar o eliminar la historia.

### 27.3 Lenguaje operativo

La UI debe evitar exponer:

- códigos HTTP;
- nombres de tablas;
- transacciones;
- webhooks;
- estados técnicos;
- IDs internos.

### 27.4 Configurable por evento

Siempre que corresponda, las reglas variables deben pertenecer al evento y no quedar hardcodeadas globalmente.

### 27.5 Simplicidad operativa

Una función no debe incorporar complejidad propia de otros productos si no resuelve una necesidad real de GR.

El croquis simplificado es un ejemplo explícito de este principio.

---

## 28. Documentos derivados

Este documento será complementado, en este orden, por:

1. `BUSINESS_RULES.md`
2. `SRS.md`
3. `ROLES_PERMISSIONS.md`
4. `UX_FLOWS.md`
5. `FINANCIAL_DOMAIN.md`
6. `SEATING_MAP.md`
7. `DATA_MODEL.md`
8. `API_CONTRACTS.md`
9. `NON_FUNCTIONAL_REQUIREMENTS.md`
10. `ACCEPTANCE_CRITERIA.md`
11. `ROADMAP_IMPLEMENTATION.md`

Los documentos derivados deben respetar los límites establecidos en `PRODUCT_SCOPE.md`.

---

## 29. Control de cambios

Cualquier nueva solicitud que introduzca:

- un rol;
- un módulo;
- una entidad de negocio;
- una nueva pasarela;
- una nueva política financiera;
- un nuevo tipo de operación;
- un nuevo canal;
- una ampliación significativa del croquis;

deberá clasificarse como:

```text
CHANGE REQUEST
```

antes de incorporarse a implementación.

---

## 30. Criterio de cierre del alcance

El alcance de producto se considera definido cuando:

- ADMIN y GRADUATE están claramente delimitados;
- los módulos incluidos están identificados;
- las exclusiones están documentadas;
- las reglas variables se derivan a `BUSINESS_RULES.md`;
- el SRS puede elaborarse sin inventar nuevos módulos;
- el equipo de desarrollo puede distinguir claramente entre requisito y mejora futura.

---

## 31. Baseline

Con esta versión se establece como baseline:

```text
PRODUCT_SCOPE_VERSION = 1.0
```

Las decisiones documentadas se consideran vigentes hasta que una actualización posterior de este archivo las sustituya explícitamente.
