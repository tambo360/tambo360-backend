/**
 * @swagger
 * tags:
 *   - name: Configuración
 *     description: Operaciones administrativas sobre el establecimiento y los movimientos de animales
 */

/**
 * @swagger
 * /conf/establecimiento:
 *   patch:
 *     summary: Actualizar el establecimiento
 *     tags: [Configuración]
 *     security: [{ bearerAuth: [] }]
 *     description: Actualiza nombre, ubicación y parámetros de ordeñe. El usuario y establecimiento se obtienen del contexto autenticado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idEst, nombre, tipo_ordenie, ordenie_dia, promLitros, ubicacion]
 *             properties:
 *               idEst: { type: string, format: uuid }
 *               nombre: { type: string, maxLength: 50, example: Tambo La Esperanza }
 *               tipo_ordenie: { type: string, enum: [balde, linea, espina_de_pescado, rotativo, manual, otro] }
 *               ordenie_dia: { type: integer, minimum: 1, maximum: 3, example: 2 }
 *               promLitros: { type: number, exclusiveMinimum: 0, example: 24.5 }
 *               ubicacion:
 *                 type: object
 *                 required: [provincia, localidad]
 *                 properties:
 *                   provincia: { type: string, minLength: 2, maxLength: 100 }
 *                   localidad: { type: string, minLength: 2, maxLength: 100 }
 *     responses:
 *       200: { description: Información del establecimiento actualizada correctamente }
 *       400: { description: Datos inválidos o establecimiento no encontrado }
 *       401: { description: Usuario no autenticado }
 *       403: { description: Establecimiento no autorizado }
 */

/**
 * @swagger
 * /conf/animal:
 *   post:
 *     summary: Registrar ingreso de animales
 *     tags: [Configuración]
 *     security: [{ bearerAuth: [] }]
 *     description: En RODEO/RODEO_UNICO incrementa el rodeo y sus razas. En INDIVIDUAL crea animales nuevos. El tipo de seguimiento debe coincidir con la configuración del establecimiento.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [tipoSeguimiento, tipo, motivo, destino, razas]
 *                 properties:
 *                   tipoSeguimiento: { type: string, enum: [RODEO, RODEO_UNICO] }
 *                   tipo: { type: string, enum: [INGRESO] }
 *                   motivo: { type: string, enum: [INGRESO_COMPRA, INGRESO_NACIMIENTO] }
 *                   destino: { type: string, format: uuid, description: ID del rodeo destino }
 *                   observacion: { type: string, maxLength: 255 }
 *                   razas:
 *                     type: array
 *                     minItems: 1
 *                     items:
 *                       type: object
 *                       required: [raza, cantVacas]
 *                       properties:
 *                         raza: { type: string, enum: [HOLANDO_ARGENTINO, JERSEY, PARDO_SUIZO, GIR_LECHERO, HOLANDO_JERSEY_CRUZA, AYRSHIRE, NORMANDO, BROWN_SWISS, MONTBELIARDE, SIMMENTAL_LECHERO, OTRAS] }
 *                         cantVacas: { type: integer, minimum: 1 }
 *               - type: object
 *                 required: [tipoSeguimiento, tipo, motivo, animales]
 *                 properties:
 *                   tipoSeguimiento: { type: string, enum: [INDIVIDUAL] }
 *                   tipo: { type: string, enum: [INGRESO] }
 *                   motivo: { type: string, enum: [INGRESO_COMPRA, INGRESO_NACIMIENTO] }
 *                   observacion: { type: string, maxLength: 255 }
 *                   animales:
 *                     type: array
 *                     minItems: 1
 *                     items:
 *                       $ref: '#/components/schemas/AnimalAlta'
 *     responses:
 *       200: { description: Alta de animales realizada correctamente }
 *       400: { description: Body inválido, seguimiento incompatible o límite individual excedido }
 *       401: { description: Usuario no autenticado }
 *       403: { description: Establecimiento no autorizado }
 *       404: { description: Configuración o rodeo no encontrado }
 */

