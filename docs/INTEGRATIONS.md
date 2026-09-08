# Contrato Normativo de Integraciones Externas (Integrations Specification)

**Documento:** `INTEGRATIONS.md`  
**Versión:** 1.0  
**Fecha:** 8 de septiembre de 2026  
**Fase de Roadmap:** Entregable #11 — Adaptadores de Integración Externa, Pagos, Almacenamiento y Correo  
**Fuentes Normativas:** `SYSTEM_ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `DATA_MODEL.md` (§50, §55), `API_ENDPOINT_MATRIX.md` (§19), `API_CONTRACT.openapi.yaml`, `EVENTS_REALTIME_CONTRACT.md`, `ERROR_CONTRACT.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `ARCHITECTURE_DELIVERABLES.md`.

---

## 1. Principios Arquitectónicos y Desacoplamiento

En **Plataforma GR**, las dependencias externas (pasarelas de pago, almacenamiento de archivos, servidores de correo) constituyen infraestructura mutable que **bajo ninguna circunstancia debe contaminar o acoplar la capa de dominio**.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CORE DOMAIN / USE CASES                            │
│  (PaymentAttempt, PaymentTransaction, Allocation, FileAsset, OutboxEvent)   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                        Ports (Abstracciones TypeScript)
                                       │
                 ┌─────────────────────┼─────────────────────┐
                 ▼                     ▼                     ▼
     ┌───────────────────────┐ ┌───────────────┐ ┌───────────────────────┐
     │ PaymentProviderAdapter│ │FileStoragePort│ │      EmailPort        │
     └───────────┬───────────┘ └───────┬───────┘ └───────────┬───────────┘
                 │                     │                     │
    ┌────────────┴───────────┐         │                     │
    ▼                        ▼         ▼                     ▼
