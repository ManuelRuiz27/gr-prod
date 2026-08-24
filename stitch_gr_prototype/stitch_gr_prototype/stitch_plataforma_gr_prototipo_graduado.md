# PLATAFORMA GR — MASTER BRIEF PARA GOOGLE STITCH
## Prototipo completo de la experiencia del Graduado

**Objetivo:** generar en Google Stitch un prototipo mobile-first, navegable y de alta fidelidad de Plataforma GR, cubriendo exclusivamente al rol **GRADUADO**.

**No generar:** landing page, panel administrativo, dashboard desktop, código productivo, backend, APIs ni funcionalidades fuera de este documento.

---

# 1. CONTEXTO DEL PRODUCTO

Plataforma GR es una plataforma para gestionar eventos de graduación.

El producto tiene únicamente dos roles funcionales:

- ADMIN
- GRADUADO

Este prototipo cubre únicamente al **GRADUADO**.

El graduado utilizará principalmente la aplicación desde smartphone y no debe necesitar conocimientos técnicos.

La interfaz debe permitir responder rápidamente:

- ¿Cuánto he pagado?
- ¿Cuánto debo?
- ¿Cuándo tengo que pagar?
- ¿Cuántos lugares tengo?
- ¿Quiénes son mis invitados?
- ¿En qué mesa estoy?
- ¿Qué platillos seleccioné?
- ¿Ya puedo solicitar mi termo?
- ¿Qué me falta por completar?

---

# 2. DIRECCIÓN DE EXPERIENCIA

Diseña una experiencia:

- premium;
- contemporánea;
- sobria;
- elegante;
- confiable;
- sencilla;
- apropiada para un evento social importante.

Debe sentirse como un **acompañante digital premium para una graduación**, no como:

- ERP;
- banca empresarial;
- portal gubernamental;
- software contable;
- invitación digital;
- app infantil.

### Mobile-first
Referencia principal: **390 × 844 px**.

### Navegación inferior
Usar exactamente cuatro destinos:

1. Inicio
2. Mi grupo
3. Pagos
4. Más

Mesa, platillos y termo se abren mediante acciones contextuales desde Inicio o Mi grupo.

---

# 3. PRINCIPIOS UX

Aplicar:

- progressive disclosure;
- una acción principal por pantalla;
- jerarquía visual clara;
- textos cortos;
- prevención de errores;
- confirmaciones antes de cambios importantes;
- montos y fechas muy visibles;
- estados con icono + texto;
- targets táctiles amplios;
- formularios simples;
- mensajes de error en lenguaje natural.

Evitar:

- tablas complejas;
- IDs;
- datos técnicos;
- demasiadas tarjetas;
- navegación profunda;
- estados internos.

Toda la UI visible debe estar en español.

No mostrar términos como:
API, webhook, provider, UUID, transaction ID, tenant, idempotency, status, ACTIVE, DRAFT, payload, SSE, payment intent.

---

# 4. SISTEMA VISUAL

## Paleta base

- Primary / Azul noche: `#1A2B4C`
- Background: `#F8F9FA`
- Surface: `#FFFFFF`
- Accent / Dorado discreto: `#D4AF37`
- Success: `#1B4D3E`
- Success surface: `#E8F5E9`
- Warning: `#B76E00`
- Warning surface: `#FFF8E1`
- Error: `#9A2A2A`
- Error surface: `#FFEBEE`
- Disabled: `#9E9E9E`
- Disabled surface: `#F0F0F0`
- Text primary: `#1C2430`
- Text secondary: `#667085`
- Border: `#D0D5DD`

El dorado debe ser un acento, nunca el color dominante.

## Tipografía

Preferencia: **Inter** o sans-serif moderna equivalente.

Jerarquía aproximada:

- Display 28 Bold
- H1 24 Bold
- H2 20 SemiBold
- H3 16 SemiBold
- Body 14 Regular
- Small 12 Regular
- Button 14 SemiBold

## Componentes consistentes

Crear y reutilizar patrones visuales para:

