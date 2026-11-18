# Documentación de Endpoints - Landing Page

## Descripción
Esta API maneja las funcionalidades de la página de destino (landing page) de Tambo360, incluyendo el envío de correos de contacto.

## Autenticación y Autorización
- No requiere autenticación JWT
- No requiere headers especiales

---

## Endpoints

### 1. Enviar Correo de Contacto

**Método:** `POST`  
**Ruta:** `/landing/contacto`  
**Middleware:** Ninguno

#### Request Body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `nombre` | string | Sí | Nombre completo del contacto |
| `email` | string | Sí | Email válido del contacto |
| `telefono` | string | Sí | Número de teléfono del contacto |
| `mensaje` | string | Sí | Mensaje del contacto |

#### Ejemplo de Request

```json
{
  "nombre": "María González",
  "email": "maria@example.com",
  "telefono": "+5491123456789",
  "mensaje": "Me gustaría obtener más información sobre Tambo360"
}
```

#### Response (200 - OK)

```json
{
  "success": true,
  "message": "Correo de contacto enviado correctamente",
  "data": null
}
```

#### Posibles Errores

| Código | Mensaje |
|--------|---------|
| 400 | Todos los campos son requeridos |

---

## Notas

- El correo se envía utilizando el servicio de mail configurado
- Los campos nombre, email, telefono y mensaje son todos obligatorios
- Las respuestas siguen el formato estándar `ApiResponse`