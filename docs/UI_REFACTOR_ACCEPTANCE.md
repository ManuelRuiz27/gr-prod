# Plataforma GR — Criterios de Aceptación del Refactor UI v2

**Fecha:** 3 de septiembre de 2026  
**Estado:** Vinculante

## 1. Alcance

Este documento valida exclusivamente el refactor de presentación e interacción. No autoriza cambios en reglas de negocio, contratos API, permisos, cálculos financieros ni modelo de datos.

## 2. Criterios globales

Una pantalla se aprueba solo si:

- conserva funcionalidad existente;
- elimina cards decorativas o contenedores innecesarios;
- no usa `KpiCard` para métricas;
- no repite título/subtítulo/supporting text;
- no usa mosaicos de accesos rápidos;
- no usa términos técnicos innecesarios;
- mantiene una acción primaria clara;
- mantiene estados loading/empty/error/success;
- cumple responsive actual o lo mejora;
- mantiene accesibilidad de teclado/focus/labels;
- no introduce dependencias visuales nuevas sin necesidad.

## 3. ADMIN

### Dashboard

- métricas globales renderizadas inline;
- próximos eventos en lista/tabla sin Card exterior;
- pendientes accionables visibles;
- eliminado bloque de accesos rápidos;
- eliminado texto de versión/módulos;
- CTA `Nuevo evento` visible.

### Eventos

- tabla/lista sin Card exterior;
- fila completa navegable;
- sin botón `Administrar` redundante;
- filtros compactos.

### Evento — Overview

- contexto del evento no se repite;
- pagos y preparación en layout plano;
- pendientes visibles y accionables;
- sin KPI cards.

### Graduados

- tabla/lista como patrón principal;
- detalle por drawer cuando sea viable;
- no cards por persona.

### Pagos

- resumen financiero inline;
- filtros/tabs accionables;
- tabla/lista sin Card exterior;
- detalle/evidencia en drawer.

### Mesas

- canvas ocupa la superficie principal;
- toolbar compacta;
- drawer contextual;
- alternativa accesible al canvas.

### Platillos / Termos

- resumen plano + tabla/lista;
- no cards de estado.

### Reportes

- reportes agrupados por categorías en filas;
- descarga visible;
- no catálogo de cards;
- charts solo si aportan análisis real.

### Configuración

- grupos separados por divisores;
- switches solo para configuración binaria reversible;
- acciones críticas no representadas como switch.

## 4. GRADUATE

### Inicio

- una sola bienvenida;
- sin badge `Graduando` decorativo;
- contexto del evento plano;
- próximo pago y progreso visibles sin Card;
- accesos a Invitados/Mesa/Platillos/Termo como lista simple;
- CTA de pago visible cuando aplica.

### Pagos

- total/pagado/restante visibles;
- próxima cuota visible;
- historial en lista;
- no cards por movimiento.

### Grupo

- lista de personas;
- no cards por persona;
- acción agregar/editar evidente.

### Mesa

- mesa y croquis como protagonistas;
- no información de terceros.

### Platillos

- controles radio/select/segmented según caso;
- target táctil >= 44 px recomendado;
- no cards por opción.

### Termo

- estado, requisito y CTA directos;
- progreso visible cuando esté bloqueado;
- sin Card obligatoria.

### Más / Notificaciones

- listas simples;
- no cards de navegación.

## 5. Regresión prohibida

Falla automática si Codex:

- cambia lógica financiera;
- altera permisos;
- modifica contratos API por conveniencia visual;
- elimina estados funcionales;
- cambia rutas sin necesidad;
- introduce mock data nuevo para ocultar una integración rota;
- sustituye tablas operativas por cards en móvil sin justificar pérdida de información;
- crea un segundo design system paralelo.

## 6. Evidencia requerida

Antes de cerrar el refactor:

- `npm test` / suite disponible;
- build frontend exitoso;
- screenshots de ADMIN y GRADUATE en desktop/mobile;
- listado de archivos modificados;
- listado de componentes deprecated/eliminados;
- confirmación explícita de que no se modificaron reglas de negocio ni contratos API.