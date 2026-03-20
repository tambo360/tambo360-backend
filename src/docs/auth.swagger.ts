/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - nombre
 *         - correo
 *         - contraseña
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 5
 *           maxLength: 50
 *         correo:
 *           type: string
 *           minLength: 5
 *           maxLength: 50
 *         contraseña:
 *           type: string
 *           minLength: 8
 *           maxLength: 50
 *           pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$'
 *       example:
 *         nombre: "Juan Perez"
 *         correo: "juan.perez@example.com"
 *         contraseña: "!Password123"
 * 
 *     LoginRequest:
 *       type: object
 *       required:
 *         - correo
 *         - contraseña
 *       properties:
 *         correo:
 *           type: string
 *         contraseña:
 *           type: string
 *       example:
 *         correo: "facuu201202@gmail.com"
 *         contraseña: "!Facu201202"
 * 
 *     EmailRequest:
 *       type: object
 *       required:
 *         - correo
 *       properties:
 *         correo:
 *           type: string
 *       example:
 *         correo: "facuu201202@gmail.com"
 * 
 *     TokenRequest:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *       example:
 *         token: "b28a6254dd3cadca4e7f2c236ee3a412575af5d19fe1e982f5760a072635bc6f"
 * 
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - nuevaContraseña
 *       properties:
 *         token:
 *           type: string
 *         nuevaContraseña:
 *           type: string
 *           minLength: 8
 *           maxLength: 50
 *           pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$'
 *       example:
 *         token: "b28a6254dd3cadca4e7f2c236ee3a412575af5d19fe1e982f5760a072635bc6f"
 *         nuevaContraseña: "!Facu201202"
 * 
 *     Usuario:
 *       type: object
 *       properties:
 *         idUsuario:
 *           type: string
 *           format: uuid
 *         correo:
 *           type: string
 *         nombre:
 *           type: string
 *         verificado:
 *           type: boolean
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 * 
 *     UsuarioResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 201
 *         message:
 *           type: string
 *           example: "Usuario registrado exitosamente"
 *         data:
 *           $ref: '#/components/schemas/Usuario'
 *         success:
 *           type: boolean
 *           example: true
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "Inicio de sesión exitoso"
 *         data:
 *           type: object
 *           properties:
 *             idUsuario:
 *               type: string
 *               format: uuid
 *             verificado:
 *               type: boolean
 *         success:
 *           type: boolean
 *           example: true
 *
 *     UnauthorizedResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 401
 *         message:
 *           type: string
 *           example: "No autenticado"
 *         success:
 *           type: boolean
 *           example: false
 * 
 *     ErrorValidationResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 500
 *         message:
 *           type: array
 *           items:
 *             type: string
 *           example: ["correo es obligatorio", "contraseña debe tener al menos 8 caracteres"]
 *         success:
 *           type: boolean
 *           example: false
 *
 *     ErrorTokenResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 500
 *         message:
 *           type: string
 *           example: "Token inválido o expirado"
 *         success:
 *           type: boolean
 *           example: false
 *
 */

/**
 * @swagger
 * /auth/crear-cuenta:
 *   post:
 *     tags:
 *       - auth
 *     summary: Crea una nueva cuenta de usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       400:
 *         description: Error de validación (nombre/correo/contraseña obligatorios)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidationResponse'
 *             example:
 *               statusCode: 400
 *               message: ["Todos los campos son obligatorios"]
 *               success: false
 * 
 * /auth/verificar-email:
 *   post:
 *     tags:
 *       - auth
 *     summary: Verifica el correo con un token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenRequest'
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
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
 *                   example: "Email verificado exitosamente"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Token obligatorio, inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorTokenResponse'
 *             example:
 *               statusCode: 400
 *               message: "Token de verificación inválido o expirado"
 *               success: false
 * 
 * /auth/reenviar-verificacion:
 *   post:
 *     tags:
 *       - auth
 *     summary: Reenvía el correo de verificación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       200:
 *         description: Correo de verificación reenviado exitosamente
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
 *                   example: "Correo de verificación reenviado exitosamente"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Correo obligatoria
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidationResponse'
 *             example:
 *               statusCode: 400
 *               message: "Correo es obligatorio"
 *               success: false
 * 
 * /auth/iniciar-sesion:
 *   post:
 *     tags:
 *       - auth
 *     summary: Inicia sesión de un usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email y contraseña obligatorios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidationResponse'
 *             example:
 *               statusCode: 400
 *               message: "Email y contraseña son obligatorios"
 *               success: false
 * 
 * /auth/contrasena-olvidada:
 *   post:
 *     tags:
 *       - auth
 *     summary: Envía un correo para recuperar contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       200:
 *         description: Instrucciones enviadas al correo
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
 *                   example: "Instrucciones para restablecer la contraseña enviadas al correo"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Correo obligatorio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidationResponse'
 *             example:
 *               statusCode: 400
 *               message: "Correo es obligatorio"
 *               success: false
 * 
 * /auth/verificar-restablecer-contrasena:
 *   post:
 *     tags:
 *       - auth
 *     summary: Verifica el token de recuperación de contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenRequest'
 *     responses:
 *       200:
 *         description: Token de restablecimiento válido
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
 *                   example: "Token de restablecimiento válido"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Token obligatorio, inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorTokenResponse'
 *             example:
 *               statusCode: 400
 *               message: "Token de restablecimiento inválido o expirado"
 *               success: false
 * 
 * /auth/restablecer-contrasena:
 *   post:
 *     tags:
 *       - auth
 *     summary: Restablece la contraseña usando token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
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
 *                   example: "Contraseña restablecida exitosamente"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Token o contraseña inválidos u obligatorios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidationResponse'
 *             example:
 *               statusCode: 400
 *               message:
 *                 - "Token es obligatorio"
 *                 - "Nueva contraseña es obligatoria"
 *               success: false
 *
 * /auth/me:
 *   get:
 *     tags:
 *       - auth
 *     summary: Obtiene los datos del usuario autenticado
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidationResponse'
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - auth
 *     summary: Cierra la sesión del usuario
 *     description: Elimina la cookie de autenticación y finaliza la sesión del usuario.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
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
 *                   example: "Sesión cerrada correctamente"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 */