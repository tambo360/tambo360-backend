# Backend - Tambo360

Backend principal de la aplicación Tambo360.
Encargado de la lógica de negocio, persistencia de datos y exposición de la API.

## 🛠️ Tecnologías

* Node.js
* Express
* TypeScript
* Prisma ORM
* Docker

---

## ⚙️ Requisitos

* Docker instalado
* (Opcional) Node.js si querés correrlo sin contenedor

---

## 📦 Variables de entorno

Este proyecto utiliza variables de entorno.

1. Copiar el archivo de ejemplo:

```bash
cp .env-example .env
```

2. Completar las variables necesarias (DB, puertos, etc.)

---

## 🚀 Levantar el proyecto con Docker

### 1. Build de la imagen

```bash
docker build -t tambo360-back:v1 .
```

### 2. Ejecutar el contenedor

```bash
docker run --name tambo360-back -p 8080:3000 tambo360-back:v1
```

👉 La API quedará disponible en:
http://localhost:8080

---

## 🧪 Desarrollo (sin Docker)

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

---

## 📁 Estructura básica

```
src/
 ├── controllers/
 ├── services/
 ├── routes/
 ├── middlewares/
 └── prisma/
```

---

## ⚠️ Notas

* No subir el archivo `.env`
* Mantener consistencia en el uso de Prisma para acceso a datos
* Toda la lógica de negocio debe ir en services (no en controllers)

---

## 🧠 Consideraciones

Este backend está pensado para escalar, pero se prioriza simplicidad y claridad en esta etapa.
Evitar sobreingeniería innecesaria.

---
