# Documentación de Endpoints - Dashboard

## Descripción
Esta API expone métricas de dashboard para un establecimiento: costos directos por categoría, resumen del mes actual con variaciones, gráfico de producción, litros libres y gráfico de costos generales.

## Autenticación y Autorización

Todos los endpoints del router pasan por los siguientes middlewares:

- Autenticación JWT (`authenticate`)
- Contexto de organización (`orgContext`)
- Acceso a la organización (`requireOrgAccess`)
- Contexto de establecimiento (`estContext`)
- Acceso al establecimiento (`establecimientoRequireOrgAccess`)

Además, **`GET /dashboard/costos` exige rol de establecimiento `ADMIN` o `OWNER`** (`requireRoles`). Los demás endpoints no tienen restricción de rol adicional: basta con tener acceso al establecimiento.

## Headers Requeridos

| Header | Tipo | Descripción |
|--------|------|-------------|
| `Authorization` | string | Token JWT de autenticación (`Bearer <token>`) |
| `x-organizacion-id` | string (UUID) | ID de la organización |
| `x-establecimiento-id` | string (UUID) | ID del establecimiento |

## Formato de respuesta

Todas las respuestas exitosas siguen la estructura:

```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": {}
}
```

## Errores comunes

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 401 | Usuario no autenticado |
| 403 | Permisos insuficientes |

## Resumen de endpoints

| Método | Ruta | Descripción | Rol requerido |
|--------|------|-------------|---------------|
| GET | `/dashboard/costos` | Costos directos por categoría del mes actual | `ADMIN` / `OWNER` |
| GET | `/dashboard/mes-actual` | Resumen del mes actual y variación vs. mes anterior | Acceso al establecimiento |
| GET | `/dashboard/grafico` | Serie mensual de producción por producto y métrica | Acceso al establecimiento |
| GET | `/dashboard/litros-libres` | Litros libres del mes actual | Acceso al establecimiento |
| GET | `/dashboard/costos-generales` | Gráfico de costos generales por período | Acceso al establecimiento |

---

## Endpoints

### 1. Costos por Categoría

**Método:** `GET`  
**Ruta:** `/dashboard/costos`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`, `requireRoles({est: [RolEstablecimiento.ADMIN, RolEstablecimiento.OWNER]})`

#### Request
No requiere body ni query params.

#### Ejemplo de Request

```bash
GET /dashboard/costos
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440000
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440001
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Costos por categoría obtenidos correctamente",
  "data": [
    {
      "categoria": "insumos_basicos",
      "moneda": "ARS",
      "total": 12000.5
    },
    {
      "categoria": "leche_cruda",
      "moneda": "ARS",
      "total": 8500.0
    }
  ]
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 401 | Usuario no autenticado |
| 403 | Permisos insuficientes |

---

### 2. Resumen del Mes Actual

**Método:** `GET`  
**Ruta:** `/dashboard/mes-actual`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

Devuelve la producción y los costos del mes en curso, y la variación porcentual respecto del mes anterior.

#### Request
No requiere body ni query params.

#### Ejemplo de Request