- App Header
- Event Header
- Primary Button
- Secondary Button
- Text Button
- Input
- Password Input
- Card
- Financial Summary
- Payment Card
- Guest Row
- Meal Row
- Table marker
- Status Badge
- Progress Bar
- Bottom Navigation
- Modal
- Bottom Sheet
- Toast
- Alert Banner
- Empty State
- Error State
- Skeleton Loading
- Confirmation Dialog
- Notification Row
- Event Card

Botón principal: alrededor de 48 px de alto.

Targets táctiles: alrededor de 44 px o más.

No comunicar estados únicamente mediante color.

---

# 5. DATOS DEMO OBLIGATORIOS

Mantener estos datos consistentes en TODO el prototipo.

### Graduado
**Andrea Martínez**

Correo:
`andrea.martinez@ejemplo.com`

### Evento
**Graduación Facultad de Derecho 2027**

Fecha:
**19 de junio de 2027**

Lugar:
**Centro de Convenciones**

### Finanzas

Total contratado:
**$12,500 MXN**

Pagado:
**$7,500 MXN**

Pendiente:
**$5,000 MXN**

Avance:
**60%**

Próximo pago:
**$2,500 MXN**

Fecha límite:
**15 de marzo de 2027**

Mensualidades:

1. Mensualidad 1 — $2,500 — Pagado
2. Mensualidad 2 — $2,500 — Pagado
3. Mensualidad 3 — $2,500 — Pagado
4. Mensualidad 4 — $2,500 — Próximo
5. Mensualidad 5 — $2,500 — Pendiente

Después del pago de la mensualidad 4:

- Pagado: $10,000
- Pendiente: $2,500
- Avance: 80%

### Grupo

Lugares contratados:
**8**

Invitados:

1. Andrea Martínez — Titular
2. Carlos Martínez
3. Elena Martínez
4. Luis Martínez
5. Sofía Ramírez
6. Diego Ramírez
7. Paula Hernández
8. Mateo Hernández

Mesa:
**Mesa 24**

### Platillos

- Tradicional
- Vegetariano
- Vegano

### Termo

Avance inicial:
**60%**

Umbral:
**70%**

Estado inicial:
**Bloqueado**

A 80%:
**Disponible**

---

# 6. REGLAS DE NEGOCIO CERRADAS

No inventar alternativas.

### Acceso
- El graduado entra mediante link o código asociado al evento.
- Puede pertenecer a más de un evento.

### Lugares
- Puede agregar invitados hasta una fecha límite y mientras exista capacidad.
- Reducir lugares después de confirmar requiere autorización del organizador.
- Un grupo puede repartirse entre varias mesas.

### Mesas
- Puede cambiar de mesa hasta una fecha límite.
- La disponibilidad puede cambiar mientras selecciona.
- Si pierde disponibilidad, mostrar un mensaje sencillo y pedir otra selección.

### Platillos
- Las opciones las configura el organizador.
- Después del cierre, el graduado solo consulta.
- Para cambios posteriores debe contactar al organizador.

### Pagos
- Calendario fijo por evento.
- El lugar se considera realmente apartado cuando se confirma el pago inicial.
- No se permiten pagos parciales de una mensualidad.
- Sí se permiten pagos anticipados.
- **Mercado Pago es la pasarela principal.**
- Usar conceptualmente **Checkout Pro con experiencia prediseñada**.
- **OpenPay es alternativa secundaria.**
- No diseñar captura de tarjeta dentro de Plataforma GR para el flujo principal.
- Al volver de Mercado Pago, no asumir éxito.
- Mostrar primero: **Estamos confirmando tu pago**.
- Los pagos confirmados no se editan ni eliminan.

### Termo
Estados:
1. Bloqueado
2. Disponible
3. Solicitado
4. En producción
5. Entregado

El graduado puede modificar su solicitud únicamente antes de “En producción”.

### Notificaciones
MVP:
- panel;
- email.

---

# 7. PANTALLAS DEL PROTOTIPO

Generar todas las siguientes vistas dentro del mismo proyecto y conectarlas mediante **Prototypes**.

---

## A. ACCESO

### A1 — Accede a tu graduación

Título:
**Accede a tu graduación**

Texto:
`Ingresa el código que te proporcionó tu organizador.`

Campo:
`Código del evento`

CTA:
**Continuar**

Secundario:
`Ya tengo una cuenta`

Error:
`No encontramos un evento con ese código. Revisa e inténtalo nuevamente.`

