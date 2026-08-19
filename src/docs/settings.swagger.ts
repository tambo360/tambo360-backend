/**
 * @swagger
 * tags:
 *   - name: Configuración
 *     description: Operaciones de configuración y administración de movimientos de animales (altas, bajas y transferencias)
 */

/**
 * @swagger
 * /conf/animal:
 *   post:
 *     summary: Dar de alta animales en el establecimiento
 *     description: Registra la incorporación de animales. Soporta dos modos según tipoSeguimiento - RODEO/RODEO_UNICO (incrementa cantidad en rodeo) o INDIVIDUAL (crea registros de animales)
 *     tags: [Configuración]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [tipoSeguimiento, rodeoDestino, tipo, motivo, cantidad]
 *                 properties:
 *                   tipoSeguimiento:
 *                     type: string
 *                     enum: [RODEO, RODEO_UNICO]
 *                     example: "RODEO"
 *                   rodeoDestino:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440010"
 *                   tipo:
 *                     type: string
 *                     enum: [INGRESO]
 *                     example: "INGRESO"
 *                   motivo:
 *                     type: string
 *                     enum: [INGRESO_COMPRA, INGRESO_NACIMIENTO]
 *                     example: "INGRESO_COMPRA"
 *                   cantidad:
 *                     type: integer
 *                     minimum: 1
 *                     example: 5
 *                   observacion:
 *                     type: string
 *                     maxLength: 255
 *                     example: "Compra de vacas de lechería"
 *               - type: object
 *                 required: [tipoSeguimiento, animales, tipo, motivo, cantidad]
 *                 properties:
 *                   tipoSeguimiento:
 *                     type: string
 *                     enum: [INDIVIDUAL]
 *                     example: "INDIVIDUAL"
 *                   motivo:
 *                     type: string
 *                     enum: [INGRESO_COMPRA, INGRESO_NACIMIENTO]
 *                     example: "INGRESO_NACIMIENTO"
 *                   tipo:
 *                     type: string
 *                     enum: [INGRESO]
 *                     example: "INGRESO"
 *                   cantidad:
 *                     type: integer
 *                     minimum: 1
 *                     example: 2
 *                   animales:
 *                     type: array
 *                     minItems: 1
 *                     items:
 *                       type: object
 *                       required: [categoria, estado]
 *                       properties:
 *                         codigo:
 *                           type: string
 *                           example: "A-001"
 *                         nombre:
 *                           type: string
 *                           example: "Vaca Rosa"
 *                         categoria:
 *                           type: string
 *                           enum: [ORDENE, SECAS, PREPARTO]
 *                           example: "ORDENE"
 *                         estado:
 *                           type: string
 *                           enum: [MATITIS, TRATAMIENTO, PREPARTO, DESCARTE]
 *                           example: "PREPARTO"
 *                         fechaNacimiento:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T00:00:00.000Z"
 *                   observacion:
 *                     type: string
 *                     maxLength: 255
 *                     example: "Nacimientos en el rodeo"
 *     responses:
 *       200:
 *         description: Alta de animales realizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Alta de animales realizada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     idMovimiento:
 *                       type: string
 *                       format: uuid
 *                     idConfiguracion:
 *                       type: string
 *                       format: uuid
 *                     tipo:
 *                       type: string
 *                       example: "INGRESO"
 *                     motivo:
 *                       type: string
 *                       example: "INGRESO_COMPRA"
 *                     cantidad:
 *                       type: integer
 *                       example: 5
 *                     usuarioId:
 *                       type: string
 *                       format: uuid
 *                     observacion:
 *                       type: string
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                     rodeoDestino:
 *                       type: string
 *                       format: uuid
 *                     animales:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Datos de ingreso inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Establecimiento no autorizado
 *       404:
 *         description: Configuración no encontrada
 */