/**
 * @swagger
 * /conf/animal:
 *   delete:
 *     summary: Registrar egreso de animales
 *     tags: [Configuración]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [tipoSeguimiento, tipo, motivo, cantidad, origen]
 *                 properties:
 *                   tipoSeguimiento: { type: string, enum: [RODEO, RODEO_UNICO] }
 *                   tipo: { type: string, enum: [EGRESO] }
 *                   motivo: { type: string, enum: [EGRESO_VENTA, EGRESO_DESCARTE, EGRESO_MUERTE] }
 *                   cantidad: { type: integer, minimum: 1 }
 *                   origen: { type: string, format: uuid, description: ID del rodeo origen }
 *                   observacion: { type: string, maxLength: 255 }
 *               - type: object
 *                 required: [tipoSeguimiento, tipo, motivo, cantidad, animales]
 *                 properties:
 *                   tipoSeguimiento: { type: string, enum: [INDIVIDUAL] }
 *                   tipo: { type: string, enum: [EGRESO] }
 *                   motivo: { type: string, enum: [EGRESO_VENTA, EGRESO_DESCARTE, EGRESO_MUERTE] }
 *                   cantidad: { type: integer, minimum: 1 }
 *                   animales:
 *                     type: array
 *                     minItems: 1
 *                     items: { type: string, format: uuid }
 *                   observacion: { type: string, maxLength: 255 }
 *     responses:
 *       200: { description: Baja de animales realizada correctamente }
 *       400: { description: Body inválido o cantidad superior a la disponible }
 *       401: { description: Usuario no autenticado }
 *       403: { description: Establecimiento no autorizado }
 *       404: { description: Configuración, rodeo o animal no encontrado }
 */

/**
 * @swagger
 * /conf/animal/listar:
 *   get:
 *     summary: Listar animales activos
 *     tags: [Configuración]
 *     security: [{ bearerAuth: [] }]
 *     description: Disponible únicamente cuando el establecimiento usa seguimiento INDIVIDUAL. Incluye filtros, paginación, DEL y producción del día.
 *     parameters:
 *       - { in: query, name: codigo, schema: { type: string } }
 *       - { in: query, name: nombre, schema: { type: string } }
 *       - { in: query, name: estado, schema: { type: string, enum: [MASTITIS, TRATAMIENTO, PREPARTO, SANO] } }
 *       - { in: query, name: orden, schema: { type: string, enum: [asc, desc], default: asc } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100, default: 10 } }
 *     responses:
 *       200: { description: Animales obtenidos correctamente }
 *       400: { description: Filtros inválidos, seguimiento no individual o establecimiento no determinado }
 *       401: { description: Usuario no autenticado }
 *       403: { description: Establecimiento no autorizado }
 */

/**
 * @swagger
 * /conf/movimiento:
 *   get:
 *     summary: Obtener movimientos de animales
 *     tags: [Configuración]
 *     security: [{ bearerAuth: [] }]
 *     description: Devuelve los movimientos de la configuración actual, con usuario y detalle de animales. No recibe parámetros.
 *     responses:
 *       200: { description: Movimientos obtenidos; el controlador conserva actualmente el mensaje Animal actualizado correctamente }
 *       400: { description: Establecimiento no determinado }
 *       401: { description: Usuario no autenticado }
 *       403: { description: Establecimiento no autorizado }
 *       404: { description: Establecimiento no encontrado }
 */

/**
 * @swagger
 * /conf/animal:
 *   patch:
 *     summary: Actualizar datos de un animal
 *     tags: [Configuración]
 *     security: [{ bearerAuth: [] }]
 *     description: Disponible únicamente con seguimiento INDIVIDUAL. El controlador recibe todos los datos mediante query parameters.
 *     parameters:
 *       - { in: query, name: id, required: true, schema: { type: string, format: uuid } }
 *       - { in: query, name: codigo, schema: { type: string }, description: Debe enviarse codigo o nombre }
 *       - { in: query, name: nombre, schema: { type: string }, description: Debe enviarse codigo o nombre }
 *       - { in: query, name: observacion, schema: { type: string } }
 *       - { in: query, name: fechaNacimiento, schema: { type: string, format: date-time } }
 *       - { in: query, name: fechaParto, schema: { type: string, format: date-time } }
 *     responses:
 *       200: { description: Animal actualizado correctamente }
 *       400: { description: Parámetros inválidos, seguimiento no individual o animal inexistente }
 *       401: { description: Usuario no autenticado }
 *       403: { description: Establecimiento no autorizado }
 */