┌──────────────┐  ┌──────────────┐ ┌──────────────┐    ┌─────────────────┐
│ Mercado Pago │  │   OpenPay    │ │ Local / R2 / │    │ FakeMailer /    │
│  (PRIMARY)   │  │ (SECONDARY)  │ │      S3      │    │ SMTP (Outbox)   │
└──────────────┘  └──────────────┘ └──────────────┘    └─────────────────┘
```

### 1.1 Reglas Fundamentales de Integración
1. **Zero Domain SDK Coupling:** Ninguna entidad de dominio ni caso de uso importa `mercadopago` u `openpay` directamente. Todas las interacciones se realizan mediante la interfaz canónica `PaymentProviderAdapter`.
2. **Fail-Fast en Configuración:** Las credenciales y variables de entorno se validan al arrancar la aplicación (`AppModule`). La ausencia de parámetros requeridos impide el despliegue del contenedor.
3. **Segregación Estricta Sandbox vs Producción:** Las credenciales de prueba (`SANDBOX=true`) y producción (`SANDBOX=false`) deben distinguirse explícitamente. Se prohíbe el uso de credenciales reales en entornos de prueba o staging.
4. **Resiliencia y Timeouts Acotados:** Toda llamada de red externa posee un timeout estricto (máx 5000 ms). Ante fallas de red, sockets caídos o errores 5xx del proveedor, el sistema mapea la falla a HTTP 503 `DEPENDENCY_UNAVAILABLE`.

---

## 2. Proveedores de Pago (Payment Providers)

### 2.1 Interfaz Canónica: `PaymentProviderAdapter`

```typescript
export interface PaymentProviderAdapter {
  readonly provider: PaymentProvider; // 'MERCADO_PAGO' | 'OPENPAY'

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPayment(providerPaymentId: string): Promise<ProviderPaymentDetails>;
  verifyWebhook(input: VerifyWebhookInput): Promise<WebhookVerificationResult>;
  refund(input: RefundInput): Promise<RefundResult>;
}
```

### 2.2 Proveedor Primario: Mercado Pago (PRIMARY)

| Dimensión | Especificación Normativa |
|---|---|
| **Mecanismo de Cobro** | Checkout Pro (Preference API) con redirección al checkout seguro de Mercado Pago |
| **Identificador del Proveedor** | `payment.id` (numérico/string de MP, ej. `1234567890`) |
| **Idempotencia de Creación** | Header `X-Idempotency-Key` transmitido en cada llamada a la API de MP |
| **Verificación de Webhook** | Algoritmo HMAC-SHA256 sobre el header `x-signature` (`ts` y `v1`), concatenando `id`, `request-id` y `ts` con el secret `PAYMENTS_MP_WEBHOOK_SECRET`. Tolerancia a timestamp drift: 5 minutos |
| **Server-to-Server Lookup** | `GET /v1/payments/{id}` autenticado con Bearer Access Token |
| **Timeouts y Retries** | Timeout: 5000 ms. Reintentos: 3 intentos con backoff exponencial (1s, 2s, 4s) solo para errores 5xx o timeout de socket |
| **Modos de Operación** | `PAYMENTS_MP_SANDBOX=true` utiliza credenciales de prueba (`TEST-...`); `false` utiliza credenciales de producción (`APP_USR-...`) |

#### Mapeo de Estados de Mercado Pago
| Estado Mercado Pago | Estado de Intento (`PaymentAttemptStatus`) | Estado de Transacción (`PaymentTransactionStatus`) | Acción en Plataforma GR |
|---|---|---|---|
| `approved` | `CONFIRMED` | `CONFIRMED` | Genera `PaymentTransaction` + `PaymentAllocations` |
| `in_process` / `pending` | `PENDING` | *(Ninguna)* | Intento permanece en espera |
| `rejected` | `FAILED` | *(Ninguna)* | Marca intento como fallido |
| `cancelled` | `CANCELLED` | *(Ninguna)* | Marca intento como cancelado |
| `refunded` | `CONFIRMED` | `REVERSED` | Procesa reverso/reembolso mediante `RefundSource` |

---

### 2.3 Proveedor Secundario: OpenPay (SECONDARY)

| Dimensión | Especificación Normativa |
|---|---|
| **Mecanismo de Cobro** | Cargos con Tarjeta (3D Secure), Transferencia SPEI y Tiendas de Conveniencia (Paynet) |
| **Identificador del Proveedor** | `transaction.id` (alfanumérico OpenPay, ej. `trqwer123456`) |
| **Idempotencia de Creación** | Parámetro `order_id` vinculado biyectivamente al `payment_attempt.id` de Plataforma GR |
| **Verificación de Webhook** | Verificación por token de autenticación HTTP Basic / header criptográfico contra `PAYMENTS_OPENPAY_WEBHOOK_SECRET` |
| **Server-to-Server Lookup** | `GET /v1/{merchantId}/charges/{transactionId}` |
| **Timeouts y Retries** | Timeout: 5000 ms. Reintentos: 3 con backoff exponencial (1s, 2s, 4s) |
| **Modos de Operación** | `PAYMENTS_OPENPAY_SANDBOX=true` utiliza `https://sandbox-api.openpay.mx`; `false` utiliza `https://api.openpay.mx` |

#### Mapeo de Estados de OpenPay
| Estado OpenPay | Estado de Intento (`PaymentAttemptStatus`) | Estado de Transacción (`PaymentTransactionStatus`) | Acción en Plataforma GR |
|---|---|---|---|
| `completed` | `CONFIRMED` | `CONFIRMED` | Genera `PaymentTransaction` + `PaymentAllocations` |
| `in_progress` | `PENDING` | *(Ninguna)* | Intento en espera (SPEI / tienda) |
| `failed` | `FAILED` | *(Ninguna)* | Marca intento como fallido |
| `cancelled` | `CANCELLED` | *(Ninguna)* | Marca intento como cancelado |
| `refunded` | `CONFIRMED` | `REVERSED` | Genera reverso contable |

---

### 2.4 Reglas Inmutables de Integración de Pagos

1. **Return URL NUNCA Confirma Pagos (`RETURN_URL_CANNOT_CONFIRM_PAYMENT`):**
   - Cuando el usuario completa el flujo en la pasarela externa y es redirigido a la aplicación web (`/graduate/payments?status=congrats`), esta redirección es puramente visual.
   - La aplicación frontend muestra un estado transicional ("Confirmando pago con el banco...").
   - El backend **jamás** emite una transacción financiera basada en parámetros de query de la URL de retorno (`collection_status=approved`). La única autoridad es el **webhook criptográficamente verificado** o la consulta server-to-server directa.

