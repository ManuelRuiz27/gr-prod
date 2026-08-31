# Índice de Documentación - Plataforma GR

> [!IMPORTANT]
> **Estos documentos son SOURCE OF TRUTH (la única fuente de verdad).**
> - El código legacy no modifica estas decisiones.
> - La documentación antigua del repositorio no prevalece sobre estos archivos.
> - Si existe una contradicción, el agente debe detenerse y reportarla.
> - No se deben inventar roles, módulos, estados, endpoints ni reglas.
> - Todo cambio de alcance requiere actualizar primero la documentación correspondiente.

## Orden Normativo Funcional

1. [PRODUCT_SCOPE.md](./PRODUCT_SCOPE.md)
2. [BUSINESS_RULES.md](./BUSINESS_RULES.md)
3. [SRS.md](./SRS.md)
4. [ROLES_PERMISSIONS.md](./ROLES_PERMISSIONS.md)
5. [UX_FLOWS.md](./UX_FLOWS.md)
6. [FINANCIAL_DOMAIN.md](./FINANCIAL_DOMAIN.md)
7. [SEATING_MAP.md](./SEATING_MAP.md)
8. [DATA_MODEL.md](./DATA_MODEL.md)
9. [API_CONTRACTS.md](./API_CONTRACTS.md)
10. [NON_FUNCTIONAL_REQUIREMENTS.md](./NON_FUNCTIONAL_REQUIREMENTS.md)
11. [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md)
12. [ROADMAP_IMPLEMENTATION.md](./ROADMAP_IMPLEMENTATION.md)

## Fuentes Técnicas Vinculantes

- [TECH_STACK.md](./TECH_STACK.md) — stack objetivo, infraestructura, proveedores de pago y ownership Antigravity/Codex.
- [REPOSITORY_SOURCE_OF_TRUTH.md](./REPOSITORY_SOURCE_OF_TRUTH.md) — radiografía del código real, legacy y estrategia de reutilización/refactor.

Para decisiones de tecnología e infraestructura prevalece `TECH_STACK.md`. Para determinar qué existe hoy en el repositorio y qué es legacy prevalece `REPOSITORY_SOURCE_OF_TRUTH.md`.

## Documentación Legacy / Reference Only

La documentación operativa antigua de la raíz del repositorio, por ejemplo `ENDPOINTS.md`, `OPENPAY_SETUP.md`, `GUIA_PRUEBAS.md`, `RESULTADOS_PRUEBAS.md`, `NGROK_SETUP.md` o archivos equivalentes, se considera **LEGACY / REFERENCE ONLY** cuando contradiga o anteceda al baseline vigente.

`README.md` funciona únicamente como punto de entrada y resumen; no sustituye a `/docs`.