```bash
GET /dashboard/mes-actual
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440000
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440001
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Resumen del mes actual",
  "data": {
    "actual": {
      "leches": 15000,
      "quesos": 820,
      "mermas": 45,
      "costos": 230000.5
    },
    "variaciones": {
      "leches": 5.2,
      "quesos": -3.1,
      "mermas": null,
      "costos": 12.4
    },
    "mesPrevio": "septiembre"
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `actual.leches` | number | Cantidad producida de la categoría `leches` en el mes actual |
| `actual.quesos` | number | Cantidad producida de la categoría `quesos` en el mes actual |
| `actual.mermas` | number | Suma de mermas de todos los lotes del mes |
| `actual.costos` | number | Suma de costos directos de todos los lotes del mes |
| `variaciones.*` | number \| null | Variación porcentual vs. el mes anterior. `null` si el valor del mes anterior es 0 |
| `mesPrevio` | string | Nombre del mes anterior |

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 401 | Usuario no autenticado |
| 403 | Permisos insuficientes |

---

### 3. Gráfico de Producción

**Método:** `GET`  
**Ruta:** `/dashboard/grafico`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

Devuelve la serie mensual del producto y la métrica solicitados. Abarca los 6 meses anteriores más el mes actual (7 puntos).

#### Query Params

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `producto` | string | Sí | Categoría de producto (enum `Categoria`). Ejemplos: `leches`, `quesos` |
| `metrica` | string | Sí | Métrica a graficar: `cantidad`, `mermas` o `costos` |

#### Ejemplo de Request

```bash
GET /dashboard/grafico?producto=leches&metrica=cantidad
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440000
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440001
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Resumen de los ultimos 6 meses",
  "data": {
    "resultado": [
      { "mes": "abril", "anio": 2026, "valor": 12000 },
      { "mes": "mayo", "anio": 2026, "valor": 13500 },
      { "mes": "junio", "anio": 2026, "valor": 0 }
    ],
    "Lote": true
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `resultado` | array | Un elemento por mes, en orden cronológico |
| `resultado[].mes` | string | Nombre del mes |
| `resultado[].anio` | number | Año |
| `resultado[].valor` | number | Valor de la métrica para ese mes (0 si no hay datos) |
| `Lote` | boolean | `false` si el establecimiento no tiene lotes en el período (en ese caso `resultado` es `[]`) |

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 400 | La métrica y el producto son obligatorios |
| 400 | Producto o métrica no válidos |
| 401 | Usuario no autenticado |
| 403 | Permisos insuficientes |

---

### 4. Litros Libres

**Método:** `GET`  
**Ruta:** `/dashboard/litros-libres`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

Calcula los litros libres del mes actual a partir de la producción de leche en litros, el precio del litro configurado en el establecimiento y los costos generales del mes.

**Fórmula:**

```
litrosLibres = ((litrosProducidos × precioLitro) − costosGenerales) / precioLitro
             = litrosProducidos − (costosGenerales / precioLitro)
```

Es decir, a la producción del mes se le restan los litros que hacen falta vender para cubrir los costos generales. El resultado no se redondea y puede ser **negativo** si los costos generales superan el valor de la producción.

#### Request
No requiere body ni query params.

#### Ejemplo de Request

```bash
GET /dashboard/litros-libres
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440000
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440001
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Litros Libres calculados correctamente",
  "data": {
    "periodo": {
      "fechaDesde": "2026-10-01T00:00:00.000Z",
      "fechaHasta": "2026-10-31T23:59:59.999Z"
    },
    "litrosProducidos": 15000,
    "precioLitro": 450,
    "costosGenerales": 800000,
    "litrosLibres": 13222.22
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `periodo.fechaDesde` | string (ISO 8601) | Inicio del mes actual |
| `periodo.fechaHasta` | string (ISO 8601) | Fin del mes actual |
| `litrosProducidos` | number | Suma de lotes de la categoría `leches` registrados en litros durante el mes |
| `precioLitro` | number | Precio del litro configurado en el establecimiento |
| `costosGenerales` | number | Suma de los costos generales del mes |
| `litrosLibres` | number | Litros que quedan libres tras cubrir los costos generales (ver fórmula). Sin redondeo; puede ser negativo |

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 400 | El establecimiento no tiene configurado el precio del litro de leche |
| 400 | El precio por litro debe ser mayor que cero |
| 400 | Los valores para calcular Litros Libres no son válidos |
| 400 | La producción y los costos no pueden ser negativos |
| 401 | Usuario no autenticado |
| 403 | Permisos insuficientes |

---

### 5. Gráfico de Costos Generales

**Método:** `GET`  
**Ruta:** `/dashboard/costos-generales`  
**Middleware:** `authenticate`, `orgContext`, `requireOrgAccess`, `estContext`, `establecimientoRequireOrgAccess`

Devuelve los costos generales agrupados por período y por categoría (`tipoCosto`), con los períodos sin costos incluidos en cero.

#### Query Params

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `periodo` | string | No | `7dias`, `1mes` o `6meses`. Por defecto: `6meses` |

Comportamiento de cada período:

| Valor | Rango | Agrupación |
|-------|-------|------------|
| `7dias` | Hoy y los 6 días anteriores | Una fila por día |
| `1mes` | Mes calendario actual, hasta hoy | Una fila (el mes actual) |
| `6meses` | Los 6 meses calendario anteriores, **sin incluir el mes actual** | Una fila por mes |

#### Ejemplo de Request

```bash
GET /dashboard/costos-generales?periodo=6meses
Authorization: Bearer jwt_token_here
x-organizacion-id: 550e8400-e29b-41d4-a716-446655440000
x-establecimiento-id: 550e8400-e29b-41d4-a716-446655440001
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Gráfico de costos generales obtenido correctamente",
  "data": {
    "periodo": "6meses",
    "fechaInicio": "2026-04-01T00:00:00.000Z",
    "fechaFin": "2026-09-30T23:59:59.999Z",
    "categorias": ["alquiler", "sueldos"],
    "datos": [
      {
        "periodo": "abril",
        "clave": "2026-04",
        "anio": 2026,
        "total": 150000,
        "alquiler": 50000,
        "sueldos": 100000
      },
      {
        "periodo": "mayo",
        "clave": "2026-05",
        "anio": 2026,
        "total": 0,
        "alquiler": 0,
        "sueldos": 0
      }
    ]
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `periodo` | string | Período solicitado |
| `fechaInicio` / `fechaFin` | string (ISO 8601) | Rango consultado |
| `categorias` | string[] | Categorías (`tipoCosto`) presentes en el rango, ordenadas alfabéticamente |
| `datos` | array | Una fila por día (`7dias`) o por mes (`1mes`, `6meses`) |
| `datos[].periodo` | string | Etiqueta: `dd/mm` para `7dias`, nombre del mes para `1mes` y `6meses` |
| `datos[].clave` | string | `YYYY-MM-DD` para `7dias`, `YYYY-MM` para meses |
| `datos[].anio` | number | Año |
| `datos[].total` | number | Suma de todas las categorías en esa fila |
| `datos[].<categoria>` | number | Monto de cada categoría listada en `categorias` (0 si no hay costos) |

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | No se pudo determinar el establecimiento |
| 400 | El parámetro periodo debe ser un texto válido |
| 400 | El período debe ser 7dias, 1mes o 6meses |
| 400 | El establecimiento es obligatorio |
| 401 | Usuario no autenticado |
| 403 | Permisos insuficientes |
| 500 | Se encontró un monto de costo general inválido |

---

## Notas

- `/dashboard/costos` agrupa los costos directos de los lotes del mes actual por `tipoCosto` y `moneda`; las fechas se calculan automáticamente para el mes en curso
- `/dashboard/mes-actual` y `/dashboard/litros-libres` trabajan sobre el mes calendario actual
- `/dashboard/litros-libres` solo suma lotes de la categoría `leches` cuya unidad es litros; los costos generales se toman de todo el mes sin distinguir categoría
- `/dashboard/grafico` devuelve 7 puntos mensuales (6 meses anteriores + el mes actual) aunque el mensaje de respuesta diga "últimos 6 meses"
- `/dashboard/costos-generales` con `6meses` excluye el mes actual; para ver el mes en curso usar `1mes`
- Todos los datos se filtran por el establecimiento indicado en `x-establecimiento-id`