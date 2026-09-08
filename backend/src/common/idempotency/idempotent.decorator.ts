import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENT_KEY = 'IDEMPOTENT';
export const Idempotent = (required = true) => SetMetadata(IDEMPOTENT_KEY, { required });
