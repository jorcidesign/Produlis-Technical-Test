# Order Management System — Frontend

Frontend del sistema interno de gestión de clientes, productos y órdenes construido con **Next.js**, **TypeScript**, **Tailwind CSS v4** y **shadcn/ui**.

## Arquitectura y Atomic Design

El proyecto sigue una estructura estricta de Atomic Design según lo especificado en `AGENTS.md`:

```
frontend/
├── app/
│   ├── layout.tsx         # Root layout (Server Component) con TooltipProvider y next/font
│   ├── loading.tsx        # Fallback de carga con Spinner atom para streaming / Suspense
│   ├── page.tsx           # Vista principal
│   └── globals.css        # Configuración de Tailwind CSS v4 y tokens de diseño
├── components/
│   ├── atoms/             # Componentes primitivos (carpeta por componente + index.tsx)
│   │   ├── badge/
│   │   ├── button/
│   │   ├── checkbox/
│   │   ├── combobox/
│   │   ├── input/
│   │   ├── input-group/
│   │   ├── label/
│   │   ├── select/
│   │   ├── separator/
│   │   ├── skeleton/
│   │   ├── spinner/
│   │   ├── switch/
│   │   ├── tabs/
│   │   ├── textarea/
│   │   └── tooltip/
│   ├── molecules/         # Composiciones de átomos sin modificar el átomo original
│   │   ├── input-field/   # Input + Label + mensajes de validación / ayuda
│   │   └── select-field/  # Select + Label + mensajes de validación / ayuda
│   └── organisms/         # (Reservado para bloques de UI de mayor nivel en siguientes fases)
├── lib/
│   └── utils.ts           # Helper cn para merge de clases Tailwind
```

### Convenciones de Componentes
- **Una carpeta por componente**: Cada átomo y molécula vive en su propia carpeta con `index.tsx`.
- **Server Components por defecto**: `"use client"` únicamente en componentes que requieran interactividad o estado en el cliente (como `select`, `combobox`, `switch`, `tooltip`).
- **Manejo de imágenes**: Siempre utilizar `next/image` en lugar del tag `<img>` nativo para optimización automática.

## Tailwind CSS v4

- El proyecto utiliza **Tailwind CSS v4** (`tailwindcss: ^4`).
- Se utiliza la directiva `@import "tailwindcss";` y el bloque `@theme inline` en `app/globals.css`.
- No requiere archivo `tailwind.config.js` tradicional, integrando directamente las variables CSS para shadcn/ui.

## Patrón de Caché y Data Fetching para Futuras Llamadas a la API

Para mantener consistencia con Next.js App Router y las directrices del proyecto:

```typescript
// En Server Components (ej. app/customers/page.tsx, app/orders/page.tsx):
async function getCustomers(page = 1, search = "") {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers?page=${page}&search=${search}`, {
    next: {
      revalidate: 60, // Revalidación ISR en segundo plano (60s)
      tags: ["customers"], // Tag para revalidación on-demand
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch customers");
  }

  return res.json();
}

// En Server Actions tras crear/modificar/cancelar:
// import { revalidateTag } from "next/cache";
// revalidateTag("orders");
```

## Scripts

```bash
# Servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start

# Linter
npm run lint
```
