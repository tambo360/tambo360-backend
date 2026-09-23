# Configuración - API Tambo360

Documentación de los endpoints montados bajo `/api/conf`.

## Autenticación y contexto

Todos requieren JWT, `x-organizacion-id` y `x-establecimiento-id`. La ruta aplica esta cadena global:

`authenticate -> orgContext -> requireOrgAccess -> establecimientoRequireOrgAccess -> estContext`

## 1. Actualizar establecimiento

**PATCH** `/api/conf/establecimiento`

Actualiza datos básicos y de ordeñe. El body es JSON:

```json
{
  "idEst": "uuid-establecimiento",
  "nombre": "Tambo La Esperanza",
  "tipo_ordenie": "linea",
  "ordenie_dia": 2,
  "promLitros": 24.5,
  "ubicacion": {
    "provincia": "Buenos Aires",
    "localidad": "Chivilcoy"
  }
}
```

Campos: `idEst` UUID, `nombre` máximo 50 caracteres, `tipo_ordenie` (`balde`, `linea`, `espina_de_pescado`, `rotativo`, `manual`, `otro`), `ordenie_dia` entero de 1 a 3, `promLitros` positivo y ubicación con provincia/localidad de 2 a 100 caracteres.

Respuesta: `data` contiene `conf` y `establecimiento`. Errores: `400`, `401` y `403`.

## 2. Registrar ingreso de animales

**POST** `/api/conf/animal`

El `tipoSeguimiento` debe coincidir con la configuración del establecimiento.

### RODEO o RODEO_UNICO

```json
{
  "tipoSeguimiento": "RODEO",
  "tipo": "INGRESO",
  "motivo": "INGRESO_COMPRA",
  "destino": "uuid-rodeo-destino",
  "razas": [
    { "raza": "HOLANDO_ARGENTINO", "cantVacas": 10 },
    { "raza": "JERSEY", "cantVacas": 5 }
  ],
  "observacion": "Compra de animales"
}
```

Incrementa el rodeo y realiza upsert de cada raza. La cantidad registrada es la suma de `razas[].cantVacas`. `razas` requiere al menos un elemento.

### INDIVIDUAL