---

### A2 — Registro

Contexto superior:
**Graduación Facultad de Derecho 2027**

Campos:
- Nombre completo
- Correo electrónico
- Teléfono
- Carrera
- Generación
- Contraseña
- Confirmar contraseña

CTA:
**Crear mi cuenta**

Texto:
`Tu cuenta quedará vinculada a esta graduación.`

---

### A3 — Login

Marca:
**Plataforma GR**

Subtítulo:
`Tu graduación, en un solo lugar`

Campos:
- Correo electrónico
- Contraseña

CTA:
**Iniciar sesión**

Secundarios:
- `Olvidé mi contraseña`
- `Tengo un código de evento`

---

### A4 — Recuperar contraseña

Título:
**Recupera tu contraseña**

Campo:
`Correo electrónico`

CTA:
**Enviar enlace**

---

### A5 — Correo enviado

Título:
**Revisa tu correo**

Texto:
`Te enviamos un enlace temporal para crear una nueva contraseña.`

---

## B. MIS EVENTOS

### B1 — Selector de evento

Mostrar tarjetas simples.

Evento principal:

**Graduación Facultad de Derecho 2027**
`19 junio 2027`
Badge: `En curso`

CTA:
**Abrir**

Segundo ejemplo:
**Cena de Gala Generación 2027**
Badge: `Próximamente`

Si el usuario solo tiene un evento, Inicio puede abrir directamente.

---

# 8. HOME

## C1 — Inicio normal

Header:
**Hola, Andrea**

Evento:
**Graduación Facultad de Derecho 2027**

Fecha:
`19 de junio de 2027`

Lugar:
`Centro de Convenciones`

La pantalla debe responder visualmente:
**¿Cómo voy con mi graduación?**

### Estado financiero
**60% completado**

Has pagado:
**$7,500 MXN**

Pendiente:
**$5,000 MXN**

Barra de progreso 60%.

### Próximo pago
**$2,500 MXN**
`15 de marzo de 2027`

CTA:
**Pagar ahora**

### Resumen compacto
- 8 lugares
- Mesa 24
- Platillos pendientes
- Termo bloqueado

Texto termo:
`Se desbloquea al alcanzar el 70% de tus pagos.`

### Próximas acciones
- Elegir platillos
- Revisar mesa
- Realizar pago

Evitar cuadrículas saturadas.

---

## C2 — Pago próximo

Banner:
**Tu próxima mensualidad vence pronto**

CTA:
**Pagar ahora**

---

## C3 — Pago vencido

Banner:
**Tienes un pago pendiente**

Texto:
`La fecha de pago ya pasó. Puedes liquidarlo ahora.`

CTA:
**Ver pago**

Tono informativo, no agresivo.

---

# 9. NOTIFICACIONES

## D1 — Lista de notificaciones

Ejemplos:

`Tu pago de $2,500 vence el 15 de marzo.`

`Recibimos tu pago de $2,500.`

`Tu mesa es Mesa 24.`

`El 30 de abril cierra la selección de platillos.`

`Ya puedes solicitar tu termo.`

Diferenciar nueva / leída.

---

# 10. MI GRUPO

## E1 — Resumen

Título:
**Mi grupo**

Resumen:
**8 de 8 lugares utilizados**

Lista:
- Andrea Martínez — Titular
- Carlos Martínez
- Elena Martínez
- Luis Martínez
- Sofía Ramírez
- Diego Ramírez
- Paula Hernández
- Mateo Hernández

Mostrar secundariamente mesa y platillo cuando exista.

CTA cuando haya capacidad:
**Agregar invitado**

Cuando no:
`Todos tus lugares están asignados`

Acción:
`Solicitar lugares adicionales`

---

## E2 — Agregar invitado

Campo:
`Nombre completo`

Texto:
`Al agregar un lugar adicional pueden generarse pagos pendientes correspondientes al calendario del evento.`

Mostrar costo antes de confirmar cuando aplique.

CTA:
**Agregar invitado**

---

## E3 — Sin capacidad

Título:
**No hay lugares disponibles**

Texto:
`El evento alcanzó su capacidad disponible.`

CTA:
**Volver a mi grupo**

---

