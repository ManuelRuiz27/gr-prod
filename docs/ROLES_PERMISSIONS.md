# Plataforma GR — Roles y Permisos

**Documento:** `ROLES_PERMISSIONS.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.1  
**Estado:** Baseline de autorización  
**Fecha:** 31 de agosto de 2026  
**Fuentes:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`

---

# 1. Principios

Los únicos roles funcionales son:

```text
ADMIN
GRADUATE
```

No existen subroles, permisos personalizados, tenants ni jerarquías adicionales.

El backend es la autoridad de autorización. Ocultar una acción en frontend no sustituye guards/policies server-side.

Los IDs enviados por cliente no conceden ownership.

---

# 2. Identidad

Modelo conceptual:

```text
Account
  ├── role: ADMIN | GRADUATE
  └── status: ACTIVE | DISABLED

GraduateMembership
  ├── account_id
  └── event_id
```

Una cuenta GRADUATE puede tener múltiples membresías, pero cada operación `/me/events/{eventId}` debe validar que la membresía pertenezca a la cuenta autenticada.

---

# 3. ADMIN

ADMIN puede operar todos los eventos de la instancia y sus recursos, sujeto a reglas/invariantes.

Puede:

- crear/editar/transicionar eventos;
- administrar cuentas ADMIN;
- consultar graduados;
- configurar productos, precios, parcialidades y deadlines;
- configurar milestones, penalización tardía y cancelación automática;
- crear/publicar versiones de política de cancelación;
- consultar contratos y aceptación;
- modificar lugares/productos autorizados;
- operar croquis y mesas;
- reasignar personas a mesas;
- configurar/editar platillos;
- consultar planes financieros;
- registrar efectivo, transferencia y depósito;
- revisar/aprobar/rechazar comprobantes de GRADUATE;
- crear ajustes;
- iniciar/registrar reembolsos;
- cancelar membresías;
- operar termos y entregas;
- crear notas internas;
- consultar/exportar reportes y cortes;
- consultar auditoría.

ADMIN **no puede**:

- editar o borrar destructivamente pagos confirmados;
- modificar una política de cancelación ya publicada;
- modificar retroactivamente un contrato aceptado sin flujo contractual explícito;
- eliminar auditoría;
- provocar sobrecupo de evento/mesa;
- reembolsar más de lo reembolsable;
- omitir invariantes mediante UI/API.

---

# 4. GRADUATE

GRADUATE solo puede operar información propia dentro de sus membresías.

Puede:

- consultar/editar campos permitidos de perfil;
- consultar sus eventos;
- consultar y aceptar su contrato;
- consultar su folio;
- consultar sus productos/lugares;
- administrar integrantes propios dentro de reglas;
- agregar productos/lugares cuando esté habilitado;
- consultar croquis seguro;
- asignar/cambiar mesa de sus integrantes dentro de reglas y deadline;
- seleccionar platillos de sus integrantes;
- consultar plan, obligaciones e historial financiero visible;
- iniciar pago electrónico propio;
- reportar transferencia/depósito propio y subir comprobante;
- consultar estado de sus comprobantes;
- consultar/solicitar/personalizar su termo cuando corresponda;
- consultar sus notificaciones.

GRADUATE **no puede**:

- consultar otros graduados/grupos;
- leer PII de terceros en croquis;
- consultar notas internas;
- acceder a `/admin/*`;
- configurar evento, productos, precios o políticas;
- aprobar/rechazar comprobantes;
- registrar un pago como confirmado;
- crear ajustes/reembolsos;
- cancelar directamente otra membresía;
- editar pagos confirmados;
- marcar termo en producción/entregado;
- consultar reportes globales o auditoría.

---

# 5. Matriz global

Leyenda: ✅ permitido, ⚠️ condicionado, ❌ prohibido.

