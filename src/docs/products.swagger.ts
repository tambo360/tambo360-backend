/**
 * @swagger
 * tags:
 *   - name: Productos
 *     description: Gestión y listado de productos disponibles
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Listar todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Productos listados correctamente
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
 *                   example: "Productos listados correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idProducto:
 *                         type: string
 *                         format: uuid
 *                         example: "a1b2c3d4-5678-90ab-cdef-1234567890ab"
 *                       nombre:
 *                         type: string
 *                         example: "Leche Entera"
 *                       categoria:
 *                         type: string
 *                         example: "lácteos"
 *       404:
 *         description: No hay productos registrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "No hay productos registrados"
 *                 data:
 *                   type: null
 */