/**
 * @swagger
 * /conf/animal/listar:
 *   get:
 *     summary: Listar animales activos del establecimiento
 *     description: Devuelve animales activos del establecimiento autenticado, con filtros opcionales, paginación y producción registrada durante el día actual.
 *     tags: [Configuración]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: codigo
 *         schema:
 *           type: string
 *         description: Filtra por coincidencia parcial del código, sin distinguir mayúsculas y minúsculas.
 *         example: "A-00"
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtra por coincidencia parcial del nombre, sin distinguir mayúsculas y minúsculas.
 *         example: "Rosa"
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [MASTITIS, TRATAMIENTO, NORMAL]
 *         description: Estado sanitario del animal.
 *       - in: query
 *         name: orden
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Orden alfabético por nombre.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad máxima de animales por página.
 *     responses:
 *       200:
 *         description: Animales obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Animales obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idAnimal:
 *                         type: string
 *                         format: uuid
 *                       idRodeo:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       nombre:
 *                         type: string
 *                         nullable: true
 *                       codigo:
 *                         type: string
 *                         nullable: true
 *                       categoria:
 *                         type: string
 *                       estado:
 *                         type: string
 *                       genero:
 *                         type: string
 *                         nullable: true
 *                       observacion:
 *                         type: string
 *                         nullable: true
 *                       fechaNacimiento:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       DEL:
 *                         type: integer
 *                         description: Días transcurridos desde el último parto. 0 si no existe fecha de último parto.
 *                       produccion:
 *                         type: object
 *                         properties:
 *                           litros_hoy:
 *                             type: object
 *                             additionalProperties:
 *                               type: string
 *                             description: Litros agrupados por destino para el día actual.
 *                           litros_totales:
 *                             type: string
 *                             description: Total de litros producidos durante el día actual.
 *       400:
 *         description: Filtros inválidos o establecimiento no determinado
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Establecimiento no autorizado
 */

/**
 * @swagger
 * /conf/establecimiento:
 *   patch:
 *     summary: Actualizar información del establecimiento
 *     description: Actualiza el nombre, ubicación y parámetros de ordeñe del establecimiento autenticado.
 *     tags: [Configuración]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idEst, nombre, tipo_ordenie, ordenie_dia, promLitros, ubicacion]
 *             properties:
 *               idEst:
 *                 type: string
 *                 format: uuid
 *                 description: ID del establecimiento a actualizar. Debe corresponder al establecimiento del contexto.
 *               nombre:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Tambo La Esperanza"
 *               tipo_ordenie:
 *                 type: string
 *                 enum: [balde, linea, espina_de_pescado, rotativo, manual, otro]
 *                 example: "linea"
 *               ordenie_dia:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *                 example: 2
 *               promLitros:
 *                 type: number
 *                 exclusiveMinimum: 0
 *                 example: 24.5
 *               ubicacion:
 *                 type: object
 *                 required: [provincia, localidad]
 *                 properties:
 *                   provincia:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 100
 *                     example: "Buenos Aires"
 *                   localidad:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 100
 *                     example: "Chivilcoy"
 *     responses:
 *       200:
 *         description: Información del establecimiento actualizada correctamente
 *       400:
 *         description: Datos inválidos o establecimiento inexistente
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Establecimiento no autorizado
 */

