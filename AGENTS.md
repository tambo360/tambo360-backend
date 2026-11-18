# Tambo360 Backend — AGENTS.md

## Comandos de desarrollo

```bash
npm run dev         # ts-node-dev --respawn --transpile-only --poll src/server.ts
npm run build       # tsc
npm run seed        # ts-node src/lib/seedProductos.ts
npx prisma generate # regenerar cliente Prisma
npx prisma migrate dev
npx prisma migrate deploy # prod
```

No hay scripts de lint, typecheck ni test configurados en el proyecto.

## Arquitectura

- **Entrypoint**: `src/server.ts` → monta todo en Express
- **Capas**: `routes/` → `controllers/` → `services/` (toda la lógica de negocio en services)
- **ORM**: Prisma (PostgreSQL). Cliente singleton en `src/lib/prisma.ts` con `log: ['query']`
- **Swagger**: disponible en `/api-docs`, generado desde `src/docs/*.ts`
- **Rate limit**: global 1000 req / 15 min por IP en `/api`

## API routes (montadas bajo `/api`)

| Prefix | File |
|---|---|
| `/auth` | `routes/auth.ts` |
| `/perfil` | `routes/profile.ts` |
| `/establecimiento` | `routes/establishment.ts` |
| `/organizacion` | `routes/organization.ts` |
| `/lote` | `routes/batch.ts` |
| `/mermas` | `routes/mermas.ts` |
| `/costos` | `routes/cost.ts` |
| `/productos` | `routes/product.ts` |
| `/razas` | `routes/breedsRoutes.ts` |
| `/alertas` | `routes/alertRoutes.ts` |
| `/dashboard` | `routes/dashboard.ts` |
| `/landing` | `routes/landing.ts` |
| `/health` | `routes/health.ts` |

## Auth y control de acceso

- **JWT en cookie httpOnly** (`token`), no en header Authorization
- `authenticate` middleware → `req.user.id`
- Contexto de organización/establecimiento **por headers**: `x-organizacion-id`, `x-establecimiento-id`
- Middleware chain típica para rutas protegidas con roles:

  ```
  authenticate → orgContext → requireOrgAccess → estContext → establecimientoRequireOrgAccess → requireRoles(...)
  ```

- Roles: `ORG_OWNER | ORG_ADMIN | MEMBER` y `OWNER | ADMIN | EMPLOYEE`
- Errores operacionales con `AppError`, atrapados por `errorHandler` global

## Módulo especial: `src/module/tambo/`

Módulo interno de IA (migrado de Python, **no expone endpoints**). Pipeline:

```
tambo.service (orquestador)
  → tambo.engine (cálculos + DB)
  → tambo.prompt (construcción de prompt)
  → ia.service (llamada a OpenRouter)
  → tambo.parser (parseo + fallback)
```

Ver `src/module/tambo/README.md` para reglas detalladas de separación de responsabilidades.

## Cron

- Un solo cron: cierre automático de lotes a medianoche (`0 0 * * *`)
- Habilitado solo si `ENABLE_CRONS=true`

## Envío de emails

Delega en una serverless function de Vercel: `https://api-email-lzrp.vercel.app/api/sendMail`

## Variables de entorno requeridas

`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (comma-separated), `FRONTEND_URL`, `TAMBO_AI_URL`, `OPENROUTER_API_KEY`. Opcionales: `ENABLE_CRONS`, `BACKEND_URL` (para Swagger), `NODE_ENV`, `PORT`.

## Infraestructura

- Docker multi-stage: `base` → `development` (dev) | `build` → `production` (prod)
- Dev: `npx prisma generate && npx prisma migrate deploy && npm run dev`
- Prod: `node dist/server.js`
- PostgreSQL en docker-compose como servicio `db` (puerto 5432)
- Container expone puerto 3000, mapeado a 8080 en docker-compose

## Convenciones y notas

- Nombres de rutas, schemas, campos y comentarios en **español**
- Validación con **Zod** (`src/schemas/*.ts`)
- Respuestas envueltas en `ApiResponse` (`{ success, message, data, statusCode }`)
- Errores con `throw new AppError(mensaje, statusCode)`
- Prisma queries loggeadas en desarrollo
- `src/models/User.ts` es un **archivo obsoleto** — los services consultan Prisma directamente
- `src/generated/prisma` está en `.gitignore`
- `npm run seed` además está configurado como `"prisma": { "seed" }` en package.json
