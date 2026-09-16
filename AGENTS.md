# AGENTS.md — Order Management System

## Contexto del proyecto
Prueba técnica: sistema **interno** (no ecommerce) de gestión de clientes, productos y órdenes para un equipo administrativo. `SPEC.md` en la raíz es la fuente de verdad de TODAS las decisiones de arquitectura, alcance y reglas de negocio. Ante cualquier duda, `SPEC.md` manda sobre cualquier suposición propia.

## Stack
- Backend: NestJS + TypeScript + Prisma + MySQL
- Frontend: Next.js + TypeScript + Tailwind, atomic design (atoms → molecules → organisms → pages)
- Infra: Docker Compose, monorepo. Sin CI/CD ni deploy real.

## Estructura del repo
```
/backend
/frontend
docker-compose.yml
SPEC.md
AGENTS.md
.aiignore
```

## Reglas duras (no negociables)
- No implementar autenticación, roles, websockets, integraciones de IA, ni ningún feature fuera de la sección 11 de `SPEC.md` ("se implementa"). Todo lo demás va SOLO documentado en el README como mejora futura, nunca como código.
- No usar stored procedures — ORM (Prisma) únicamente en esta entrega.
- `orders` nunca se elimina, solo cambia de `status`. Soft-delete (`is_active`) aplica solo a `customers` y `products`.
- `order_items` guarda `product_name` y `unit_price` como snapshot inmutable al momento de crear la orden.
- Transiciones de estado válidas: `pending → completed`, `pending → cancelled`. `completed` y `cancelled` son terminales.
- Sin CI/CD, sin deploy, sin usar infraestructura de terceros/clientes.
- Sin sobre-ingeniería: estructura modular estándar de Nest (sin capas hexagonales), atomic design simple en el front (sin templates).

## Convenciones
- BD: tablas en plural, `snake_case`. FKs con sufijo `_id`. Timestamps `created_at`/`updated_at`. Booleanos con prefijo `is_`.
- Backend: un módulo por recurso → `module / controller / service / dto / entities`.
- Frontend: una carpeta por componente (`index.tsx` + estilos co-ubicados, responsividad dentro del propio componente).
- Paginación, búsqueda y filtros se resuelven en el backend; el frontend solo mapea.

## Fase actual: SOLO scaffolding
En esta etapa **no se escribe lógica de negocio, entidades, controladores, DTOs con reglas propias, ni scripts SQL**. Únicamente: estructura de carpetas, instalación de dependencias, y validar que backend, frontend y MySQL levantan correctamente. No avanzar a implementar ningún módulo sin instrucción explícita.