```json
{
  "tipoSeguimiento": "INDIVIDUAL",
  "tipo": "INGRESO",
  "motivo": "INGRESO_NACIMIENTO",
  "animales": [
    {
      "codigo": "A-001",
      "nombre": "Vaca Rosa",
      "categoria": "ORDENE",
      "estado": "SANO",
      "raza": "HOLANDO_ARGENTINO",
      "fechaNacimiento": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

Cada animal requiere `categoria`, `estado`, `raza` y código o nombre. Un animal `ORDENE` solo puede tener estado `SANO`. El establecimiento no puede superar 70 animales activos.

Motivos: `INGRESO_COMPRA`, `INGRESO_NACIMIENTO`. Responde `200`. Errores: `400`, `401`, `403` y `404`.

## 3. Dar de baja animales

**DELETE** `/api/conf/animal`

### RODEO o RODEO_UNICO

```json
{
  "tipoSeguimiento": "RODEO",
  "tipo": "EGRESO",
  "motivo": "EGRESO_VENTA",
  "origen": "uuid-rodeo-origen",
  "raza": {
        "idRaza": "uuid-raza-origen",
        "raza": "HOLANDO_ARGENTINO",
        "cantVacas": 2;
  },
  "observacion": "Venta"
}
```

### INDIVIDUAL

```json
{
  "tipoSeguimiento": "INDIVIDUAL",
  "tipo": "EGRESO",
  "motivo": "EGRESO_DESCARTE",
  "animales": "uuid-animal"
}
```

Motivos: `EGRESO_VENTA`, `EGRESO_DESCARTE`, `EGRESO_MUERTE`. En individual, `cantidad` debe coincidir con la cantidad de IDs y los animales se marcan como inactivos. Responde `200`. Errores: `400`, `401`, `403` y `404`.

## 4. Listar animales

**GET** `/api/conf/animal/listar`

Disponible únicamente con seguimiento `INDIVIDUAL`. Query opcional:

| Parámetro | Tipo    | Default | Restricción                                   |
| --------- | ------- | ------: | --------------------------------------------- |
| `codigo`  | string  |       - | Coincidencia parcial                          |
| `nombre`  | string  |       - | Coincidencia parcial                          |
| `estado`  | enum    |       - | `MASTITIS`, `TRATAMIENTO`, `PREPARTO`, `SANO` |
| `orden`   | enum    |   `asc` | `asc` o `desc`                                |
| `page`    | integer |     `1` | Mayor que 0                                   |
| `limit`   | integer |    `10` | Entre 1 y 100                                 |

Devuelve animales activos con `DEL`, `situacion`, género, observación y producción del día (`litros_hoy`, `litros_totales`). Errores: `400` si no es seguimiento individual, filtros inválidos o establecimiento no determinado; `401` y `403`.

## 5. Obtener movimientos

**GET** `/api/conf/movimiento`

No recibe query ni body. Devuelve movimientos de la configuración actual, con `tipo`, motivo normalizado, origen/destino, cantidad, observación, fecha, usuario y detalles de animales.

> El controlador conserva actualmente el mensaje de éxito `Animal actualizado correctamente`, aunque la operación obtiene movimientos.
>
> Advertencia de implementación: el controlador valida `listaMovimientosSchema` contra el string del establecimiento en lugar de `{ idEst: string }`; por ese motivo la ruta puede responder `400` antes de consultar el servicio.

Errores: `400`, `401`, `403` y `404`.

## 6. Actualizar animal

**PATCH** `/api/conf/animal`

Disponible únicamente con seguimiento `INDIVIDUAL`. Actualmente el controlador lee los datos desde query parameters, no desde JSON:

```text
/api/conf/animal?id=uuid&codigo=A-001&nombre=Vaca%20Rosa&observacion=Seguimiento&fechaNacimiento=2024-01-15&fechaParto=2026-07-20
```

Parámetros:

| Parámetro         | Obligatorio | Descripción                       |
| ----------------- | ----------: | --------------------------------- |
| `id`              |          Sí | UUID del animal                   |
| `codigo`          | Condicional | Debe existir `codigo` o `nombre`  |
| `nombre`          | Condicional | Debe existir `codigo` o `nombre`  |
| `observacion`     |          No | Nueva observación                 |
| `fechaNacimiento` |          No | Fecha                             |
| `fechaParto`      |          No | Se guarda como `fechaUltimoParto` |

No actualiza categoría, estado ni raza. Responde `200`. Errores: `400`, `401` y `403`.

## 7. Transferir animales

**POST** `/api/conf/animal/transferir`

### RODEO o RODEO_UNICO

```json
{
  "tipo": "TRANSFERENCIA",
  "motivo": "TRANSFERENCIA_SANITARIA",
  "causa": "MASTITIS",
  "tipoSeguimiento": "RODEO",
  "origen": "uuid-rodeo-origen",
  "destino": "uuid-rodeo-destino",
  "animal": {
    "raza": "uuid-raza",
    "cantVacas": 3
  },
  "retorno": "2026-10-01T00:00:00.000Z",
  "observacion": "Tratamiento sanitario"
}
```

Mueve la cantidad de la raza indicada entre rodeos y actualiza sus existencias. `origen` y `destino` deben ser diferentes.

### INDIVIDUAL

```json
{
  "tipo": "TRANSFERENCIA",
  "motivo": "TRANSFERENCIA_CICLO_PRODUCTIVO",
  "causa": "SECADA_PROGRAMADA",
  "tipoSeguimiento": "INDIVIDUAL",
  "origen": "ORDENE",
  "destino": "SECAS",
  "animal": "uuid-animal",
  "retorno": null
}
```

En individual cambia la categoría y el estado según la causa. Motivos: `TRANSFERENCIA_SANITARIA`, `TRANSFERENCIA_CICLO_PRODUCTIVO`, `TRANSFERENCIA_RECUPERACION`.

Causas válidas por motivo:

- Sanitaria: `MASTITIS`, `PROBLEMA_PODAL`, `PROBLEMA_UTERINO`, `ENFERMEDAD_GENERAL`.
- Ciclo productivo: `SECADA_PROGRAMADA`, `PARTO`, `ABORTO`.
- Recuperación: `ALTA_MEDICA`.

Responde `200`. Errores: `400`, `401`, `403` y `404`.

## 8. Obtener informacion para el formulario de Alta animal

**GET** `/api/conf/animal/alta/form-data`

No recibe query ni body. Devuelve información para utilizar en el formulario (darle opciones al usuario), la informacion varia dependiendo del tipo de seguimiento del establecimiento (RODEO, RODEO_UNICO | INDIVIDUAL)

- En caso de RODEO, RODEO_UNICO se obtiene: TipoSeguimiento, Rodeos disponibles (idRodeo, label, value), Razas disponibles (label, value), TipoMovimiento (necesario para el alta), motivos disponibles (label, value).
- En caso de INDIVIDUAL se obtiene: TipoSeguimiento, EstadoSanitarios disponibles (label, value), Categorias de animal disponibles (label, value), Razas disponibles (label, value), TipoMovimiento (necesario para el alta), motivos disponibles (label, value)..

### RODEO o RODEO_UNICO

```json
{
  "tipoMovimiento": "INGRESO",
  "Motivos": {
      "label": "Ingreso Nacimiento",
      "value": "INGRESO_NACIMIENTO";
  }[],
  "tipoSeguimiento": "RODEO" | "RODEO_UNICO",
  "rodeos": {
        "idRodeo": "uuid del rodeo",
        "TipoRodeo": {
            "label": "Rodeo Alta Producción",
            "value": "ALTA_PRODUCCION"
        },
    }[],
    "razas": {
        "label": "Jersey",
        "value": "JERSEY"
    }[]
}
```

### INDIVIDUAL

```json
{
    "tipoMovimiento": "INGRESO",
    "Motivos": {
      "label": "Ingreso Nacimiento",
      "value": "INGRESO_NACIMIENTO";
    }[],
    "tipoSeguimiento": "INDIVIDUAL",
    "EstadoSanitarios": {
        "label": "Problema Podal",
        "value": "PROBLEMA_PODAL"
    }[],
    "Categorias": {
        "label": "Ordeñe",
        "value": "ORDENE"
    }[],
    "razas": {
        "label": "Jersey",
        "value": "JERSEY"
    }[]
}
```

Responde `200`. Errores: `400`, `401`, `403` y `404`.

## 9. Obtener informacion para el formulario de Baja animal

**GET** `/api/conf/animal/baja/form-data`

No recibe query ni body. Devuelve información para utilizar en el formulario (darle opciones al usuario), la informacion varia dependiendo del tipo de seguimiento del establecimiento (RODEO, RODEO_UNICO | INDIVIDUAL)

- En caso de RODEO, RODEO_UNICO se obtiene: TipoSeguimiento, Rodeos disponibles (idRodeo, label, value, cantidades), Razas disponibles (label, value, idRaza, cantidades), TipoMovimiento (necesario para la baja), motivos disponibles (label, value).
- En caso de INDIVIDUAL se obtiene: TipoSeguimiento, animales disponibles (idAnimal, nombre, codigo, raza), TipoMovimiento (necesario para la baja), motivos disponibles (label, value).

### RODEO o RODEO_UNICO

```json
{
  "tipoMovimiento": "EGRESO",
  "Motivos": {
      "label": "Egreso Muerte",
      "value": "EGRESO_MUERTE";
  }[],
  "tipoSeguimiento": "RODEO" | "RODEO_UNICO",
  "rodeos": {
        "idRodeo": "uuid del rodeo",
        "TipoRodeo": {
            "label": "Rodeo Alta Producción",
            "value": "ALTA_PRODUCCION"
        },
        "cantVacas": 20,
        "razas": {
            "idRaza": "uuid-raza",
            "cantVacas": 8,
            "nombre": {
              "label": "Jersey",
              "value": "JERSEY"
            }
        }[]
    }[],
    "razas": {
        "label": "Jersey",
        "value": "JERSEY"
    }[]
}
```

### INDIVIDUAL

```json
{
    "tipoMovimiento": "EGRESO",
    "Motivos": {
      "label": "Egreso Muerte",
      "value": "EGRESO_MUERTE";
    }[],
    "tipoSeguimiento": "INDIVIDUAL",
    "EstadoSanitarios": {
        "label": "Problema Podal",
        "value": "PROBLEMA_PODAL"
    }[],
    "animales": {
      "idAnimal": "uuid-animal",
      "nombre": "Lola",
      "codigo": "A-H320",
      "razas": {
        "label": "Jersey",
        "value": "JERSEY"
      }
    }[]
}
```

Responde `200`. Errores: `400`, `401`, `403` y `404`.
