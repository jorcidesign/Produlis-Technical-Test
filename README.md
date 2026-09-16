# Order Management System

Sistema interno (no ecommerce) de gestión de clientes, productos y órdenes para un equipo administrativo. Un operador busca o crea un cliente, arma una orden seleccionando productos y cantidades, y el sistema calcula el total y guarda el pedido con estado `pending`.

Monorepo: `/backend` (NestJS + Prisma + MySQL), `/frontend` (Next.js), `docker-compose.yml` en la raíz. Ver `SPEC.md` y `AGENTS.md` para el detalle de decisiones de producto/arquitectura previas al código.

## Requisitos previos

- Node.js 24.x y npm
- Docker + Docker Compose (para MySQL, o para levantar todo el stack)

## Setup

### 1. Variables de entorno

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Los valores por defecto ya apuntan a `localhost` y al puerto no estándar `3307` de MySQL (para no chocar con una instalación local en el 3306).

### 2. Levantar MySQL

```bash
docker compose up -d mysql
```

### 3. Backend

```bash
cd backend
npm install        # dispara `prisma generate` vía postinstall
npx prisma migrate deploy   # o `npx prisma migrate dev` en desarrollo
npm run start:dev
```

Backend en `http://localhost:3001`, Swagger en `http://localhost:3001/api/docs`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend en `http://localhost:3000`.

## Correr todo con Docker Compose

```bash
docker compose up --build
```

Levanta los 3 servicios (`mysql`, `backend`, `frontend`). El backend espera a que MySQL esté `healthy` antes de arrancar y aplica las migraciones pendientes (`prisma migrate deploy`) automáticamente en su entrypoint, con reintentos. Los 3 servicios corren en `network_mode: host` (ver sección de decisiones técnicas) — funciona en Linux; en otros SO usar el setup local sin Docker para frontend/backend.

## Tests

```bash
# Backend — unit (mocks, sin base de datos)
cd backend && npm test

# Backend — e2e (contra un backend real corriendo en :3001 + MySQL)
docker compose up -d mysql backend   # o `npm run start:dev` en otra terminal
cd backend && npm run test:e2e

# Frontend — Playwright (contra un frontend + backend reales)
cd frontend && npx playwright install chromium   # una sola vez
npx playwright test
```

## Technical Decisions & Assumptions

- **Prisma 7 + driver adapters son obligatorios.** Prisma 7 eliminó el motor de queries "clásico" con binario nativo: `new PrismaClient()` sin un `adapter` lanza `PrismaClientInitializationError`. Se usa `@prisma/adapter-mariadb` en `PrismaService`.
- **MySQL 8 + `caching_sha2_password`.** El driver `mariadb` necesita `allowPublicKeyRetrieval: true` para completar el handshake de auth por defecto de MySQL 8 sin TLS (ver `PrismaService.toPoolConfig`). Sin esto, la primera conexión tras un contenedor de MySQL recién creado falla o cuelga.
- **Contrato de API normalizado con un interceptor global.** Prisma devuelve objetos en camelCase y `Decimal` como tipo propio; el frontend (ya construido) espera snake_case y `number`. En vez de reescribir el frontend, `TransformResponseInterceptor` normaliza toda respuesta del backend de forma recursiva. La paginación de los 3 recursos usa el mismo shape plano: `{ data, total, page, limit, total_pages }`.
- **DTOs de `orders` en snake_case (`customer_id`, `product_id`).** Excepción deliberada a la convención camelCase de Nest: las Server Actions del frontend ya envían el body así; nombrar el DTO igual evita tocar el frontend.
- **Backend e2e como pruebas "black-box" (Supertest contra un servidor real corriendo), no contra un `TestingModule` de Nest en memoria.** El compilador WASM de queries de Prisma 7 (usado por los driver adapters) no carga correctamente dentro del sandbox `--experimental-vm-modules` de Jest — cualquier test que instancie `PrismaService` en el mismo proceso de Jest cuelga o revienta con un error de `Buffer` indefinido. Es una incompatibilidad de la librería, no de este código: se evita instanciando el cliente de Prisma en un proceso Node normal (el servidor real) y hablándole por HTTP desde los tests.
- **Docker Compose con los 3 servicios en `network_mode: host`.** Así ningún `.env` cambia entre desarrollo local y Docker (todo sigue siendo `localhost`), evitando mezclar host-networking (ya usado por MySQL) con la red bridge por defecto de Compose. Trade-off: solo funciona en Linux y requiere los puertos 3000/3001/3307 libres en el host.
- **`next.config.ts` con `output: "standalone"`** para una imagen de Docker liviana. `/orders/new` se marca `force-dynamic` porque hace fetch de clientes/productos activos — evita que el build de Next necesite un backend accesible en tiempo de build.
- **README único en la raíz** (este archivo) en vez de READMEs separados por paquete, dado que es un monorepo con un solo `docker-compose.yml` y una sola fuente de verdad de setup.
- **Sin stored procedures, auth, roles, websockets, ni capas hexagonales** — fuera de alcance por `AGENTS.md`/`SPEC.md`.

## Limitaciones conocidas

- Sin autenticación ni control de acceso — cualquiera con la URL puede operar el sistema.
- Sin control de inventario/stock — el catálogo es solo nombre + precio.
- `network_mode: host` en Docker Compose es Linux-only.
- Los tests e2e de backend y el e2e de Playwright requieren un servidor real corriendo (no están aislados en un sandbox in-memory).
- Los botones que navegan (`<Button render={<Link .../>}>`) emiten un warning de consola de Base UI ("expected a native `<button>`") en desarrollo. Es cosmético: se probó `nativeButton={false}` para silenciarlo, pero eso reescribe el rol ARIA de `link` a `button` en elementos de navegación (regresión real de semántica/accesibilidad), así que se revirtió — el warning queda documentado en vez de "corregido" con una solución peor.

## Mejoras futuras (documentadas, sin código)

- Auth JWT con roles operario/administrador
- Historial de auditoría de cambios de estado (tabla `order_status_history`)
- Cache sobre el catálogo
- Stored procedures para lecturas de alto volumen
- Notificaciones al cliente por cambio de estado
- CI/CD + deploy (GitHub Actions + Railway/Render)
- Rate limiting y observabilidad

## Endpoints del backend

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/customers` | Crear cliente |
| GET | `/customers` | Listar clientes activos (paginado, búsqueda por nombre) |
| GET | `/customers/:id` | Obtener cliente |
| PATCH | `/customers/:id` | Actualizar cliente |
| DELETE | `/customers/:id` | Soft-delete (`is_active=false`) |
| POST | `/products` | Crear producto |
| GET | `/products` | Listar productos activos (paginado, búsqueda por nombre) |
| GET | `/products/:id` | Obtener producto |
| PATCH | `/products/:id` | Actualizar producto |
| DELETE | `/products/:id` | Soft-delete (`is_active=false`) |
| POST | `/orders` | Crear orden (`customer_id` + `items[]`) |
| GET | `/orders` | Listar órdenes (paginado, filtro por `status`/`customer_id`) |
| GET | `/orders/:id` | Obtener orden con items y cliente |
| PATCH | `/orders/:id/status` | Cambiar estado (`pending → completed\|cancelled`, 409 si es inválido) |

Documentación interactiva completa en `/api/docs` (Swagger).
