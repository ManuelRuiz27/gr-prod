# React + TypeScript + Vite

## Croquis precargado

`npm run dev` permite consultar `/graduate/table` y `/admin/events/{eventId}/tables`.
El croquis Taller 2560 usa SVG + JSON y queda en vista previa: capacidades pendientes,
sin disponibilidad inventada ni escrituras de asignación. `VITE_SEATING_SOURCE=preview`
es el valor por defecto; `http` requiere el contrato nuevo y capacidades reales.
Contrato y activación: [SEATING_QUANTITY_CONTRACT.md](../docs/SEATING_QUANTITY_CONTRACT.md).

Mocks interactivos (solo `npm run dev`): `/__qa/seating?scenario=partial`.
Diez escenarios con capacidades simuladas, selector de graduado/administrador y estado aislado;
la página de pruebas no se incluye en el build de producción.

Con `VITE_DATA_MODE=mock`, las cuentas de Andrea y Administrador Principal también
incluyen los diez casos en sus pantallas habituales de mesas. Accesos, credenciales,
flujo entre roles y reinicio: [pruebas por usuario](../docs/DEMO_MOCK.md#croquis-pruebas-con-los-usuarios-correspondientes).
Las cantidades se comparten localmente entre estos usuarios y sobreviven a la recarga;
el aviso de capacidades simuladas permanece visible. Pruebas específicas:
`npx vitest run src/test/localAccountSeating.test.ts src/test/seatingQuantityScenarios.test.ts`.

Pruebas del módulo: `npx vitest run src/test/graduateTable.test.tsx src/test/adminEventTables.test.tsx src/test/presetSeatingGateway.test.ts src/test/presetSeatingLifecycle.test.tsx`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
