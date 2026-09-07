/**
 * @swagger
 * tags:
 *   - name: Establecimientos
 *     description: Operaciones sobre los establecimientos de un usuario
 */

/**
 * @swagger
 * /establecimiento/registrar:
 *   post:
 *     summary: Crear un nuevo establecimiento
 *     description: Permite registrar un establecimiento para un usuario autenticado. Cada usuario solo puede tener un establecimiento.
 *     tags: [Establecimientos]
 *     security:
 *       - bearerAuth: []   # Si usas JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - localidad
 *               - provincia
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del establecimiento
 *                 example: Establecimiento Norte
 *               localidad:
 *                 type: string
 *                 description: Localidad del establecimiento
 *                 example: Rafaela
 *               provincia:
 *                 type: string
 *                 description: Provincia del establecimiento
 *                 example: Santa Fe
 *     responses:
 *       201:
 *         description: Establecimiento creado correctamente
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
 *                   example: Establecimiento creado correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     idEstablecimiento:
 *                       type: string
 *                       format: uuid
 *                       example: "c2b8e8a2-4f92-4f3f-b0c5-1a2b3c4d5e6f"
 *                     nombre:
 *                       type: string
 *                       example: Establecimiento Norte
 *                     localidad:
 *                       type: string
 *                       example: Rafaela
 *                     provincia:
 *                       type: string
 *                       example: Santa Fe
 *                     idUsuario:
 *                       type: string
 *                       format: uuid
 *                       example: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
 *                     cuestionarioCompletado:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Datos inválidos o usuario ya tiene establecimiento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Todos los campos son obligatorios o el usuario ya tiene un establecimiento"
 *                 data:
 *                   type: null
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Usuario no autenticado"
 *                 data:
 *                   type: null
 */

/**
 * @swagger
 * /establecimiento/cuestionario:
 *   post:
 *     summary: Registrar cuestionario del establecimiento
 *     description: Registra la configuración del establecimiento y, según el tipo de seguimiento, sincroniza rodeos o animales. El establecimiento se toma del contexto y no se envía en el body.
 *     tags: [Establecimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - TipoSeguimiento
 *               - cantVacas
 *               - cantOrdenie
 *               - tipoOrdenie
 *               - promLitros
 *               - ventaLeche
 *               - empleados
 *               - ubicacion
 *             properties:
 *               TipoSeguimiento:
 *                 type: string
 *                 enum: [RODEO, RODEO_UNICO, INDIVIDUAL]
 *                 example: RODEO
 *               cantVacas:
 *                 type: integer
 *                 example: 150
 *               cantOrdenie:
 *                 type: integer
 *                 example: 2
 *               tipoOrdenie:
 *                 type: string
 *                 enum: [balde, linea, espina_de_pescado, rotativo, manual, otro]
 *                 example: linea
 *               promLitros:
 *                 type: number
 *                 example: 25.5
 *               ventaLeche:
 *                 type: string
 *                 enum: [usina, fabrica_propia, cooperativa, varios]
 *                 example: usina
 *               empleados:
 *                 type: boolean
 *                 example: true
 *               cantEmpleados:
 *                 type: integer
 *                 example: 3
 *               productos:
 *                 type: array
 *                 description: Productos asociados al establecimiento. Puede incluir productos existentes o nuevos.
 *                 items:
 *                   oneOf:
 *                     - type: object
 *                       required: [tipo, idProducto, nombre]
 *                       properties:
 *                         tipo:
 *                           type: string
 *                           enum: [existente]
 *                           example: existente
 *                         idProducto:
 *                           type: string
 *                           format: uuid
 *                           example: "550e8400-e29b-41d4-a716-446655440300"
 *                         nombre:
 *                           type: string
 *                           example: Leche Fresca
 *                     - type: object
 *                       required: [tipo, nombre, categoria]
 *                       properties:
 *                         tipo:
 *                           type: string
 *                           enum: [nuevo]
 *                           example: nuevo
 *                         nombre:
 *                           type: string
 *                           example: Yogur Natural
 *                         categoria:
 *                           type: string
 *                           enum: [leches, yogures, quesos, carnes, otros]
 *                           example: yogures
 *               rodeos:
 *                 type: array
 *                 description: Requerido para RODEO y RODEO_UNICO. RODEO exige al menos un rodeo de cada tipo ALTA_PRODUCCION, BAJA_PRODUCCION y VACAS_SECAS; RODEO_UNICO exige al menos un rodeo UNICO_ORDENIE y uno UNICO_SECA.
 *                 items:
 *                   type: object
 *                   required: [tipoRodeo, cantVacas, costoRacion]
 *                   properties:
 *                     tipoRodeo:
 *                       type: string
 *                       enum: [ALTA_PRODUCCION, BAJA_PRODUCCION, VACAS_SECAS, UNICO_ORDENIE, UNICO_SECA]
 *                       example: ALTA_PRODUCCION
 *                     cantVacas:
 *                       type: integer
 *                       example: 80
 *                     costoRacion:
 *                       type: number
 *                       example: 150.5
 *               animales:
 *                 type: array
 *                 description: Requerido para INDIVIDUAL; su cantidad debe coincidir con cantVacas.
 *                 items:
 *                   type: object
 *                   required: [categoria, estado]
 *                   properties:
 *                     codigo:
 *                       type: string
 *                       example: A-001
 *                     nombre:
 *                       type: string
 *                       example: Animal 1
 *                     categoria:
 *                       type: string
 *                       enum: [ORDENE, SECAS]
 *                       example: ORDENE
 *                     estado:
 *                       type: string
 *                       enum: [MASTITIS, TRATAMIENTO, NORMAL]
 *                       example: NORMAL
 *                     fechaNacimiento:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
 *                     observacion:
 *                       type: string
 *                       example: "Animal en seguimiento"
 *                     fechaParto:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-07-20T00:00:00.000Z"
 *               ubicacion:
 *                 type: object
 *                 required:
 *                   - provincia
 *                   - localidad
 *                 properties:
 *                   provincia:
 *                     type: string
 *                     example: Córdoba
 *                   localidad:
 *                     type: string
 *                     example: Villa María
 *     responses:
 *       201:
 *         description: Cuestionario registrado correctamente
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
 *                   example: Cuestionario registrado correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: success
 *       400:
 *         description: Datos inválidos, faltan rodeos/animales o validación del negocio
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Requiere rol OWNER o ADMIN del establecimiento y ORG_OWNER de la organización
 *       404:
 *         description: Establecimiento no encontrado
 */
