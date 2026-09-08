# Índice de Documentación — Plataforma GR

**Baseline normativo:** 1.4  
**Fecha de actualización:** 7 de septiembre de 2026

> [!IMPORTANT]
> `/docs` es la fuente de verdad. Código legacy, fixtures, mocks, prototipos y documentación raíz no pueden cambiar decisiones normativas.

---

## 1. Arquitectura contract-first 1.4

Documentos rectores incorporados:

1. [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) — arquitectura objetivo y reglas obligatorias para implementación.
2. [ARCHITECTURE_DELIVERABLES.md](./ARCHITECTURE_DELIVERABLES.md) — tracker para cerrar backend antes de producción.
3. [SEATING_AUTOMATION_CONTRACT.md](./SEATING_AUTOMATION_CONTRACT.md) — ampliación aprobada de automatización/OCR de croquis.

### Precedencia técnica

```text
SYSTEM_ARCHITECTURE.md
→ TECH_STACK.md
→ DATA_MODEL.md / API_CONTRACTS.md / NON_FUNCTIONAL_REQUIREMENTS.md
→ REPOSITORY_SOURCE_OF_TRUTH.md
→ código
```

`SYSTEM_ARCHITECTURE.md` no puede alterar por sí mismo reglas funcionales de negocio; define cómo se implementan.

`SEATING_AUTOMATION_CONTRACT.md` es excepción funcional específica y posterior: prevalece únicamente sobre declaraciones anteriores que excluyan reconocimiento automático de planos.

---

## 2. Orden normativo funcional y visual

1. [PRODUCT_SCOPE.md](./PRODUCT_SCOPE.md)
2. [BUSINESS_RULES.md](./BUSINESS_RULES.md)
3. [SRS.md](./SRS.md)
4. [ROLES_PERMISSIONS.md](./ROLES_PERMISSIONS.md)
5. [SEATING_AUTOMATION_CONTRACT.md](./SEATING_AUTOMATION_CONTRACT.md) — extensión específica posterior.
6. [GRADUATE_UX_SIMPLIFICATION_AUDIT.md](./GRADUATE_UX_SIMPLIFICATION_AUDIT.md)
7. [ADMIN_UX_SIMPLIFICATION_AUDIT.md](./ADMIN_UX_SIMPLIFICATION_AUDIT.md)
8. [UX_FLOWS.md](./UX_FLOWS.md)
9. [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md)
10. [SCREEN_VISUAL_SPECIFICATIONS.md](./SCREEN_VISUAL_SPECIFICATIONS.md)
11. [ANTIGRAVITY_DESIGN_GUIDE.md](./ANTIGRAVITY_DESIGN_GUIDE.md)
12. [FINANCIAL_DOMAIN.md](./FINANCIAL_DOMAIN.md)
13. [SEATING_MAP.md](./SEATING_MAP.md)
14. [DATA_MODEL.md](./DATA_MODEL.md)
15. [API_CONTRACTS.md](./API_CONTRACTS.md)
16. [NON_FUNCTIONAL_REQUIREMENTS.md](./NON_FUNCTIONAL_REQUIREMENTS.md)
17. [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md)
18. [REQUIREMENTS_TRACEABILITY_MATRIX.md](./REQUIREMENTS_TRACEABILITY_MATRIX.md)
19. [ROADMAP_IMPLEMENTATION.md](./ROADMAP_IMPLEMENTATION.md)

Para composición/visibilidad UX, los documentos `*_UX_SIMPLIFICATION_AUDIT.md` siguen prevaleciendo sobre especificaciones visuales anteriores. Esa precedencia no cambia reglas de dominio.

---

## 3. Fuentes técnicas

- [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
- [TECH_STACK.md](./TECH_STACK.md)
- [REPOSITORY_SOURCE_OF_TRUTH.md](./REPOSITORY_SOURCE_OF_TRUTH.md)
- [ARCHITECTURE_DELIVERABLES.md](./ARCHITECTURE_DELIVERABLES.md)

`TECH_STACK.md` define tecnologías base. `SYSTEM_ARCHITECTURE.md` define fronteras, dependencias, transacciones y decisiones de integración. `REPOSITORY_SOURCE_OF_TRUTH.md` describe qué existe realmente en código.

---

## 4. Baseline funcional vigente

Se mantienen:

- single-tenant;
- roles `ADMIN` y `GRADUATE`;
- contrato individual y folio;
- productos/lugares configurables;
- integrantes nominales;
- planes de pago;
- pagos electrónicos/manuales y comprobantes;
- penalizaciones;
- cancelación/refunds;
- croquis y asignación por persona;
- platillos;
- termos;
- reportes/cortes/exportaciones;
- notas y auditoría.

Ampliación 1.4:

- plano PNG/JPG/JPEG/PDF de una página;
- detección automática asistida de mesas;
- OCR de numeración cuando exista;
- revisión humana obligatoria antes de persistir.

No se incorpora selección de silla, CAD, ML entrenado, invitaciones, RSVP, QR/check-in ni multi-tenant.

---

## 5. Baseline técnico

```text
Frontend: React + TypeScript + Vite
Canvas: React-Konva
Backend: NestJS + TypeScript
ORM: Prisma
DB: PostgreSQL / Supabase managed
Payments: Mercado Pago primario + OpenPay secundario
Storage: backend adapter; target Supabase Storage privado
API: REST /api/v1 contract-first
```

Para automatización de croquis V1:

```text
PDF.js + OpenCV.js + Tesseract.js + Web Worker
```

Las versiones concretas se fijan durante implementación tras verificar releases/documentación vigente.

---

## 6. Documentación legacy

Archivos raíz como:

```text
ENDPOINTS.md
OPENPAY_SETUP.md
GUIA_PRUEBAS.md
RESULTADOS_PRUEBAS.md
NGROK_SETUP.md
contratos api.txt
srs.txt
```

son `LEGACY / REFERENCE ONLY` cuando contradigan `/docs`.

`README.md` es punto de entrada, no fuente normativa.

---

## 7. Regla para agentes

Antes de backend:

```text
1. leer INDEX
2. leer SYSTEM_ARCHITECTURE
3. ubicar FR/BR/roles
4. ubicar DOMAIN/DATA/API especializados
5. confirmar endpoint en API_ENDPOINT_MATRIX/OpenAPI
6. implementar
7. ejecutar QA
8. actualizar trazabilidad
```

Mientras `API_ENDPOINT_MATRIX.md` u OpenAPI aún estén `TODO`, el agente puede trabajar únicamente en el entregable documental correspondiente o foundation que no dependa de un contrato aún inexistente; no debe inventar endpoints.

Para frontend:

```text
UI aprobada != autoridad de dominio
fixture != requisito
mock != fallback productivo
```

---

## 8. Track vigente

El track vigente es:

```text
Architecture Closure → Backend Production
```

Estado y orden:

[ARCHITECTURE_DELIVERABLES.md](./ARCHITECTURE_DELIVERABLES.md)
