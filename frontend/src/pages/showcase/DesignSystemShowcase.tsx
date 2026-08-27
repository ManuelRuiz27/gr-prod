import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  TextArea,
  Checkbox,
  Switch,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Modal,
  ConfirmDialog,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  Breadcrumb,
  StateBoundary,
  type UIState,
} from '../../design-system';

export const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'components' | 'states' | 'tokens'>('components');
  const [currentState, setCurrentState] = useState<UIState>('ready');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);

  return (
    <div className="min-h-screen bg-surface-bg text-content-primary p-4 sm:p-8 flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surface-high gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-navy-900 text-gold-400 font-display font-bold text-sm flex items-center justify-center">
              GR
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-navy-900">
              Design System Showcase & UI Foundation
            </h1>
          </div>
          <p className="text-sm text-content-secondary">
            Catálogo normativo de componentes reutilizables, tokens y estados visuales (Plataforma GR).
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-surface-low p-1 rounded-xl border border-surface-high">
          <button
            type="button"
            onClick={() => setActiveTab('components')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'components'
                ? 'bg-navy-900 text-surface-bright shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            Componentes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('states')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'states'
                ? 'bg-navy-900 text-surface-bright shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            Estados UI ({currentState.toUpperCase()})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tokens')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'tokens'
                ? 'bg-navy-900 text-surface-bright shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            Tokens de Color
          </button>
        </div>
      </header>

      {/* Tab: COMPONENTS */}
      {activeTab === 'components' && (
        <div className="flex flex-col gap-8">
          {/* Breadcrumb Section */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-content-muted">
              Jerarquía y Breadcrumbs
            </h3>
            <Card>
              <Breadcrumb
                items={[
                  { label: 'Plataforma GR', href: '/admin' },
                  { label: 'Graduación Facultad de Derecho 2027', href: '/admin/events/evt-derecho-2027' },
                  { label: 'Graduados', href: '/admin/events/evt-derecho-2027/graduates' },
                  { label: 'Andrea Martínez', current: true },
                ]}
              />
            </Card>
          </section>

          {/* Buttons Section */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-content-muted">
              Botones y Variantes
            </h3>
            <Card>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primario Navy</Button>
                <Button variant="gold">Acento Oro</Button>
                <Button variant="secondary">Secundario</Button>
                <Button variant="outline">Contorno</Button>
                <Button variant="ghost">Fantasma</Button>
                <Button variant="danger">Peligro</Button>
                <Button variant="primary" isLoading>
                  Cargando
                </Button>
                <Button variant="primary" disabled>
                  Deshabilitado
                </Button>
                <Button variant="gold" iconStart="ticket">
                  Con Ícono
                </Button>
              </div>
            </Card>
          </section>

          {/* Badges Section */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-content-muted">
              Badges e Indicadores de Estado
            </h3>
            <Card>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="success" dot>
                  Pagado
                </Badge>
                <Badge variant="warning" dot>
                  Pago Parcial (60%)
                </Badge>
                <Badge variant="error" dot>
                  Vencido
                </Badge>
                <Badge variant="info" icon="info">
                  Información
                </Badge>
                <Badge variant="primary">Mesa 24</Badge>
                <Badge variant="gold">Generación 2027</Badge>
                <Badge variant="outline">OPEN</Badge>
              </div>
            </Card>
          </section>

          {/* Form Controls Section */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-content-muted">
              Controles de Formulario
            </h3>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Nombre Completo"
                  placeholder="Ej. Andrea Martínez"
                  iconStart="user"
                  required
                  helperText="Ingresa el nombre del integrante"
                />
                <Input
                  label="Correo Electrónico con Error"
                  placeholder="correo@ejemplo.com"
                  defaultValue="invalido@"
                  iconStart="mail"
                  error="Formato de correo no válido"
                />
                <Select
                  label="Selección de Platillo"
                  options={[
                    { value: 'Tradicional', label: 'Tradicional' },
                    { value: 'Vegetariano', label: 'Vegetariano' },
                    { value: 'Vegano', label: 'Vegano' },
                  ]}
                  helperText="Opciones normativas aprobadas"
                />
                <TextArea
                  label="Observaciones"
                  placeholder="Comentarios sobre el registro..."
                  rows={2}
                />
                <div className="flex flex-col gap-4 pt-2">
                  <Checkbox
                    label="Acepto los términos de participación y reglamento"
                    checked={checkboxChecked}
                    onChange={(e) => setCheckboxChecked(e.target.checked)}
                    helperText="Requerido para confirmar lugares"
                  />
                  <Switch
                    label="Notificaciones del Evento"
                    helperText="Recibe alertas de pagos y fechas límite"
                    checked={switchChecked}
                    onChange={(e) => setSwitchChecked(e.target.checked)}
                  />
                </div>
              </div>
            </Card>
          </section>

          {/* Alerts Section */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-content-muted">
              Alertas y Banners Contextuales
            </h3>
            <div className="flex flex-col gap-3">
              <Alert variant="info" title="Periodo de Asignación Abierto">
                Puedes seleccionar tu mesa y platillos antes de la fecha límite del evento.
              </Alert>
              <Alert variant="success" title="Pago Verificado">
                Tu mensualidad M3 por $2,500.00 MXN fue validada correctamente.
              </Alert>
              <Alert variant="warning" title="Fecha Límite Próxima">
                Próxima mensualidad M4 por $2,500.00 MXN vence el 15 Mar 2027.
              </Alert>
              <Alert variant="error" title="Transacción Rechazada">
                La tarjeta no cuenta con fondos suficientes. Por favor intenta con otro método.
              </Alert>
            </div>
          </section>

          {/* Table Section */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-content-muted">
              Tablas de Datos
            </h3>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Graduado</TableHeader>
                  <TableHeader>Lugares</TableHeader>
                  <TableHeader>Mesa</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader className="text-right">Total</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Andrea Martínez</TableCell>
                  <TableCell>8 lugares</TableCell>
                  <TableCell>Mesa 24</TableCell>
                  <TableCell>
                    <Badge variant="warning" dot>
                      60% Pagado
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">$12,500.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Fernando Torres</TableCell>
                  <TableCell>10 lugares</TableCell>
                  <TableCell>Mesa 12</TableCell>
                  <TableCell>
                    <Badge variant="success" dot>
                      Liquidado
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">$15,625.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          {/* Modal Triggers */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-content-muted">
              Diálogos Modales Accesibles
            </h3>
            <Card>
              <div className="flex gap-4">
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Abrir Modal Informativo
                </Button>
                <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                  Abrir Confirmación de Acción
                </Button>
              </div>
            </Card>
          </section>
        </div>
      )}

      {/* Tab: STATES */}
      {activeTab === 'states' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-navy-900">Control de Estado UI</h3>
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
              <p className="text-xs text-content-secondary mb-4">
                El componente <code>StateBoundary</code> encapsula el estado visual de cualquier
                superficie de datos respetando los principios de accesibilidad y claridad.
              </p>

              <StateBoundary
                state={currentState}
                loadingMessage="Consultando lista de integrantes en tiempo real..."
                emptyTitle="No tienes integrantes registrados"
                emptyDescription="Comienza registrando los nombres de tus acompañantes y su preferencia de platillo."
                emptyActionLabel="Registrar primer invitado"
                onEmptyAction={() => {}}
                errorTitle="Error de sincronización"
                errorMessage="No se pudo obtener la cartera desde el servidor."
                onRetry={() => setCurrentState('ready')}
                offlineMessage="No hay conexión de red disponible en este momento."
                successTitle="Registro confirmado"
                successMessage="El integrante y su platillo quedaron registrados exitosamente."
              >
                <div className="p-6 bg-surface-low rounded-2xl border border-surface-high flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-navy-900">Estado READY Activo</span>
                    <Badge variant="success">Listo para operar</Badge>
                  </div>
                  <p className="text-xs text-content-secondary leading-relaxed">
                    Este es el contenido regular de la superficie cuando los datos están cargados y listos
                    para interactuar.
                  </p>
                </div>
              </StateBoundary>
            </CardBody>
          </Card>

          {/* Thermo States Visual Explorer (Moved from operational screen to showcase) */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-navy-900">Estados Visuales de Termo (Demostración de QA)</h3>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">Bloqueado</Badge>
                <Badge variant="gold">Disponible para solicitar</Badge>
                <Badge variant="primary">Solicitado</Badge>
                <Badge variant="warning">En producción</Badge>
                <Badge variant="success">Entregado</Badge>
              </div>
            </CardBody>
          </Card>
        </div>
      )}



      {/* Tab: TOKENS */}
      {activeTab === 'tokens' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-navy-900">Paleta de Colores Stitch</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-navy-950 text-white">
                  <p className="text-xs font-bold">Navy 950</p>
                  <p className="text-[10px] font-mono">#020d20</p>
                </div>
                <div className="p-4 rounded-xl bg-navy-900 text-white">
                  <p className="text-xs font-bold">Navy 900 (Primary)</p>
                  <p className="text-[10px] font-mono">#031636</p>
                </div>
                <div className="p-4 rounded-xl bg-gold-400 text-navy-950">
                  <p className="text-xs font-bold">Gold 400 (Accent)</p>
                  <p className="text-[10px] font-mono">#D4AF37</p>
                </div>
                <div className="p-4 rounded-xl bg-gold-200 text-navy-950">
                  <p className="text-xs font-bold">Gold 200 (Light)</p>
                  <p className="text-[10px] font-mono">#F4E5B8</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-bg border text-content-primary">
                  <p className="text-xs font-bold">Surface BG</p>
                  <p className="text-[10px] font-mono">#F8F9FA</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-low border text-content-primary">
                  <p className="text-xs font-bold">Surface Low</p>
                  <p className="text-[10px] font-mono">#F1F4F9</p>
                </div>
                <div className="p-4 rounded-xl bg-status-success-bg border border-status-success/30 text-status-success">
                  <p className="text-xs font-bold">Success</p>
                  <p className="text-[10px] font-mono">#1E8E3E</p>
                </div>
                <div className="p-4 rounded-xl bg-status-error-bg border border-status-error/30 text-status-error">
                  <p className="text-xs font-bold">Error</p>
                  <p className="text-[10px] font-mono">#9A2A2A</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalles de Mesa 24"
        description="Forma Cuadrada (SQUARE) — Capacidad 10 lugares"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-content-secondary leading-relaxed">
            La Mesa 24 cuenta con capacidad para 10 personas. Asignada para el grupo de Andrea Martínez (8 lugares requeridos).
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
        }}
        title="¿Liberar asignación de mesa?"
        message="Esta acción desasignará los lugares de la mesa. Deberás seleccionarla nuevamente antes de la fecha límite."
        variant="danger"
        confirmText="Sí, liberar asignación"
      />
    </div>
  );
};
