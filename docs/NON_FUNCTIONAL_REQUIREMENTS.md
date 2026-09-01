# Plataforma GR — Requisitos No Funcionales

**Documento:** `NON_FUNCTIONAL_REQUIREMENTS.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.1  
**Estado:** Baseline técnico para producción y QA  
**Fecha:** 31 de agosto de 2026  
**Stack de referencia:** Node.js / NestJS / PostgreSQL / Prisma / React

---

# 1. Prioridades

- `P0`: bloquea producción.
- `P1`: obligatorio para MVP.
- `P2`: madurez operativa posterior al núcleo.

---

# 2. Principios generales

## NFR-GEN-001 — Backend authority
**P0.** Autorización, capacidad, deadlines, contratos, importes, pagos, cancelaciones y estados se validan server-side.

## NFR-GEN-002 — PostgreSQL fuente transaccional
**P0.** DB es autoridad de cuentas, contratos, membresías, asignaciones, obligaciones, movimientos y auditoría.

## NFR-GEN-003 — API stateless
**P1.** Ningún lock/idempotencia/estado financiero crítico depende de memoria local de una instancia.

## NFR-GEN-004 — Dinero exacto
**P0.** No usar float binario para importes.

## NFR-GEN-005 — UTC + timezone
**P0.** Persistir timestamps en UTC y evaluar reglas civiles usando timezone del evento.

---

# 3. Transporte y secretos

## NFR-SEC-001 — HTTPS/TLS
**P0.** Producción solo HTTPS, TLS 1.2+; preferir TLS 1.3.

## NFR-SEC-002 — Secretos
**P0.** Credenciales productivas nunca en repo, frontend, logs o ejemplos reales.

## NFR-SEC-003 — Separación de entornos
**P0.** DB, Mercado Pago, OpenPay, correo y storage usan credenciales independientes por entorno.

## NFR-SEC-004 — Headers
**P1.** CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy y protección de framing.

## NFR-SEC-005 — CORS
**P0.** Orígenes explícitos; nunca `*` en producción para API autenticada.

---

# 4. Autenticación

## NFR-AUTH-001 — Password hashing
**P0.** Hash adaptativo; bcrypt cost mínimo 12 aceptable o Argon2id equivalente.

## NFR-AUTH-002 — Password secrecy
**P0.** Nunca texto plano, cifrado reversible, logs o auditoría.

## NFR-AUTH-003 — Access token
**P0.** Vida corta; baseline 15 minutos.

## NFR-AUTH-004 — Refresh
**P0 si existe.** Expirable, revocable y rotado; baseline 7 días.

## NFR-AUTH-005 — Password reset
**P0.** Token hasheado, un solo uso y expiración baseline 30 minutos.

## NFR-AUTH-006 — Enumeración
**P0.** Reset/login no revelan innecesariamente existencia de cuentas.

---

# 5. Autorización e IDOR

## NFR-AUTHZ-001
**P0.** Cada endpoint protegido verifica `Account -> role -> resource ownership/admin scope`.

## NFR-AUTHZ-002
**P0.** Manipular `event_id`, `membership_id`, `group_member_id`, `file_id`, `submission_id`, `table_id` o IDs financieros no concede acceso.

## NFR-AUTHZ-003
**P0.** GRADUATE no obtiene PII, finanzas, comprobantes, notas ni archivos de otros graduados.

## NFR-AUTHZ-004
**P0.** URLs de archivos privados deberán verificar autorización en cada acceso o usar URL firmada de corta duración ligada a un recurso autorizado.

---

# 6. Validación de entrada

## NFR-INPUT-001
**P0.** DTO/schema con whitelist, rechazo de campos sensibles desconocidos y transformación controlada.

## NFR-INPUT-002
**P0.** Proteger contra SQL injection, XSS, command injection y path traversal.

## NFR-INPUT-003
**P0.** Backend valida todos los enums, UUID, importes, fechas, porcentajes y rangos.

---

# 7. Rate limiting

## NFR-RATE-001 — Login
**P0.** Baseline 10 intentos/15 minutos por identidad-origen.

## NFR-RATE-002 — Reset
**P0.** Baseline 5 solicitudes/hora por identidad-origen.

## NFR-RATE-003 — API autenticada
**P1.** Baseline inicial 120 req/min/cuenta, ajustable por endpoints específicos.

## NFR-RATE-004 — Uploads
**P1.** Limitar frecuencia/volumen para evitar abuso de storage.

## NFR-RATE-005 — Webhooks
**P1.** Política independiente compatible con proveedor; priorizar autenticidad/idempotencia.

---

# 8. Seguridad de pagos

## NFR-PAY-001
**P0.** Checkout principal no captura datos completos de tarjeta.

## NFR-PAY-002
**P0.** Return URL jamás confirma pago.

## NFR-PAY-003
**P0.** Webhooks se validan conforme a mecanismo oficial vigente.

## NFR-PAY-004
**P0.** Frontend no es autoridad de `amount`, `currency`, `graduate` o allocation.

## NFR-PAY-005
**P0.** No loggear payloads sensibles completos de proveedores sin necesidad y política de retención explícita.

---

# 9. Idempotencia

## NFR-IDEM-001 — Webhook
**P0.** Mismo evento proveedor produce un solo efecto lógico.

## NFR-IDEM-002 — Provider transaction
**P0.** Unicidad `provider/source + provider_transaction_id`.

## NFR-IDEM-003 — PaymentSubmission approval
**P0.** Un submission solo puede originar una transacción confirmada.

## NFR-IDEM-004 — Idempotency-Key
**P0.** Requerida en pagos manuales, approve/reject sensibles, ajustes, refunds, aceptación contractual, cambios contractuales, publicación de policy, cancelación y otras escrituras con riesgo de duplicado.

## NFR-IDEM-005 — Misma clave/mismo payload
**P0.** Retorna mismo resultado lógico.

## NFR-IDEM-006 — Misma clave/distinto payload
**P0.** `409 IDEMPOTENCY_KEY_REUSED`.

## NFR-IDEM-007 — Retención
**P1.** Baseline 24h para claves administrativas; identificadores financieros externos se conservan mientras exista historia relacionada.

## NFR-IDEM-008 — Late fee
**P0.** Reejecutar job no crea segunda penalización para la misma regla/periodo/membresía.

## NFR-IDEM-009 — Auto-cancel
**P0.** Reejecutar job sobre membresía ya cancelada no duplica efectos.

---

# 10. Concurrencia

## NFR-CON-001
**P0.** Integridad prevalece sobre disponibilidad aparente en UI.

## NFR-CON-002 — Capacidad evento
**P0.** Confirmar/aumentar lugares garantiza `confirmed_places <= capacity` bajo concurrencia.

## NFR-CON-003 — Mesas
**P0.** Asignar/reasignar personas usa transacción y locks/serialización sobre mesas afectadas.

## NFR-CON-004 — Locks
**P0.** Varias mesas se bloquean en orden determinista.

## NFR-CON-005 — Retry
**P1.** Hasta 3 reintentos ante deadlock/serialization failure recuperable, con backoff+jitter.

## NFR-CON-006 — Pago
**P0.** Transaction + allocations + freeze + efectos críticos se confirman atómicamente.

## NFR-CON-007 — Submission approval
**P0.** Estado `APPROVED`, creación de transaction y allocations forman una unidad transaccional.

## NFR-CON-008 — Refund
**P0.** Refunds concurrentes no superan monto reembolsable.

## NFR-CON-009 — Cancellation quote
**P0.** Confirmar cancelación revalida estado/quote y evita usar simultáneamente un quote obsoleto.

---

# 11. Archivos y comprobantes

## NFR-FILE-001 — Storage privado
**P0.** Comprobantes de pago, firmas y evidencias se almacenan en bucket/storage privado.

## NFR-FILE-002 — Tipos permitidos
**P0.** Lista cerrada. Baseline recomendado para comprobantes:

```text
application/pdf
image/jpeg
image/png
image/webp
```

La lista definitiva puede reducirse en implementación, nunca ampliarse por extensión de archivo solamente.

## NFR-FILE-003 — Tamaño máximo
**P0.** Baseline recomendado: 10 MB por comprobante/evidencia, configurable por tipo de archivo.

## NFR-FILE-004 — Validación real
**P0.** Validar MIME/contenido y no confiar solo en nombre/extensión.

## NFR-FILE-005 — Antivirus/malware
**P1.** Evidencias de usuario deberán pasar escaneo antimalware o mecanismo equivalente antes de quedar disponibles a operadores cuando la infraestructura lo permita; archivos sospechosos se aíslan/rechazan.

## NFR-FILE-006 — Nombre/storage key
**P0.** Backend genera storage key; nunca aceptar path arbitrario.

## NFR-FILE-007 — URLs
**P0.** URLs firmadas de lectura con expiración corta. Baseline recomendado: <= 10 minutos.

## NFR-FILE-008 — Checksum
**P1.** Conservar checksum para integridad/deduplicación investigable.

## NFR-FILE-009 — Retención
**P1.** Comprobantes/evidencias financieras se conservan al menos mientras exista la historia financiera/legal asociada; eliminación/archivo sigue política formal, no borrado ad hoc.

---

# 12. Evidencia contractual

## NFR-CONTRACT-001 — Snapshot
**P0.** Al aceptar, persistir snapshot inmutable de términos/policy o referencia inmutable verificable.

## NFR-CONTRACT-002 — Hash
**P0.** Calcular hash criptográfico del snapshot contractual para detectar modificación accidental/no autorizada.

## NFR-CONTRACT-003 — Timestamp
**P0.** Usar tiempo servidor; frontend no define `accepted_at`.

## NFR-CONTRACT-004 — IP/User-Agent
**P1.** Registrar únicamente la información necesaria y permitida por política de privacidad/legal. Si se requiere minimizar PII, usar hash/normalización definida; la decisión debe quedar documentada en implementación.

## NFR-CONTRACT-005 — Version immutability
**P0.** Policy/términos aceptados no pueden cambiar por update de defaults.

---

# 13. Auditoría

## NFR-AUD-001
**P0.** AuditLog append-only.

## NFR-AUD-002
**P0.** Registrar actor/origen, timestamp, acción, entidad, request_id, before/after relevante y motivo cuando aplique.

## NFR-AUD-003
**P0.** Procesos automáticos se identifican como sistema, no como un ADMIN ficticio.

## NFR-AUD-004
**P1.** Acceso/descarga de documentos sensibles podrá registrarse para investigación cuando el riesgo/infraestructura lo justifique.

## NFR-AUD-005
**P0.** Nunca auditar contraseñas, tokens planos, secretos ni datos completos de tarjeta.

---

# 14. Jobs programados

## NFR-JOB-001 — Durable execution
**P0.** Penalizaciones, cancelación automática y recordatorios no dependen de un `setTimeout` de proceso web; usar scheduler/queue/cron durable según stack.

## NFR-JOB-002 — Reentrancia
**P0.** Todos los jobs financieros son idempotentes y seguros ante reejecución.

## NFR-JOB-003 — Lock distribuido/claim
**P0.** Varias instancias no deben ejecutar el mismo efecto financiero dos veces; usar DB constraint/claim/lock adecuado.

## NFR-JOB-004 — Observabilidad
**P1.** Registrar inicio/fin, elementos procesados, errores, retries y métricas.

## NFR-JOB-005 — Fallos parciales
**P0.** Un error en una membresía no debe corromper otras; las operaciones unitarias usan transacciones independientes.

---

# 15. Reportes y exports

## NFR-REP-001 — Fuente
**P0.** Reportes derivan de DB autoritativa o réplica consistente; no de totales frontend.

## NFR-REP-002 — Autorización
**P0.** Solo ADMIN obtiene exports globales.

## NFR-REP-003 — URLs temporales
**P0.** Export generado usa descarga privada/firmada con expiración.

## NFR-REP-004 — Grandes volúmenes
**P1.** Si export supera ventana HTTP razonable, usar job async y estado `202`/polling.

## NFR-REP-005 — Retención temporal
**P1.** Exports generados podrán eliminarse automáticamente después de TTL configurable; baseline recomendado 24h–7d según infraestructura.

## NFR-REP-006 — Fórmulas seguras
**P0.** CSV/XLSX debe mitigar formula injection para campos controlados por usuario (`=`, `+`, `-`, `@`) antes de exportar.

---

# 16. Rendimiento

## NFR-PERF-001 — API ordinaria
**P1.** P95 objetivo < 500 ms para lecturas simples internas sin dependencia externa, bajo carga MVP esperada.

## NFR-PERF-002 — Escrituras críticas
**P1.** P95 objetivo < 1 s sin contar latencia externa, manteniendo transaccionalidad.

## NFR-PERF-003 — Dashboard/reportes
**P1.** P95 < 2 s para vistas agregadas de tamaño operativo normal; usar índices/proyecciones si se necesita.

## NFR-PERF-004 — Canvas
**P1.** Drag debe sentirse fluido; persistencia en `onDragEnd`, no cada frame.

## NFR-PERF-005 — Paginación
**P1.** Colecciones administrativas paginadas; default 25, máximo recomendado 100 salvo endpoint específico.

---

# 17. Polling

## NFR-POLL-001 — Pago
**P1.** Tras retorno, polling inicial ~3 s por máximo 60 s; luego degradar frecuencia/mostrar pendiente.

## NFR-POLL-002 — Mesas
**P1.** Durante selección activa se permite refresh/polling 3–5 s, pero confirmación siempre revalida estado transaccional.

---

# 18. Resiliencia de proveedores

## NFR-EXT-001
**P0.** Timeout/error de proveedor nunca se transforma en pago exitoso inventado.

## NFR-EXT-002
**P1.** Reintentos server-to-server con backoff cuando sean seguros/idempotentes.

## NFR-EXT-003
**P0.** Estado `PENDING` se conserva si la confirmación no es definitiva.

---

# 19. Logs y observabilidad

## NFR-OBS-001
**P0.** Cada request tiene `request_id`.

## NFR-OBS-002
**P1.** Logs estructurados con nivel, request_id, ruta, status, latencia y error code; no secretos/PII innecesaria.

## NFR-OBS-003
**P1.** Métricas mínimas: error rate, latencia, webhooks, submissions pendientes, jobs fallidos, refunds fallidos, DB connections.

## NFR-OBS-004
**P1.** Alertas para fallos sostenidos de webhooks/jobs y errores P0 financieros.

---

# 20. Backups y recuperación

## NFR-DR-001
**P0.** Backups automáticos de PostgreSQL.

## NFR-DR-002
**P1.** Baseline objetivo: backup diario con retención mínima 30 días; política final según hosting/costo.

## NFR-DR-003
**P0.** Probar restauración antes de producción y periódicamente.

## NFR-DR-004
**P1.** RPO objetivo <= 24 h baseline; preferir PITR para reducirlo cuando infraestructura lo permita.

## NFR-DR-005
**P1.** RTO objetivo documentado antes de release; baseline inicial <= 8 h para MVP.

---

# 21. CI/CD y calidad

## NFR-CI-001
**P0.** CI ejecuta lint, typecheck, tests, build y validación de migrations.

## NFR-CI-002
**P0.** Release no avanza si falla criterio P0.

## NFR-CI-003
**P0.** Migraciones reproducibles desde DB vacía.

## NFR-CI-004
**P1.** OpenAPI generado/validado contra contratos.

---

# 22. Pruebas de seguridad P0

Obligatorias:

- IDOR entre graduados/eventos;
- acceso a comprobante/file ajeno;
- role escalation por payload;
- upload con MIME/extensión falsa;
- path traversal;
- XSS en notas/nombres/referencias;
- formula injection en exports;
- webhook duplicado/falso;
- doble approve de submission;
- doble penalización;
- doble cancelación automática;
- refund concurrente;
- contrato/policy version no retroactiva.
