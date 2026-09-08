# Reporte de Validación — Integrations & Adapters Contract (Mercado Pago, OpenPay, File Storage, Email)

**Documento:** `INTEGRATIONS_VALIDATION.md`  
**Fecha:** 8 de septiembre de 2026  
**Fase de Roadmap:** Entregable #11 — Integraciones Externas, Adaptadores Hexagonales y Webhooks  
**Estado:** **PASSED (100%)**

---

## 1. Resumen Ejecutivo

Se completó la especificación contractual, arquitectura hexagonal de adaptadores y pruebas contractuales rigurosas para las integraciones externas de **Plataforma GR**:

1. **`docs/INTEGRATIONS.md`**:
   - Especificación normativa formal que define los puertos (`PaymentProviderAdapter`, `FileStorageAdapter`, `EmailAdapter`) desacoplados estrictamente de SDKs de terceros.
   - Configuración centralizada fail-fast (`IntegrationsConfig`) con separación estricta de credenciales de Sandbox y Producción (`INTEGRATIONS_ENVIRONMENT`). Prohibición absoluta de secretos hardcodeados.
   - Pipeline canónico de webhooks en 6 fases: recepción, autenticación criptográfica (HMAC-SHA256 / Basic Auth), deduplicación por folio en `PaymentProviderEvent`, consulta server-to-server, normalización agnóstica de estados y despacho a capa de aplicación.
   - Invariantes críticos normados:
     - **RETURN_URL_CANNOT_CONFIRM_PAYMENT:** La URL de retorno frontend jamás tiene autoridad para confirmar pagos ni alterar el ledger financiero.
     - **PRESERVATION_OF_CONFIRMED_MONEY:** El dinero recaudado legítimamente jamás se revierte automáticamente ante conflictos de capacidad; se confirma el pago y se abre un `ReconciliationCase(PAYMENT_CONFIRMED_CAPACITY_CONFLICT)`.
     - **PRIVATE_BY_DEFAULT_STORAGE:** Archivos privados con URLs firmadas con HMAC y TTL de expiración; prohibición de path traversal.
     - **ZERO_LEAKAGE_EMAIL:** Prohibición absoluta de registrar tokens de reseteo en texto claro en logs del sistema (`***MASKED***`).

2. **Capa Backend de Integraciones (`backend/src/integrations/`)**:
   - `config/integrations.config.ts`: Carga y validación fail-fast con detección de entorno sandbox/producción.
   - `payments/`:
     - `payment-provider.interface.ts`: Interfaz canónica agnóstica (`createPayment`, `getPayment`, `verifyWebhook`, `refund`, `normalizeStatus`).
     - `mercado-pago.adapter.ts`: Verificación HMAC-SHA256 con tolerancia a drift de timestamp (5 min), normalización a estados canónicos (`CONFIRMED`, `PENDING`, `FAILED`, `CANCELLED`, `REFUNDED`), manejo de timeout con HTTP 503 `DEPENDENCY_UNAVAILABLE`.
     - `openpay.adapter.ts`: Verificación por Basic Auth y HMAC SHA-256, mapeo canónico y timeouts.
   - `storage/`:
     - `file-storage.interface.ts`: Reglas de propósito (`PAYMENT_EVIDENCE`, `SEATING_BACKGROUND`, `THERMO_EVIDENCE`, `EXPORT`) con límites de tamaño y tipos MIME estrictos.
     - `local-disk-storage.adapter.ts`: Implementación de sistema de archivos local seguro, validación de path traversal (`..` y paths absolutos), firmas HMAC con timestamps `exp` y expiración estricta.
     - `storage.service.ts`: Orquestación de persistencia con entidad Prisma `FileAsset`, validación de roles y propiedad (`RESOURCE_NOT_FOUND` / `FORBIDDEN_RESOURCE`).
   - `email/`:
     - `email.interface.ts`: Contrato de mensajería transaccional.
     - `fake-email.adapter.ts`: Adaptador de desarrollo y pruebas con enmascaramiento estricto de secretos (`***MASKED***`).
     - `email.service.ts`: Integración transaccional opcional con `OutboxService` (`email.password_reset.v1`) para garantizar atomicidad ACID.
   - `integrations.module.ts`: Módulo NestJS registrado globalmente en `AppModule`.

3. **Servicio y Controlador de Webhooks (`backend/src/webhooks/`)**:
   - `webhooks.service.ts`: Ejecuta la deduplicación idempotente contra `PaymentProviderEvent`, valida formato UUID de `attemptId`, confirma `PaymentAttempt`, detecta sobrecupos y crea `ReconciliationCase` preservando el ledger.
   - `webhooks.controller.ts`: Endpoints públicos `@Post('mercado-pago')`, `@Post('openpay')` y `@Get('return')` que impone el rechazo `RETURN_URL_CANNOT_CONFIRM_PAYMENT` (HTTP 400).

---

## 2. Cobertura de Pruebas Unitarias

