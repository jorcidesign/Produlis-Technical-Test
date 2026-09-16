# SPEC.md — Order Management System

> Documento de decisiones previas al código. Sirve como contexto para los agentes de IA (Gemini Flash) y como base directa de la sección "Technical Decisions & Assumptions" del README final.

## 1. Objetivo

Sistema interno de gestión de clientes, productos y órdenes. **No es un ecommerce**: no hay portal externo para el cliente final ni carrito de compra. El usuario es un operador interno de la empresa que registra pedidos a nombre de un cliente (modelo tipo CRM simple).

Stack obligatorio (no negociable, viene del enunciado): NestJS + Next.js + MySQL + Docker + TypeScript + Git.

## 2. Caso de uso

Un operador entra al sistema, busca o crea un cliente, arma una orden seleccionando productos y cantidades, y el sistema calcula el total y guarda el pedido con estado `pending`. No hay control de inventario/stock — el enunciado solo pide catálogo (nombre + precio), no cantidades disponibles.

## 3. Modelo de datos

### Tablas
- `customers` — name, email, (+ campos opcionales), `is_active`, `created_at`, `updated_at`
- `products` — name, price, (+ campos opcionales), `is_active`, `created_at`, `updated_at`
- `orders` — `customer_id` (FK), `status`, `total_amount`, `created_at`, `updated_at`
- `order_items` — `order_id` (FK), `product_id` (FK), `product_name` (snapshot), `unit_price` (snapshot), `quantity`

### Convenciones de nomenclatura
- Tablas en plural, `snake_case` (`order_items`)
- FKs con sufijo `_id`
- Timestamps `created_at` / `updated_at` en todas las tablas
- Booleanos con prefijo `is_` (`is_active`)

### Índices
`orders.customer_id`, `orders.status`, `orders.created_at`, `order_items.order_id`, `order_items.product_id` — pensado para el escenario de miles de registros que menciona el enunciado.

### ORM
Prisma o TypeORM. No procedures en esta entrega (aunque es el estándar en el trabajo del autor) — se documenta como mejora futura para lecturas de alto volumen.

## 4. Reglas de negocio (requisitos abiertos)

**4.1 Cambio de precio de producto**
`order_items` guarda `product_name` y `unit_price` como snapshot al crear la orden. Son inmutables: si el producto cambia de precio o se desactiva después, las órdenes ya creadas no se ven afectadas.

**4.2 Cancelación de orden / máquina de estados**
Cancelar ≠ eliminar. Es un cambio de `status` a `cancelled`, la fila permanece para trazabilidad. Transiciones válidas: `pending → completed`, `pending → cancelled`. `completed` y `cancelled` son estados terminales — no se puede cancelar una orden ya completada.

**4.3 Eliminación de customers / products**
Soft-delete (`is_active = false`), no borrado físico — evita romper la integridad de órdenes históricas que los referencian. Esto **no** aplica a `orders`: las órdenes nunca se eliminan, solo cambian de estado.

**4.4 Validaciones**
- Customer: `name` y `email` requeridos, email con formato válido.
- Product: `name` requerido, `price > 0`.
- Order: mínimo 1 item, `quantity > 0` por item, `customer_id` debe existir.

## 5. Backend (NestJS)

Estructura modular estándar de Nest por recurso — sin hexagonal ni capas extra (sobre-ingeniería innecesaria para este alcance):
```
customers/
  customers.module.ts
  customers.controller.ts
  customers.service.ts
  dto/create-customer.dto.ts
  dto/update-customer.dto.ts
  entities/customer.entity.ts
```
- DTOs validados con `class-validator`.
- `common/filters/http-exception.filter.ts` — filtro global de excepciones, shape de error consistente.
- Paginación (`page`/`limit`), búsqueda por nombre y filtros (orders por `status`/`customer_id`) resueltos en el backend — el front solo mapea, sin lógica.
- SOLID aplicado donde surge natural (servicios con una responsabilidad, DTOs separados de entidades), no forzado con abstracciones artificiales.

## 6. Frontend (Next.js)

Atomic design: **atoms → molecules → organisms → pages** (sin templates, innecesario en este alcance).
- Carpeta por componente, con `index.tsx` + estilos co-ubicados (no una carpeta global de CSS).
- Responsividad y variantes manejadas dentro del propio componente.
- Carpeta `styles/tokens` (o `theme`) para el sistema de diseño.
- Tailwind (o similar) para un look cuidado sin invertir tiempo de más.
- UX mínima: loading state en botones, disable de submit mientras guarda, toasts de éxito/error.

## 7. Infraestructura

- **Monorepo**: `/frontend`, `/backend`, `docker-compose.yml` en la raíz. Sin Turborepo/Nx.
- Docker Compose con 3 servicios: backend, frontend, MySQL. Variables de entorno vía `.env` + `.env.example`.
- El backend debe esperar a que MySQL esté listo antes de correr migraciones.
- **Sin CI/CD ni deploy real** — no está en la rúbrica ni en el enunciado. Se documenta como siguiente paso natural en el README, no se implementa.
- Nunca se usa infraestructura de clientes propios (cPanel, dominios prestados) para nada relacionado a esta entrega.

## 8. Testing

- Backend: Jest + supertest (viene integrado de fábrica en Nest).
- Frontend: Playwright e2e — flujo completo crear cliente → crear orden → cancelar.

## 9. Documentación

- Swagger (`@nestjs/swagger`) para documentación de API.
- `README.md` con: setup, cómo correr, sección **"Technical Decisions & Assumptions"** (nombre exacto pedido), limitaciones conocidas, mejoras futuras.
- `AGENTS.md` — contexto del proyecto y convenciones para el agente de IA.
- `.aiignore` — excluye `dist/`, `node_modules/`, `.env`.

## 10. Uso de IA

Gemini Flash orquestado en paralelo. En el README, priorizar qué generó la IA y qué se corrigió/validó manualmente — no el detalle de la orquestación entre agentes, ya que la rúbrica evalúa "entender y validar el output", no el setup.

## 11. Alcance de esta entrega

**Se implementa:**
Paginación, búsqueda y filtros en los 3 recursos · exception filter global · UX mínima (loading/disable/toasts) · Jest + Playwright · Swagger · AGENTS.md + .aiignore · README completo.

**Solo se documenta como mejora futura (sin código):**
Auth JWT con roles operario/administrador · historial de auditoría de cambios de estado (`order_status_history`) · cache sobre el catálogo · stored procedures para lecturas de alto volumen · notificaciones al cliente por cambio de estado · CI/CD + deploy (GitHub Actions + Railway/Render) · rate limiting y observabilidad.
