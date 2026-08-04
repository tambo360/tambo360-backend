/**
 * @swagger
 * tags:
 *   - name: Lotes
 *     description: Gestión de lotes de producción
 */

/**
 * @swagger
 * /lote:
 *   post:
 *     summary: Crear un nuevo lote de producción
 *     tags: [Lotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [tipoSeguimiento, idLote, tempTanque, destino, idProducto, cantidad, unidad, fechaProduccion, idRodeo]
 *                 properties:
 *                   tipoSeguimiento:
 *                     type: string
 *                     enum: [RODEO]
 *                     example: RODEO
 *                   idLote:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440000"
 *                   tempTanque:
 *                     type: number
 *                     example: 4.5
 *                   destino:
 *                     type: string
 *                     enum: [TANQUE_FRIO, VENTA, FABRICA_QUESOS]
 *                     example: TANQUE_FRIO
 *                   idProducto:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440001"
 *                   cantidad:
 *                     type: number
 *                     example: 100
 *                   unidad:
 *                     type: string
 *                     enum: [kg, litros]
 *                     example: kg
 *                   fechaProduccion:
 *                     type: string
 *                     example: "15/05/2026"
 *                   estado:
 *                     type: boolean
 *                     example: false
 *                   idRodeo:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440003"
 *               - type: object
 *                 required: [tipoSeguimiento, idLote, tempTanque, destino, idProducto, cantidad, unidad, fechaProduccion, animales]
 *                 properties:
 *                   tipoSeguimiento:
 *                     type: string
 *                     enum: [INDIVIDUAL]
 *                     example: INDIVIDUAL
 *                   idLote:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440010"
 *                   tempTanque:
 *                     type: number
 *                     example: 3.2
 *                   destino:
 *                     type: string
 *                     enum: [TANQUE_FRIO, VENTA, FABRICA_QUESOS]
 *                     example: VENTA
 *                   idProducto:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440001"
 *                   cantidad:
 *                     type: number
 *                     example: 80
 *                   unidad:
 *                     type: string
 *                     enum: [kg, litros]
 *                     example: litros
 *                   fechaProduccion:
 *                     type: string
 *                     example: "15/05/2026"
 *                   estado:
 *                     type: boolean
 *                     example: false
 *                   animales:
 *                     type: array
 *                     minItems: 1
 *                     items:
 *                       type: object
 *                       required: [idAnimal, litros, estado]
 *                       properties:
 *                         idAnimal:
 *                           type: string
 *                           format: uuid
 *                           example: "550e8400-e29b-41d4-a716-446655440020"
 *                         litros:
 *                           type: number
 *                           example: 40
 *                         estado:
 *                           type: string
 *                           enum: [MATITIS, TRATAMIENTO, PREPARTO, DESCARTE]
 *                           example: PREPARTO
 *     responses:
 *       201:
 *         description: Lote creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 201 }
 *                 message: { type: string, example: "Lote creado correctamente" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     idLote: { type: string, format: uuid, example: "550e8400-e29b-41d4-a716-446655440000" }
 *                     idProducto: { type: string, format: uuid, example: "550e8400-e29b-41d4-a716-446655440001" }
 *                     cantidad: { type: number, example: 100 }
 *                     unidad: { type: string, example: "kg" }
 *                     fechaProduccion: { type: string, format: date-time, example: "2026-05-15T12:00:00.000Z" }
 *                     estado: { type: boolean, example: false }
 *                     numeroLote: { type: integer, example: 1 }
 *                     producto:
 *                       type: object
 *                       properties:
 *                         idProducto: { type: string, format: uuid, example: "550e8400-e29b-41d4-a716-446655440001" }
 *                         nombre: { type: string, example: "Leche Fresca" }
 *                         categoria: { type: string, example: "leches" }
 *       400:
 *         description: Datos inválidos, seguimiento incompatible con la configuración del establecimiento o cuerpo inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 400 }
 *                 message: { type: string, example: "El tipo de seguimiento enviado no coincide con la configuración del establecimiento" }
 *                 data: { type: null }
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 401 }
 *                 message: { type: string, example: "Usuario no autenticado" }
 *                 data: { type: null }
 *       404:
 *         description: Producto o rodeo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 404 }
 *                 message: { type: string, example: "Producto no encontrado" }
 *                 data: { type: null }
 */

