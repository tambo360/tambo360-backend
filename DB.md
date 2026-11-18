# Base de Datos - Tambo360

## Índice

- [Introducción](#introducción)
- [Modelo General](#modelo-general)
- [Usuario](#usuario)
- [Organizacion](#organizacion)
- [OrganizacionUsuario](#organizacionusuario)
- [Establecimiento](#establecimiento)
- [Establecimiento_OrganizacionUsuario](#establecimiento_organizacionusuario)
- [configuracion](#configuracion)
- [InvitacionOrganizacion](#invitacionorganizacion)
- [InvitacionEstablecimiento](#invitacionestablecimiento)
- [Producto](#producto)
- [EstablecimientoProducto](#establecimientoproducto)
- [Rodeo](#rodeo)
- [Animal](#animal)
- [ProduccionAnimal](#produccionanimal)
- [LoteProduccion](#loteproduccion)
- [Merma](#merma)
- [CostosDirecto](#costosdirecto)
- [CostoGeneral](#costogeneral)
- [VerificarToken](#verificartoken)
- [Alerta](#alerta)
- [PromedioCategoria](#promediocategoria)
- [Resumen](#resumen)

## Introducción

La base de datos del proyecto está definida con Prisma ORM y PostgreSQL. Este documento describe el modelo de datos declarado en el schema de Prisma, incluyendo sus entidades principales, relaciones, restricciones y convenciones observables en el modelo.

Convenciones generales observables en el schema:

- Los identificadores de la mayoría de modelos se definen como UUIDs de tipo String mediante `@default(uuid())`.
- Existen campos de tipo `DateTime` con valores por defecto `now()` para registrar fechas de creación o modificación.
- Se utilizan booleanos para representar estados o flags simples, como `activo`, `verificado`, `estado` o `visto`.
- No se observan campos explícitos de borrado lógico (`deletedAt`) ni campos `updatedAt` en el schema.
- Los modelos utilizan enums para limitar valores de determinados campos.

## Modelo General

El modelo de datos organiza la información alrededor de organizaciones, establecimientos, animales, lotes de producción y productos. La estructura central puede resumirse de la siguiente manera:

```text
Usuario
├── OrganizacionUsuario ──> Organizacion
│   └── Establecimiento
│       ├── configuracion
│       ├── Rodeo
│       ├── Animal
│       ├── Producto (vía EstablecimientoProducto)
│       └── LoteProduccion
│           ├── Merma
│           ├── CostosDirecto
│           └── ProduccionAnimal
├── InvitacionOrganizacion
├── InvitacionEstablecimiento
└── VerificarToken
```

Además, existen modelos auxiliares para alertas y métricas acumuladas por categoría:

```text
Alerta
PromedioCategoria
```

---

# Usuario

## Propósito

Representa a un usuario del sistema y su estado de autenticación y verificación.

## Relaciones

- One to Many con `VerificarToken`.
- One to Many con `OrganizacionUsuario`.
- One to Many con `InvitacionOrganizacion`.
- One to Many con `InvitacionEstablecimiento`.

## Campos importantes

- `idUsuario`: clave primaria UUID.
- `correo`: correo único del usuario.
- `contrasena`: credencial almacenada en texto plano en el schema.
- `nombre`: nombre del usuario con longitud máxima de 50 caracteres.
- `verificado`: indicador de verificación.
- `activo`: indicador de estado activo.
- `fechaCreacion`: fecha de creación.

## Restricciones

- `correo` es único.
- `idUsuario` es la clave primaria.
- `activo` y `verificado` tienen valores por defecto.

## Observaciones

- El modelo actúa como entidad base para la asociación con organizaciones, establecimientos e invitaciones.

---

# Organizacion

## Propósito

Representa una organización a la que pueden pertenecer usuarios y establecimientos.

## Relaciones

- One to Many con `OrganizacionUsuario`.
- One to Many con `Establecimiento`.
- One to Many con `InvitacionOrganizacion`.
- One to Many con `Producto`.

## Campos importantes

- `idOrganizacion`: clave primaria UUID.
- `nombre`: nombre de la organización.
- `fechaCreacion`: fecha de creación.

## Restricciones

- `idOrganizacion` es la clave primaria.

## Observaciones

- Es el punto de agregación principal para establecimientos y productos asociados a una organización.

---

# OrganizacionUsuario

## Propósito

Modela la asociación entre un usuario y una organización, incluyendo el rol dentro de la organización.

## Relaciones

- Many to One con `Organizacion`.
- Many to One con `Usuario`.
- One to Many con `Establecimiento_OrganizacionUsuario`.

## Campos importantes

- `idOrganizacionUsuario`: clave primaria UUID.
- `idOrganizacion`: clave foránea hacia `Organizacion`.
- `idUsuario`: clave foránea hacia `Usuario`.
- `rol`: enum `RolOrganizacion`.
- `estado`: flag de estado activo/inactivo.
- `fechaCreacion`: fecha de creación.

## Restricciones

- La combinación `(idOrganizacion, idUsuario)` es única.
- `idOrganizacion` e `idUsuario` son relaciones obligatorias.

## Observaciones

- Es una tabla puente entre usuarios y organizaciones.

---

# Establecimiento

## Propósito

Representa un establecimiento perteneciente a una organización.

## Relaciones

- Many to One con `Organizacion`.
- One to Many con `LoteProduccion`.
- One to Many con `Establecimiento_OrganizacionUsuario`.
- One to Many con `configuracion`.
- One to Many con `InvitacionEstablecimiento`.
- One to Many con `EstablecimientoProducto`.
- One to Many con `CostoGeneral`.
- One to Many con `Animal`.

## Campos importantes

- `idEstablecimiento`: clave primaria UUID.
- `idOrganizacion`: clave foránea hacia `Organizacion`.
- `nombre`: nombre del establecimiento.
- `localidad` y `provincia`: datos opcionales de ubicación.
- `cuestionarioCompletado`: flag de configuración del establecimiento.
- `fechaCreacion`: fecha de creación.

## Restricciones

- `idEstablecimiento` es la clave primaria.
- La relación con `Organizacion` es obligatoria.

## Observaciones

- Es una entidad central del dominio y concentra varias relaciones de negocio y de configuración.

---

# Establecimiento_OrganizacionUsuario

## Propósito

Representa la asociación entre un usuario vinculado a una organización y un establecimiento específico, con un rol particular.

## Relaciones

- Many to One con `Establecimiento`.
- Many to One con `OrganizacionUsuario`.

## Campos importantes

- `idEstablecimientoOrganizacionUsuario`: clave primaria UUID.
- `idEstablecimiento`: clave foránea hacia `Establecimiento`.
- `idOrganizacionUsuario`: clave foránea hacia `OrganizacionUsuario`.
- `rol`: enum `RolEstablecimiento`.
- `estado`: flag de estado activo/inactivo.
- `fechaCreacion`: fecha de creación.

## Restricciones

- La combinación `(idEstablecimiento, idOrganizacionUsuario)` es única.
- Ambas relaciones son obligatorias.

## Observaciones

- Es una tabla puente para permisos o accesos a un establecimiento dentro de una organización.

---

# configuracion

## Propósito

Almacena parámetros de configuración de un establecimiento.

## Relaciones

- One to One con `Establecimiento`.
- One to Many con `Rodeo`.

## Campos importantes

- `idConfiguracion`: clave primaria UUID.
- `idEstablecimiento`: clave foránea única hacia `Establecimiento`.
- `ultimoNumeroLote`: número de lote configurado.
- `cantVacas`, `cantOrdenies`, `promLitros`, `empleados`, `cantEmpleados`: campos de configuración numérica o booleana.
- `tipoOrdenie`: enum `TipoOrdenie`.
- `ventaLeche`: enum `VentaLeche`.
- `tipoSeguimiento`: enum `TipoSeguimiento` con valor por defecto `RODEO`.
- `modificadoEn`: fecha de última modificación.

## Restricciones

- `idEstablecimiento` es único.
- `idConfiguracion` es la clave primaria.
- `tipoSeguimiento` tiene valor por defecto `RODEO`.
- `ultimoNumeroLote` tiene valor por defecto `0`.

## Observaciones

- El nombre del modelo está en minúsculas, pero su rol es claramente de configuración.

---

# InvitacionOrganizacion

## Propósito

Registra invitaciones de usuarios a participar en una organización.

## Relaciones

- Many to One con `Organizacion`.
- Many to One con `Usuario`.

## Campos importantes

- `idInvitacion`: clave primaria UUID.
- `idOrganizacion`: clave foránea hacia `Organizacion`.
- `idInvitador`: clave foránea hacia `Usuario`.
- `correo`: correo del invitado.
- `codigo`: identificador de la invitación.
- `estado`: enum `EstadoInvitacion` con valor por defecto `pendiente`.
- `expiraEn`: fecha de expiración.
- `respondidaEn`: fecha de respuesta, opcional.
- `rol`: enum `RolOrganizacion`.
- `creadoEn`: fecha de creación.

## Restricciones

- `estado` tiene valor por defecto `pendiente`.
- Las relaciones con organización e invitador son obligatorias.

## Observaciones

- El modelo captura el ciclo de una invitación desde su creación hasta su respuesta.

---

# InvitacionEstablecimiento

## Propósito

Registra invitaciones de usuarios a participar en un establecimiento.

## Relaciones

- Many to One con `Establecimiento`.
- Many to One con `Usuario`.

## Campos importantes

- `idInvitacion`: clave primaria UUID.
- `idEstablecimiento`: clave foránea hacia `Establecimiento`.
- `idInvitador`: clave foránea hacia `Usuario`.
- `correo`: correo del invitado.
- `codigo`: identificador de la invitación.
- `estado`: enum `EstadoInvitacion` con valor por defecto `pendiente`.
- `expiraEn`: fecha de expiración.
- `respondidaEn`: fecha de respuesta, opcional.
- `rol`: enum `RolEstablecimiento`.
- `creadoEn`: fecha de creación.

## Restricciones

- `estado` tiene valor por defecto `pendiente`.
- Las relaciones con establecimiento e invitador son obligatorias.

## Observaciones

- Es análoga a la invitación a organización, pero aplicada a un establecimiento específico.

---

# Producto

## Propósito

Representa un producto del dominio, tanto de sistema como de organización específica.

## Relaciones

- Optional Many to One con `Organizacion`.
- One to Many con `EstablecimientoProducto`.
- One to Many con `LoteProduccion`.

## Campos importantes

- `idProducto`: clave primaria UUID.
- `nombre`: nombre del producto.
- `nombreNormalizado`: nombre normalizado para búsquedas o unicidad.
- `esSistema`: indicador de si el producto es de sistema.
- `idOrganizacion`: clave foránea opcional hacia `Organizacion`.
- `categoria`: enum `Categoria`.

## Restricciones

- La combinación `(nombreNormalizado, idOrganizacion)` es única.
- `idOrganizacion` es opcional.
- `categoria` es un enum.

## Observaciones

- El modelo soporta productos globales y productos específicos de organización.

---

# EstablecimientoProducto

## Propósito

Representa la asociación entre un establecimiento y un producto.

## Relaciones

- Many to One con `Establecimiento`.
- Many to One con `Producto`.

## Campos importantes

- `id`: clave primaria UUID.
- `idEstablecimiento`: clave foránea hacia `Establecimiento`.
- `idProducto`: clave foránea hacia `Producto`.

## Restricciones

- La combinación `(idEstablecimiento, idProducto)` es única.
- Ambas relaciones son obligatorias.

## Observaciones

- Es una tabla puente entre establecimientos y productos.

---

# Rodeo

## Propósito

Representa un rodeo asociado a una configuración de establecimiento.

## Relaciones

- Many to One con `configuracion`.
- One to Many con `LoteProduccion`.
- One to Many con `Animal`.

## Campos importantes

- `idRodeo`: clave primaria UUID.
- `idConfiguracion`: clave foránea hacia `configuracion`.
- `tipoRodeo`: enum `TipoRodeo`.
- `cantVacas`: cantidad de vacas.
- `costoRacion`: valor decimal de costo de ración.

## Restricciones

- La combinación `(idConfiguracion, tipoRodeo)` es única.
- `idConfiguracion` es una relación obligatoria.

## Observaciones

- Es una entidad de agrupación de animales y lotes dentro de una configuración.

---

# Animal

## Propósito

Representa un animal dentro de un establecimiento y, cuando corresponde, dentro de un rodeo.

## Relaciones

- Many to One con `Establecimiento`.
- Optional Many to One con `Rodeo`.
- One to Many con `ProduccionAnimal`.

## Campos importantes

- `idAnimal`: clave primaria UUID.
- `idEstablecimiento`: clave foránea hacia `Establecimiento`.
- `idRodeo`: clave foránea opcional hacia `Rodeo`.
- `codigo` y `nombre`: identificadores opcionales del animal.
- `categoria`: enum `CategoriaAnimal`.
- `estado`: enum `EstadoAnimal`.
- `activo`: flag de estado activo.
- `fechaNacimiento`: fecha de nacimiento opcional.

## Restricciones

- `categoria` y `estado` son enums.
- `idEstablecimiento` es una relación obligatoria.
- `idRodeo` es opcional.

## Observaciones

- El modelo permite registrar animales con categorías y estados definidos por enums.

---

# ProduccionAnimal

## Propósito

Registra la producción asociada a un animal dentro de un lote.

## Relaciones

- Many to One con `Animal`.
- Many to One con `LoteProduccion`.

## Campos importantes

- `idProduccionAnimal`: clave primaria UUID.
- `idAnimal`: clave foránea hacia `Animal`.
- `idLote`: clave foránea hacia `LoteProduccion`.
- `estado`: enum `EstadoAnimal`.
- `litros`: valor decimal.

## Restricciones

- `idAnimal` e `idLote` son relaciones obligatorias.
- `estado` es un enum.

## Observaciones

- Actúa como tabla de detalle de producción a nivel individual por animal y lote.

---

# LoteProduccion

## Propósito

Representa un lote de producción vinculado a un establecimiento, producto y, opcionalmente, un rodeo.

## Relaciones

- Many to One con `Rodeo`.
- Many to One con `Producto`.
- Many to One con `Establecimiento`.
- One to Many con `Merma`.
- One to Many con `CostosDirecto`.
- One to Many con `ProduccionAnimal`.

## Campos importantes

- `idLote`: clave primaria, sin default explícito en el schema.
- `numeroLote`: número del lote dentro del establecimiento.
- `fechaProduccion`: fecha de producción.
- `cantidad`: valor decimal de cantidad producida.
- `unidad`: enum `Unidad`.
- `estado`: booleano que representa un estado del lote.
- `tempTanque`: valor decimal de temperatura de tanque.
- `destino`: enum `TipoDestino`.
- `cantAnimales`: cantidad de animales asociados.
- `idRodeo`: clave foránea opcional hacia `Rodeo`.
- `idProducto`: clave foránea hacia `Producto`.
- `idEstablecimiento`: clave foránea hacia `Establecimiento`.

## Restricciones

- La combinación `(idEstablecimiento, numeroLote)` es única.
- `idProducto` e `idEstablecimiento` son relaciones obligatorias.
- `idRodeo` es opcional.
- `unidad` y `destino` son enums.

## Observaciones

- Es una entidad central para el seguimiento de producción y costos asociados.

---

# Merma

## Propósito

Registra las mermas asociadas a un lote.

## Relaciones

- Many to One con `LoteProduccion`.

## Campos importantes

- `idMerma`: clave primaria UUID.
- `tipo`: enum `TipoMerma`.
- `observacion`: texto opcional.
- `cantidad`: valor decimal.
- `fechaCreacion`: fecha de creación.
- `idLote`: clave foránea hacia `LoteProduccion`.

## Restricciones

- `tipo` es un enum.
- `idLote` es una relación obligatoria.

## Observaciones

- El modelo captura desechos o pérdidas vinculadas a un lote específico.

---

# CostosDirecto

## Propósito

Registra costos directos asociados a un lote.

## Relaciones

- Many to One con `LoteProduccion`.

## Campos importantes

- `idCostoDirecto`: clave primaria UUID.
- `tipoCosto`: enum `TipoCosto`.
- `moneda`: enum `Moneda` con valor por defecto `ARS`.
- `monto`: valor decimal.
- `observaciones`: texto opcional con valor por defecto vacío.
- `fechaCreacion`: fecha de creación.
- `idLote`: clave foránea hacia `LoteProduccion`.

## Restricciones

- `idLote` es una relación obligatoria.
- `tipoCosto` y `moneda` son enums.
- Existe un índice sobre `idLote`.

## Observaciones

- El modelo está orientado a costos asociados a un lote de producción.

---

# CostoGeneral

## Propósito

Registra costos generales asociados a un establecimiento.

## Relaciones

- Many to One con `Establecimiento`.

## Campos importantes

- `idCostoGeneral`: clave primaria UUID.
- `idEstablecimiento`: clave foránea hacia `Establecimiento`.
- `tipoCosto`: enum `TipoCostoGeneral`.
- `descripcion`: texto opcional.
- `monto`: valor decimal.
- `fecha`: fecha del costo.
- `creadoEn`: fecha de creación.

## Restricciones

- `idEstablecimiento` es una relación obligatoria.
- `tipoCosto` es un enum.

## Observaciones

- Se diferencia de los costos directos porque está vinculado al establecimiento y no a un lote específico.

---

# VerificarToken

## Propósito

Guarda tokens relacionados con procesos de verificación o recuperación para un usuario.

## Relaciones

- Many to One con `Usuario`.

## Campos importantes

- `tokenid`: clave primaria UUID.
- `idUsuario`: clave foránea hacia `Usuario`.
- `tipo`: enum `TipoToken`.
- `tokenHash`: hash del token.
- `expiraEn`: fecha de expiración.
- `usadoEn`: fecha de uso, opcional.
- `creadoEn`: fecha de creación.

## Restricciones

- `idUsuario` es una relación obligatoria.
- Existe un índice compuesto sobre `(idUsuario, tipo)`.

## Observaciones

- El modelo está enfocado al manejo de tokens de seguridad y recuperación.

---

# Alerta

## Propósito

Registra alertas asociadas a un establecimiento, lote y producto.

## Relaciones

- No se declaran relaciones explícitas con otros modelos en el schema; se almacenan identificadores.

## Campos importantes

- `id`: clave primaria UUID.
- `idEstablecimiento`: identificador de establecimiento.
- `idLote`: identificador de lote.
- `producto`: nombre o identificador de producto.
- `categoria`: enum `Categoria`.
- `nivel`: enum `NivelAlerta`.
- `descripcion`: texto largo.
- `creadoEn`: fecha de creación.
- `visto`: flag de estado.

## Restricciones

- `nivel` y `categoria` son enums.
- Existe un índice sobre `(idEstablecimiento, creadoEn)`.

## Observaciones

- El schema no define una relación directa con `Establecimiento` o `LoteProduccion`; solo se guardan referencias externas.

---

# PromedioCategoria

## Propósito

Almacena métricas acumuladas por establecimiento y categoría.

## Relaciones

- No se declaran relaciones explícitas con otros modelos en el schema.

## Campos importantes

- `id`: clave primaria UUID.
- `idEstablecimiento`: identificador de establecimiento.
- `categoria`: enum `Categoria`.
- `produccionAcumulada`, `mermaAcumulada`, `pctMermaPromedio`: métricas numéricas.
- `cantidadLotes`: cantidad de lotes considerados.

## Restricciones

- La combinación `(idEstablecimiento, categoria)` es única.

## Observaciones

- El modelo parece orientado a almacenar agregados o resúmenes por categoría.

---

# Resumen

- Cantidad total de modelos: 20
- Cantidad de enums: 18
- Tablas principales: `Usuario`, `Organizacion`, `Establecimiento`, `Producto`, `Rodeo`, `Animal`, `LoteProduccion`
- Tablas puente: `OrganizacionUsuario`, `Establecimiento_OrganizacionUsuario`, `EstablecimientoProducto`, `ProduccionAnimal`
- Tablas de configuración: `configuracion`, `CostoGeneral`
- Tablas históricas: no se observan tablas históricas explícitas en el schema
