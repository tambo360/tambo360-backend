/**
 * @swagger
 * tags:
 *   - name: Costos Generales
 *     description: Gestión de costos generales y resumen económico del establecimiento
 */

/**
 * @swagger
 * /costos-generales/:
 *   post:
 *     summary: Registrar un costo general
 *     tags: [Costos Generales]
 *     security:
 *       - bearerAuth: []
 *     description: Requiere rol OWNER o ADMIN del establecimiento.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipoCosto, monto, fecha]
 *             properties:
 *               tipoCosto:
 *                 type: string
 *                 enum: [PERSONAL, SERVICIOS, LOGISTICA, MANTENIMIENTO, VETERINARIO, INMUEBLE, OTRO]
 *                 example: PERSONAL
 *               descripcion:
 *                 type: string
 *                 maxLength: 500
 *                 example: Sueldos del personal del establecimiento
 *               monto:
 *                 type: number
 *                 exclusiveMinimum: 0
 *                 example: 125000.50
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-08-31T00:00:00.000Z'
 *     responses:
 *       201:
 *         description: Costo general registrado correctamente
 *       400:
 *         description: Datos inválidos o establecimiento no determinado
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Rol insuficiente o establecimiento no autorizado
 */

/**
 * @swagger
 * /costos-generales/:
 *   get:
 *     summary: Listar costos generales de un período
 *     tags: [Costos Generales]
 *     security:
 *       - bearerAuth: []
 *     description: Disponible para cualquier rol con acceso al establecimiento. Incluye costos manuales y un registro virtual de alimentación calculado automáticamente.
 *     parameters:
 *       - in: query
 *         name: fechaDesde
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: '2026-08-01T00:00:00.000Z'
 *       - in: query
 *         name: fechaHasta
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: '2026-08-31T23:59:59.999Z'
 *     responses:
 *       200:
 *         description: Costos generales obtenidos correctamente
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
 *                   example: Costos generales obtenidos correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - type: object
 *                         properties:
 *                           idCostoGeneral: { type: string, format: uuid }
 *                           idEstablecimiento: { type: string, format: uuid }
 *                           tipoCosto: { type: string, enum: [PERSONAL, SERVICIOS, LOGISTICA, MANTENIMIENTO, VETERINARIO, INMUEBLE, OTRO] }
 *                           descripcion: { type: string, nullable: true }
 *                           monto: { type: number }
 *                           fecha: { type: string, format: date-time }
 *                           creadoEn: { type: string, format: date-time }
 *                       - type: object
 *                         properties:
 *                           idCostoGeneral: { type: string, example: alimentacion }
 *                           tipoCosto: { type: string, example: ALIMENTACION }
 *                           descripcion: { type: string, example: Costo de alimentación (calculado automáticamente) }
 *                           monto: { type: number }
 *                           fecha: { type: string, format: date-time }
 *                           automatico: { type: boolean, example: true }
 *                           soloLectura: { type: boolean, example: true }
 *       400:
 *         description: Período de consulta incompleto o establecimiento no determinado
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Establecimiento no autorizado
 *       404:
 *         description: Establecimiento no encontrado
 */

/**
 * @swagger
 * /costos-generales/resumen:
 *   get:
 *     summary: Obtener resumen económico
 *     tags: [Costos Generales]
 *     security:
 *       - bearerAuth: []
 *     description: Requiere rol OWNER o ADMIN. Calcula los gastos del período sin crear registros persistentes.
 *     parameters:
 *       - in: query
 *         name: fechaDesde
 *         required: true
 *         schema: { type: string, format: date-time }
 *         example: '2026-08-01T00:00:00.000Z'
 *       - in: query
 *         name: fechaHasta
 *         required: true
 *         schema: { type: string, format: date-time }
 *         example: '2026-08-31T23:59:59.999Z'
 *     responses:
 *       200:
 *         description: Resumen económico obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Resumen económico obtenido correctamente }
 *                 data:
 *                   type: object
 *                   properties:
 *                     periodo:
 *                       type: object
 *                       properties:
 *                         fechaDesde: { type: string, format: date-time }
 *                         fechaHasta: { type: string, format: date-time }
 *                     gastoAlimentacion: { type: number, example: 250000 }
 *                     gastoCostosGenerales: { type: number, example: 125000.5 }
 *                     gastoTotal: { type: number, example: 375000.5 }
 *                     lotesCompletos: { type: integer, example: 8 }
 *                     prorrateoPromedio: { type: number, example: 46875.06 }
 *       400:
 *         description: Fechas inválidas, período invertido o establecimiento no determinado
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Rol insuficiente o establecimiento no autorizado
 *       404:
 *         description: Establecimiento no encontrado
 */

/**
 * @swagger
 * /costos-generales/{id}:
 *   patch:
 *     summary: Actualizar un costo general
 *     tags: [Costos Generales]
 *     security:
 *       - bearerAuth: []
 *     description: Requiere rol OWNER o ADMIN. Todos los campos del body son opcionales; el costo automático de alimentación no puede editarse porque no es persistente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipoCosto:
 *                 type: string
 *                 enum: [PERSONAL, SERVICIOS, LOGISTICA, MANTENIMIENTO, VETERINARIO, INMUEBLE, OTRO]
 *               descripcion: { type: string, maxLength: 500 }
 *               monto: { type: number, exclusiveMinimum: 0 }
 *               fecha: { type: string, format: date-time }
 *     responses:
 *       200: { description: Costo general actualizado correctamente }
 *       400: { description: Datos inválidos o establecimiento no determinado }
 *       401: { description: Usuario no autenticado }
 *       403: { description: Rol insuficiente, establecimiento no autorizado o costo de otro establecimiento }
 *       404: { description: Costo general no encontrado }
 */

/**
 * @swagger
 * /costos-generales/{id}:
 *   delete:
 *     summary: Eliminar un costo general
 *     tags: [Costos Generales]
 *     security:
 *       - bearerAuth: []
 *     description: Requiere rol OWNER o ADMIN. No elimina el costo automático de alimentación porque se calcula al consultar.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Costo general eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Costo general eliminado correctamente }
 *                 data: { nullable: true, example: null }
 *       401: { description: Usuario no autenticado }
 *       403: { description: Rol insuficiente, establecimiento no autorizado o costo de otro establecimiento }
 *       404: { description: Costo general no encontrado }
 */
