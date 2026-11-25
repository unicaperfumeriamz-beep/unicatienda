# 🌸 ÚNICA Perfumería - Tienda E-Commerce Oficial

Plataforma de comercio electrónico para **ÚNICA Perfumería** (*Esencialmente Bueno*), con catálogo completo de la **Edición Nº 50** precargado y módulo administrativo para la actualización y carga de productos mes a mes desde el libro oficial.

---

## 🌟 Características Principales

- **Catálogo Oficial UNICA (Edición 50)**: 199 productos clasificados en 8 categorías (Fragancias Femeninas, Masculinas, Perfumes Árabes Premium, Perfumes Premium, Difusores & Hogar, Cosmética & Uñas, Óleos Sumeria, Cuidado Capilar & Facial).
- **Gestión Mensual del Libro desde el Panel Admin**: Pestaña dedicada **Libro / Catálogo** para actualizar precios, ofertas y sumar las nuevas fragancias edición por edición (mes a mes) vía JSON, archivo o sincronización automática.
- **Precios de Lista y Promocionales**: Muestra precios con descuentos oficiales y códigos de producto (SKU) exactos del libro.
- **Base de Datos en la Nube con Turso (libSQL)**: Arquitectura moderna, distribuida y ultrarrápida impulsada por Drizzle ORM.
- **Preparado para Render**: Archivo de Blueprint `render.yaml` incluido para desplegar Backend y Frontend con un solo clic.
- **Programa de Puntos & Fidelización**: Recompensas del 10% en puntos por compra, canjeables por descuentos.

---

## 🚀 Inicio Rápido en Desarrollo Local

### 1. Clonar el repositorio e instalar dependencias
```bash
# Backend
cd backend
npm install
npm run seed  # Carga los 199 productos y categorías oficiales
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

La tienda estará disponible en: `http://localhost:5173`  
El backend API estará en: `http://localhost:3000/api`

---

## 🔐 Credenciales de Administrador

Para acceder al Panel de Control (`/admin`):
- **Email**: `admin@unicaperfumeria.com` *(o `admin@tienda.com`)*
- **Contraseña**: `admin123`

---

## ☁️ Despliegue en Render y Turso

Consulta el archivo detallado [DEPLOY_TURSO_RENDER.md](file:///c:/Users/Nahuel/Desktop/unica/DEPLOY_TURSO_RENDER.md) para ver la guía paso a paso de configuración con Turso y Render.
