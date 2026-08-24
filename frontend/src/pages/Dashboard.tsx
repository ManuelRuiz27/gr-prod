import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProgressRing from '../components/ProgressRing';
import StepCard from '../components/StepCard';
import BottomNav from '../components/BottomNav';
import TicketSelector from '../components/TicketSelector';
import api from '../services/api';
import { paymentsAPI } from '../services/paymentsAPI';

interface DashboardData {
    tickets: {
        count: number;
        completed: boolean;
    };
    table: {
        selected: boolean;
        label?: string;
    };
    meals: {
        completed: boolean;
        count: number;
    };
    payments: {
        progress: number;
        has_initial: boolean;
    };
    thermo: {
        unlocked: boolean;
        customized: boolean;
    };
}

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [profileResp, paymentsResp] = await Promise.all([
                api.get('/graduates/me/dashboard'),
                paymentsAPI.getSummary(),
            ]);

            const profile = profileResp.data;
            const payments = paymentsResp.data;

            setData({
                tickets: {
                    count: profile.guests_count || 0,
                    completed: profile.tickets_step === 'completed',
                },
                table: {
                    selected: profile.layout_step === 'completed',
                    label: profile.table?.label,
                },
                meals: {
                    completed: profile.meals_step === 'completed',
                    count: profile.guests_count || 0,
                },
                payments: {
                    progress: payments.progress_percent || 0,
                    has_initial: payments.has_initial_payment,
                },
                thermo: {
                    unlocked: profile.thermo_step !== 'locked',
                    customized: profile.thermo_step === 'completed',
                },
            });
        } catch (err) {
            console.error('Error loading dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const getOverallProgress = () => {
        if (!data) return 0;
        let completed = 0;
        const total = 5;

        if (data.tickets.completed) completed++;
        if (data.table.selected) completed++;
        if (data.meals.completed) completed++;
        if (data.payments.has_initial) completed++;
        if (data.thermo.customized) completed++;

        return Math.round((completed / total) * 100);
    };

    const getStepStatus = (step: string): 'completed' | 'current' | 'locked' => {
        if (!data) return 'locked';

        switch (step) {
            case 'tickets':
                return data.tickets.completed ? 'completed' : 'current';

            case 'table':
                if (data.table.selected) return 'completed';
                return data.tickets.completed ? 'current' : 'locked';

            case 'meals':
                if (data.meals.completed) return 'completed';
                return data.table.selected ? 'current' : 'locked';

            case 'payments':
                if (data.payments.has_initial) return 'completed';
                return data.meals.completed ? 'current' : 'locked';

            case 'thermo':
                if (data.thermo.customized) return 'completed';
                return data.thermo.unlocked ? 'current' : 'locked';

            default:
                return 'locked';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-premium-black">
                <div className="text-center">
                    <div className="spinner-premium mb-4"></div>
                    <p className="text-premium-silver">Cargando tu progreso...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-premium-black pb-24 md:pb-8">
            {/* Header Premium */}
            <header className="bg-gradient-card border-b border-premium-gold/20 sticky top-0 z-40 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-display text-2xl md:text-3xl font-bold text-premium-platinum">
                                Graduación 2025
                            </h1>
                            <p className="text-sm text-premium-silver mt-1">
                                Bienvenido, <span className="text-premium-gold">{user?.full_name}</span>
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="btn-ghost text-sm px-4 py-2"
                        >
                            Salir
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Progress Section */}
                <div className="card-premium mb-8 text-center">
                    <h2 className="font-display text-xl font-semibold text-premium-platinum mb-6">
                        Tu Progreso
                    </h2>

                    <div className="flex justify-center mb-4">
                        <ProgressRing progress={getOverallProgress()} size={140} strokeWidth={10} />
                    </div>

                    <p className="text-premium-silver text-sm">
                        {getOverallProgress() === 100
                            ? '¡Felicidades! Has completado todos los pasos'
                            : 'Continúa completando los pasos para tu graduación'}
                    </p>
                </div>

                {/* Steps Section */}
                <div className="space-y-4">
                    <h2 className="section-header">Pasos del Proceso</h2>

                    <StepCard
                        icon="🎫"
                        title="Boletos"
                        description="Selecciona la cantidad de boletos"
                        status={getStepStatus('tickets')}
                        details={data?.tickets.completed ? `${data.tickets.count} boletos seleccionados` : undefined}
                        onClick={() => {
                            if (getStepStatus('tickets') !== 'locked') {
                                // Scroll to tickets section (stays on dashboard)
                                document.getElementById('tickets-section')?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    />

                    <StepCard
                        icon="🪑"
                        title="Mesa"
                        description="Elige tu mesa en el croquis"
                        status={getStepStatus('table')}
                        details={data?.table.label ? `Mesa ${data.table.label}` : undefined}
                        onClick={() => {
                            if (getStepStatus('table') !== 'locked') {
                                navigate('/layout');
                            }
                        }}
                    />

                    <StepCard
                        icon="🍽️"
                        title="Platillos"
                        description="Selecciona el menú para tus invitados"
                        status={getStepStatus('meals')}
                        details={data?.meals.completed ? `${data.meals.count} platillos seleccionados` : undefined}
                        onClick={() => {
                            if (getStepStatus('meals') !== 'locked') {
                                navigate('/meals');
                            }
                        }}
                    />

                    <StepCard
                        icon="💳"
                        title="Pagos"
                        description="Realiza tus pagos mensuales"
                        status={getStepStatus('payments')}
                        details={data?.payments.progress ? `${data.payments.progress}% completado` : undefined}
                        onClick={() => {
                            if (getStepStatus('payments') !== 'locked') {
                                navigate('/payments');
                            }
                        }}
                    />

                    <StepCard
                        icon="🎁"
                        title="Termo Personalizado"
                        description="Personaliza tu termo exclusivo"
                        status={getStepStatus('thermo')}
                        details={data?.thermo.customized ? 'Termo personalizado' : data?.thermo.unlocked ? 'Disponible para personalizar' : `Desbloquea al alcanzar 70% de pagos`}
                        onClick={() => {
                            if (getStepStatus('thermo') !== 'locked') {
                                navigate('/thermo');
                            }
                        }}
                    />
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <div className="divider-premium"></div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/summary')}
                            className="btn-secondary text-sm py-3"
                        >
                            📊 Ver Resumen
                        </button>
                        <button
                            onClick={() => navigate('/payments')}
                            className="btn-primary text-sm py-3"
                        >
                            💳 Ir a Pagos
                        </button>
                    </div>
                </div>

                {/* Tickets Section (Embedded) */}
                <div id="tickets-section" className="mt-8">
                    {!data?.tickets.completed && (
                        <div className="card-premium">
                            <TicketSelector onComplete={loadDashboardData} />
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Navigation (Mobile) */}
            <BottomNav />
        </div>
    );
};

export default Dashboard;
