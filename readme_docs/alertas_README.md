# Documentación de Endpoints - Alertas

## Descripción
Esta API permite gestionar alertas del sistema Tambo360. Las alertas son notificaciones generadas por el motor de inteligencia artificial para informar sobre eventos importantes en los lotes de producción.

## Autenticación y Autorización
- No requiere autenticación JWT
- No requiere headers especiales

---

## Endpoints

### 1. Obtener Alertas de un Establecimiento

**Método:** `GET`  
**Ruta:** `/alertas/:idEstablecimiento`  
**Middleware:** Ninguno

#### Parámetros de URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `idEstablecimiento` | string (UUID) | ID del establecimiento |

#### Query Parameters

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `rango` | number | No | Número de días hacia atrás para filtrar alertas |

#### Ejemplo de Request

```bash
GET /alertas/550e8400-e29b-41d4-a716-446655440000?rango=7
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Alertas obtenidas correctamente",
  "data": [
    {
      "id": 1,
      "tipo": "temperatura_alta",
      "mensaje": "Temperatura del lote supera el límite",
      "severidad": "alta",
      "fecha": "2026-05-15T12:00:00.000Z",
      "idLote": "uuid-lote",
      "visto": false
    }
  ]
}
```

---

### 2. Obtener Últimas Alertas

**Método:** `GET`  
**Ruta:** `/alertas/:idEstablecimiento/ultimas`  
**Middleware:** Ninguno

#### Parámetros de URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `idEstablecimiento` | string (UUID) | ID del establecimiento |

#### Ejemplo de Request

```bash
GET /alertas/550e8400-e29b-41d4-a716-446655440000/ultimas
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Últimas alertas obtenidas correctamente",
  "data": [
    {
      "id": 1,
      "tipo": "temperatura_alta",
      "mensaje": "Temperatura del lote supera el límite",
      "severidad": "alta",
      "fecha": "2026-05-15T12:00:00.000Z",
      "idLote": "uuid-lote",
      "visto": false
    }
  ]
}
```

---

### 3. Marcar Alerta como Vista

**Método:** `PUT`  
**Ruta:** `/alertas/:idAlerta/visto`  
**Middleware:** Ninguno

#### Parámetros de URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `idAlerta` | number | ID de la alerta |

#### Ejemplo de Request

```bash
PUT /alertas/1/visto
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Alerta marcada como vista correctamente",
  "data": {
    "id": 1,
    "tipo": "temperatura_alta",
    "mensaje": "Temperatura del lote supera el límite",
    "severidad": "alta",
    "fecha": "2026-05-15T12:00:00.000Z",
    "idLote": "uuid-lote",
    "visto": true
  }
}
```

---

### 4. Obtener Conteo de Alertas No Vistas

**Método:** `GET`  
**Ruta:** `/alertas/:idEstablecimiento/no-vistas`  
**Middleware:** Ninguno

#### Parámetros de URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `idEstablecimiento` | string (UUID) | ID del establecimiento |

#### Ejemplo de Request

```bash
GET /alertas/550e8400-e29b-41d4-a716-446655440000/no-vistas
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Conteo de alertas no vistas obtenido correctamente",
  "data": {
    "totalNoVistas": 5
  }
}
```

---

### 5. Obtener Alertas por Lote

**Método:** `GET`  
**Ruta:** `/alertas/:idEstablecimiento/lote/:idLote`  
**Middleware:** Ninguno

#### Parámetros de URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `idEstablecimiento` | string (UUID) | ID del establecimiento |
| `idLote` | string (UUID) | ID del lote |

#### Ejemplo de Request

```bash
GET /alertas/550e8400-e29b-41d4-a716-446655440000/lote/550e8400-e29b-41d4-a716-446655440001
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Alertas del lote obtenidas correctamente",
  "data": [
    {
      "id": 1,
      "tipo": "temperatura_alta",
      "mensaje": "Temperatura del lote supera el límite",
      "severidad": "alta",
      "fecha": "2026-05-15T12:00:00.000Z",
      "idLote": "550e8400-e29b-41d4-a716-446655440001",
      "visto": false
    }
  ]
}
```

---

## Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | ID del establecimiento requerido |
| 400 | ID de la alerta requerido |
| 400 | ID del lote requerido |

---

## Notas

- Las alertas son generadas automáticamente por el sistema TamboEngine
- Los tipos de severidad pueden ser: baja, media, alta, critica
- El parámetro `rango` filtra alertas por número de días hacia atrás
- Las alertas pueden marcarse como vistas para seguimiento
- Las respuestas siguen el formato estándar `ApiResponse`