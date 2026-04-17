# Módulo Tambo (Migración de Python → TypeScript)

## 📌 Objetivo

Este módulo reemplaza el backend de Python que actualmente se encarga de:

* Cálculo de mermas y análisis de lotes
* Generación de alertas
* Integración con IA (OpenRouter)
* Persistencia en base de datos

👉 A diferencia del backend anterior, este módulo **NO expone endpoints**.
Se usa internamente desde el backend principal como funciones.

---

## 🧱 Estructura del módulo

```bash
tambo/
├── tambo.engine.ts      # Cálculos + actualización de promedios (usa DB)
├── tambo.repository.ts  # Acceso a base de datos (Prisma)
├── tambo.prompt.ts      # Construcción del prompt para IA
├── tambo.parser.ts      # Parseo de respuesta IA + fallback
├── tambo.service.ts     # Orquestador principal (pipeline completo)
├── tambo.types.ts       # Tipos e interfaces
```

---

## 🧠 Responsabilidades

### 🔹 tambo.engine.ts

* Contiene lógica de cálculo
* Calcula mermas y porcentajes
* Detecta outliers
* Actualiza promedios en base de datos

⚠️ IMPORTANTE:

* Usa repository (DB)
* NO llama a la IA
* NO construye prompts

---

### 🔹 tambo.repository.ts

* Maneja acceso a base de datos (Prisma)
* Solo queries (find, create, update)
* No tiene lógica de negocio

---

### 🔹 tambo.prompt.ts

* Construye los mensajes para la IA
* Basado en datos ya calculados
* NO realiza cálculos

---

### 🔹 tambo.parser.ts

* Parsea la respuesta de la IA
* Maneja errores de formato
* Genera fallback si la IA falla

---

### 🔹 tambo.service.ts

* Orquesta todo el flujo:

  * engine (cálculos + DB)
  * prompt
  * llamada a IA
  * parser
* Es el punto de entrada del módulo

---

### 🔹 tambo.types.ts

* Define estructuras de datos
* Basado en `schemas.py`
* Evita uso de `any`

---

## 🔄 Flujo de ejecución

```bash
Controller (backend principal)
↓
tambo.service
↓
(engine) cálculo + DB
↓
(prompt) construcción del mensaje
↓
(IA) llamada a OpenRouter
↓
(parser) validación + fallback
↓
respuesta final
```

---

## ⚠️ Reglas importantes

* ❌ NO poner lógica en controllers
* ❌ NO mezclar responsabilidades entre archivos
* ❌ NO llamar IA desde engine
* ❌ NO calcular nada en repository
* ✔️ Respetar separación por responsabilidad

---

## 📚 Origen del código

Este módulo es una migración del backend Python:

* `tambo_engine.py` → dividido en:

  * engine
  * prompt
  * parser
  * service
* `db_models.py` → Prisma schema
* `schemas.py` → tambo.types.ts

---

## ⚠️ Nota importante

Aunque en Python todo estaba en un solo archivo, en esta migración se separa por responsabilidades para mejorar mantenimiento y trabajo en equipo.

👉 IMPORTANTE:
La lógica debe mantenerse igual (no modificar fórmulas ni comportamiento).
