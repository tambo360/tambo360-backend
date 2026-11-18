/**
 * @swagger
 * tags:
 *   - name: Mermas
 *     description: Gestión de mermas asociadas a lotes de producción
 */

/**
 * @swagger
 * /mermas/tipos:
 *   get:
 *     summary: Obtener tipos de merma disponibles
 *     tags: [Mermas]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de merma con valor y etiqueta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Tipos de merma obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       value:
 *                         $ref: '#/components/schemas/TipoMerma'
 *                       label:
 *                         type: string
 *                   example:
 *                     - value: "MASTITIS"
 *                       label: "Mastitis"
 *                     - value: "ESTRES_CALORICO"
 *                       label: "Estrés calórico"
 *                     - value: "OTRO"
 *                       label: "Otro"
 *       401:
 *         description: Usuario no autenticado
 */

/**
 * @swagger
 * /mermas:
 *   post:
 *     summary: Crear una nueva merma
 *     tags: [Mermas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: header
 *         name: x-establecimiento-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del establecimiento sobre el que se registra la merma.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_lote
 *               - tipoMerma
 *               - cantidad
 *             properties:
 *               id_lote:
 *                 type: string
 *                 format: uuid
 *                 description: ID del lote al que pertenece la merma. Nombre de campo en snake_case (a diferencia del resto).
 *                 example: "d3e1c8e4-12a3-4bcd-9e0d-123456789abc"
 *               tipoMerma:
 *                 $ref: '#/components/schemas/TipoMerma'
 *               observaciones:
 *                 type: string
 *                 example: "Pérdida durante el transporte"
 *               cantidad:
 *                 type: number
 *                 example: 20
 *     responses:
 *       201:
 *         description: Merma creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Merma registrada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     idMerma:
 *                       type: string
 *                       format: uuid
 *                     tipo:
 *                       $ref: '#/components/schemas/TipoMerma'
 *                     cantidad:
 *                       type: number
 *                     observacion:
 *                       type: string
 *                       nullable: true
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                     idLote:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Datos inválidos, o no se pudo determinar el establecimiento
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: El lote no pertenece al establecimiento
 *       409:
 *         description: La merma supera la producción del lote
 */

/**
 * @swagger
 * /mermas:
 *   get:
 *     summary: Listar mermas del establecimiento
 *     description: Devuelve las mermas del establecimiento, ordenadas por fecha de creación descendente. Puede filtrarse por lote.
 *     tags: [Mermas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: header
 *         name: x-establecimiento-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del establecimiento sobre el que se consulta.
 *       - in: query
 *         name: id_lote
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtra las mermas de un lote específico.
 *     responses:
 *       200:
 *         description: Lista de mermas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idMerma:
 *                         type: string
 *                         format: uuid
 *                       tipo:
 *                         $ref: '#/components/schemas/TipoMerma'
 *                       observacion:
 *                         type: string
 *                         nullable: true
 *                       cantidad:
 *                         type: number
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                       idLote:
 *                         type: string
 *                         format: uuid
 *                       lote:
 *                         type: object
 *                         properties:
 *                           idLote:
 *                             type: string
 *                             format: uuid
 *                           numeroLote:
 *                             type: integer
 *                           fechaProduccion:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: No se pudo determinar el establecimiento
 *       401:
 *         description: Usuario no autenticado
 */

/**
 * @swagger
 * /mermas/{id}:
 *   get:
 *     summary: Obtener una merma por ID
 *     tags: [Mermas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: header
 *         name: x-establecimiento-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del establecimiento sobre el que se consulta.
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la merma
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Merma encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     idMerma:
 *                       type: string
 *                       format: uuid
 *                     tipo:
 *                       $ref: '#/components/schemas/TipoMerma'
 *                     observacion:
 *                       type: string
 *                       nullable: true
 *                     cantidad:
 *                       type: number
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                     idLote:
 *                       type: string
 *                       format: uuid
 *                     lote:
 *                       type: object
 *                       properties:
 *                         idLote:
 *                           type: string
 *                           format: uuid
 *                         numeroLote:
 *                           type: integer
 *                         fechaProduccion:
 *                           type: string
 *                           format: date-time
 *                         idEstablecimiento:
 *                           type: string
 *                           format: uuid
 *       400:
 *         description: No se pudo determinar el establecimiento
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: Merma no encontrada (no existe, o no pertenece al establecimiento)
 */

/**
 * @swagger
 * /mermas/{id}:
 *   put:
 *     summary: Actualizar una merma
 *     description: >
 *       Actualiza los datos de una merma existente. El lote asociado (id_lote)
 *       no puede modificarse. Solo se permite editar mermas cuyo lote siga en
 *       estado editable (INCOMPLETO).
 *     tags: [Mermas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: header
 *         name: x-establecimiento-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del establecimiento sobre el que se consulta.
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la merma
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipoMerma:
 *                 $ref: '#/components/schemas/TipoMerma'
 *               observaciones:
 *                 type: string
 *                 example: "Corregido tras revisión"
 *               cantidad:
 *                 type: number
 *                 example: 15
 *     responses:
 *       200:
 *         description: Merma actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Merma actualizada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     idMerma:
 *                       type: string
 *                       format: uuid
 *                     tipo:
 *                       $ref: '#/components/schemas/TipoMerma'
 *                     cantidad:
 *                       type: number
 *                     observacion:
 *                       type: string
 *                       nullable: true
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                     idLote:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Datos inválidos, o no se pudo determinar el establecimiento
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: Merma no encontrada
 *       409:
 *         description: La merma supera la producción del lote
 */

/**
 * @swagger
 * /mermas/{id}:
 *   delete:
 *     summary: Eliminar una merma
 *     description: >
 *       Elimina una merma existente. Solo es posible si el lote asociado
 *       sigue en estado editable (INCOMPLETO).
 *     tags: [Mermas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: header
 *         name: x-establecimiento-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del establecimiento sobre el que se consulta.
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la merma
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Merma eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Merma eliminada correctamente"
 *                 data:
 *                   type: null
 *       400:
 *         description: No se pudo determinar el establecimiento
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: Merma no encontrada
 */