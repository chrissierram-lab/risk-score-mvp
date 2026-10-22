# ProntoPaga — Consulta de score

MVP de demostración para consultar un score financiero ficticio por RUT. El resultado es determinista para un mismo RUT y **no representa una evaluación ni una decisión financiera real**.

## Requisitos

- Node.js 20 o superior
- npm

## Ejecutar en local

1. Instala las dependencias en dos terminales:

   ```bash
   cd backend && npm install
   ```

   ```bash
   cd frontend && npm install
   ```

2. Desde la raíz, prepara las variables del backend:

   ```bash
   cp backend/.env.example backend/.env
   ```

3. Inicia el backend y el frontend, cada uno en su terminal:

   ```bash
   cd backend && npm run dev
   ```

   ```bash
   cd frontend && npm run dev
   ```

4. Abre la dirección que indique Vite (por defecto `http://localhost:5173`).

## Usuarios de prueba

Las credenciales son mock, solo para desarrollo local:

| Rol | Email | Contraseña | RUT asociado |
|---|---|---|---|
| `user` | `usuario@demo.cl` | `usuario123` | `12.345.678-9` |
| `admin` | `admin@demo.cl` | `admin123` | `76.123.456-0` |

El usuario `user` solo puede consultar su RUT asociado. `admin` puede consultar cualquier RUT con formato válido.

## API

- `POST /login`: recibe `{ "email": "...", "password": "..." }` y devuelve un JWT y el perfil.
- `GET /score/:rut`: requiere `Authorization: Bearer <token>` y devuelve `{ "rut": "...", "score": 0, "fecha": "..." }`.

El JWT contiene `sub` y `role`; el claim `rut` se incluye solo para el rol `user`.

El score se calcula de forma reproducible a partir del RUT normalizado. La autenticación y las cuentas son exclusivamente demostrativas; no usar esta configuración en producción.

## Comprobaciones

```bash
cd backend && npm test && npm run build
```

```bash
cd frontend && npm test && npm run typecheck && npm run build
```

## Estructura

- `backend/`: API REST, autenticación JWT, autorización y pruebas.
- `frontend/`: SPA React, formularios y estados de carga/error.
- `docs/ai_interactions.md`: registro del apoyo de herramientas de IA.
