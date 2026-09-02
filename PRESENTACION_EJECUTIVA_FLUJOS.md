---
marp: true
theme: default
paginate: true
size: 16:9
html: true
title: Plataforma GR — Experiencia integral
description: Presentación ejecutiva de los flujos de graduado y administración basada en la UI real del repositorio.
style: |
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  :root {
    --navy: #031b41;
    --navy-2: #102b55;
    --ink: #091a35;
    --slate: #66738d;
    --gold: #efc84b;
    --paper: #f5f7fb;
    --white: #ffffff;
    --line: #ccd4e2;
    --success: #dff2e4;
    --danger: #a62128;
  }

  * { box-sizing: border-box; }

  section {
    position: relative;
    overflow: hidden;
    background: var(--paper);
    color: var(--ink);
    font-family: 'Inter', Arial, sans-serif;
    padding: 46px 58px 42px;
  }

  section::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 10px;
    background: var(--gold);
  }

  section::after {
    content: attr(data-flow);
    position: absolute;
    right: 54px;
    top: 28px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .16em;
    color: #8791a5;
  }

  h1, h2, h3, p { margin: 0; }
  h1 { font-size: 56px; line-height: 1.02; letter-spacing: -.04em; }
  h2 { font-size: 38px; line-height: 1.08; letter-spacing: -.035em; }
  h3 { font-size: 19px; line-height: 1.25; }

  .kicker {
    color: #9b7400;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: .15em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .subhead {
    color: var(--slate);
    font-size: 20px;
    line-height: 1.4;
    margin-top: 16px;
    max-width: 650px;
  }

  .cover {
    background: var(--navy);
    color: var(--white);
    padding: 0;
  }

  .cover::before { width: 14px; }
  .cover::after { display: none; }

  .cover-grid {
    display: grid;
    grid-template-columns: 46% 54%;
    min-height: 100%;
  }

  .cover-copy {
    padding: 96px 54px 72px 76px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .cover-copy .eyebrow {
    color: var(--gold);
    font-weight: 800;
    letter-spacing: .18em;
    font-size: 14px;
    margin-bottom: 22px;
  }

  .cover-copy p {
    color: #bec8da;
    font-size: 21px;
    line-height: 1.45;
    margin-top: 22px;
  }

  .cover-art {
    position: relative;
    background: linear-gradient(135deg, #102b55 0%, #061a3b 100%);
    overflow: hidden;
  }

  .cover-art .desktop-shot {
    position: absolute;
    width: 92%;
    right: -12%;
    top: 12%;
    border: 8px solid rgba(255,255,255,.9);
    border-radius: 20px;
    box-shadow: 0 30px 80px rgba(0,0,0,.45);
  }

  .cover-art .mobile-shot {
    position: absolute;
    width: 28%;
    left: 8%;
    bottom: -15%;
    border: 8px solid #fff;
    border-radius: 28px;
    box-shadow: 0 30px 70px rgba(0,0,0,.55);
    z-index: 2;
  }

  .gold-rule { width: 78px; height: 6px; background: var(--gold); margin-top: 28px; }

  .split-stage {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 26px;
    height: 570px;
    margin-top: 18px;
  }

  .persona-panel {
    position: relative;
    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 22px;
    overflow: hidden;
    padding: 26px;
  }

  .persona-panel.dark { background: var(--navy); color: var(--white); border-color: var(--navy); }
  .persona-panel h3 { font-size: 26px; }
  .persona-panel p { color: var(--slate); margin-top: 8px; font-size: 15px; }
  .persona-panel.dark p { color: #b7c4d9; }
  .persona-panel img.mobile { position: absolute; width: 34%; right: 30px; bottom: -28%; border-radius: 22px; box-shadow: 0 18px 48px rgba(9,26,53,.25); }
  .persona-panel img.desktop { position: absolute; width: 77%; left: 30px; bottom: 26px; border-radius: 12px; box-shadow: 0 18px 48px rgba(0,0,0,.28); }

  .mini-flow {
    position: absolute;
    left: 28px;
    top: 118px;
    display: grid;
    gap: 10px;
    width: 48%;
  }

  .mini-flow span {
    display: block;
    background: #f0f3f9;
    border-left: 4px solid var(--gold);
    padding: 10px 12px;
    font-size: 14px;
    font-weight: 700;
  }

  .dark .mini-flow span { background: rgba(255,255,255,.1); }

  .mobile-layout {
    display: grid;
    grid-template-columns: 1fr 440px;
    align-items: center;
    gap: 28px;
    height: 620px;
  }

  .mobile-copy { padding-left: 12px; }
  .callouts { margin-top: 34px; display: grid; gap: 14px; }

  .callout {
    position: relative;
    width: 78%;
    background: var(--white);
    border: 1px solid var(--line);
    border-left: 5px solid var(--gold);
    border-radius: 12px;
    padding: 15px 66px 15px 18px;
    font-size: 16px;
    font-weight: 700;
    box-shadow: 0 8px 20px rgba(9,26,53,.05);
  }

  .callout::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -128px;
    width: 116px;
    border-top: 2px solid #9ca7bb;
  }

  .callout::before {
    content: '';
    position: absolute;
    top: calc(50% - 4px);
    right: -132px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gold);
  }

  .phone-frame {
    height: 600px;
    width: 290px;
    margin: 0 auto;
    padding: 10px;
    background: #0b1831;
    border-radius: 34px;
    box-shadow: 0 24px 60px rgba(3,27,65,.28);
    overflow: hidden;
  }

  .phone-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    border-radius: 25px;
  }

  .desktop-layout { margin-top: 18px; }

  .desktop-frame {
    width: 100%;
    height: 535px;
    background: #0b1831;
    border-radius: 17px;
    padding: 9px;
    overflow: hidden;
    box-shadow: 0 18px 45px rgba(3,27,65,.16);
  }

  .desktop-frame img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center top;
    background: #fff;
    border-radius: 10px;
  }

  .annotation-rail {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-top: 16px;
  }

  .annotation {
    position: relative;
    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 12px 14px;
    text-align: center;
    font-size: 14px;
    font-weight: 750;
  }

  .annotation::before {
    content: '';
    position: absolute;
    left: 50%;
    top: -17px;
    height: 16px;
    border-left: 2px solid #9ca7bb;
  }

  .annotation::after {
    content: '';
    position: absolute;
    left: calc(50% - 4px);
    top: -22px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gold);
  }

  .dual-desktop {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
    margin-top: 20px;
  }

  .dual-card {
    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: 12px;
  }

  .dual-card img { width: 100%; height: 440px; object-fit: contain; background: #fff; }
  .dual-card .caption { display: flex; align-items: center; gap: 10px; padding: 10px 6px 2px; font-size: 15px; font-weight: 800; }
  .dual-card .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--gold); }

  .close {
    background: var(--navy);
    color: var(--white);
    padding: 70px 78px;
  }

  .close::before { width: 14px; }
  .close::after { display: none; }

  .close-grid { display: grid; grid-template-columns: 45% 55%; gap: 38px; height: 100%; align-items: center; }
  .close h2 { font-size: 50px; }
  .close p { color: #bec8da; font-size: 21px; line-height: 1.45; margin-top: 20px; }
  .close .pill { display: inline-block; margin-top: 32px; border: 1px solid rgba(255,255,255,.24); border-radius: 999px; padding: 12px 18px; color: var(--gold); font-weight: 800; }
  .close img { width: 100%; border: 8px solid rgba(255,255,255,.94); border-radius: 18px; box-shadow: 0 28px 70px rgba(0,0,0,.45); }

  section[data-theme='dark'] { background: var(--navy); color: var(--white); }
  section[data-theme='dark']::after { color: #90a0bb; }
  section[data-theme='dark'] .subhead { color: #b9c5d8; }
  section[data-theme='dark'] .callout { color: var(--ink); }
---

<!-- _class: cover -->

<div class="cover-grid">
  <div class="cover-copy">
    <div class="eyebrow">PLATAFORMA GR · EXPERIENCIA INTEGRAL</div>
    <h1>Una operación premium, de principio a fin</h1>
    <p>Autoservicio para el graduado. Control ejecutivo para la administración.</p>
    <div class="gold-rule"></div>
  </div>
  <div class="cover-art">
    <img class="desktop-shot" src="./stitch_gr_prototype/stitch_gr_prototype/evento_resumen_general/screen.png" alt="Resumen administrativo del evento">
    <img class="mobile-shot" src="./stitch_gr_prototype/stitch_gr_prototype/inicio_estado_normal_c1_corregido/screen.png" alt="Inicio mobile del graduado">
  </div>
</div>

<!-- Fuentes UI: frontend/src/App.tsx; stitch_gr_prototype/.../evento_resumen_general/screen.png; stitch_gr_prototype/.../inicio_estado_normal_c1_corregido/screen.png -->

---

<!-- _class: overview -->
<!-- _data-flow: VISIÓN DE PRODUCTO -->

## Dos experiencias. Una sola operación.

<div class="split-stage">
  <div class="persona-panel">
    <h3>Graduado · mobile first</h3>
    <p>Claridad, autonomía y una próxima acción evidente.</p>
    <div class="mini-flow">
      <span>Acceso y contrato</span>
      <span>Grupo y beneficios</span>
      <span>Pagos y evento</span>
    </div>
    <img class="mobile" src="./stitch_gr_prototype/stitch_gr_prototype/inicio_estado_normal_c1_corregido/screen.png" alt="Experiencia mobile del graduado">
  </div>
  <div class="persona-panel dark">
    <h3>Administración · desktop first</h3>
    <p>Visibilidad, intervención y trazabilidad por evento.</p>
    <div class="mini-flow">
      <span>Crear y configurar</span>
      <span>Operar y cobrar</span>
      <span>Medir y auditar</span>
    </div>
    <img class="desktop" src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_dashboard_corregido_2/screen.png" alt="Experiencia desktop de administración">
  </div>
</div>

<!-- Fuente funcional: docs/UX_FLOWS.md §§2–3 y 36; rutas: /graduate/* y /admin/* -->

---

<!-- _data-flow: GRADUADO · 01 -->

<div class="mobile-layout">
  <div class="mobile-copy">
    <div class="kicker">Entrada contextual</div>
    <h2>El evento correcto desde el primer contacto</h2>
    <p class="subhead">El código conecta al graduado con su experiencia, sin navegación ambigua.</p>
    <div class="callouts">
      <div class="callout">Acceso por evento</div>
      <div class="callout">Una acción dominante</div>
      <div class="callout">Continuidad a cuenta</div>
    </div>
  </div>
  <div class="phone-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/accede_a_tu_graduaci_n/screen.png" alt="Acceso por código de evento"></div>
</div>

<!-- Ruta UI: /access · Componente: GraduateAccessScreen.tsx · Flujo: UX-G-AUTH-001 -->

---

<!-- _data-flow: GRADUADO · 02 -->

<div class="mobile-layout">
  <div class="mobile-copy">
    <div class="kicker">Inicio personal</div>
    <h2>El graduado entiende qué sigue en segundos</h2>
    <p class="subhead">Evento, avance financiero, próximo pago y pendientes operativos conviven en una sola vista.</p>
    <div class="callouts">
      <div class="callout">Progreso financiero</div>
      <div class="callout">Próximo pago visible</div>
      <div class="callout">Pendientes accionables</div>
    </div>
  </div>
  <div class="phone-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/inicio_estado_normal_c1_corregido/screen.png" alt="Inicio del graduado"></div>
</div>

<!-- Ruta UI: /graduate · Componente: GraduateHomeScreen.tsx · Flujo: UX-G-HOME -->

---

<!-- _data-flow: GRADUADO · 03 -->

<div class="mobile-layout">
  <div class="mobile-copy">
    <div class="kicker">Mi grupo</div>
    <h2>Todos los lugares, personas y pendientes bajo control</h2>
    <p class="subhead">La experiencia muestra capacidad contratada, integrantes y avance nominal sin complejidad operativa.</p>
    <div class="callouts">
      <div class="callout">Capacidad utilizada</div>
      <div class="callout">Integrantes nominales</div>
      <div class="callout">Estado por persona</div>
    </div>
  </div>
  <div class="phone-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/mi_grupo_e1_final/screen.png" alt="Grupo del graduado"></div>
</div>

<!-- Ruta UI: /graduate/group · Componente: GraduateGroupScreen.tsx · Flujo: UX-G-GROUP -->

---

<!-- _data-flow: GRADUADO · 04 -->

<div class="mobile-layout">
  <div class="mobile-copy">
    <div class="kicker">Mis pagos</div>
    <h2>La cobranza se convierte en una experiencia clara</h2>
    <p class="subhead">Cada obligación tiene contexto, fecha, monto y una siguiente acción segura.</p>
    <div class="callouts">
      <div class="callout">Avance consolidado</div>
      <div class="callout">Calendario por cuota</div>
      <div class="callout">Beneficio desbloqueado</div>
    </div>
  </div>
  <div class="phone-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/mis_pagos_80_final/screen.png" alt="Centro de pagos del graduado"></div>
</div>

<!-- Ruta UI: /graduate/payments · Componente: GraduatePaymentsScreen.tsx · Flujo: UX-G-PAY -->

---

<!-- _data-flow: GRADUADO · 05 -->

<div class="mobile-layout">
  <div class="mobile-copy">
    <div class="kicker">Selección de mesa</div>
    <h2>Elegir ubicación se vuelve visual y confiable</h2>
    <p class="subhead">Disponibilidad, ocupación y selección propia se comunican sin exponer datos de terceros.</p>
    <div class="callouts">
      <div class="callout">Mapa de disponibilidad</div>
      <div class="callout">Estados inequívocos</div>
      <div class="callout">Mesa propia destacada</div>
    </div>
  </div>
  <div class="phone-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/selecci_n_de_mesa/screen.png" alt="Selección mobile de mesa"></div>
</div>

<!-- Ruta UI: /graduate/table · Componente: GraduateTableScreen.tsx · Flujo: UX-G-SEAT -->

---

<!-- _data-flow: GRADUADO · 06 -->

<div class="mobile-layout">
  <div class="mobile-copy">
    <div class="kicker">Platillos</div>
    <h2>La captura termina con un resumen verificable</h2>
    <p class="subhead">Cada integrante conserva su selección y el grupo confirma con una vista consolidada.</p>
    <div class="callouts">
      <div class="callout">Selección individual</div>
      <div class="callout">Preferencias visibles</div>
      <div class="callout">Resumen de producción</div>
    </div>
  </div>
  <div class="phone-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/revisa_tus_platillos/screen.png" alt="Revisión de platillos"></div>
</div>

<!-- Ruta UI: /graduate/meals · Componente: GraduateMealsScreen.tsx · Flujo: UX-G-MEAL -->

---

<!-- _data-flow: GRADUADO · 07 -->

<div class="mobile-layout">
  <div class="mobile-copy">
    <div class="kicker">Beneficio premium</div>
    <h2>El avance financiero activa una recompensa tangible</h2>
    <p class="subhead">El termo pasa de bloqueado a disponible, solicitado, producción y entrega.</p>
    <div class="callouts">
      <div class="callout">Disponibilidad automática</div>
      <div class="callout">Personalización controlada</div>
      <div class="callout">Solicitud trazable</div>
    </div>
  </div>
  <div class="phone-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/solicitar_mi_termo/screen.png" alt="Solicitud de termo"></div>
</div>

<!-- Ruta UI: /graduate/thermo · Componente: GraduateThermoScreen.tsx · Flujo: UX-G-TH -->

---

<!-- _data-flow: ADMIN · 01 -->

<div class="desktop-layout">
  <div class="kicker">Acceso administrativo</div>
  <h2>Una entrada sobria para una operación reservada</h2>
  <div class="desktop-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_login/screen.png" alt="Login administrativo"></div>
  <div class="annotation-rail">
    <div class="annotation">Identidad separada</div>
    <div class="annotation">Recuperación segura</div>
    <div class="annotation">Acceso directo al control</div>
  </div>
</div>

<!-- Ruta UI: /admin/login · Componente: AdminLoginScreen.tsx -->

---

<!-- _data-flow: ADMIN · 02 -->

<div class="desktop-layout">
  <div class="kicker">Dashboard global</div>
  <h2>El negocio ve escala, cobranza y riesgo en una mirada</h2>
  <div class="desktop-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_dashboard_corregido_2/screen.png" alt="Dashboard global administrativo"></div>
  <div class="annotation-rail">
    <div class="annotation">Recaudación consolidada</div>
    <div class="annotation">Alertas de vencimiento</div>
    <div class="annotation">Eventos destacados</div>
  </div>
</div>

<!-- Ruta UI: /admin · Componente: AdminDashboardScreen.tsx · Flujo: ADMIN Dashboard -->

---

<!-- _data-flow: ADMIN · 03 -->

<div class="desktop-layout">
  <div class="kicker">Portafolio de eventos</div>
  <h2>Cada evento conserva estado, escala y avance financiero</h2>
  <div class="desktop-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/eventos_listado_general/screen.png" alt="Listado general de eventos"></div>
  <div class="annotation-rail">
    <div class="annotation">Ciclo de vida visible</div>
    <div class="annotation">Meta y ocupación</div>
    <div class="annotation">Entrada a detalle</div>
  </div>
</div>

<!-- Ruta UI: /admin/events · Componente: AdminEventsScreen.tsx -->

---

<!-- _data-flow: ADMIN · 04 -->

<div class="desktop-layout">
  <div class="kicker">Creación guiada</div>
  <h2>Configurar un evento termina en una revisión ejecutiva</h2>
  <div class="desktop-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_crear_evento_resumen_final/screen.png" alt="Revisión final para crear evento"></div>
  <div class="annotation-rail">
    <div class="annotation">Datos principales</div>
    <div class="annotation">Plan financiero</div>
    <div class="annotation">Hitos operativos</div>
  </div>
</div>

<!-- Ruta UI: /admin/events/new · Componente: CreateEventWizardScreen.tsx · Wizard real con 9 pasos en docs/UX_FLOWS.md -->

---

<!-- _data-flow: ADMIN · 05 -->

<div class="desktop-layout">
  <div class="kicker">Centro de control</div>
  <h2>El evento concentra finanzas, capacidad y alertas accionables</h2>
  <div class="desktop-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/evento_resumen_general/screen.png" alt="Resumen general del evento"></div>
  <div class="annotation-rail">
    <div class="annotation">Estado financiero</div>
    <div class="annotation">Capacidad contratada</div>
    <div class="annotation">Atención requerida</div>
  </div>
</div>

<!-- Ruta UI: /admin/events/:eventId · Componente: AdminEventOverviewScreen.tsx -->

---

<!-- _data-flow: ADMIN · 06 -->

<div class="desktop-layout">
  <div class="kicker">Cartera de graduados</div>
  <h2>Los filtros convierten excepciones en prioridades operativas</h2>
  <div class="desktop-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_lista_de_graduados_corregido_2/screen.png" alt="Listado administrativo de graduados"></div>
  <div class="annotation-rail">
    <div class="annotation">Estado financiero</div>
    <div class="annotation">Asignación de mesa</div>
    <div class="annotation">Pendientes de platillo</div>
  </div>
</div>

<!-- Ruta UI: /admin/events/:eventId/graduates · Componente: AdminEventGraduatesListScreen.tsx -->

---

<!-- _data-flow: ADMIN · 07 -->

<div class="desktop-layout">
  <div class="kicker">Expediente 360°</div>
  <h2>Una persona, todo su contexto contractual y operativo</h2>
  <div class="desktop-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_detalle_de_andrea_mart_nez_corregido_1/screen.png" alt="Expediente del graduado"></div>
  <div class="annotation-rail">
    <div class="annotation">Estado de pagos</div>
    <div class="annotation">Grupo y asignación</div>
    <div class="annotation">Platillos y termo</div>
  </div>
</div>

<!-- Ruta UI: /admin/events/:eventId/graduates/:graduateId · Componente: AdminGraduateOverviewScreen.tsx -->

---

<!-- _data-flow: ADMIN · 08 -->

<div class="desktop-layout">
  <div class="kicker">Control financiero</div>
  <h2>La cartera revela cuánto, cuándo y dónde intervenir</h2>
  <div class="desktop-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_resumen_de_pagos_corregido_2/screen.png" alt="Estado de cuenta global"></div>
  <div class="annotation-rail">
    <div class="annotation">Contratado vs. cobrado</div>
    <div class="annotation">Vencido destacado</div>
    <div class="annotation">Próximos ingresos</div>
  </div>
</div>

<!-- Ruta UI: /admin/events/:eventId/payments · Componente: AdminEventPaymentsScreen.tsx -->

---

<!-- _data-flow: ADMIN · 09 -->

<div class="desktop-layout">
  <div class="kicker">Croquis y mesas</div>
  <h2>La capacidad deja de ser una hoja de cálculo</h2>
  <div class="desktop-frame"><img src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_croquis_de_mesas_1/screen.png" alt="Croquis administrativo de mesas"></div>
  <div class="annotation-rail">
    <div class="annotation">Ocupación sobre el plano</div>
    <div class="annotation">Detalle de asignados</div>
    <div class="annotation">Capacidad disponible</div>
  </div>
</div>

<!-- Ruta UI: /admin/events/:eventId/tables · Componente: AdminEventTablesScreen.tsx -->

---

<!-- _data-flow: ADMIN · 10 -->

## Producción de alimentos y beneficios, en tiempo real

<div class="dual-desktop">
  <div class="dual-card">
    <img src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_panel_de_platillos/screen.png" alt="Panel administrativo de platillos">
    <div class="caption"><span class="dot"></span> Platillos · totales, pendientes y detalle</div>
  </div>
  <div class="dual-card">
    <img src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_panel_de_termos/screen.png" alt="Panel administrativo de termos">
    <div class="caption"><span class="dot"></span> Termos · estados, producción y entrega</div>
  </div>
</div>

<!-- Rutas UI: /admin/events/:eventId/meals y /thermos · Componentes: AdminEventMealsScreen.tsx, AdminEventThermosScreen.tsx -->

---

<!-- _data-flow: ADMIN · 11 -->

## Medición ejecutiva y trazabilidad operativa

<div class="dual-desktop">
  <div class="dual-card">
    <img src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_hub_de_reportes/screen.png" alt="Hub de reportes administrativos">
    <div class="caption"><span class="dot"></span> Reportes · finanzas, cartera y operación</div>
  </div>
  <div class="dual-card">
    <img src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_historial_de_cambios/screen.png" alt="Historial administrativo de cambios">
    <div class="caption"><span class="dot"></span> Auditoría · quién cambió qué y cuándo</div>
  </div>
</div>

<!-- Rutas UI: /admin/events/:eventId/reports y /audit · Componentes: AdminEventReportsScreen.tsx, AdminEventAuditScreen.tsx -->

---

<!-- _class: close -->

<div class="close-grid">
  <div>
    <div class="kicker">RESULTADO</div>
    <h2>Una experiencia que conecta servicio, operación y control</h2>
    <p>El graduado avanza con confianza. La administración actúa con información. El negocio conserva trazabilidad.</p>
    <div class="pill">Una sola fuente operativa</div>
  </div>
  <img src="./stitch_gr_prototype/stitch_gr_prototype/administraci_n_hub_de_reportes/screen.png" alt="Vista ejecutiva de reportes">
</div>

<!-- Cierre basado en docs/PRODUCT_SCOPE.md §3 y UI real versionada. -->
