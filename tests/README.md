# Guía de pruebas

## Estructura
- Las pruebas viven en `tests/**/*.test.ts`.
- El entorno de ejecución usa Vitest con Node (`vitest.config.ts`).
- Los archivos de setup global van en `tests/setup.ts`.

## Convenciones
1. Documentar la intención del test con comentarios breves.
2. Mockear dependencias externas (por ejemplo Prisma, servicios remotos o la librería de JWT) cuando el objetivo sea validar el flujo del middleware o la lógica local.
3. Resetear mocks en `beforeEach` para evitar contaminación entre tests.
4. Verificar tanto el comportamiento positivo como los fallos que podrían permitir bypass de seguridad.

## Ejemplo de patrón
- `vi.hoisted(...)` se usa para construir mocks compartidos antes de que Vite/Vitest inyecte el módulo.
- `vi.mock(...)` se usa para reemplazar dependencias reales por mocks controlados.
- `beforeEach` restaura el estado de los mocks y las variables de entorno usadas por los tests.

## Comandos
- Ejecutar toda la suite: `npm test`
- Ejecutar un archivo específico: `npx vitest run tests/middleware/authMiddleware.test.ts`
- Modo watch: `npm run test:watch`