/**
 * @swagger
 * /establecimiento/listar:
 *   get:
 *     summary: Listar el establecimiento de un usuario
 *     description: Devuelve los datos del establecimiento registrado para un usuario autenticado.
 *     tags: [Establecimientos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Establecimiento obtenido correctamente
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
 *                   example: Establecimientos obtenidos correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     idEstablecimiento:
 *                       type: string
 *                       format: uuid
 *                       example: "c2b8e8a2-4f92-4f3f-b0c5-1a2b3c4d5e6f"
 *                     nombre:
 *                       type: string
 *                       example: Establecimiento Norte
 *                     localidad:
 *                       type: string
 *                       example: Rafaela
 *                     provincia:
 *                       type: string
 *                       example: Santa Fe
 *                     idUsuario:
 *                       type: string
 *                       format: uuid
 *                       example: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
 *                     cuestionarioCompletado:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Usuario no autenticado
 *                 data:
 *                   type: null
 */

/**
 * @swagger
 * /establecimiento/invitacion/{idInvitacion}:
 *   delete:
 *     summary: Eliminar una invitación de establecimiento
 *     description: Elimina una invitación pendiente asociada al establecimiento del usuario autenticado.
 *     tags: [Establecimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idInvitacion
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la invitación a eliminar
 *     responses:
 *       200:
 *         description: Invitación eliminada correctamente
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
 *                   example: Invitación eliminada correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     idInvitacion:
 *                       type: string
 *                       format: uuid
 *                       example: "8e2f7b1a-3b90-4c0a-a4db-df0d2b6f4f8f"
 *                     idEstablecimiento:
 *                       type: string
 *                       format: uuid
 *                       example: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
 *                     correo:
 *                       type: string
 *                       example: "usuario@dominio.com"
 *                     estado:
 *                       type: string
 *                       example: "pendiente"
 *       400:
 *         description: La invitación ya fue procesada o datos inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Permisos insuficientes o no pertenece al establecimiento
 *       404:
 *         description: Invitación no encontrada
 */
/**
 * @swagger
 * /establecimiento/invitacion:
 *   get:
 *     summary: Obtener invitaciones de establecimiento
 *     description: Lista las invitaciones pendientes asociadas al establecimiento autenticado.
 *     tags: [Establecimientos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invitaciones obtenidas correctamente
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
 *                   example: Invitaciones obtenidas correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "8e2f7b1a-3b90-4c0a-a4db-df0d2b6f4f8f"
 *                       correo:
 *                         type: string
 *                         example: "usuario@dominio.com"
 *                       codigo:
 *                         type: string
 *                         example: "abc123def456"
 *                       estado:
 *                         type: string
 *                         example: "pendiente"
 *                       expiracion:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-08T00:00:00.000Z"
 *                       rol:
 *                         type: string
 *                         example: ADMIN
 *       400:
 *         description: Acceso no válido o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Acceso a establecimiento no válido
 *                 data:
 *                   type: null
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Usuario no autenticado
 *                 data:
 *                   type: null
 *       403:
 *         description: Permisos insuficientes para obtener invitaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: Permisos insuficientes para obtener invitaciones
 *                 data:
 *                   type: null
 */
/**
 * @swagger
 * /establecimiento/editar-nombre:
 *   patch:
 *     summary: Editar el nombre del establecimiento
 *     description: Permite actualizar el nombre del establecimiento del usuario autenticado.
 *     tags: [Establecimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del establecimiento
 *                 example: Establecimiento Sur
 *     responses:
 *       200:
 *         description: Nombre del establecimiento actualizado correctamente
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
 *                   example: Nombre del establecimiento actualizado correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     idEstablecimiento:
 *                       type: string
 *                       format: uuid
 *                       example: "c2b8e8a2-4f92-4f3f-b0c5-1a2b3c4d5e6f"
 *                     nombre:
 *                       type: string
 *                       example: Establecimiento Sur
 *                     localidad:
 *                       type: string
 *                       example: Rafaela
 *                     provincia:
 *                       type: string
 *                       example: Santa Fe
 *                     idUsuario:
 *                       type: string
 *                       format: uuid
 *                       example: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
 *                     cuestionarioCompletado:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Nombre inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: El nombre es obligatorio
 *                 data:
 *                   type: null
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Usuario no autenticado
 *                 data:
 *                   type: null
 */