2. **Deduplicación Atómica de Eventos de Proveedor:**
   - La tabla `payment_provider_events` posee una restricción única compuesta:
     ```prisma
     @@unique([provider, external_event_id])
     ```
   - Si un proveedor envía el mismo webhook múltiples veces (por política de reintento de la pasarela), la primera llamada procesa la transacción; las subsiguientes detectan el registro existente y devuelven HTTP 200 con `{ status: 'ALREADY_PROCESSED' }` **sin duplicar transacciones ni mutar el saldo**.

3. **Preservación Incondicional del Dinero Confirmado (Conflicto de Capacidad):**
   - Si un graduado realiza un pago en línea que es confirmado por Mercado Pago u OpenPay, pero durante el lapso de confirmación la capacidad del evento o la mesa fue consumida por otra operación concurrente:
     - El pago **NO se cancela**.
     - La transacción financiera (`PaymentTransaction`) se registra como `CONFIRMED` en el ledger inmutable.
     - La capacidad del evento **no se sobreasigna** (`capacity` permanece respetada).
     - El sistema crea inmediatamente un incidente de conciliación:
       ```text
       ReconciliationCase {
         case_type: PAYMENT_CONFIRMED_CAPACITY_CONFLICT,
         status: OPEN,
         details: { paymentTransactionId, paymentPlanId, amount, reason: "CAPACITY_EXCEEDED" }
       }
       ```
     - Se notifica al administrador para reasignación manual o emisión de cupo especial.

---

## 3. Pipeline de Webhooks

Tanto `POST /api/v1/webhooks/mercado-pago` como `POST /api/v1/webhooks/openpay` ejecutan estrictamente el siguiente pipeline de 6 etapas:

```text
[1. RECEIVE]
  HTTP POST recibido con payload crudo y headers de firma
        │
        ▼
[2. VERIFY AUTHENTICITY]
  Verificación HMAC-SHA256 / firma criptográfica con secreto del proveedor
  - Si la firma es inválida o expiró -> HTTP 401 UNAUTHENTICATED
        │
        ▼
[3. DEDUPLICATE PROVIDER EVENT]
  Búsqueda en payment_provider_events por (provider, external_event_id)
  - Si ya existe -> Retorna HTTP 200 { status: 'ALREADY_PROCESSED' }
  - Si es nuevo -> Inserta registro con processing_status = 'RECEIVED'
        │
        ▼
[4. SERVER-TO-SERVER LOOKUP]
  Consulta directa al API oficial del proveedor (GET /payments/{id})
  garantizando que el payload del webhook no fue falsificado ni alterado
        │
        ▼
[5. NORMALIZE RESULT]
  Conversión a DTO neutral ProviderPaymentDetails y mapeo a NormalizedPaymentStatus
        │
        ▼
[6. APPLICATION LAYER DISPATCH]
  Ejecución transaccional: PaymentAttempt -> CONFIRMED, PaymentTransaction, Allocations,
  OutboxEvent (payment_transaction.confirmed.v1)
```

### 3.1 Política de Privacidad en Logs de Webhooks (Zero-Leakage)
- Prohibido registrar números de tarjeta (PAN), códigos CVV o tokens de pasarela.
- Prohibido volcar el header `Authorization` o los secretos de firma en logs.
- Los logs únicamente registran: `provider`, `external_event_id`, `action`, y `attempt_id`.

---

## 4. Almacenamiento de Archivos (File Storage)

### 4.1 Interfaz Canónica: `FileStorageAdapter`

```typescript
export interface FileStorageAdapter {
  upload(input: UploadFileInput): Promise<UploadFileResult>;
  getSignedDownloadUrl(input: GetSignedUrlInput): Promise<string>;
  verifySignedUrl(token: string, path: string): Promise<boolean>;
  delete(storagePath: string): Promise<boolean>;
  getMetadata(storagePath: string): Promise<FileMetadata>;
}
```

### 4.2 Matriz de Validación por Propósito (`FilePurpose`)

