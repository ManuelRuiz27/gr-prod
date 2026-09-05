import { createApp } from './app.factory';

async function bootstrap() {
  const app = await createApp();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
}
void bootstrap();