/**
 * @swagger
 * /lote/opciones-creacion:
 *   get:
 *     summary: Obtener opciones de creación para un lote según la configuración del establecimiento
 *     tags: [Lotes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Opciones de creación obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 200 }
 *                 message: { type: string, example: "Opciones de creación obtenidas correctamente" }
 *                 data:
 *                   oneOf:
 *                     - type: object
 *                       required: [tipoSeguimiento, rodeos]
 *                       properties:
 *                         tipoSeguimiento:
 *                           type: string
 *                           enum: [RODEO]
 *                           example: RODEO
 *                         rodeos:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               idRodeo: { type: string, format: uuid }
 *                               label: { type: string }
 *                               value: { type: string }
 *                               costoRacion: { type: number }
 *                               cantVacas: { type: integer }
 *                     - type: object
 *                       required: [tipoSeguimiento, animales]
 *                       properties:
 *                         tipoSeguimiento:
 *                           type: string
 *                           enum: [INDIVIDUAL]
 *                           example: INDIVIDUAL
 *                         animales:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               idAnimal: { type: string, format: uuid }
 *                               codigo: { type: string }
 *                               nombre: { type: string }
 *                               categoria: { type: string }
 *                               estado: { type: string }
 *                               fechaNacimiento: { type: string, format: date-time }
 *       400:
 *         description: No se pudo determinar el establecimiento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 400 }
 *                 message: { type: string, example: "No se pudo determinar el establecimiento" }
 *                 data: { type: null }
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 401 }
 *                 message: { type: string, example: "Usuario no autenticado" }
 *                 data: { type: null }
 */

/**
 * @swagger
 * /lote/listar:
 *   get:
 *     summary: Listar todos los lotes del usuario
 *     tags: [Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           pattern: "^[0-9]+$"
 *         required: false
 *         description: Número de página (la primera página es 1) (opcional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           pattern: "^[0-9]+$"
 *         required: false
 *         description: Cantidad de resultados por página (máx 100) (opcional)
 *       - in: query
 *         name: orden
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         required: false
 *         description: Ordenar por número de lote ('asc' o 'desc') (opcional)
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         required: false
 *         description: Filtrar por estado del lote (`true` o `false`) (opcional)
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         required: false
 *         description: Buscar por texto en el nombre o producto (opcional)
 *       - in: query
 *         name: producto
 *         schema:
 *           type: string
 *         required: false
 *         description: Buscar por texto en el nombre del producto (opcional)
 *       - in: query
 *         name: numeroLote
 *         schema:
 *           type: string
 *           pattern: "^[0-9]+$"
 *         required: false
 *         description: Filtrar por número de lote exacto (opcional)
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           pattern: "^\\d{2}/\\d{2}/\\d{4}$"
 *         required: false
 *         description: Fecha inicial en formato dd/mm/aaaa (opcional)
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           pattern: "^\\d{2}/\\d{2}/\\d{4}$"
 *         required: false
 *         description: Fecha final en formato dd/mm/aaaa (opcional)
 *     responses:
 *       200:
 *         description: Lotes listados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 200 }
 *                 message: { type: string, example: "Lotes listados correctamente" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 10 }
 *                     totalLotes: { type: integer, example: 30 }
 *                     totalPaginas: { type: integer, example: 2 }
 *                     lotes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           lote:
 *                             type: object
 *                             properties:
 *                               idLote: { type: string, format: uuid }
 *                               idProducto: { type: string, format: uuid }
 *                               cantidad: { type: number }
 *                               unidad: { type: string }
 *                               fechaProduccion: { type: string, format: date-time }
 *                               estado: { type: boolean }
 *                               numeroLote: { type: integer }
 *                               producto:
 *                                 type: object
 *                                 properties:
 *                                   idProducto: { type: string, format: uuid }
 *                                   nombre: { type: string }
 *                                   categoria: { type: string }
 *                               idEstablecimiento: { type: string, format: uuid }
 *                               idRodeo: { type: string, format: uuid }
 *                               cantAnimales: { type: integer }
 *                               destino: { type: string }
 *                               tempTanque: { type: number }
 *                               rodeo:
 *                                 type: object
 *                                 properties:
 *                                   idRodeo: { type: string, format: uuid }
 *                                   tipoRodeo: { type: string }
 *                                   costoRacion: { type: number }
 *                                   cantVacas: { type: integer }
 *                               mermas: { type: array, items: { type: object } }
 *                               costosDirectos: { type: array, items: { type: object } }
 *                               produccionesIndividuales:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     idProduccionAnimal: { type: string, format: uuid }
 *                                     idAnimal: { type: string, format: uuid }
 *                                     litros: { type: number }
 *                                     estado: { type: string }
 *                               turno: { type: string }
 *                           merma_porcentaje: { type: number }
 *       400:
 *         description: Error de validación o usuario sin establecimiento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 400 }
 *                 message: { type: string, example: "El usuario no tiene un establecimiento registrado" }
 *                 data: { type: null }
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 401 }
 *                 message: { type: string, example: "Usuario no autenticado" }
 *                 data: { type: null }
 */