| Recurso / acción | ADMIN | GRADUATE |
|---|---:|---:|
| Login/logout/reset | ✅ | ✅ |
| Administrar cuentas ADMIN | ✅ | ❌ |
| Crear/editar evento | ✅ | ❌ |
| Transicionar evento | ✅ | ❌ |
| Ver eventos propios | ✅ | ✅ |
| Ver todos los graduados | ✅ | ❌ |
| Ver expediente propio | ✅ | ✅ |
| Ver expediente ajeno | ✅ | ❌ |
| Ver contrato propio | ✅ | ✅ |
| Aceptar contrato propio | ❌ | ✅ |
| Modificar contrato publicado | ⚠️ flujo explícito | ❌ |
| Configurar productos/precios | ✅ | ❌ |
| Agregar producto/lugar | ✅ | ⚠️ propio |
| Reducir lugares | ✅ | ❌ |
| Editar croquis | ✅ | ❌ |
| Ver croquis seguro | ✅ | ✅ |
| Asignar persona propia a mesa | ✅ | ⚠️ |
| Reasignar fuera de deadline | ✅ | ❌ |
| Configurar platillos | ✅ | ❌ |
| Elegir platillo propio | ✅ | ⚠️ |
| Override después de deadline | ✅ | ❌ |
| Ver plan propio | ✅ | ✅ |
| Ver plan de terceros | ✅ | ❌ |
| Iniciar pago electrónico propio | ❌* | ✅ |
| Registrar CASH | ✅ | ❌ |
| Registrar TRANSFER/DEPOSIT confirmado | ✅ | ❌ |
| Subir comprobante propio | ✅ posible | ✅ |
| Aprobar/rechazar comprobante | ✅ | ❌ |
| Crear ajuste | ✅ | ❌ |
| Crear/iniciar reembolso | ✅ | ❌ |
| Configurar penalización tardía | ✅ | ❌ |
| Configurar política cancelación | ✅ | ❌ |
| Publicar política cancelación | ✅ | ❌ |
| Consultar cotización cancelación | ✅ | ⚠️ solo si UX futuro lo expone |
| Confirmar cancelación membresía | ✅ / sistema autorizado | ❌ |
| Solicitar termo propio | ✅ operativamente | ⚠️ |
| Marcar termo en producción | ✅ | ❌ |
| Marcar termo entregado | ✅ | ❌ |
| Crear nota interna | ✅ | ❌ |
| Leer notas internas | ✅ | ❌ |
| Ver reportes/cortes | ✅ | ❌ |
| Exportar reportes | ✅ | ❌ |
| Ver auditoría | ✅ | ❌ |
| Editar/eliminar auditoría | ❌ | ❌ |

\* El checkout ordinario pertenece al graduado. Un flujo ADMIN para iniciar cobro electrónico requiere especificación explícita adicional.

---

# 6. Reglas por dominio

## RP-CON-001 — Contrato propio
GRADUATE solo puede consultar/aceptar el contrato asociado a su propia membresía.

## RP-CON-002 — Versiones
Solo backend/ADMIN autorizado puede crear la estructura contractual; GRADUATE no selecciona versión de términos ni política.

## RP-PLC-001 — Integrantes
GRADUATE puede administrar integrantes propios solo si evento, deadline, cantidad de lugares y estado de membresía lo permiten.

## RP-SEAT-001 — Croquis GRADUATE
La respuesta debe excluir nombres, teléfonos, correos y detalles financieros ajenos.

## RP-SEAT-002 — Asignación
GRADUATE solo puede asignar sus `GroupMember`; ADMIN puede asignar cualquier persona del evento respetando capacidad.

## RP-FIN-001 — Lectura
GRADUATE solo puede consultar su plan y movimientos visibles.

## RP-FIN-002 — Confirmación
GRADUATE nunca puede declarar una transacción `CONFIRMED`.

## RP-PROOF-001 — Submission
GRADUATE puede crear/consultar submissions propios; no puede aprobarlos.

## RP-PROOF-002 — Revisión
Aprobar/rechazar es exclusivo de ADMIN y requiere auditoría.

## RP-CANPOL-001 — Administración de política
Solo ADMIN puede crear/modificar drafts y publicar versiones.

## RP-CANPOL-002 — Publicada
Ningún rol puede modificar destructivamente una versión publicada.

## RP-CAN-001 — Cancelación
Cancelación manual de membresía es ADMIN; ejecución automática solo puede originarse desde proceso backend configurado y auditable.

## RP-REF-001 — Refund
Solo ADMIN puede iniciar/registrar un refund; GRADUATE puede observar el resultado financiero propio cuando sea visible.

## RP-TH-001 — Termo
GRADUATE solicita/personaliza antes de producción; ADMIN controla producción y entrega.

## RP-NOTE-001 — Notas internas
Solo ADMIN puede leer/escribir notas internas.

## RP-REP-001 — Reportes
Reportes globales, cortes y exports son exclusivos de ADMIN.

---

# 7. Reglas de estado

Si una membresía está `CANCELLED`, GRADUATE no puede realizar mutaciones ordinarias aunque conserve acceso histórico de lectura permitido.

Si el evento está `CLOSED`, `FINALIZED` o `CANCELLED`, se bloquean mutaciones ordinarias GRADUATE según `BUSINESS_RULES.md`.

Una cuenta `DISABLED` no puede ejecutar operaciones autenticadas.

---

# 8. Auditoría de autorización

Operaciones ADMIN sensibles deberán registrar identidad real del actor. Procesos automáticos deberán usar un origen de sistema inequívoco, no hacerse pasar por una cuenta humana.

Pruebas P0 deben cubrir IDOR, escalamiento por body/query, cambio arbitrario de `eventId`, acceso a archivos/comprobantes ajenos y acceso GRADUATE a rutas administrativas.
