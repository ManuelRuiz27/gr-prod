declare global {
    interface Window {
        OpenPay?: any;
    }
}

export function initOpenPay() {
    if (typeof window === 'undefined') {
        throw new Error('OpenPay sólo puede inicializarse en el navegador');
    }

    const OpenPay = window.OpenPay;

    if (!OpenPay) {
        console.error('OpenPay SDK no está cargado en window');
        throw new Error('OpenPay SDK not loaded');
    }

    const merchantId = import.meta.env.VITE_OPENPAY_MERCHANT_ID;
    const publicKey = import.meta.env.VITE_OPENPAY_PUBLIC_KEY;

    if (!merchantId || !publicKey) {
        console.error(
            'OpenPay env vars not configured: VITE_OPENPAY_MERCHANT_ID / VITE_OPENPAY_PUBLIC_KEY',
        );
        throw new Error('OpenPay env vars not configured');
    }

    OpenPay.setId(merchantId);
    OpenPay.setApiKey(publicKey);
    OpenPay.setSandboxMode(import.meta.env.VITE_OPENPAY_SANDBOX !== 'false');

    return OpenPay;
}

export function setupOpenPayDeviceData(openpay: any): string | null {
    try {
        const deviceData = openpay?.deviceData;
        if (deviceData && typeof deviceData.setup === 'function') {
            return deviceData.setup();
        }
        console.warn(
            'OpenPay deviceData.setup no está disponible en este SDK; se omite device session id',
        );
    } catch (err) {
        console.error('Error setting up OpenPay device data:', err);
    }

    return null;
}

