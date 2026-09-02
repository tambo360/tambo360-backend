# Documentación de la API - Tambo360 Backend

Esta carpeta contiene la documentación completa de todos los endpoints de la API de Tambo360.

## Documentos Disponibles

| Archivo | Descripción | Rutas |
|---------|-------------|-------|
| [auth_README.md](auth_README.md) | Endpoints de autenticación | `/auth/*` |
| [organization_README.md](organization_README.md) | Endpoints de organizaciones | `/organizacion/*` |
| [establishment_README.md](establishment_README.md) | Endpoints de establecimientos | `/establecimiento/*` |
| [profile_README.md](profile_README.md) | Endpoints de perfil de usuario | `/perfil/*` |
| [breeds_README.md](breeds_README.md) | Endpoints de razas | `/razas/*` |
| [batch_README.md](batch_README.md) | Endpoints de lotes | `/lote/*` |
| [productos_README.md](productos_README.md) | Endpoints de productos | `/productos/*` |
| [mermas_README.md](mermas_README.md) | Endpoints de mermas | `/mermas/*` |
| [alertas_README.md](alertas_README.md) | Endpoints de alertas | `/alertas/*` |
| [landing_README.md](landing_README.md) | Endpoints de landing page | `/landing/*` |
| [dashboard_README.md](dashboard_README.md) | Endpoints de dashboard | `/dashboard/*` |
| [health_README.md](health_README.md) | Endpoint de health check | `/health` |
| [settings_README.md](settings_README.md) | Endpoints de configuración, animales y establecimiento | `/conf/*` |
| [costos-generales_README.md](costos-generales_README.md) | Endpoints de costos generales y resumen económico | `/costos-generales/*` |

## Autenticación General

La mayoría de los endpoints requieren autenticación JWT mediante el header `Authorization: Bearer <token>`. Los endpoints que no requieren autenticación están marcados específicamente.

## Headers Comunes

- `Authorization`: Token JWT de autenticación (requerido para endpoints protegidos)
- `x-organizacion-id`: ID de la organización (requerido para endpoints organizacionales)
- `x-establecimiento-id`: ID del establecimiento (requerido para endpoints específicos de establecimiento)

## Formato de Respuesta

Todas las respuestas siguen el formato estándar:

```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { ... }
}
```

## Códigos de Estado

- `200`: Éxito
- `201`: Creado
- `400`: Datos inválidos
- `401`: No autenticado
- `403`: Permisos insuficientes
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## Notas Generales

- Todos los IDs son UUID v4
- Las fechas están en formato ISO 8601
- Los endpoints siguen el patrón REST
- Algunos endpoints tienen rate limiting aplicado
- Se utiliza validación con Zod para los datos de entrada