/**
 * @swagger
 * /lote/buscar/{idLote}:
 *   get:
 *     summary: Obtener un lote por ID
 *     tags: [Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idLote
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del lote
 *     responses:
 *       200:
 *         description: Lote obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 200 }
 *                 message: { type: string, example: "Lote obtenido correctamente" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     lote:
 *                       type: object
 *                       properties:
 *                         idLote: { type: string, format: uuid }
 *                         numeroLote: { type: integer }
 *                         fechaProduccion: { type: string, format: date-time }
 *                         cantidad: { type: number }
 *                         unidad: { type: string }
 *                         estado: { type: boolean }
 *                         tempTanque: { type: number }
 *                         destino: { type: string }
 *                         idProducto: { type: string, format: uuid }
 *                         idEstablecimiento: { type: string, format: uuid }
 *                         turno: { type: string }
 *                         producto:
 *                           type: object
 *                           properties:
 *                             idProducto: { type: string, format: uuid }
 *                             nombre: { type: string }
 *                             categoria: { type: string }
 *                         idRodeo: { type: string, format: uuid }
 *                         cantAnimales: { type: integer }
 *                         rodeo:
 *                           type: object
 *                           properties:
 *                             idRodeo: { type: string, format: uuid }
 *                             tipoRodeo: { type: string }
 *                             costoRacion: { type: number }
 *                             cantVacas: { type: integer }
 *                         establecimiento:
 *                           type: object
 *                           properties:
 *                             idEstablecimiento: { type: string, format: uuid }
 *                             nombre: { type: string }
 *                             provincia: { type: string }
 *                             localidad: { type: string }
 *                         mermas:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               idMerma: { type: string, format: uuid }
 *                               tipo: { type: string }
 *                               cantidad: { type: number }
 *                               fechaCreacion: { type: string, format: date-time }
 *                         costosDirectos:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               idCostoDirecto: { type: string, format: uuid }
 *                               concepto: { type: string }
 *                               monto: { type: number }
 *                               observaciones: { type: string }
 *                               fechaCreacion: { type: string, format: date-time }
 *                         produccionesIndividuales:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               idProduccionAnimal: { type: string, format: uuid }
 *                               idAnimal: { type: string, format: uuid }
 *                               litros: { type: number }
 *                               estado: { type: string }
 *                     alertas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string, format: uuid }
 *                           idEstablecimiento: { type: string, format: uuid }
 *                           idLote: { type: string, format: uuid }
 *                           producto: { type: string }
 *                           categoria: { type: string }
 *                           nivel: { type: string }
 *                           descripcion: { type: string }
 *                           creadoEn: { type: string, format: date-time }
 *                           visto: { type: boolean }
 *                     alertasError: { type: string, nullable: true }
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Lote no encontrado
 */