/**
 * @swagger
 * /conf/animal:
 *   delete:
 *     summary: Dar de baja animales del establecimiento
 *     description: Registra la salida de animales. Soporta dos modos - RODEO/RODEO_UNICO (decrementa cantidad) o INDIVIDUAL (marca como inactivos)
 *     tags: [Configuración]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [tipoSeguimiento, rodeoOrigen, tipo, motivo, cantidad]
 *                 properties:
 *                   tipoSeguimiento:
 *                     type: string
 *                     enum: [RODEO, RODEO_UNICO]
 *                     example: "RODEO"
 *                   rodeoOrigen:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440010"
 *                   tipo:
 *                     type: string
 *                     enum: [EGRESO]
 *                     example: "EGRESO"
 *                   motivo:
 *                     type: string
 *                     enum: [EGRESO_VENTA, EGRESO_DESCARTE, EGRESO_MUERTE]
 *                     example: "EGRESO_VENTA"
 *                   cantidad:
 *                     type: integer
 *                     minimum: 1
 *                     example: 2
 *                   observacion:
 *                     type: string
 *                     maxLength: 255
 *                     example: "Venta a feria de ganado"
 *               - type: object
 *                 required: [tipoSeguimiento, animales, tipo, motivo, cantidad]
 *                 properties:
 *                   tipoSeguimiento:
 *                     type: string
 *                     enum: [INDIVIDUAL]
 *                     example: "INDIVIDUAL"
 *                   motivo:
 *                     type: string
 *                     enum: [EGRESO_VENTA, EGRESO_DESCARTE, EGRESO_MUERTE]
 *                     example: "EGRESO_DESCARTE"
 *                   tipo:
 *                     type: string
 *                     enum: [EGRESO]
 *                     example: "EGRESO"
 *                   cantidad:
 *                     type: integer
 *                     minimum: 1
 *                     example: 1
 *                   animales:
 *                     type: array
 *                     minItems: 1
 *                     items:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440401"
 *                   observacion:
 *                     type: string
 *                     maxLength: 255
 *                     example: "Descarte por edad"
 *     responses:
 *       200:
 *         description: Baja de animales realizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Baja de animales realizada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     idMovimiento:
 *                       type: string
 *                       format: uuid
 *                     idConfiguracion:
 *                       type: string
 *                       format: uuid
 *                     tipo:
 *                       type: string
 *                       example: "EGRESO"
 *                     motivo:
 *                       type: string
 *                       example: "EGRESO_VENTA"
 *                     cantidad:
 *                       type: integer
 *                       example: 2
 *                     usuarioId:
 *                       type: string
 *                       format: uuid
 *                     observacion:
 *                       type: string
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                     rodeoOrigen:
 *                       type: string
 *                       format: uuid
 *                     animales:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Datos de egreso inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Establecimiento no autorizado
 *       404:
 *         description: Configuración no encontrada
 */

/**
 * @swagger
 * /conf/rodeo/transferir:
 *   post:
 *     summary: Transferir animales entre rodeos del mismo establecimiento
 *     description: Transfiere animales de un rodeo a otro. Solo disponible para establecimientos con seguimiento RODEO o RODEO_UNICO
 *     tags: [Configuración]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rodeoOrigen, rodeoDestino, motivo, cantidad]
 *             properties:
 *               rodeoOrigen:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440010"
 *               rodeoDestino:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440011"
 *               motivo:
 *                 type: string
 *                 enum: [TRANSFERENCIA_BAJA_PRODUCCION, TRANSFERENCIA_ALTA_PRODUCCION, TRANSFERENCIA_SECADO, TRANSFERENCIA_CAMBIO_ESTADO, TRANSFERENCIA_OTRO]
 *                 example: "TRANSFERENCIA_BAJA_PRODUCCION"
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *               observacion:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Transferencia por baja producción"
 *     responses:
 *       200:
 *         description: Transferencia de animales realizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transferencia de rodeo realizada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     idMovimiento:
 *                       type: string
 *                       format: uuid
 *                     idConfiguracion:
 *                       type: string
 *                       format: uuid
 *                     tipo:
 *                       type: string
 *                       example: "TRANSFERENCIA"
 *                     motivo:
 *                       type: string
 *                       example: "TRANSFERENCIA_BAJA_PRODUCCION"
 *                     rodeoOrigen:
 *                       type: string
 *                       format: uuid
 *                     rodeoDestino:
 *                       type: string
 *                       format: uuid
 *                     cantidad:
 *                       type: integer
 *                       example: 3
 *                     usuarioId:
 *                       type: string
 *                       format: uuid
 *                     observacion:
 *                       type: string
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos de transferencia inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Establecimiento no autorizado
 *       404:
 *         description: Rodeos o configuración no encontrados
 */
