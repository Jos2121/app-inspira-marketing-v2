# Tech Stack

- You are building a React application.
- Use TypeScript.
- Use React Router. KEEP the routes in src/App.tsx
- Always put source code in the src folder.
- Put pages into src/pages/
- Put components into src/components/
- The main page (default page) is src/pages/Index.tsx
- UPDATE the main page to include the new components. OTHERWISE, the user can NOT see any components!
- ALWAYS try to use the shadcn/ui library.
- Tailwind CSS: always use Tailwind CSS for styling components. Utilize Tailwind classes extensively for layout, spacing, colors, and other design aspects.

Available packages and libraries:

- The lucide-react package is installed for icons.
- You ALREADY have ALL the shadcn/ui components and their dependencies installed. So you don't need to install them again.
- You have ALL the necessary Radix UI components installed.
- Use prebuilt components from the shadcn/ui library after importing them. Note that these files shouldn't be edited, so make new components if you need to change them.

## Arquitectura y Modularidad (Reglas Estrictas)

A partir de ahora, TODO el código generado, refactorizado o sugerido debe obedecer estrictamente los siguientes principios arquitectónicos:

1. **Principio de Responsabilidad Única (SRP):** Divide las vistas grandes y complejas (como las páginas completas en `src/pages/`) en sub-componentes pequeños y reutilizables. Un archivo no debe hacer demasiadas cosas a la vez.
2. **Separación de Lógica y UI:** Extrae la lógica de negocio compleja, las llamadas a la API y el manejo de estados globales fuera de los componentes de React. Utiliza Custom Hooks (en `src/hooks/`) o funciones de utilidad (en `src/utils/` o `src/lib/`) para mantener los componentes visuales limpios.
3. **Componentización de UI:** Cualquier elemento visual que se repita (tarjetas específicas, modales, variantes de botones) debe ser extraído como un componente independiente (por ejemplo, en `src/components/common/` o extendiendo `src/components/ui/`).
4. **Estructura de Carpetas Modular:** Agrupa los archivos por dominio o característica funcional cuando sea necesario, en lugar de amontonar todos los componentes en una sola carpeta plana.
5. **Archivos Pequeños y Mantenibles:** Si un archivo crece demasiado (código espagueti), es un indicador estricto de que debe ser refactorizado en módulos más pequeños antes de añadir nuevas funcionalidades.
6. **Moneda Exclusiva (PEN):** Toda la plataforma y cualquier nueva funcionalidad que involucre transacciones, precios o reportes financieros debe utilizar exclusivamente la moneda Sol Peruano (PEN, S/). No generar código con dólares (USD) ni símbolos genéricos ($). Usar siempre la función `formatCurrency` de `src/lib/utils.ts`.
7. **Zona Horaria y Localización Exclusiva (Lima/es-PE):** Toda la plataforma, tanto en el frontend como en cualquier lógica de backend o formateo, debe usar estrictamente la zona horaria de Lima, Perú ('America/Lima') y el formato local 'es-PE'. Nunca se deben mostrar fechas en UTC o zonas horarias del navegador por defecto si difieren de la de Perú. Siempre importa y utiliza las funciones del módulo `src/lib/date-utils.ts` para este propósito.

<!-- nitro:start -->

## Nitro Server Layer

This project has a Nitro server layer for backend API routes. A `nitro.config.ts` at the app root sets `serverDir: "./server"` — do not move or remove it.

### vite.config.ts

`vite.config.ts` already imports `nitro` from `"nitro/vite"` and registers `nitro()` as the LAST entry in the `plugins` array. Do not move it earlier — it must run after Vite's module-transform middleware, otherwise Nitro's SPA fallback intercepts Vite internal URLs (`/src/*.tsx`, `/@vite/client`, `/@react-refresh`, `/@fs/*`) and returns `index.html`, breaking the preview.

### API Route Conventions

- Write routes in `server/routes/api/` (NEVER top-level `/api/`).
- Dynamic routes: `[param].ts`. Method-specific: `hello.get.ts`, `hello.post.ts`.
- Runtime config: `useRuntimeConfig()` (env vars prefixed with `NITRO_`).

### Imports — read carefully

Imports come from two different sources:

- `defineHandler` and `useRuntimeConfig` are imported from **`"nitro"`**.
- **Every request/response helper comes from `"nitro/h3"`** — Nitro v3 re-exports h3 utilities through that subpath. Common ones: `readBody`, `readValidatedBody`, `getQuery`, `getRouterParam`, `getRouterParams`, `createError`, `sendError`, `setResponseStatus`, `getRequestHeaders`, `getRequestURL`, `setCookie`, `getCookie`, `deleteCookie`.

Worked example — `server/routes/api/todos.post.ts`:

```ts
import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ title?: string }>(event);
  if (!body?.title) {
    throw createError({ statusCode: 400, statusMessage: "title is required" });
  }
  return { ok: true, title: body.title };
});
```

### Server-side packages

Any package used inside `server/` (database drivers like `@neondatabase/serverless`, auth SDKs, third-party API clients) must be in `package.json`. Add it before writing the first server file that imports it. NEVER import these from `src/` — code under `src/` ships to the browser, so importing server packages there leaks them and usually breaks the build.

### Common mistakes

- `import { readBody } from "nitro"` → wrong. h3 utilities are not exported from `"nitro"`. Use `"nitro/h3"`.
- `import { readBody } from "h3"` → wrong. Even though Nitro is built on h3, you import through `"nitro/h3"` (the version Nitro re-exports), not `"h3"` directly.
- `nitro()` placed before `react()` in `plugins` → wrong. Must be the LAST entry, otherwise the SPA fallback intercepts Vite internals.
- Omitting `nitro()` from `vite.config.ts` entirely → `/api/*` returns `index.html` instead of JSON.
- Importing server-only packages or referencing server-only env vars (`process.env.DATABASE_URL`, secrets) from `src/` → wrong. The Vite client bundle is public; this leaks them. Server code lives in `server/` only.

<!-- nitro:end -->