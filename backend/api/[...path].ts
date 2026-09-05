import type { Request, Response } from 'express';
import type { INestApplication } from '@nestjs/common';
import { createApp } from '../src/app.factory';

let appPromise: Promise<INestApplication> | undefined;

async function getServer() {
  appPromise ??= createApp().then(async (app) => {
    await app.init();
    return app;
  });

  const app = await appPromise;
  return app.getHttpAdapter().getInstance();
}

/** Vercel Node.js Function catch-all for the NestJS API. */
export default async function handler(req: Request, res: Response) {
  const server = await getServer();
  return server(req, res);
}
