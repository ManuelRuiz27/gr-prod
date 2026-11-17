# Stitch — Entrega de dos prototipos COMPLETOS de Plataforma GR

**Fecha:** 16-nov-2026  
**Estado:** handoff de UX/UI, no ejecución de Stitch, ni implementación productiva.  
**Rama:** `ManuelRuiz27/gr-prod@integration/monkavia-gr-access`.

## Entregables para importar como BASE en Stitch

| Proyecto de Stitch (crear DOS proyectos independientes) | Documento rector | Qué debe producir |
|---|---|---|
| **GR · Solo plataforma** | [STITCH_PROTOTIPO_01_GR_BASE.md](STITCH_PROTOTIPO_01_GR_BASE.md) | Rediseño **completo** de ADMIN + GRADUATE, todos los flujos comerciales del CEO, sin QR/check-in |
| **GR · Plataforma + Monkavia** | [STITCH_PROTOTIPO_02_GR_MONKAVIA.md](STITCH_PROTOTIPO_02_GR_MONKAVIA.md) | **Otro rediseño completo** de ADMIN + GRADUATE con mismas reglas base **más** Accesos y superficie Monkavia Scanner |

**Importante:** no pedir a Stitch «amplía sólo las pantallas de acceso» en el segundo proyecto: debe incluir todas las pantallas del GR base y ser utilizable de manera independiente. Es válido reutilizar el mismo sistema de diseño y componentes entre ambos, pero el resultado esperado son **dos prototipos distintos y completos**.

## Restricciones de autoridad

1. **GR CEO:** el producto comercial no se altera. Respetar `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `FINANCIAL_DOMAIN.md`. `GroupMember` permanece nominal con `full_name` obligatorio.
2. **UX:** obedecer `GRADUATE_UX_SIMPLIFICATION_AUDIT.md` y `ADMIN_UX_SIMPLIFICATION_AUDIT.md`. Debe rehacerse UI/navegación, no reglas de dominio.
3. **Mesas:** únicamente catálogo de croquis/plantillas precargadas y cantidades `TableAllocation`. La descripción histórica de editor/imagen/CRUD dinámico queda retirada. No introducir sillas individuales ni permiso especial multimesa no aprobado.
4. **Accesos (sólo Prototipo 02):** usar `GR_ACCESS_INTEGRATION.openapi.yaml` y `invitacionespremium@monkavia-gr/docs/04-tecnico/GR_PRIVATE_API.openapi.yaml` v2. Separación GR vs Monkavia; no reescribir finanzas ni mesas de GR.
5. **Q3:** aprobación de distribuciones multimesa pendiente del CEO. No inventar flujo ni gate.
6. Son **prototipos UX**, no certificados de integración. Las operaciones descritas contract-first pueden estar aún pendientes de backend y pruebas.

## Cómo entregar materiales a Stitch

**Proyecto 01:** proporcionar primero `STITCH_PROTOTIPO_01_GR_BASE.md`. Como anexos de reglas y estilo adjuntar/enlazar `INDEX.md`, `GRADUATE_UX_SIMPLIFICATION_AUDIT.md`, `ADMIN_UX_SIMPLIFICATION_AUDIT.md`, `UI_DESIGN_SYSTEM.md`, `SEATING_QUANTITY_CONTRACT.md`.

**Proyecto 02:** proporcionar primero `STITCH_PROTOTIPO_02_GR_MONKAVIA.md`; después `STITCH_PROTOTIPO_01_GR_BASE.md` para detalle comercial y `GR_ACCESS_INTEGRATION.openapi.yaml` para operación GR. Para contratos privados Monkavia añadir `GR_PRIVATE_API.openapi.yaml` v2 de rama `monkavia-gr`. No usar V1/1,800/releaseState único como estado actual.

El prompt final para cada proyecto aparece en el apartado `Instrucción final para Stitch` del documento correspondiente. **Construir un proyecto por prompt**.

## Comparación visual y funcional obligatoria

| Dominio | Prototipo 01: GR | Prototipo 02: GR + Monkavia |
|---|---|---|
| Acceso, registro, login, selección de evento | Completo | Idéntico funcionalmente |
| Crear evento/configuración/estado comercial | Completo | Idéntico funcionalmente |
| Contrato, folio, `GroupMember`, grupo y compras | Completo | Idéntico funcionalmente |
| Mercado Pago/OpenPay, transferencias, comprobantes, cartera, ajustes, refunds | Completo | Idéntico funcionalmente |
| Croquis precargado, cantidades, vínculo nominal, platillos y termo | Completo | Idéntico funcionalmente |
| Reportes/cortes, políticas cancelación y auditoría | Completo | Idéntico funcionalmente |
| Elegibilidad y emisión de QR | No aparece | FAMILY por contrato + NO_DINNER individual |
| Impresión de QR sin cena por ADMIN | No aparece | Sí, plantilla + PDF |
| Operación de admisión y staff | No aparece | Configuración, horario, pause/resume, Staff |
| Escaneo e ingresos | No aparece | Monkavia Scanner independiente |
| Capacidad técnica derechos | No aplica | 5,000 por evento GR_ACCESS, pendiente certificación |
| Aprobación distribución multimesa Q3 | No añadida | No añadida (CEO pendiente) |

## Matriz de pantallas y criterios de entrega

- Prototipo 01: 17 pantallas/estados **G00–G16**, 22 **A00–A21** (39 identificadores; varios son subflujos/sheets, no necesariamente rutas).
- Prototipo 02: **las 39 superficies anteriores** más 4 **G17–G20**, 8 **A22–A29**, 9 **M00–M08** (60 identificadores totales; no todas son páginas independientes).
- Cada identificador debe tener entrada, salida, CTA principal y casos alternos; algunos se resuelven como modal, drawer o estado de una página, no creando navegación espuria.
- ADMIN desktop-first y GRADUATE mobile-first, Staff scanner touch-first. Desktop/tablet/mobile adaptados sin duplicar menús.
- Componentes visuales consistentes y estados vacíos, fallas, permisos, deadlines, confirmaciones, concurrencia y éxito.
- Datos sintéticos etiquetados como demo. No registrar pagos reales ni QR válidos; no afirmar conexión real a API.

## Checklist de revisión y aceptación

- [ ] ¿Stitch generó DOS proyectos completos, uno por documento?
- [ ] ¿El prototipo 02 incluye toda la operación GR, no sólo Accesos?
- [ ] ¿La variante base omite totalmente QR y check-in?
- [ ] ¿Los dos preservan `GroupMember`, contratos, pagos y croquis vigente?
- [ ] ¿Los dos usan el sistema visual y simplificación UX de GR?
- [ ] ¿En la variante Monkavia están los pases NO_DINNER impresos sólo por ADMIN, FAMILY compartido y check-in parcial?
- [ ] ¿La operación de admisión distingue ventana normal, PAUSE, RESUME, override auditado y CLOSE irreversible?
- [ ] ¿No se añadió aprobación Q3 ni Staff como rol GR?