| Propósito (`FilePurpose`) | MIME Types Permitidos | Tamaño Máximo | Acceso | Retención |
|---|---|---|---|---|
| `PAYMENT_EVIDENCE` | `image/jpeg`, `image/png`, `image/webp`, `application/pdf` | 10 MB | Privado (Graduado / Admin) | Permanente |
| `SEATING_BACKGROUND` | `image/jpeg`, `image/png`, `application/pdf` | 25 MB | Privado (Admin operativo) | Vida del evento |
| `THERMO_EVIDENCE` | `image/jpeg`, `image/png`, `image/webp` | 10 MB | Privado (Admin / Titular) | Auditoría (1 año) |
| `EXPORT` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `text/csv`, `application/pdf` | 50 MB | Privado (Admin solicitante) | Temporal (24 horas) |

### 4.3 Arquitectura de Acceso Seguro mediante URLs Firmadas (Signed URLs)
1. **Rutas Privadas por Defecto:** Los archivos se almacenan bajo nombres generados por UUID en directorios privados: `uploads/{purpose}/{uuid}.bin`.
2. **Generación de URLs Firmadas:**
   - La URL contiene: `path`, `exp` (UNIX timestamp de expiración) y `sig` (HMAC-SHA256 sobre `path:exp` firmado con `STORAGE_SIGNED_URL_SECRET`).
   - TTL estándar: 15 minutos para comprobantes; 60 minutos para exportaciones.
3. **Verificación Estricta:**
   - Si `now > exp`, la URL expira inmediatamente arrojando HTTP 403 / 401.
   - Si la firma `sig` no coincide exactamente (`crypto.timingSafeEqual`), la petición es rechazada sin revelar si el archivo existe o no.
   - Se impide cualquier intento de Path Traversal (`../`, rutas absolutas no autorizadas).

---

## 5. Servicio de Correo Electrónico (Email)

### 5.1 Interfaz Canónica: `EmailAdapter`

```typescript
export interface EmailAdapter {
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
  sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<SendEmailResult>;
  sendTransactionalNotification(input: TransactionalNotificationInput): Promise<SendEmailResult>;
}
```

### 5.2 Casos de Uso Oficiales
1. **Reseteo de Contraseña (`authPasswordResetRequest`):**
   - Transmite enlace seguro hacia el frontend: `https://app.plataformagr.com/reset-password?token={resetToken}`.
   - **Regla Zero-Leakage:** El token de reseteo **NUNCA** se imprime en los logs de la aplicación. En logs y trazas de depuración se reemplaza obligatoriamente por `***MASKED***`.
2. **Notificaciones Transaccionales:**
   - Notificación de comprobante de pago aprobado o rechazado.
   - Confirmación de aceptación de contrato digital.
   - Alerta de exportación de reporte lista para descarga.

### 5.3 Desacoplamiento mediante Outbox Pattern
- Las solicitudes de correo no bloquean la respuesta HTTP del cliente.
- El caso de uso persiste la intención en base de datos o encola la tarea en `OutboxEvent` para despacho asíncrono seguro con retries ante indisponibilidad del servidor SMTP.

---

## 6. Variables de Entorno y Configuración Centralizada

Todas las integraciones se configuran de forma centralizada con validación fail-fast al inicializar:

```env
# ==============================================================================
# PAGOS — MERCADO PAGO (PRIMARY)
# ==============================================================================
PAYMENTS_MP_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PAYMENTS_MP_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYMENTS_MP_SANDBOX=true

# ==============================================================================
# PAGOS — OPENPAY (SECONDARY)
# ==============================================================================
PAYMENTS_OPENPAY_MERCHANT_ID=mxxxxxxxxxxxxxxxxxxx
PAYMENTS_OPENPAY_PRIVATE_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYMENTS_OPENPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYMENTS_OPENPAY_SANDBOX=true

# ==============================================================================
# ALMACENAMIENTO DE ARCHIVOS (STORAGE)
# ==============================================================================
STORAGE_DRIVER=local
STORAGE_LOCAL_DIR=./storage/uploads
STORAGE_SIGNED_URL_SECRET=gr_storage_secret_key_change_in_production_min_32_chars
STORAGE_DEFAULT_EXPIRATION_SECONDS=900

# ==============================================================================
# CORREO ELECTRÓNICO (EMAIL)
# ==============================================================================
MAIL_DRIVER=fake
MAIL_FROM_ADDRESS=no-reply@plataformagr.com
MAIL_FROM_NAME="Plataforma GR"
MAIL_SMTP_HOST=smtp.mailtrap.io
MAIL_SMTP_PORT=587
MAIL_SMTP_USER=
MAIL_SMTP_PASS=
```
