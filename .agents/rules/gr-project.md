---
description: Reglas fundamentales de dominio, stack, alcance y flujo de trabajo para Plataforma GR
---

# Reglas del Proyecto Plataforma GR

- **Fuente de verdad funcional:** `/docs` manda sobre suposiciones, código legacy, fixtures y prototipos.
- **Fuente de verdad técnica:** `docs/TECH_STACK.md`.
- **Radiografía del código:** `docs/REPOSITORY_SOURCE_OF_TRUTH.md`.
- **Fuente visual:** `stitch_gr_prototype/` + audits UX vigentes.
- **Integridad de dominio:** no inventar entidades, estados, reglas, datos o flujos no aprobados.
- **Ownership frontend:** Google Antigravity trabaja normalmente sobre `frontend/**` y QA visual.
- **Ownership backend:** Codex trabaja normalmente sobre `backend/**`, Prisma, contratos server-side, seguridad e integraciones.
- **Pagos:** Mercado Pago primario; OpenPay secundario detrás de adapter.
- **Datos:** Supabase es PostgreSQL administrado objetivo; frontend no accede directamente a tablas financieras ni usa `service_role`.
- **Git:** trabajar sobre `main`; no crear ramas/PR salvo instrucción explícita.
- **Economía de cambios:** preferir diff mínimo y cambios quirúrgicos.
- **Documentación auxiliar:** no crear `implementation_plan.md`, `walkthrough.md` o reportes salvo que el ticket los pida.

## Decisión vigente de croquis — 2026-09-14

El cliente confirmó que utiliza un conjunto pequeño y relativamente estable de croquis (aprox. 15). Por tanto:

```text
croquis = catálogo semi-fijo precargado y versionado
```

Documentos rectores:

```text
docs/SEATING_CATALOG_CONTRACT.md
docs/SEATING_QUANTITY_CONTRACT.md
docs/SEATING_MAP.md
```

`SEATING_AUTOMATION_CONTRACT.md` es histórico/RETIRED.

No reintroducir como feature:

- upload arbitrario de planos;
- OCR/CV/OpenCV/Tesseract para detectar mesas;
- importación de mesas detectadas;
- editor estructural de geometría;
- creación/bulk/delete de mesas del layout desde runtime.

Se conservan selección de plantilla por evento, render del croquis, block/unblock, ocupación, asignaciones/allocations, concurrencia, realtime y auditoría.

Si código anterior de detección/upload/import sigue en el repo, se clasifica `REMOVE`: no ampliarlo ni usarlo como fuente contractual.
