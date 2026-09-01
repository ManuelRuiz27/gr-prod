import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Input,
  Select,
  TextArea,
  Checkbox,
  Switch,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Modal,
  ConfirmDialog,
  Drawer,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  Breadcrumb,
  Search,
  KpiCard,
  Tabs,
  Toast,
  Skeleton,
  SkeletonText,
  SkeletonKpi,
  SkeletonCard,
  SkeletonTable,
  Divider,
  PageHeader,
  SectionHeader,
  StateBoundary,
  type UIState,
} from '../../design-system';

export const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'primitives' | 'states' | 'tokens' | 'typography'>('primitives');
  const [subTab, setSubTab] = useState<string>('buttons');
  const [currentState, setCurrentState] = useState<UIState>('ready');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="min-h-screen bg-obsidian-950 text-silver-100 p-4 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <PageHeader
        title="Plataforma GR — Design System Showcase"
        subtitle="Catálogo normativo de componentes reutilizables, tokens Obsidian/Silver/Gold, tipografía y estados UI (Baseline 1.2)."
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Plataforma GR', href: '/' },
              { label: 'Design System', current: true },
            ]}
          />
        }
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              iconStart="refresh"
              onClick={() => {
                setIsToastVisible(true);
              }}
            >
              Lanzar Toast Demo
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconStart="settings"
              onClick={() => setIsDrawerOpen(true)}
            >
              Abrir Drawer
            </Button>
          </div>
        }
      />

      {/* Main Showcase Tabs */}
      <Tabs
        variant="pills"
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as 'primitives' | 'states' | 'tokens' | 'typography')}
        tabs={[
          { id: 'primitives', label: 'Primitives & Componentes' },
          { id: 'states', label: `Estados UI (${currentState.toUpperCase()})` },
          { id: 'tokens', label: 'Tokens & Paletas' },
          { id: 'typography', label: 'Tipografía & Jerarquía' },
        ]}
      />

      {/* TAB: PRIMITIVES */}
      {activeTab === 'primitives' && (
        <div className="flex flex-col gap-8">
          {/* Sub Navigation */}
          <Tabs
            variant="line"
            activeTab={subTab}
            onChange={setSubTab}
            tabs={[
              { id: 'buttons', label: 'Botones & Acciones' },
              { id: 'forms', label: 'Formularios & Search' },
              { id: 'data', label: 'KPIs, Cards & Tablas' },
              { id: 'overlays', label: 'Modales & Drawers' },
              { id: 'feedback', label: 'Alerts, Badges & Skeletons' },
            ]}
          />

          {/* Sub-tab: BUTTONS */}
          {subTab === 'buttons' && (
            <div className="flex flex-col gap-6">
              <SectionHeader
                title="Botones Interactivos"
                description="Variantes oficiales de acción con acento dorado, superficies obsidiana y estados accesibles."
              />

              <Card>
                <div className="flex flex-col gap-6">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-silver-400 mb-3 tracking-wider">
                      Variantes Principales
                    </h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="primary">Primario (Gold CTA)</Button>
                      <Button variant="secondary">Secundario (Obsidian/Silver)</Button>
                      <Button variant="outline">Contorno</Button>
                      <Button variant="ghost">Fantasma</Button>
                      <Button variant="danger">Destructivo</Button>
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <h4 className="text-xs font-semibold uppercase text-silver-400 mb-3 tracking-wider">
                      Tamaños y Touch Targets
                    </h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="secondary" size="sm">Pequeño (sm: 32px)</Button>
                      <Button variant="secondary" size="md">Mediano (md: 40px)</Button>
                      <Button variant="primary" size="lg">Grande (lg: 48px - Mobile Touch)</Button>
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <h4 className="text-xs font-semibold uppercase text-silver-400 mb-3 tracking-wider">
                      IconButtons y Estados
                    </h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <IconButton icon="plus" aria-label="Agregar elemento" variant="primary" />
                      <IconButton icon="edit" aria-label="Editar registro" variant="secondary" />
                      <IconButton icon="trash" aria-label="Eliminar registro" variant="danger" />
                      <IconButton icon="search" aria-label="Buscar" variant="ghost" />
                      <Button variant="primary" isLoading>Guardando</Button>
                      <Button variant="secondary" disabled>Deshabilitado</Button>
                      <Button variant="primary" iconStart="ticket">Con Ícono Start</Button>
                      <Button variant="secondary" iconEnd="chevron-right">Con Ícono End</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Sub-tab: FORMS */}
          {subTab === 'forms' && (
            <div className="flex flex-col gap-6">
              <SectionHeader
                title="Controles de Formulario & Búsqueda"
                description="Campos con fondos oscuros, focus dorado accesible y validación de errores nativa."
              />

              <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-5">
                    <Search
                      placeholder="Buscar graduado por nombre o folio..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onSearch={(val) => alert(`Buscar: ${val}`)}
                      onClear={() => setSearchValue('')}
                    />

                    <Input
                      label="Nombre Completo"
                      placeholder="Ej. Andrea Martínez"
                      iconStart="user"
                      required
                      helperText="Ingresa el nombre del integrante tal como en su identificación"
                    />

                    <Input
                      label="Correo Electrónico (Estado Error)"
                      placeholder="correo@ejemplo.com"
                      defaultValue="andrea.invalido@"
                      iconStart="mail"
                      error="El formato de correo no es válido"
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <Select
                      label="Preferencia de Platillo"
                      options={[
                        { value: 'tradicional', label: 'Tradicional (Corte de Res)' },
                        { value: 'vegetariano', label: 'Vegetariano (Lasagna de Espinacas)' },
                        { value: 'vegano', label: 'Vegano (Bowl Mediterráneo)' },
                      ]}
                      helperText="Catálogo normativo de platillos aprobados para el evento"
                    />

                    <TextArea
                      label="Restricciones Médicas / Alergias"
                      placeholder="Indica si algún invitado tiene requerimientos especiales..."
                      rows={3}
                    />

                    <div className="flex flex-col gap-4 pt-2">
                      <Checkbox
                        label="Confirmo que los datos de registro son correctos"
                        checked={checkboxChecked}
                        onChange={(e) => setCheckboxChecked(e.target.checked)}
                        helperText="Requerido para emitir pases de acceso"
                      />
                      <Switch
                        label="Notificaciones por Correo"
                        helperText="Recibe alertas de fechas límite y confirmación de pagos"
                        checked={switchChecked}
                        onChange={(e) => setSwitchChecked(e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Sub-tab: DATA */}
          {subTab === 'data' && (
            <div className="flex flex-col gap-6">
              <SectionHeader
                title="Visualización de Datos & KPIs"
                description="Métricas operativas renderizadas en tipografía Inter con alineación estricta y tablas estructuradas."
              />

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  label="Total Recaudado"
                  value="$125,000"
                  supportingText="65% del objetivo total"
                  trend={{ value: '+15%', direction: 'up' }}
                  icon="payment"
                />
                <KpiCard
                  label="Graduados Registrados"
                  value="84"
                  supportingText="De 120 proyectados"
                  status="info"
                  statusLabel="Activo"
                  icon="users"
                />
                <KpiCard
                  label="Mesas Asignadas"
                  value="18 / 24"
                  supportingText="6 mesas con lugares libres"
                  status="warning"
                  statusLabel="En selección"
                  icon="table"
                />
                <KpiCard
                  label="Pagos Vencidos"
                  value="3"
                  supportingText="Requieren notificación"
                  status="error"
                  statusLabel="Atención"
                  icon="clock"
                />
              </div>

              {/* Data Table */}
              <Card>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-silver-50">Listado de Integrantes</h4>
                    <Badge variant="gold">Generación 2027</Badge>
                  </div>

                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeader>Graduado / Integrante</TableHeader>
                        <TableHeader>Lugares</TableHeader>
                        <TableHeader>Mesa</TableHeader>
                        <TableHeader>Estado Financiero</TableHeader>
                        <TableHeader className="text-right">Monto Contratado</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold text-silver-50">Andrea Martínez</TableCell>
                        <TableCell>8 lugares</TableCell>
                        <TableCell>Mesa 24 (Cuadrada)</TableCell>
                        <TableCell>
                          <Badge variant="warning" dot>
                            Pago Parcial (60%)
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-silver-50">
                          $12,500.00 MXN
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold text-silver-50">Fernando Torres</TableCell>
                        <TableCell>10 lugares</TableCell>
                        <TableCell>Mesa 12 (Redonda)</TableCell>
                        <TableCell>
                          <Badge variant="success" dot>
                            Liquidado
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-silver-50">
                          $15,625.00 MXN
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold text-silver-50">Mariana López</TableCell>
                        <TableCell>6 lugares</TableCell>
                        <TableCell>Sin asignar</TableCell>
                        <TableCell>
                          <Badge variant="error" dot>
                            Mensualidad M3 Vencida
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-silver-50">
                          $9,375.00 MXN
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Card Variants */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="default">
                  <CardHeader>
                    <h5 className="font-bold text-sm text-silver-50">Card Default</h5>
                    <Badge variant="neutral">Superficie Base</Badge>
                  </CardHeader>
                  <CardBody>
                    <p className="text-xs text-silver-400 leading-relaxed">
                      Superficie estándar <code>bg-obsidian-850</code> con borde plateado sutil <code>border-silver-800</code>.
                    </p>
                  </CardBody>
                  <CardFooter>
                    <span className="text-xs text-silver-500">Footer informativo</span>
                  </CardFooter>
                </Card>

                <Card variant="raised">
                  <CardHeader>
                    <h5 className="font-bold text-sm text-silver-50">Card Raised</h5>
                    <Badge variant="info">Elevación Media</Badge>
                  </CardHeader>
                  <CardBody>
                    <p className="text-xs text-silver-400 leading-relaxed">
                      Superficie elevada <code>bg-obsidian-800</code> para componentes que requieren jerarquía superior.
                    </p>
                  </CardBody>
                  <CardFooter>
                    <span className="text-xs text-silver-500">Footer informativo</span>
                  </CardFooter>
                </Card>

                <Card variant="gold-accent">
                  <CardHeader>
                    <h5 className="font-bold text-sm text-silver-50">Card Gold Accent</h5>
                    <Badge variant="gold">Celebración</Badge>
                  </CardHeader>
                  <CardBody>
                    <p className="text-xs text-silver-400 leading-relaxed">
                      Tarjeta con acento dorado ceremonial reservada para hitos y estado destacado.
                    </p>
                  </CardBody>
                  <CardFooter>
                    <span className="text-xs text-gold-400 font-semibold">Hito alcanzado</span>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}

          {/* Sub-tab: OVERLAYS */}
          {subTab === 'overlays' && (
            <div className="flex flex-col gap-6">
              <SectionHeader
                title="Superficies Superpuestas (Modales & Drawers)"
                description="Contenedores con trampa de foco, tecla Escape y accesibilidad WAI-ARIA."
              />

              <Card>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    Abrir Modal Informativo
                  </Button>
                  <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                    Abrir ConfirmDialog de Peligro
                  </Button>
                  <Button variant="secondary" onClick={() => setIsDrawerOpen(true)}>
                    Abrir Panel Lateral (Drawer)
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Sub-tab: FEEDBACK */}
          {subTab === 'feedback' && (
            <div className="flex flex-col gap-6">
              <SectionHeader
                title="Retroalimentación Visual, Badges & Skeletons"
                description="Indicadores de estado normativos y esqueletos de carga respetuosos de reduced-motion."
              />

              {/* Badges */}
              <Card>
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-semibold uppercase text-silver-400 tracking-wider">
                    Badges Normativos
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="neutral">Neutral</Badge>
                    <Badge variant="success" dot>Pagado / Liquidado</Badge>
                    <Badge variant="warning" dot>Pago Parcial (60%)</Badge>
                    <Badge variant="error" dot>Vencido</Badge>
                    <Badge variant="info" icon="info">Información</Badge>
                    <Badge variant="primary">Mesa 24</Badge>
                    <Badge variant="gold">Generación 2027</Badge>
                    <Badge variant="outline">Contorno</Badge>
                  </div>
                </div>
              </Card>

              {/* Alerts */}
              <div className="flex flex-col gap-3">
                <Alert variant="info" title="Periodo de Asignación Abierto">
                  Puedes seleccionar tu mesa y preferencias de platillos antes de la fecha límite del evento.
                </Alert>
                <Alert variant="success" title="Pago Validado">
                  Tu mensualidad M3 por $2,500.00 MXN fue confirmada correctamente.
                </Alert>
                <Alert variant="warning" title="Fecha Límite Próxima">
                  Próxima mensualidad M4 vence el 15 Mar 2027.
                </Alert>
                <Alert variant="error" title="Transacción Rechazada">
                  No se pudo procesar el cargo a la tarjeta. Intenta con un método alternativo.
                </Alert>
              </div>

              {/* Skeletons Demo */}
              <Card>
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-semibold uppercase text-silver-400 tracking-wider">
                    Skeletons (Estados de Carga Estructural)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-silver-400 mb-2">Skeleton Text & Base Blocks</p>
                      <div className="flex flex-col gap-3">
                        <Skeleton height={24} width={180} rounded="lg" />
                        <SkeletonText lines={3} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-silver-400 mb-2">Skeleton KPI</p>
                      <SkeletonKpi />
                    </div>
                  </div>
                  <Divider />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-silver-400 mb-2">Skeleton Card</p>
                      <SkeletonCard />
                    </div>
                    <div>
                      <p className="text-xs text-silver-400 mb-2">Skeleton Table</p>
                      <SkeletonTable rows={3} cols={3} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB: STATES */}
      {activeTab === 'states' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-silver-50">Control de Estado UI (StateBoundary)</h3>
              <div className="flex flex-wrap gap-2">
                {(['ready', 'loading', 'empty', 'error', 'offline', 'action_success'] as UIState[]).map(
                  (st) => (
                    <Button
                      key={st}
                      variant={currentState === st ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setCurrentState(st)}
                    >
                      {st.toUpperCase()}
                    </Button>
                  )
                )}
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-xs text-silver-400 mb-4">
                El componente <code>StateBoundary</code> encapsula los estados visuales garantizando consistencia y accesibilidad.
              </p>

              <StateBoundary
                state={currentState}
                loadingMessage="Consultando registros y estados financieros..."
                emptyTitle="No hay integrantes registrados en este evento"
                emptyDescription="Comienza agregando los nombres de tus acompañantes y su preferencia de platillo."
                emptyActionLabel="Registrar primer invitado"
                onEmptyAction={() => {}}
                errorTitle="Error al sincronizar datos"
                errorMessage="No se pudo obtener la cartera de pagos desde el servidor."
                onRetry={() => setCurrentState('ready')}
                offlineMessage="Sin conexión a la red. Los cambios se sincronizarán al reconectar."
                successTitle="Registro confirmado"
                successMessage="El integrante y su menú fueron guardados exitosamente."
              >
                <div className="p-6 bg-obsidian-800 rounded-2xl border border-silver-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-silver-50">Estado READY Activo</span>
                    <Badge variant="success">Listo para operar</Badge>
                  </div>
                  <p className="text-xs text-silver-300 leading-relaxed">
                    Este es el contenido regular de la superficie cuando los datos están cargados y listos para interactuar.
                  </p>
                </div>
              </StateBoundary>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB: TOKENS */}
      {activeTab === 'tokens' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold text-silver-50">Paleta Obsidian (Superficies & Fondos)</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <div className="p-4 rounded-xl bg-obsidian-950 border border-silver-800 text-silver-100">
                  <p className="text-xs font-bold">Obsidian 950</p>
                  <p className="text-[10px] font-mono text-silver-400">#08090A (Root)</p>
                </div>
                <div className="p-4 rounded-xl bg-obsidian-900 border border-silver-800 text-silver-100">
                  <p className="text-xs font-bold">Obsidian 900</p>
                  <p className="text-[10px] font-mono text-silver-400">#0D0F11 (Base)</p>
                </div>
                <div className="p-4 rounded-xl bg-obsidian-850 border border-silver-800 text-silver-100">
                  <p className="text-xs font-bold">Obsidian 850</p>
                  <p className="text-[10px] font-mono text-silver-400">#12151A (Cards)</p>
                </div>
                <div className="p-4 rounded-xl bg-obsidian-800 border border-silver-800 text-silver-100">
                  <p className="text-xs font-bold">Obsidian 800</p>
                  <p className="text-[10px] font-mono text-silver-400">#14171A (Raised)</p>
                </div>
                <div className="p-4 rounded-xl bg-obsidian-750 border border-silver-800 text-silver-100">
                  <p className="text-xs font-bold">Obsidian 750</p>
                  <p className="text-[10px] font-mono text-silver-400">#1A1F26 (Selected)</p>
                </div>
                <div className="p-4 rounded-xl bg-obsidian-700 border border-silver-800 text-silver-100">
                  <p className="text-xs font-bold">Obsidian 700</p>
                  <p className="text-[10px] font-mono text-silver-400">#20252C (Hover)</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-base font-bold text-silver-50">Paleta Silver (Texto & Estructura Metálica)</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <div className="p-4 rounded-xl bg-silver-50 text-obsidian-950">
                  <p className="text-xs font-bold">Silver 50</p>
                  <p className="text-[10px] font-mono">#F1F3F5 (Text High)</p>
                </div>
                <div className="p-4 rounded-xl bg-silver-100 text-obsidian-950">
                  <p className="text-xs font-bold">Silver 100</p>
                  <p className="text-[10px] font-mono">#E3E6E8 (Headings)</p>
                </div>
                <div className="p-4 rounded-xl bg-silver-300 text-obsidian-950">
                  <p className="text-xs font-bold">Silver 300</p>
                  <p className="text-[10px] font-mono">#B7BDC3 (Body Text)</p>
                </div>
                <div className="p-4 rounded-xl bg-silver-500 text-obsidian-950">
                  <p className="text-xs font-bold">Silver 500</p>
                  <p className="text-[10px] font-mono">#8A929B (Muted)</p>
                </div>
                <div className="p-4 rounded-xl bg-silver-700 text-silver-50">
                  <p className="text-xs font-bold">Silver 700</p>
                  <p className="text-[10px] font-mono">#505861 (Strong Border)</p>
                </div>
                <div className="p-4 rounded-xl bg-silver-900 text-silver-50">
                  <p className="text-xs font-bold">Silver 900</p>
                  <p className="text-[10px] font-mono">#292F37 (Deep Border)</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-base font-bold text-silver-50">Paleta Gold (Acento Ceremonial & CTA)</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <div className="p-4 rounded-xl bg-gold-100 text-obsidian-950">
                  <p className="text-xs font-bold">Gold 100</p>
                  <p className="text-[10px] font-mono">#F7EFCF (Highlight)</p>
                </div>
                <div className="p-4 rounded-xl bg-gold-300 text-obsidian-950">
                  <p className="text-xs font-bold">Gold 300</p>
                  <p className="text-[10px] font-mono">#DEC889 (Hover)</p>
                </div>
                <div className="p-4 rounded-xl bg-gold-400 text-obsidian-950">
                  <p className="text-xs font-bold">Gold 400</p>
                  <p className="text-[10px] font-mono">#D4AF37 (Metallic)</p>
                </div>
                <div className="p-4 rounded-xl bg-gold-500 text-obsidian-950 font-bold">
                  <p className="text-xs">Gold 500 (CTA)</p>
                  <p className="text-[10px] font-mono">#C6A85B</p>
                </div>
                <div className="p-4 rounded-xl bg-gold-700 text-silver-50">
                  <p className="text-xs font-bold">Gold 700</p>
                  <p className="text-[10px] font-mono">#94772F (Tonal)</p>
                </div>
                <div className="p-4 rounded-xl bg-gold-900 text-silver-50">
                  <p className="text-xs font-bold">Gold 900</p>
                  <p className="text-[10px] font-mono">#47381A (Deep)</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB: TYPOGRAPHY */}
      {activeTab === 'typography' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold text-silver-50">Tipografía Ceremonial & UI</h3>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-6">
                <div>
                  <span className="text-xs font-semibold uppercase text-gold-400 tracking-wider">
                    Display Ceremonial: Cormorant Garamond
                  </span>
                  <h1 className="text-4xl font-bold font-display text-silver-50 mt-1">
                    Graduación Facultad de Derecho 2027
                  </h1>
                  <h2 className="text-2xl font-bold font-display text-silver-200 mt-2">
                    Noche de Gala y Celebración Académica
                  </h2>
                </div>

                <Divider />

                <div>
                  <span className="text-xs font-semibold uppercase text-gold-400 tracking-wider">
                    UI, Datos y Tablas: Inter
                  </span>
                  <p className="text-lg font-semibold text-silver-50 mt-1">
                    Resumen Financiero y Asignación de Lugares
                  </p>
                  <p className="text-sm text-silver-300 mt-1 leading-relaxed max-w-2xl">
                    Los datos numéricos, estados de cuenta, tablas operativas y controles de formulario
                    se renderizan estrictamente en fuente Inter para garantizar legibilidad y alta densidad controlada.
                  </p>
                </div>

                <Divider />

                <div>
                  <span className="text-xs font-semibold uppercase text-gold-400 tracking-wider">
                    Monospace / Código: JetBrains Mono
                  </span>
                  <div className="mt-2 p-4 rounded-xl bg-obsidian-900 border border-silver-800 font-mono text-xs text-silver-300">
                    <p>FOLIO: EVT-DERECHO-2027-001</p>
                    <p>TRANSACCIÓN: TR-9823471092 | ESTADO: VERIFIED</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Overlays / Modals / Drawers */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalles de Mesa 24"
        description="Forma Cuadrada — Capacidad 10 lugares"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-silver-300 leading-relaxed">
            La Mesa 24 cuenta con capacidad para 10 personas. Asignada para el grupo de Andrea Martínez (8 lugares solicitados).
          </p>
          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Entendido
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          setIsToastVisible(true);
        }}
        title="¿Liberar asignación de mesa?"
        message="Esta acción desasignará los lugares de la mesa. Deberás seleccionarla nuevamente antes de la fecha límite del evento."
        variant="danger"
        confirmText="Sí, liberar asignación"
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Panel de Configuración Rápida"
        description="Ajustes de visualización y filtros operativos"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Guardar Cambios
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <Input label="Filtro por Graduado" placeholder="Escribe un nombre..." />
          <Select
            label="Filtrar por Estado de Pago"
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'paid', label: 'Liquidados' },
              { value: 'partial', label: 'Pago Parcial' },
              { value: 'overdue', label: 'Vencidos' },
            ]}
          />
          <Switch label="Solo mostrar con mesa asignada" checked={true} onChange={() => {}} />
        </div>
      </Drawer>

      {/* Floating Toast Demo */}
      {isToastVisible && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeInUp">
          <Toast
            variant="success"
            title="Acción completada"
            message="El cambio de configuración fue guardado exitosamente en el sistema."
            onClose={() => setIsToastVisible(false)}
          />
        </div>
      )}
    </div>
  );
};
