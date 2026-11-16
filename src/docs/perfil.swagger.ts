/**
 * @swagger
 * tags:
 *   - name: Perfil
 *     description: Datos de la cuenta del usuario logueado
 */

/**
 * @swagger
 * /perfil/:
 *   patch:
 *     summary: Actualizar nombre y/o correo del usuario logueado
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     description: Debe venir al menos nombre o correo. Para cambiar el correo se requiere contraseñaActual; el usuario queda con verificado = false y se envía un mail de verificación al correo nuevo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 50
 *                 example: Nicolás Debella
 *               correo:
 *                 type: string
 *                 format: email
 *                 minLength: 5
 *                 maxLength: 50
 *                 example: nuevo.correo@tambo360.test
 *               contraseñaActual:
 *                 type: string
 *                 description: Obligatoria si se envía correo.
 *     responses:
 *       200:
 *         description: Perfil actualizado (si cambió el correo, el mensaje pide verificarlo)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Perfil actualizado correctamente }
 *                 data:
 *                   type: object
 *                   properties:
 *                     idUsuario: { type: string, format: uuid }
 *                     nombre: { type: string }
 *                     correo: { type: string, format: email }
 *                     verificado: { type: boolean }
 *       400: { description: Datos inválidos, body vacío o falta contraseñaActual al cambiar el correo }
 *       401: { description: Usuario no autenticado o contraseña actual incorrecta }
 *       404: { description: Usuario no encontrado }
 *       409: { description: El correo ya está en uso }
 */