/**
 * @swagger
 * /conf/animal/transferir:
 *   post:
 *     summary: Transferir animales
 *     tags: [Configuración]
 *     security: [{ bearerAuth: [] }]
 *     description: Para RODEO/RODEO_UNICO mueve una raza y cantidad entre rodeos. Para INDIVIDUAL cambia la categoría del animal y su estado según la causa.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [tipo, motivo, causa, tipoSeguimiento, origen, destino, animal]
 *                 properties:
 *                   tipo: { type: string, enum: [TRANSFERENCIA] }
 *                   motivo: { type: string, enum: [TRANSFERENCIA_SANITARIA, TRANSFERENCIA_CICLO_PRODUCTIVO, TRANSFERENCIA_RECUPERACION] }
 *                   causa: { type: string, enum: [MASTITIS, PROBLEMA_PODAL, PROBLEMA_UTERINO, ENFERMEDAD_GENERAL, SECADA_PROGRAMADA, PARTO, ABORTO, ALTA_MEDICA] }
 *                   retorno: { type: string, format: date-time, nullable: true }
 *                   observacion: { type: string, maxLength: 255 }
 *                   tipoSeguimiento: { type: string, enum: [RODEO, RODEO_UNICO] }
 *                   origen: { type: string, format: uuid }
 *                   destino: { type: string, format: uuid }
 *                   animal:
 *                     type: object
 *                     required: [raza, cantVacas]
 *                     properties:
 *                       raza: { type: string, format: uuid }
 *                       cantVacas: { type: integer, minimum: 1 }
 *               - type: object
 *                 required: [tipo, motivo, causa, tipoSeguimiento, origen, destino, animal]
 *                 properties:
 *                   tipo: { type: string, enum: [TRANSFERENCIA] }
 *                   motivo: { type: string, enum: [TRANSFERENCIA_SANITARIA, TRANSFERENCIA_CICLO_PRODUCTIVO, TRANSFERENCIA_RECUPERACION] }
 *                   causa: { type: string, enum: [MASTITIS, PROBLEMA_PODAL, PROBLEMA_UTERINO, ENFERMEDAD_GENERAL, SECADA_PROGRAMADA, PARTO, ABORTO, ALTA_MEDICA] }
 *                   retorno: { type: string, format: date-time, nullable: true }
 *                   observacion: { type: string, maxLength: 255 }
 *                   tipoSeguimiento: { type: string, enum: [INDIVIDUAL] }
 *                   origen: { type: string, enum: [ORDENE, SECAS] }
 *                   destino: { type: string, enum: [ORDENE, SECAS] }
 *                   animal: { type: string, format: uuid }
 *     responses:
 *       200: { description: Transferencia de animal realizada correctamente }
 *       400: { description: Body inválido, causa incompatible, origen/destino iguales o seguimiento incompatible }
 *       401: { description: Usuario no autenticado }
 *       403: { description: Establecimiento no autorizado }
 *       404: { description: Configuración, rodeo, raza o animal no encontrado }
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AnimalAlta:
 *       type: object
 *       required: [categoria, estado, raza]
 *       properties:
 *         codigo: { type: string, nullable: true }
 *         nombre: { type: string, nullable: true }
 *         categoria: { type: string, enum: [ORDENE, SECAS] }
 *         estado: { type: string, enum: [MASTITIS, TRATAMIENTO, PREPARTO, SANO] }
 *         fechaNacimiento: { type: string, format: date-time, nullable: true }
 *         observacion: { type: string, nullable: true }
 *         fechaParto: { type: string, format: date-time, nullable: true }
 *         raza: { type: string, enum: [HOLANDO_ARGENTINO, JERSEY, PARDO_SUIZO, GIR_LECHERO, HOLANDO_JERSEY_CRUZA, AYRSHIRE, NORMANDO, BROWN_SWISS, MONTBELIARDE, SIMMENTAL_LECHERO, OTRAS] }
 */
