---
description: Reglas de desarrollo e interfaz para Google Antigravity en el frontend de Plataforma GR
---

# Reglas de Frontend para Plataforma GR

Aplicable principalmente a `frontend/**`.

## Ownership

- **Agente principal:** Google Antigravity.
- **Stack obligatorio:** consultar `docs/TECH_STACK.md` antes de cambiar dependencias, arquitectura cliente o estrategia de integración.
- **Superficie normal:** `frontend/**`.
- No modificar `backend/**`, `backend/prisma/**` ni contratos financieros para desbloquear una pantalla salvo que el ticket lo autorice expresamente.
- Si el frontend requiere un contrato backend inexistente, reportar el bloqueo; no simular una regla autoritativa en cliente.

## Implementación

- **Reutilización:** Reutilizar el design system existente (`src/design-system`), shells y componentes antes de crear nuevos.
- **Modificaciones quirúrgicas:** No reescribir archivos completos si basta una modificación localizada.
- **Componentes:** No duplicar componentes ni variantes.
- **Lógica de negocio:** No simular reglas de negocio que corresponden al backend.
- **Persistencia:** No acceder directamente a tablas financieras de Supabase. La integración autoritativa es `Frontend → NestJS`.
- **Seguridad:** Nunca incluir `service_role`, credenciales de DB, secrets de Mercado Pago/OpenPay ni cualquier llave privada en variables `VITE_*`, bundles o código cliente.
- **Pagos:** El frontend puede iniciar/continuar UX de pago usando contratos del backend y mecanismos cliente expresamente públicos del proveedor; nunca decide que un pago está confirmado.
- **Vocabulario UI:** Los enums técnicos (`EventStatus`, `ThermoStatus`, `InstallmentStatus`, etc.) se usan internamente; la UI expone lenguaje natural en español sin tecnicismos.
- **Fixtures:** Únicamente representan información normativamente definida. Si falta un dato, omitir el bloque o mostrar estado vacío en lugar de inventar valores.
- **Alineación con prototipos:** Antes de modificar una pantalla, localizar su prototipo correspondiente en `stitch_gr_prototype/`.

## Verificación

- **Resultados verificables:** reportar cantidades de tests, errores y warnings exactamente desde la última ejecución real; nunca estimarlas.
- **QA visual:** solo reportar `Visual Browser: PASS` cuando se haya ejecutado realmente Browser sobre la ruta y viewport solicitados. Si no se ejecutó, reportar `NOT RUN`. Build/tests no equivalen a validación visual.
- Antes de cerrar trabajo frontend ejecutar, cuando aplique:

```bash
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build
```
