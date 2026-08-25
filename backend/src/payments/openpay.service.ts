import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Openpay = require('openpay');

@Injectable()
export class OpenpayService {
    private readonly logger = new Logger(OpenpayService.name);
    private readonly openpay: any;
    private readonly merchantId: string;
    private readonly privateKey: string;
    private readonly publicKey: string;
    private readonly isProduction: boolean;

    constructor(private readonly configService: ConfigService) {
        this.merchantId =
            this.configService.get<string>('OPENPAY_MERCHANT_ID') ?? '';
        this.privateKey =
            this.configService.get<string>('OPENPAY_PRIVATE_KEY') ?? '';
        this.publicKey =
            this.configService.get<string>('OPENPAY_PUBLIC_KEY') ?? '';

        const rawMode =
            this.configService.get<string>('OPENPAY_PRODUCTION_MODE') ??
            'false';
        this.isProduction = rawMode === 'true';

        if (!this.merchantId || !this.privateKey) {
            const message =
                'OpenPay configuration error: OPENPAY_MERCHANT_ID and OPENPAY_PRIVATE_KEY must be defined';
            this.logger.error(message);
            throw new Error(message);
        }

        if (!this.publicKey) {
            this.logger.warn(
                'OPENPAY_PUBLIC_KEY is not defined; frontend may not be able to initialize OpenPay.js',
            );
        }

        this.openpay = new Openpay(
            this.merchantId,
            this.privateKey,
            this.isProduction,
        );

        this.logger.log(
            `OpenPay initialized in ${
                this.isProduction ? 'PRODUCTION' : 'SANDBOX'
            } mode with merchantId=${this.merchantId}`,
        );
    }

    /**
     * Crea un cargo usando un token de tarjeta
     * El token se genera en el frontend con OpenPay.js
     */
    async createChargeWithToken(data: {
        token: string;
        amount: number;
        description: string;
        order_id: string;
        customer: {
            name: string;
            email: string;
            phone_number?: string;
        };
    }): Promise<any> {
        return new Promise((resolve, reject) => {
            const chargeRequest = {
                source_id: data.token,
                method: 'card',
                amount: data.amount,
                currency: 'MXN',
                description: data.description,
                order_id: data.order_id,
                customer: {
                    name: data.customer.name,
                    email: data.customer.email,
                    phone_number: data.customer.phone_number || '',
                },
                use_3d_secure: false, // Cambiar a true en producción
            };

            this.openpay.charges.create(
                chargeRequest,
                (error: any, body: any, _response: any) => {
                    if (error) {
                        this.logger.error(
                            `OpenPay charge error: http_code=${error?.http_code} error_code=${error?.error_code} description=${error?.description}`,
                        );
                        reject(error);
                    } else {
                        this.logger.log(`Charge created successfully: ${body.id}`);
                        resolve(body);
                    }
                },
            );
        });
    }

    /**
     * Crea un cargo por transferencia bancaria (SPEI)
     */
    async createBankCharge(data: {
        amount: number;
        description: string;
        order_id: string;
        customer: {
            name: string;
            email: string;
            phone_number?: string;
        };
    }): Promise<any> {
        return new Promise((resolve, reject) => {
            const chargeRequest = {
                method: 'bank_account',
                amount: data.amount,
                currency: 'MXN',
                description: data.description,
                order_id: data.order_id,
                customer: {
                    name: data.customer.name,
                    email: data.customer.email,
                    phone_number: data.customer.phone_number || '',
                },
            };

            this.openpay.charges.create(
                chargeRequest,
                (error: any, body: any, _response: any) => {
                    if (error) {
                        this.logger.error(
                            `OpenPay bank charge error: http_code=${error?.http_code} error_code=${error?.error_code} description=${error?.description}`,
                        );
                        reject(error);
                    } else {
                        this.logger.log(`Bank charge created: ${body.id}`);
                        resolve(body);
                    }
                },
            );
        });
    }

    /**
     * Crea un cargo por efectivo en tiendas (OXXO, 7-Eleven, etc.)
     */
    async createStoreCharge(data: {
        amount: number;
        description: string;
        order_id: string;
        customer: {
            name: string;
            email: string;
            phone_number?: string;
        };
    }): Promise<any> {
        return new Promise((resolve, reject) => {
            const chargeRequest = {
                method: 'store',
                amount: data.amount,
                currency: 'MXN',
                description: data.description,
                order_id: data.order_id,
                customer: {
                    name: data.customer.name,
                    email: data.customer.email,
                    phone_number: data.customer.phone_number || '',
                },
            };

            this.openpay.charges.create(
                chargeRequest,
                (error: any, body: any, _response: any) => {
                    if (error) {
                        this.logger.error(
                            `OpenPay store charge error: http_code=${error?.http_code} error_code=${error?.error_code} description=${error?.description}`,
                        );
                        reject(error);
                    } else {
                        this.logger.log(`Store charge created: ${body.id}`);
                        resolve(body);
                    }
                },
            );
        });
    }

    /**
     * Obtiene información de un cargo
     */
    async getCharge(chargeId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.openpay.charges.get(
                chargeId,
                (error: any, body: any, _response: any) => {
                    if (error) {
                        this.logger.error(
                            `OpenPay get charge error: http_code=${error?.http_code} error_code=${error?.error_code} description=${error?.description}`,
                        );
                        reject(error);
                    } else {
                        resolve(body);
                    }
                },
            );
        });
    }

    /**
     * Verifica la firma del webhook usando HMAC-SHA256
     */
    verifyWebhookSignature(payload: string, signature: string): boolean {
        const crypto = require('crypto');

        const hash = crypto
            .createHmac('sha256', this.privateKey)
            .update(payload)
            .digest('hex');

        return hash === signature;
    }

    /**
     * Obtiene la clave pública para el frontend
     */
    getPublicKey(): string {
        return this.publicKey;
    }

    /**
     * Obtiene el merchant ID para el frontend
     */
    getMerchantId(): string {
        return this.merchantId;
    }
}

