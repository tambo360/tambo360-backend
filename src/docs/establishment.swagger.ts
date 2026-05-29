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