---
description: Reglas fundamentales de dominio, stack, alcance y flujo de trabajo para Plataforma GR
---

# Reglas del Proyecto Plataforma GR

- **Fuente de verdad funcional:** `/docs` manda sobre cualquier suposición, código legacy o prototipo.
- **Fuente de verdad técnica:** `docs/TECH_STACK.md` define stack, infraestructura, proveedores y ownership técnico.
- **Radiografía del código:** `docs/REPOSITORY_SOURCE_OF_TRUTH.md` define qué existe, qué es legacy y qué debe reutilizarse, adaptarse o reemplazarse.
- **Fuente de verdad visual:** `stitch_gr_prototype/` es la referencia para layout, jerarquía, spacing y apariencia.
- **Código legacy:** El código preexistente nunca prevalece sobre `/docs`.
- **Integridad de dominio:** No inventar entidades, estados, campos, reglas de negocio, datos ficticios ni flujos no aprobados.
- **Ownership frontend:** Google Antigravity trabaja normalmente sobre `frontend/**` y QA visual. No implementa persistencia ni reglas backend por conveniencia.
- **Ownership backend:** Codex trabaja normalmente sobre `backend/**`, Prisma, contratos server-side, seguridad e integraciones de pago.
- **Pagos:** Mercado Pago es proveedor electrónico primario y OpenPay secundario. El código OpenPay existente es legacy hasta converger al dominio financiero normado.
- **Datos:** Supabase se usa como PostgreSQL administrado objetivo; no sustituye al backend NestJS. No se permite acceso directo del frontend a tablas financieras ni `service_role` en cliente.
- **Estrategia Git:** Trabajar directamente sobre `main`. No crear ramas ni Pull Requests salvo instrucción explícita posterior.
- **Economía de cambios:** Preferir el diff mínimo y modificaciones quirúrgicas.
- **Documentación auxiliar:** No crear `implementation_plan.md`, `walkthrough.md` ni reportes salvo que el ticket lo solicite explícitamente.