## E4 — Reducir lugares

Modal:

**¿Necesitas reducir tus lugares?**

Texto:
`Este cambio debe ser revisado por el organizador porque puede modificar tu plan de pagos.`

CTA:
**Solicitar cambio**

Secundario:
**Cancelar**

---

# 11. MESAS

No crear editor administrativo.

## F1 — Elegir mesa

Título:
**Elige tu mesa**

Texto:
`Selecciona una mesa con lugares suficientes para tu grupo.`

Crear un plano simple del salón.

Estados:
- Disponible
- Pocos lugares
- Completa
- Mi mesa

Mesa 24 debe identificarse claramente.

La experiencia puede sugerir zoom/pan, pero sin herramientas de edición.

---

## F2 — Detalle de mesa

**Mesa 24**

`8 lugares disponibles`

`Tu grupo necesita 8`

CTA:
**Elegir esta mesa**

Caso insuficiente:
`Esta mesa no tiene suficientes lugares para todo tu grupo.`

Secundario:
**Ver otras mesas**

---

## F3 — Confirmación

Modal:
**Confirmar Mesa 24**

Texto:
`Asignaremos tus 8 lugares a esta mesa.`

CTA:
**Confirmar mesa**

---

## F4 — Éxito

**Mesa confirmada**

`Tu grupo está en Mesa 24.`

---

## F5 — Disponibilidad cambió

Título:
**Esta mesa acaba de cambiar**

Texto:
`Ya no hay suficientes lugares disponibles para tu grupo. Elige otra mesa.`

CTA:
**Ver mesas disponibles**

---

## F6 — Cambios cerrados

Título:
**Tu mesa está confirmada**

Texto:
`El periodo para realizar cambios ya terminó. Si necesitas ayuda, contacta al organizador.`

---

# 12. PLATILLOS

## G1 — Resumen

Título:
**Platillos**

Texto:
`Selecciona una opción para cada integrante de tu grupo.`

Ejemplo:
- Andrea Martínez — Tradicional
- Carlos Martínez — Vegano
- Elena Martínez — Pendiente
- Luis Martínez — Tradicional
- Sofía Ramírez — Vegetariano
- Diego Ramírez — Tradicional
- Paula Hernández — Vegano
- Mateo Hernández — Tradicional

CTA:
**Guardar selecciones**

---

## G2 — Selección

Bottom sheet:
**Platillo para Elena Martínez**

Opciones:
- Tradicional
- Vegetariano
- Vegano

CTA:
**Guardar**

---

## G3 — Revisión

Título:
**Revisa tus platillos**

Mostrar los 8 asistentes.

CTA:
**Confirmar**

---

## G4 — Guardado

Toast:
**Platillos guardados**

---

## G5 — Selección cerrada

Banner:
**La selección de platillos ya cerró**

Texto:
`Si necesitas realizar un cambio, contacta al organizador.`

Modo solo lectura.

---

# 13. PAGOS

Este debe ser el módulo con mayor claridad visual.

## H1 — Mis pagos

Título:
**Mis pagos**

### Resumen

Total contratado:
**$12,500 MXN**

Pagado:
**$7,500 MXN**

Pendiente:
**$5,000 MXN**

Avance:
**60%**

### Próximo pago

**$2,500 MXN**

`15 de marzo de 2027`

CTA:
**Pagar ahora**

### Calendario

Mensualidad 1 — $2,500 — Pagado  
Mensualidad 2 — $2,500 — Pagado  
Mensualidad 3 — $2,500 — Pagado  
Mensualidad 4 — $2,500 — Próximo  
Mensualidad 5 — $2,500 — Pendiente

---

## H2 — Detalle

**Mensualidad 4**

Monto:
**$2,500 MXN**

Vence:
`15 de marzo de 2027`

Estado:
**Próximo**

CTA:
**Pagar ahora**

Texto:
`Puedes pagar esta mensualidad o adelantar pagos futuros.`

---

## H3 — Confirmación previa

Título:
**Vas a pagar**

Concepto:
`Mensualidad 4`

Evento:
`Graduación Facultad de Derecho 2027`

Graduado:
`Andrea Martínez`

Monto:
**$2,500 MXN**

Método principal:
**Mercado Pago**

