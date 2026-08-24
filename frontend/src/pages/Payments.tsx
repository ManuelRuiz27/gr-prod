import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentsAPI } from '../services/paymentsAPI';

// Declaración global de OpenPay
declare global {
    interface Window {
        OpenPay?: any;
    }
}

interface PaymentSummary {
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
    progress_percent: number;
    initial_payment: number;
    monthly_payment: number;
    has_initial_payment: boolean;
    next_month: number | null;
    months_duration: number;
    thermo_unlocked: boolean;
    thermo_threshold: number;
}

interface PaymentHistory {
    id: string;
    amount: number;
    type: string;
    status: string;
    month_number: number | null;
    payment_date: string | null;
    created_at: string;
}

type PaymentMethod = 'card' | 'bank_account' | 'store';

const Payments: React.FC = () => {
    const [summary, setSummary] = useState<PaymentSummary | null>(null);
    const [history, setHistory] = useState<PaymentHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
    const [paymentType, setPaymentType] = useState<'initial' | 'monthly'>('initial');
    const [monthNumber, setMonthNumber] = useState<number>(1);
    const [amount, setAmount] = useState<number>(0);

    // Payment response data
    const [paymentResponse, setPaymentResponse] = useState<any>(null);

    // Card data
    const [cardData, setCardData] = useState({
        card_number: '',
        holder_name: '',
        expiration_month: '',
        expiration_year: '',
        cvv2: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        loadData();
        initializeOpenPay();
    }, []);

    const initializeOpenPay = async () => {
        try {
            const { initOpenPay, setupOpenPayDeviceData } = await import('../lib/openpayClient');
            const openpay = initOpenPay();
            const deviceSessionId = setupOpenPayDeviceData(openpay);

            if (deviceSessionId) {
                console.log('OpenPay initialized with device session:', deviceSessionId);
            } else {
                console.log(
                    'OpenPay initialized without device session id (deviceData.setup not available)',
                );
            }
        } catch (err) {
            console.error('Error initializing OpenPay:', err);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [summaryResp, historyResp] = await Promise.all([
                paymentsAPI.getSummary(),
                paymentsAPI.getHistory(),
            ]);
            setSummary(summaryResp.data);
            setHistory(historyResp.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentClick = (type: 'initial' | 'monthly', paymentAmount: number, month?: number) => {
        setPaymentType(type);
        setAmount(paymentAmount);
        if (month) setMonthNumber(month);
        setShowPaymentModal(true);
        setSelectedMethod('card');
        setError('');
        setSuccess('');
        setPaymentResponse(null);
    };

    const handleCardPayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!window.OpenPay) {
            setError('OpenPay no está cargado. Recarga la página.');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            window.OpenPay.token.create(
                {
                    card_number: cardData.card_number.replace(/\s/g, ''),
                    holder_name: cardData.holder_name,
                    expiration_year: cardData.expiration_year,
                    expiration_month: cardData.expiration_month,
                    cvv2: cardData.cvv2,
                },
                async (response: any) => {
                    try {
                        await paymentsAPI.createCharge({
                            payment_method: 'card',
                            token: response.data.id,
                            payment_type: paymentType,
                            month_number: paymentType === 'monthly' ? monthNumber : undefined,
                        });

                        setSuccess('¡Pago procesado exitosamente!');
                        await loadData();

                        // Reset form
                        setCardData({
                            card_number: '',
                            holder_name: '',
                            expiration_month: '',
                            expiration_year: '',
                            cvv2: '',
                        });

                        setTimeout(() => {
                            setShowPaymentModal(false);
                            setSuccess('');
                        }, 2000);
                    } catch (err: any) {
                        setError(err.response?.data?.message || 'Error al procesar el pago');
                    } finally {
                        setProcessing(false);
                    }
                },
                (error: any) => {
                    setError(error.data?.description || 'Error al procesar la tarjeta');
                    setProcessing(false);
                },
            );
        } catch (err) {
            setError('Error al procesar el pago');
            setProcessing(false);
        }
    };

    const handleBankPayment = async () => {
        setProcessing(true);
        setError('');

        try {
            const result = await paymentsAPI.createCharge({
                payment_method: 'bank_account',
                payment_type: paymentType,
                month_number: paymentType === 'monthly' ? monthNumber : undefined,
            });

            setPaymentResponse(result.data);
            setSuccess('Referencia de pago generada');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al generar referencia');
        } finally {
            setProcessing(false);
        }
    };

    const handleStorePayment = async () => {
        setProcessing(true);
        setError('');

        try {
            const result = await paymentsAPI.createCharge({
                payment_method: 'store',
                payment_type: paymentType,
                month_number: paymentType === 'monthly' ? monthNumber : undefined,
            });

            setPaymentResponse(result.data);
            setSuccess('Referencia de pago generada');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al generar referencia');
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Cargando información de pagos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Progress Section */}
                {summary && (
                    <div className="card bg-white p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Progreso de Pago</h2>

                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Pagado</div>
                                <div className="text-lg font-bold text-green-600">
                                    {formatCurrency(summary.paid_amount)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Pendiente</div>
                                <div className="text-lg font-bold text-orange-600">
                                    {formatCurrency(summary.pending_amount)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Total</div>
                                <div className="text-lg font-bold text-primary-600">
                                    {formatCurrency(summary.total_amount)}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-primary-600 to-primary-500 h-3 rounded-full transition-all"
                                style={{ width: `${summary.progress_percent}%` }}
                            ></div>
                        </div>
                        <div className="text-center mt-2 text-sm text-gray-600">
                            {summary.progress_percent}% completado
                        </div>
                    </div>
                )}

                {/* Error/Success Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <p className="text-green-700 text-sm">{success}</p>
                    </div>
                )}

                {/* Payment Actions */}
                {summary && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Realizar Pago</h2>

                        {!summary.has_initial_payment && (
                            <div className="card bg-white p-6 border-2 border-primary-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-lg font-semibold text-gray-900 mb-1">
                                            Pago Inicial
                                        </div>
                                        <div className="text-3xl font-bold text-primary-600">
                                            {formatCurrency(summary.initial_payment)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handlePaymentClick('initial', summary.initial_payment)}
                                        className="btn-primary"
                                        disabled={processing}
                                    >
                                        Pagar
                                    </button>
                                </div>
                            </div>
                        )}

                        {summary.has_initial_payment && summary.next_month && (
                            <div className="card bg-white p-6 border-2 border-primary-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-lg font-semibold text-gray-900 mb-1">
                                            Mensualidad {summary.next_month}/{summary.months_duration}
                                        </div>
                                        <div className="text-3xl font-bold text-primary-600">
                                            {formatCurrency(summary.monthly_payment)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handlePaymentClick('monthly', summary.monthly_payment, summary.next_month!)}
                                        className="btn-primary"
                                        disabled={processing}
                                    >
                                        Pagar
                                    </button>
                                </div>
                            </div>
                        )}

                        {summary.has_initial_payment && !summary.next_month && (
                            <div className="card bg-green-50 border border-green-200 p-6 text-center">
                                <span className="text-4xl mb-2 block">✓</span>
                                <div className="text-xl font-semibold text-green-700">
                                    ¡Todos los pagos completados!
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Payment History */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Historial de Pagos</h2>

                    {history.length === 0 ? (
                        <div className="card bg-white p-12 text-center">
                            <span className="text-4xl mb-2 block opacity-50">💳</span>
                            <p className="text-gray-500">No hay pagos registrados</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((payment) => (
                                <div key={payment.id} className="card bg-white p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900 mb-1">
                                                {payment.type === 'initial'
                                                    ? 'Pago Inicial'
                                                    : `Mensualidad ${payment.month_number}`}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {payment.payment_date
                                                    ? formatDate(payment.payment_date)
                                                    : formatDate(payment.created_at)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">
                                                {formatCurrency(payment.amount)}
                                            </div>
                                            <div className={`text-xs font-medium ${payment.status === 'paid'
                                                ? 'text-green-600'
                                                : payment.status === 'pending'
                                                    ? 'text-orange-600'
                                                    : 'text-red-600'
                                                }`}>
                                                {payment.status === 'paid' ? '✓ Pagado' : payment.status === 'pending' ? '⏳ Pendiente' : '✗ Fallido'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Selecciona método de pago
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Monto a pagar: <span className="font-bold text-primary-600">{formatCurrency(amount)}</span>
                            </p>

                            {/* Payment Method Tabs */}
                            <div className="flex gap-2 mb-6 border-b">
                                <button
                                    onClick={() => setSelectedMethod('card')}
                                    className={`px-4 py-2 font-medium transition-colors ${selectedMethod === 'card'
                                        ? 'text-primary-600 border-b-2 border-primary-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    💳 Tarjeta
                                </button>
                                <button
                                    onClick={() => setSelectedMethod('bank_account')}
                                    className={`px-4 py-2 font-medium transition-colors ${selectedMethod === 'bank_account'
                                        ? 'text-primary-600 border-b-2 border-primary-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    🏦 Transferencia
                                </button>
                                <button
                                    onClick={() => setSelectedMethod('store')}
                                    className={`px-4 py-2 font-medium transition-colors ${selectedMethod === 'store'
                                        ? 'text-primary-600 border-b-2 border-primary-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    🏪 Efectivo
                                </button>
                            </div>

                            {/* Card Payment Form */}
                            {selectedMethod === 'card' && !paymentResponse && (
                                <form onSubmit={handleCardPayment} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Número de Tarjeta
                                        </label>
                                        <input
                                            type="text"
                                            value={cardData.card_number}
                                            onChange={(e) => setCardData({ ...cardData, card_number: e.target.value })}
                                            placeholder="4111 1111 1111 1111"
                                            className="input"
                                            maxLength={19}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre del Titular
                                        </label>
                                        <input
                                            type="text"
                                            value={cardData.holder_name}
                                            onChange={(e) => setCardData({ ...cardData, holder_name: e.target.value })}
                                            placeholder="JUAN PEREZ"
                                            className="input"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mes
                                            </label>
                                            <input
                                                type="text"
                                                value={cardData.expiration_month}
                                                onChange={(e) => setCardData({ ...cardData, expiration_month: e.target.value })}
                                                placeholder="12"
                                                className="input"
                                                maxLength={2}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Año
                                            </label>
                                            <input
                                                type="text"
                                                value={cardData.expiration_year}
                                                onChange={(e) => setCardData({ ...cardData, expiration_year: e.target.value })}
                                                placeholder="25"
                                                className="input"
                                                maxLength={2}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                value={cardData.cvv2}
                                                onChange={(e) => setCardData({ ...cardData, cvv2: e.target.value })}
                                                placeholder="123"
                                                className="input"
                                                maxLength={4}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                        <p className="text-xs text-blue-700">
                                            <strong>Tarjeta de prueba:</strong> 4111 1111 1111 1111
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowPaymentModal(false)}
                                            className="btn-secondary flex-1"
                                            disabled={processing}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-primary flex-1"
                                            disabled={processing}
                                        >
                                            {processing ? 'Procesando...' : 'Pagar'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Bank Transfer */}
                            {selectedMethod === 'bank_account' && !paymentResponse && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                        <p className="text-sm text-blue-700 mb-2">
                                            Se generará una referencia SPEI para realizar tu pago por transferencia bancaria.
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            La referencia estará vigente por 3 días.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowPaymentModal(false)}
                                            className="btn-secondary flex-1"
                                            disabled={processing}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleBankPayment}
                                            className="btn-primary flex-1"
                                            disabled={processing}
                                        >
                                            {processing ? 'Generando...' : 'Generar Referencia'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Store Payment */}
                            {selectedMethod === 'store' && !paymentResponse && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                        <p className="text-sm text-blue-700 mb-2">
                                            Se generará una referencia para pagar en tiendas de conveniencia (OXXO, 7-Eleven, etc.).
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            La referencia estará vigente por 3 días.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowPaymentModal(false)}
                                            className="btn-secondary flex-1"
                                            disabled={processing}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleStorePayment}
                                            className="btn-primary flex-1"
                                            disabled={processing}
                                        >
                                            {processing ? 'Generando...' : 'Generar Referencia'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Payment Response - SPEI */}
                            {paymentResponse && selectedMethod === 'bank_account' && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                        <p className="text-green-700 font-semibold mb-2">✓ Referencia generada exitosamente</p>
                                        <p className="text-sm text-green-600">
                                            Realiza tu transferencia con los siguientes datos:
                                        </p>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">CLABE</div>
                                            <div className="font-mono text-lg font-bold text-gray-900">
                                                {paymentResponse.payment_method_data?.clabe}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Banco</div>
                                            <div className="font-semibold text-gray-900">
                                                {paymentResponse.payment_method_data?.bank_name}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Monto</div>
                                            <div className="text-xl font-bold text-primary-600">
                                                {formatCurrency(amount)}
                                            </div>
                                        </div>
                                        {paymentResponse.due_date && (
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Fecha límite</div>
                                                <div className="font-semibold text-gray-900">
                                                    {formatDate(paymentResponse.due_date)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setPaymentResponse(null);
                                            loadData();
                                        }}
                                        className="btn-primary w-full"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            )}

                            {/* Payment Response - Store */}
                            {paymentResponse && selectedMethod === 'store' && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                        <p className="text-green-700 font-semibold mb-2">✓ Referencia generada exitosamente</p>
                                        <p className="text-sm text-green-600">
                                            Paga en cualquier tienda de conveniencia con esta referencia:
                                        </p>
                                    </div>

                                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3 text-center">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-2">Referencia</div>
                                            <div className="font-mono text-2xl font-bold text-gray-900">
                                                {paymentResponse.payment_method_data?.reference}
                                            </div>
                                        </div>

                                        {paymentResponse.payment_method_data?.barcode_url && (
                                            <div>
                                                <div className="text-xs text-gray-500 mb-2">Código de barras</div>
                                                <img
                                                    src={paymentResponse.payment_method_data.barcode_url}
                                                    alt="Código de barras"
                                                    className="mx-auto max-w-full"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Monto a pagar</div>
                                            <div className="text-2xl font-bold text-primary-600">
                                                {formatCurrency(amount)}
                                            </div>
                                        </div>

                                        {paymentResponse.due_date && (
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Fecha límite</div>
                                                <div className="font-semibold text-gray-900">
                                                    {formatDate(paymentResponse.due_date)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                        <p className="text-xs text-blue-700">
                                            Puedes pagar en: OXXO, 7-Eleven, Extra, Circle K, y más tiendas afiliadas.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setPaymentResponse(null);
                                            loadData();
                                        }}
                                        className="btn-primary w-full"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
