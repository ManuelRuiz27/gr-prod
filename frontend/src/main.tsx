import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DemoProvider } from './demo/DemoContext.tsx'
import { isMockDataMode } from './demo/config.ts'

async function bootstrap() {
  if (isMockDataMode) {
    const { worker } = await import('./mocks/browser.ts');
    if (import.meta.env.DEV) {
      const { localTestAuthHandlers } = await import('./mocks/localTestAuthHandlers.ts');
      worker.use(...localTestAuthHandlers);
    }
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode><DemoProvider><App /></DemoProvider></StrictMode>,
  );
}

void bootstrap();