Texto:
`Continuarás en Mercado Pago para completar tu pago de forma segura.`

CTA:
**Continuar con Mercado Pago**

Secundario:
**Otros métodos de pago**

---

## H4 — Pantalla puente Mercado Pago

NO imitar la UI real de Mercado Pago.

Mostrar únicamente:

**Continuando a Mercado Pago…**

`Completa tu pago de forma segura en la siguiente pantalla.`

Spinner/loading.

---

## H5 — Confirmando pago

Título:
**Estamos confirmando tu pago**

Texto:
`Esto puede tomar unos momentos. Te avisaremos cuando el pago quede confirmado.`

No mostrar éxito todavía.

---

## H6 — Pago confirmado

Título:
**Pago confirmado**

Monto:
**$2,500 MXN**

Concepto:
`Mensualidad 4`

CTA:
**Volver a mis pagos**

Secundario:
`Ver comprobante`

Actualizar:
- Pagado: **$10,000 MXN**
- Pendiente: **$2,500 MXN**
- Avance: **80%**

Mostrar:
**Tu termo ya está disponible**

CTA:
**Solicitar mi termo**

---

## H7 — Pago fallido

Título:
**No pudimos completar el pago**

Texto:
`No se realizó ningún cargo confirmado.`

CTA:
**Intentar nuevamente**

Secundario:
**Elegir otro método**

---

## H8 — Pago pendiente

Título:
**Pago pendiente**

Texto:
`Tu pago todavía está siendo procesado.`

CTA:
**Volver a mis pagos**

---

## H9 — Historial

Título:
**Historial de pagos**

12 febrero 2027  
Mensualidad 3  
$2,500 MXN  
Pagado

15 enero 2027  
Mensualidad 2  
$2,500 MXN  
Pagado

15 diciembre 2026  
Mensualidad 1  
$2,500 MXN  
Pagado

No mostrar IDs técnicos.

---

## H10 — Otros métodos

Título:
**Otros métodos de pago**

### OpenPay
`Pagar con otro proveedor`

CTA:
**Continuar con OpenPay**

### Efectivo o transferencia
`Si realizaste un pago directamente con el organizador, este aparecerá aquí una vez que sea validado.`

El graduado no puede marcar un pago como pagado.

---

# 14. TERMO

## I1 — Bloqueado

Título:
**Mi termo**

Estado:
**Bloqueado**

Avance:
**60%**

Texto:
`Se desbloquea al alcanzar el 70% de tus pagos.`

`Te falta 10%.`

CTA:
**Ver mis pagos**

---

## I2 — Disponible

Estado:
**Disponible**

Texto:
`Ya puedes solicitar tu termo.`

CTA:
**Solicitar termo**

---

## I3 — Solicitud

Título:
**Personaliza tu termo**

Campo:
`Nombre para personalización`

Valor:
`Andrea`

Texto:
`Podrás modificar estos datos mientras tu termo no esté en producción.`

CTA:
**Enviar solicitud**

---

## I4 — Solicitado

Estado:
**Solicitado**

Personalización:
`Andrea`

CTA:
**Editar datos**

---

## I5 — En producción

Estado:
**En producción**

Texto:
`Tu termo ya está en producción y no puede modificarse.`

Sin edición.

---

## I6 — Entregado

Estado:
**Entregado**

Texto:
`Tu termo fue entregado.`

---

# 15. RESUMEN

## J1 — Mi graduación

Título:
**Mi graduación**

### Evento
Graduación Facultad de Derecho 2027  
19 de junio de 2027  
Centro de Convenciones

### Mi grupo
8 lugares  
CTA: **Ver grupo**

### Mesa
Mesa 24  
CTA: **Ver mesa**

### Platillos
8 de 8 seleccionados  
CTA: **Ver platillos**

### Pagos
Pagado $7,500  
Pendiente $5,000  
CTA: **Ver pagos**

### Termo
Bloqueado  
CTA: **Ver termo**

---

## J2 — Todo listo

Título:
**Todo listo para tu graduación**

Mostrar checks:
- Lugares completos
- Mesa confirmada
- Platillos completos
- Pagos al día
- Termo solicitado

Debe sentirse como un cierre premium y positivo.

---