### 2.1 Payment Providers (`src/integrations/payments/payment-provider.spec.ts`)
| Caso de Prueba | Proveedor | Condición Evaluada | Resultado |
|---|---|---|:---:|
| Firma HMAC válida con ts y v1 | Mercado Pago | Autenticación exitosa y extracción de IDs | **PASSED** |
| Header x-signature ausente | Mercado Pago | Rechazo `isValid: false` | **PASSED** |
| Firma HMAC manipulada | Mercado Pago | Rechazo `isValid: false` | **PASSED** |
| Timestamp con drift > 5 min | Mercado Pago | Rechazo por expiración de ventana | **PASSED** |
| Normalización de estados | Mercado Pago | Mapeo de `approved` → `CONFIRMED`, `rejected` → `FAILED`, etc. | **PASSED** |
| Simulación de timeout | Mercado Pago | Lanza `DependencyUnavailableException` (503) | **PASSED** |
| Basic Auth válida en header | OpenPay | Autenticación exitosa y extracción de IDs | **PASSED** |
| Firma HMAC válida en body | OpenPay | Autenticación exitosa con digest SHA-256 | **PASSED** |
| Credenciales inválidas | OpenPay | Rechazo `isValid: false` | **PASSED** |
| Header de firma ausente | OpenPay | Rechazo `isValid: false` | **PASSED** |
| Normalización de estados | OpenPay | Mapeo de `completed` → `CONFIRMED`, `charge_pending` → `PENDING`, etc. | **PASSED** |
| Simulación de timeout | OpenPay | Lanza `DependencyUnavailableException` (503) | **PASSED** |
| Creación de intención de pago | Ambos | Genera URLs de checkout acordes al entorno sandbox/prod | **PASSED** |

### 2.2 File Storage (`src/integrations/storage/storage.spec.ts`)
| Caso de Prueba | Componente | Condición Evaluada | Resultado |
|---|---|---|:---:|
| Tipo MIME no permitido | LocalDiskStorageAdapter | Rechazo con `InvalidRequestException` para `.exe` en `PAYMENT_EVIDENCE` | **PASSED** |
| Tamaño excedido | LocalDiskStorageAdapter | Rechazo con `InvalidRequestException` para archivos > 10 MB | **PASSED** |
| Subida válida | LocalDiskStorageAdapter | Guarda con UUID impredecible y estructura segura | **PASSED** |
| Generación URL firmada | LocalDiskStorageAdapter | Incluye `path`, `exp` y firma HMAC `sig` | **PASSED** |
| Verificación URL válida | LocalDiskStorageAdapter | Valida correctamente firma y vigencia | **PASSED** |
| Verificación URL expirada | LocalDiskStorageAdapter | Rechaza con `isValid: false` si `exp` ya pasó | **PASSED** |
| Detección de manipulación | LocalDiskStorageAdapter | Rechaza si `storagePath` o firma fueron alterados | **PASSED** |
| Protección Path Traversal | LocalDiskStorageAdapter | Bloquea `../../` y rutas absolutas con `InvalidRequestException` | **PASSED** |
| Descarga autorizada (dueño) | StorageService | Permite al graduado propietario generar URL de descarga | **PASSED** |
| Rechazo IDOR (otro graduado) | StorageService | Bloquea a graduado ajeno con `ForbiddenResourceException` (403) | **PASSED** |
| Descarga autorizada (ADMIN) | StorageService | Permite al Administrador acceder a cualquier comprobante | **PASSED** |
| Recurso inexistente | StorageService | Lanza `ResourceNotFoundException` (404) | **PASSED** |

### 2.3 Email Service (`src/integrations/email/email.spec.ts`)
| Caso de Prueba | Componente | Condición Evaluada | Resultado |
|---|---|---|:---:|
| Envío de correo general | FakeEmailAdapter | Registra mensaje en memoria con `messageId` | **PASSED** |
| Enmascaramiento Zero-Leakage | FakeEmailAdapter | Logger jamás imprime token en claro; registra `***MASKED***` | **PASSED** |
| Notificación transaccional | FakeEmailAdapter | Despacha notificación estructurada (`PAYMENT_APPROVED`) | **PASSED** |
| Integración Outbox ACID | EmailService | Emite evento `email.password_reset.v1` atómicamente si se provee `tx` | **PASSED** |

---

## 3. Cobertura de Pruebas Integrales E2E (`test/integrations.e2e-spec.ts`)

| Suite / Caso de Prueba | Endpoint | Condición Evaluada | Resultado |
|---|---|---|:---:|
| **MP Webhook sin Firma** | `POST /api/v1/webhooks/mercado-pago` | Rechaza con HTTP 401 y código `UNAUTHENTICATED` | **PASSED** |
| **MP Webhook Firma Manipulada** | `POST /api/v1/webhooks/mercado-pago` | Rechaza con HTTP 401 y código `UNAUTHENTICATED` | **PASSED** |
| **MP Webhook Válido** | `POST /api/v1/webhooks/mercado-pago` | Procesa y responde `{ received: true }` con HTTP 200 | **PASSED** |
| **OpenPay Webhook sin Auth** | `POST /api/v1/webhooks/openpay` | Rechaza con HTTP 401 y código `UNAUTHENTICATED` | **PASSED** |
| **OpenPay Webhook Válido** | `POST /api/v1/webhooks/openpay` | Procesa y responde `{ received: true }` con HTTP 200 | **PASSED** |
| **Invariante Return URL** | `GET /api/v1/webhooks/return?status=approved` | Rechaza con HTTP 400 y código `RETURN_URL_CANNOT_CONFIRM_PAYMENT` | **PASSED** |

---

## 4. Resumen de Ejecución y Métricas

- **Pruebas Unitarias Integrations:** 29 passed (100%)
- **Pruebas Unitarias Totales Backend:** 93 passed (100% en 9 suites)
- **Pruebas E2E Totales Backend:** 58 passed (100% en 6 suites)
- **Linting (`npm run lint`):** 0 errores
- **Tipado estricto (`npm run typecheck`):** 0 errores
- **Build de Producción (`npm run build`):** Exitoso
