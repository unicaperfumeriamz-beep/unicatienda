# 🌸 Guía de Despliegue en Render y Turso - ÚNICA Perfumería

Esta guía detalla los pasos exactos para conectar la base de datos en la nube con **Turso**, desplegar el backend y frontend en **Render**, y gestionar los catálogos mensuales desde el panel de administración.

---

## 1. Configuración de Base de Datos en Turso (LibSQL)

Turso es una base de datos SQLite distribuida de alto rendimiento, 100% compatible con Drizzle ORM y `@libsql/client`.

### Paso 1: Crear la base de datos en Turso
1. Inicia sesión en tu terminal con la CLI de Turso (o desde el dashboard en [turso.tech](https://turso.tech)):
   ```bash
   turso auth login
   ```
2. Crea la base de datos para la tienda:
   ```bash
   turso db create unica-perfumeria
   ```
3. Obtén la URL de conexión:
   ```bash
   turso db show unica-perfumeria --url
   ```
   *Ejemplo de URL*: `libsql://unica-perfumeria-tuusuario.turso.io`

4. Genera un token de autenticación permanente:
   ```bash
   turso db tokens create unica-perfumeria
   ```
   *Copia este token, lo necesitarás como `TURSO_AUTH_TOKEN`.*

---

## 2. Despliegue en Render

El repositorio ya cuenta con un archivo `render.yaml` configurado como **Blueprint** para crear automáticamente el Backend y el Frontend.

### Opción A: Despliegue Automático con `render.yaml` (Blueprint)
1. Sube tu código a GitHub o GitLab.
2. Ingresa a tu cuenta de [Render](https://dashboard.render.com).
3. Haz clic en **New +** y selecciona **Blueprint**.
4. Conecta tu repositorio de GitHub `unica`.
5. Render detectará automáticamente `render.yaml` y te solicitará los valores de las variables:
   - `DATABASE_URL`: Tu URL de Turso (`libsql://unica-perfumeria-tuusuario.turso.io`).
   - `TURSO_AUTH_TOKEN`: El token que generaste en el paso anterior.
   - `APP_URL`: La URL que Render le asigne a tu frontend (puedes actualizarla una vez creado).
   - `VITE_API_URL`: La URL de tu backend con `/api` (ej: `https://unica-backend.onrender.com/api`).
6. Haz clic en **Apply**.

---

### Opción B: Despliegue Manual (Paso a Paso)

#### Servicio 1: Backend (Web Service)
- **Tipo**: Web Service
- **Entorno**: Node
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`
- **Variables de Entorno**:
  - `NODE_ENV`: `production`
  - `PORT`: `10000`
  - `DATABASE_URL`: `libsql://unica-perfumeria-tuusuario.turso.io`
  - `TURSO_AUTH_TOKEN`: `<tu_token_turso>`
  - `JWT_SECRET`: `<cualquier_cadena_secreta_larga>`
  - `APP_URL`: `https://unica-frontend.onrender.com` (o la URL de tu frontend)

> **Nota:** Al iniciar por primera vez en Render con una base de datos Turso vacía, el servidor detecta automáticamente que no hay productos y ejecuta el seed inicial con todas las categorías y los 199 productos de la Edición 50.

#### Servicio 2: Frontend (Static Site)
- **Tipo**: Static Site
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Variables de Entorno**:
  - `VITE_API_URL`: `https://tu-backend.onrender.com/api`
- **Redirects / Rewrites**:
  - `/*` -> `/index.html` (Rewrite, para que React Router funcione al recargar páginas).

---

## 3. Acceso al Panel de Administración

Una vez desplegada la tienda, puedes ingresar con las credenciales de administrador preconfiguradas:

- **URL del Panel**: `/admin` (o haciendo clic en tu perfil > *Panel Admin*)
- **Email**: `admin@unicaperfumeria.com` *(o `admin@tienda.com`)*
- **Contraseña**: `admin123`

---

## 4. Gestión Mensual del Catálogo (Libro UNICA)

Mes a mes se irán cargando los nuevos productos y precios del libro desde el panel administrativo:

1. Ingresa a `/admin`.
2. En el menú lateral haz clic en **Libro / Catálogo**.
3. Verás la edición activa actual (**Edición Nº 50 - 199 productos**).
4. Opciones disponibles:
   - **Cargar Nueva Edición**: Permite subir un archivo JSON con los nuevos productos o pegar los datos de la nueva edición (ej. UNICA 51). El sistema actualiza automáticamente los precios de lista y promociones existentes y da de alta los nuevos perfumes.
   - **Sincronizar Libro Oficial**: Restablece y sincroniza instantáneamente el catálogo oficial de la Edición 50.
   - **Exportar Catálogo**: Descarga un respaldo en JSON de todos los productos y precios actuales.