## J3 — Evento finalizado

Título:
**Tu evento ha finalizado**

Permitir consulta histórica.

No permitir cambios.

---

# 16. MÁS / PERFIL

## K1 — Más

Opciones:
- Mi perfil
- Notificaciones
- Ayuda
- Cambiar evento
- Cerrar sesión

---

## K2 — Perfil

Mostrar:
- Andrea Martínez
- andrea.martinez@ejemplo.com
- Teléfono
- Carrera
- Generación

No mostrar ni permitir editar:
- rol;
- montos;
- condiciones financieras;
- estados internos de pagos.

---

## K3 — Ayuda

Título:
**¿Necesitas ayuda?**

Opciones:
- Contactar al organizador
- Preguntas frecuentes

No inventar chat en vivo.

---

## K4 — Logout

Modal:
**¿Cerrar sesión?**

CTA:
**Cerrar sesión**

Secundario:
**Cancelar**

---

# 17. ESTADOS GENERALES

Crear ejemplos coherentes para:

### Loading
Skeletons.

### Vacío
`Aún no tienes notificaciones.`

### Error
`No pudimos cargar esta información.`

CTA:
`Intentar de nuevo`

### Sin conexión
`Parece que no tienes conexión.`

CTA:
`Reintentar`

---

# 18. CONECTAR COMO PROTOTIPO

Conectar las pantallas utilizando la función **Prototypes** de Stitch.

### Flujo principal

Acceso al evento  
→ Registro  
→ Inicio  
→ Mi grupo  
→ Elegir mesa  
→ Confirmar mesa  
→ Platillos  
→ Mis pagos  
→ Confirmar pago  
→ Continuando a Mercado Pago  
→ Estamos confirmando tu pago  
→ Pago confirmado  
→ Termo disponible  
→ Solicitar termo  
→ Todo listo

### Usuario existente

Login → Inicio

### Recuperación

Login → Recuperar contraseña → Revisa tu correo

### Mesa sin disponibilidad

Detalle de mesa → Esta mesa acaba de cambiar → Elegir mesa

### Pago fallido

Confirmar pago → Continuando a Mercado Pago → Pago fallido → Confirmar pago

### Bottom navigation

Inicio → Home  
Mi grupo → Mi grupo  
Pagos → Mis pagos  
Más → Más

---

# 19. RESTRICCIONES ABSOLUTAS

No agregar:

- invitaciones digitales;
- RSVP;
- QR;
- check-in;
- scanner;
- Staff;
- Organizer;
- Planner;
- álbum;
- panel administrativo;
- editor de croquis;
- reportes;
- configuración de evento;
- captura interna de tarjeta para Mercado Pago.

No imitar la interfaz real de Mercado Pago.

Solo representar el paso previo, redirección conceptual y regreso/confirmación dentro de Plataforma GR.

---

# 20. VALIDACIÓN FINAL

Antes de terminar, comprueba visualmente que existen:

- Andrea Martínez
- Graduación Facultad de Derecho 2027
- $12,500
- $7,500
- $5,000
- $2,500
- Mercado Pago
- OpenPay
- Mesa 24
- 70%
- Tradicional
- Vegetariano
- Vegano
- Mi termo
- Mis pagos
- Mi grupo

Y que NO aparezcan:

- InvitacionesPremium
- Organizer
- Planner
- Staff
- RSVP
- Scanner
- Check-in
- Álbum
- Boda
- términos técnicos internos

Verificar además la consistencia financiera:

- $7,500 + $5,000 = $12,500
- 3 × $2,500 = $7,500
- después de pagar $2,500:
  - pagado $10,000
  - pendiente $2,500
  - avance 80%
- al superar el umbral del 70%, el termo queda disponible.

---

# 21. RESULTADO FINAL

Genera **un solo proyecto coherente de Plataforma GR**, no diseños aislados.

Prioriza especialmente la calidad de:

1. Inicio
2. Mi grupo
3. Selección de mesa
4. Platillos
5. Mis pagos
6. Confirmación de pago
7. Confirmando pago
8. Termo
9. Resumen final

El cliente debe poder entender el producto recorriendo el prototipo sin explicación técnica.

**Genera el prototipo completo del GRADUADO y conecta los flujos.**