/**
 * @swagger
 * /lote/{idLote}:
 *   patch:
 *     summary: Editar un lote existente
 *     tags: [Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idLote
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del lote a editar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [tipoSeguimiento, cantidad, unidad, fechaProduccion, tempTanque, destino, idRodeo]
 *                 properties:
 *                   tipoSeguimiento:
 *                     type: string
 *                     enum: [RODEO]
 *                     example: RODEO
 *                   idProducto:
 *                     type: string
 *                     format: uuid
 *                     example: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
 *                   cantidad:
 *                     type: number
 *                     example: 120
 *                   unidad:
 *                     type: string
 *                     enum: [kg, litros]
 *                     example: litros
 *                   fechaProduccion:
 *                     type: string
 *                     example: "16/05/2026"
 *                   tempTanque:
 *                     type: number
 *                     example: 4.5
 *                   destino:
 *                     type: string
 *                     enum: [TANQUE_FRIO, VENTA, FABRICA_QUESOS]
 *                     example: VENTA
 *                   idRodeo:
 *                     type: string
 *                     format: uuid
 *                     example: "550e8400-e29b-41d4-a716-446655440003"
 *               - type: object
 *                 required: [tipoSeguimiento, cantidad, unidad, fechaProduccion, tempTanque, destino, animales]
 *                 properties:
 *                   tipoSeguimiento:
 *                     type: string
 *                     enum: [INDIVIDUAL]
 *                     example: INDIVIDUAL
 *                   idProducto:
 *                     type: string
 *                     format: uuid
 *                     example: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
 *                   cantidad:
 *                     type: number
 *                     example: 80
 *                   unidad:
 *                     type: string
 *                     enum: [kg, litros]
 *                     example: litros
 *                   fechaProduccion:
 *                     type: string
 *                     example: "16/05/2026"
 *                   tempTanque:
 *                     type: number
 *                     example: 3.5
 *                   destino:
 *                     type: string
 *                     enum: [TANQUE_FRIO, VENTA, FABRICA_QUESOS]
 *                     example: TANQUE_FRIO
 *                   animales:
 *                     type: array
 *                     minItems: 1
 *                     items:
 *                       type: object
 *                       required: [idAnimal, litros, estado]
 *                       properties:
 *                         idAnimal:
 *                           type: string
 *                           format: uuid
 *                           example: "550e8400-e29b-41d4-a716-446655440020"
 *                         litros:
 *                           type: number
 *                           example: 40
 *                         estado:
 *                           type: string
 *                           enum: [MATITIS, TRATAMIENTO, PREPARTO, DESCARTE]
 *                           example: PREPARTO
 *     responses:
 *       200:
 *         description: Lote actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 200 }
 *                 message: { type: string, example: "Lote actualizado correctamente" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     idLote: { type: string, format: uuid, example: "550e8400-e29b-41d4-a716-446655440000" }
 *                     idProducto: { type: string, format: uuid, example: "550e8400-e29b-41d4-a716-446655440001" }
 *                     cantidad: { type: number, example: 120 }
 *                     unidad: { type: string, example: "litros" }
 *                     fechaProduccion: { type: string, format: date-time, example: "2026-05-16T00:00:00.000Z" }
 *                     tempTanque: { type: number, example: 4.5 }
 *                     destino: { type: string, example: "VENTA" }
 *                     estado: { type: boolean, example: false }
 *                     numeroLote: { type: integer, example: 123 }
 *                     producto:
 *                       type: object
 *                       properties:
 *                         idProducto: { type: string, format: uuid, example: "550e8400-e29b-41d4-a716-446655440001" }
 *                         nombre: { type: string, example: "Leche Fresca" }
 *                         categoria: { type: string, example: "leches" }
 *       400:
 *         description: Datos inválidos o el lote no puede editarse
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 400 }
 *                 message: { type: string, example: "Datos inválidos" }
 *                 data: { type: null }
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: integer, example: 401 }
 *                 message: { type: string, example: "Usuario no autenticado" }
 *                 data: { type: null }
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Lote no encontrado
 */

/**
 * @swagger
 * /lote/eliminar/{idLote}:
 *   delete:
 *     summary: Eliminar un lote
 *     tags: [Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idLote
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del lote a eliminar
 *     responses:
 *       200:
 *         description: Lote eliminado correctamente
 *       400:
 *         description: No se puede eliminar el lote
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Lote no encontrado
 */

/**
 * @swagger
 * /lote/completar/{idLote}:
 *   post:
 *     summary: Completar un lote
 *     tags: [Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idLote
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del lote a completar
 *     responses:
 *       200:
 *         description: Lote completado correctamente
 *       400:
 *         description: Lote ya completado
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Lote no encontrado
 */

/**
 * @swagger
 * /lote/produccion-hoy:
 *   get:
 *     summary: Listar producción del día
 *     tags: [Lotes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Producción del día obtenida correctamente
 *       400:
 *         description: Usuario sin establecimiento
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: No hay producción registrada para el día de hoy
 */