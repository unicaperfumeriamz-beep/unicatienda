# PROYECTO: PLATAFORMA E-COMMERCE COMPLETA

Quiero que desarrolles una plataforma e-commerce profesional, robusta, escalable y completamente funcional, inspirada conceptualmente en la experiencia de uso de Mercado Libre, pero con identidad visual, código y componentes propios.

NO quiero un prototipo visual.

NO quiero mockups.

NO quiero funcionalidades simuladas.

NO quiero botones que no hagan nada.

NO quiero datos falsos utilizados para aparentar funcionalidades reales.

Quiero una aplicación FULL STACK funcional de extremo a extremo, lista para conectar con producción.

El sistema debe poder:

1. Permitir que cualquier visitante navegue por la tienda sin registrarse.
2. Permitir buscar y visualizar productos.
3. Permitir agregar productos al carrito sin iniciar sesión.
4. Exigir registro/inicio de sesión al momento de comenzar el checkout.
5. Permitir realizar pagos reales mediante Mercado Pago.
6. Crear y gestionar pedidos.
7. Permitir al cliente consultar sus compras.
8. Permitir seguimiento del pedido.
9. Permitir al administrador gestionar completamente el negocio.
10. Mostrar métricas reales obtenidas desde la base de datos.

---

# 1. STACK TECNOLÓGICO OBLIGATORIO

Frontend:

* React.js
* Vite
* JavaScript/JSX
* React Router
* Tailwind CSS 3
* React Bits para componentes visuales cuando corresponda
* Fetch API o Axios
* Context API o una solución liviana para estado global
* Diseño responsive Mobile First

Backend:

* Node.js
* Express.js
* API REST
* Arquitectura modular por recursos

Base de datos:

* Turso / libSQL
* ORM o query layer apropiado para Turso
* Migraciones versionadas

Autenticación:

* JWT mediante cookies HttpOnly seguras
* Access token + refresh token si la arquitectura lo requiere
* Password hashing con Argon2 o bcrypt
* OAuth para Google
* OAuth para Facebook si las credenciales están configuradas
* Login tradicional mediante email/password

Pagos:

* Mercado Pago
* Crear preferencias/órdenes desde BACKEND
* Nunca exponer credenciales privadas de Mercado Pago en frontend
* Webhooks de Mercado Pago
* Validación de estado de pago desde backend

Gráficos:

* Librería de gráficos profesional compatible con React
* Los datos deben provenir de consultas reales a la base de datos

---

# 2. REGLA FUNDAMENTAL

Antes de escribir código:

1. Analiza completamente los requerimientos.
2. Diseña la arquitectura.
3. Diseña el esquema de base de datos.
4. Diseña las rutas API.
5. Diseña los roles y permisos.
6. Diseña los estados de pedidos y pagos.
7. Diseña los flujos de autenticación.
8. Diseña el flujo completo de checkout.
9. Diseña la estructura de carpetas.
10. Recién después comienza a implementar.

NO tomes decisiones destructivas sin comprobar primero el proyecto existente.

Si ya existe código:

* inspeccionarlo;
* reutilizar lo que esté bien implementado;
* no romper funcionalidades existentes;
* no eliminar configuraciones importantes;
* no cambiar tecnologías principales sin justificación.

---

# 3. ARQUITECTURA

Utilizar una arquitectura clara y mantenible.

Frontend:

src/
components/
components/ui/
pages/
layouts/
hooks/
contexts/
services/
api/
utils/
routes/
assets/
styles/

Backend:

server/
config/
controllers/
middleware/
routes/
services/
repositories/
models/
utils/
validators/
webhooks/

Separar claramente:

* lógica de negocio;
* acceso a datos;
* controladores;
* rutas;
* autenticación;
* validación;
* servicios externos.

No colocar lógica de negocio compleja dentro de componentes React.

---

# 4. ROLES

Implementar como mínimo:

CLIENT

ADMIN

El backend debe verificar permisos.

Nunca confiar únicamente en el frontend para determinar si un usuario es administrador.

Un usuario CLIENT no debe poder acceder ni ejecutar endpoints administrativos.

Implementar middleware:

authenticate
requireRole

---

# 5. BASE DE DATOS

Diseñar una base de datos relacional correctamente normalizada.

Como mínimo contemplar:

users
oauth_accounts
sessions
products
product_images
categories
inventory
cart
cart_items
orders
order_items
payments
shipping_addresses
shipments
promotions
promotion_products
promotion_usage
notifications
reviews
audit_logs

Agregar tablas adicionales si son necesarias.

Cada tabla debe tener:

* primary key;
* timestamps;
* foreign keys;
* índices apropiados;
* restricciones necesarias.

Utilizar UUID o IDs seguros.

Crear migraciones.

No depender de tablas creadas manualmente.

---

# 6. PRODUCTOS

Cada producto debe poder contener:

* ID
* nombre
* slug
* descripción
* precio
* precio promocional
* stock
* SKU
* categoría
* imágenes
* estado activo/inactivo
* fecha de creación
* fecha de actualización

El administrador debe poder:

* crear productos;
* editar productos;
* eliminar/desactivar productos;
* cargar imágenes;
* cambiar precios;
* modificar stock;
* establecer ofertas.

---

# 7. STOCK

Implementar control real de inventario.

Estados:

* DISPONIBLE
* STOCK_BAJO
* SIN_STOCK
* INACTIVO

Configurar stock mínimo configurable.

Cuando el stock llegue al límite:

mostrar alerta administrativa.

Cuando llegue a 0:

* impedir nuevas compras;
* mostrar "Sin stock";
* deshabilitar botón de compra;
* mantener visible el producto si está activo.

IMPORTANTE:

El stock debe reservarse/controlarse correctamente durante el proceso de compra para evitar overselling.

No permitir que dos compras simultáneas vendan unidades inexistentes.

---

# 8. TIENDA PÚBLICA

Crear una experiencia visual premium.

Header:

* logo;
* buscador;
* categorías;
* carrito;
* notificaciones;
* usuario;
* acceso/login.

Hero principal:

* promociones;
* banners;
* productos destacados.

Home:

* categorías;
* productos destacados;
* ofertas;
* productos más vendidos;
* nuevos productos.

Footer:

* información;
* contacto;
* términos;
* privacidad;
* políticas de envío;
* redes sociales.

---

# 9. BUSCADOR

Crear buscador funcional.

Debe buscar por:

* nombre;
* descripción;
* SKU;
* categoría.

Implementar:

* búsqueda instantánea o con debounce;
* resultados relevantes;
* estado vacío;
* paginación;
* ordenamiento.

Filtros:

* categoría;
* precio mínimo;
* precio máximo;
* disponibilidad;
* ofertas.

Orden:

* relevancia;
* precio menor;
* precio mayor;
* más vendidos;
* más recientes.

---

# 10. PRODUCT DETAIL

Página profesional de producto.

Debe mostrar:

* galería de imágenes;
* nombre;
* descripción;
* precio;
* precio anterior si existe;
* descuento;
* stock;
* cantidad;
* botón agregar al carrito;
* botón comprar ahora;
* información de envío;
* productos relacionados.

Si no hay stock:

Mostrar claramente:

"SIN STOCK"

y bloquear la compra.

---

# 11. CARRITO

El carrito debe funcionar tanto para usuarios invitados como registrados.

Usuario invitado:

guardar carrito mediante localStorage/cookie o mecanismo seguro.

Usuario autenticado:

persistir carrito en base de datos.

Cuando un usuario invitado inicia sesión:

fusionar carrito local con carrito existente.

El carrito debe mostrar:

* producto;
* imagen;
* precio;
* cantidad;
* subtotal;
* descuento;
* total.

Permitir:

* aumentar cantidad;
* disminuir cantidad;
* eliminar producto;
* vaciar carrito.

Mostrar:

"Tenés productos esperando en tu carrito."

Implementar persistencia del carrito.

---

# 12. CHECKOUT

El usuario puede navegar sin cuenta.

PERO:

Al comenzar checkout debe autenticarse.

Si no tiene cuenta:

mostrar:

"Para completar tu compra necesitás crear una cuenta."

Opciones:

* Crear cuenta
* Iniciar sesión

Checkout:

PASO 1
Datos personales.

PASO 2
Dirección de envío.

PASO 3
Método de envío.

PASO 4
Resumen del pedido.

PASO 5
Pago.

Validar todos los campos en frontend y backend.

Nunca confiar exclusivamente en validaciones frontend.

---

# 13. AUTENTICACIÓN

Implementar:

Registro:

* nombre;
* apellido;
* email;
* teléfono;
* contraseña;
* confirmación de contraseña.

Login:

* email;
* contraseña.

OAuth:

* Google;
* Facebook.

Recuperación:

"Olvidé mi contraseña"

Flujo:

1. Usuario introduce email.
2. Backend genera token temporal.
3. Enviar email.
4. Usuario abre enlace.
5. Establece nueva contraseña.
6. Token queda invalidado.

Nunca guardar contraseñas en texto plano.

Nunca devolver passwords mediante API.

Implementar protección contra:

* brute force;
* credential stuffing;
* rate limiting;
* CSRF según arquitectura;
* XSS;
* SQL injection;
* session hijacking.

Cookies:

HttpOnly
Secure en producción
SameSite apropiado

---

# 14. EMAIL

Preparar arquitectura para emails transaccionales:

* bienvenida;
* recuperación de contraseña;
* confirmación de compra;
* pago aprobado;
* pedido enviado;
* pedido entregado;
* cancelación.

Utilizar variables de entorno para las credenciales del proveedor.

---

# 15. MERCADO PAGO

Integración REAL.

Nunca simular pagos.

Backend:

crear preferencia/orden.

Frontend:

redirigir al checkout de Mercado Pago.

Implementar URLs:

success
failure
pending

Implementar webhook.

El webhook debe:

1. recibir notificación;
2. validar el evento;
3. consultar Mercado Pago;
4. verificar el estado real;
5. actualizar payment;
6. actualizar order;
7. actualizar stock;
8. generar notificación.

IMPORTANTE:

NO marcar una orden como pagada únicamente porque el frontend regresó a success.

La fuente definitiva debe ser la validación backend/webhook.

Estados:

PENDING
APPROVED
REJECTED
CANCELLED
REFUNDED

---

# 16. PEDIDOS

Estados del pedido:

PENDING_PAYMENT
PAID
PROCESSING
PREPARING
SHIPPED
DELIVERED
CANCELLED

El administrador debe poder cambiar estados según permisos.

Registrar historial de estados.

El cliente debe poder visualizar:

* número de pedido;
* fecha;
* productos;
* cantidades;
* total;
* dirección;
* método de pago;
* estado;
* seguimiento.

---

# 17. SEGUIMIENTO DE ENVÍOS

Crear sistema preparado para tracking.

Shipment:

* carrier;
* tracking number;
* status;
* estimated delivery;
* shipped_at;
* delivered_at.

El cliente debe poder visualizar una línea de progreso:

Compra realizada
↓
Pago confirmado
↓
Preparando pedido
↓
Enviado
↓
En camino
↓
Entregado

Preparar arquitectura para integración futura con servicios de logística.

---

# 18. NOTIFICACIONES

Crear sistema de notificaciones.

Campana en header.

Notificaciones para:

* compra realizada;
* pago aprobado;
* pedido preparado;
* pedido enviado;
* pedido entregado;
* promociones;
* stock/restock si corresponde.

Implementar:

* unread count;
* marcar como leída;
* marcar todas como leídas.

---

# 19. ADMIN PANEL

Crear dashboard administrativo completamente separado del frontend público.

Sidebar:

Dashboard
Productos
Categorías
Inventario
Pedidos
Clientes
Promociones
Cupones
Envíos
Notificaciones
Métricas
Configuración

Diseño profesional tipo SaaS.

---

# 20. ADMIN — PRODUCTOS

Tabla con:

* imagen;
* nombre;
* SKU;
* precio;
* stock;
* estado;
* ventas;
* fecha.

Acciones:

* editar;
* duplicar;
* desactivar;
* eliminar;
* modificar stock.

Filtros y búsqueda.

Paginación.

---

# 21. ADMIN — PEDIDOS

Mostrar:

* ID;
* cliente;
* fecha;
* total;
* pago;
* estado;
* envío.

Filtros:

* fecha;
* estado;
* pago;
* cliente.

Detalle del pedido.

Permitir actualizar estado.

---

# 22. ADMIN — PROMOCIONES

Crear promociones:

* porcentaje;
* monto fijo;
* producto específico;
* categoría;
* mínimo de compra;
* fecha inicio;
* fecha final;
* límite de usos.

---

# 23. CUPONES

Generador de códigos promocionales.

Ejemplo:

NUEVO20
VERANO15
WELCOME10

Debe permitir configurar:

* código;
* descuento;
* tipo;
* máximo de usos;
* usos por usuario;
* fecha de inicio;
* fecha de vencimiento;
* compra mínima;
* productos/categorías aplicables;
* estado.

Validar cupón en backend.

Nunca confiar en el descuento calculado por frontend.

---

# 24. MÉTRICAS

Dashboard administrativo con datos reales.

Mostrar:

* ventas del día;
* ventas del mes;
* cantidad de pedidos;
* ticket promedio;
* clientes registrados;
* productos vendidos;
* productos sin stock;
* productos con stock bajo.

Gráficos:

Ventas por día
Ventas por mes
Pedidos
Ingresos
Productos más vendidos
Categorías más vendidas

Ranking:

TOP 10 productos más vendidos.

Todas las métricas deben calcularse desde la base de datos.

No utilizar números hardcodeados.

---

# 25. PRODUCTOS MÁS VENDIDOS

Calcular mediante cantidad real de unidades vendidas.

Mostrar:

1. Producto
2. Unidades vendidas
3. Facturación
4. Cantidad de pedidos

Permitir filtrar por:

* hoy;
* 7 días;
* 30 días;
* 90 días;
* histórico.

---

# 26. UX/UI

La interfaz debe sentirse como un producto comercial real.

Inspiración conceptual:

Mercado Libre
Amazon
Shopify
Stripe
Apple

NO copiar diseños literalmente.

Crear identidad visual propia.

Características:

* mucho espacio;
* jerarquía visual;
* tipografía profesional;
* cards modernas;
* botones claros;
* estados hover;
* microinteracciones;
* skeleton loaders;
* empty states;
* errores claros;
* feedback visual;
* responsive perfecto.

Utilizar React Bits cuando aporte valor.

No abusar de animaciones.

La interfaz debe priorizar:

CONVERSIÓN
CLARIDAD
VELOCIDAD
CONFIANZA

---

# 27. RESPONSIVE

Debe funcionar correctamente en:

* desktop;
* laptop;
* tablet;
* mobile.

No simplemente "adaptar" el desktop.

Diseñar experiencias específicas para mobile.

El carrito y checkout deben ser especialmente cómodos en dispositivos móviles.

---

# 28. SEGURIDAD

Implementar como mínimo:

* Helmet;
* CORS correctamente configurado;
* rate limiting;
* validación de inputs;
* sanitización;
* protección contra SQL injection;
* protección contra XSS;
* protección contra brute force;
* cookies seguras;
* JWT seguro;
* password hashing;
* autorización basada en roles;
* logs de seguridad;
* auditoría de acciones administrativas.

No guardar secretos en el frontend.

Usar:

.env

Agregar:

.env.example

Nunca subir:

.env

---

# 29. API

Crear API REST organizada.

Ejemplos:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password

GET /api/products
GET /api/products/:slug
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id

GET /api/categories

GET /api/cart
POST /api/cart/items
PUT /api/cart/items/:id
DELETE /api/cart/items/:id

POST /api/orders
GET /api/orders
GET /api/orders/:id

POST /api/payments/create
POST /api/payments/webhook

GET /api/notifications
PUT /api/notifications/:id/read

GET /api/admin/metrics
GET /api/admin/products
GET /api/admin/orders

Etc.

Las rutas pueden ampliarse según necesidad.

---

# 30. VALIDACIONES

Usar una librería de validación robusta.

Validar:

* email;
* password;
* precios;
* stock;
* IDs;
* cantidades;
* cupones;
* pedidos;
* direcciones;
* parámetros de búsqueda.

Validar SIEMPRE también en backend.

---

# 31. MANEJO DE ERRORES

Crear sistema centralizado de errores.

La API debe devolver respuestas consistentes.

Ejemplo:

{
"success": false,
"message": "Mensaje para el usuario",
"code": "ERROR_CODE"
}

Nunca devolver stack traces al usuario en producción.

---

# 32. LOADING / ERROR / EMPTY STATES

Cada pantalla debe contemplar:

Loading
Success
Error
Empty

No mostrar pantallas rotas.

Ejemplo:

Si no existen productos:

"No encontramos productos."

Si el carrito está vacío:

"Tu carrito está vacío."

Si falla una petición:

"Hubo un problema. Intentá nuevamente."

---

# 33. ACCESIBILIDAD

Implementar:

* HTML semántico;
* labels;
* aria-label donde corresponda;
* navegación por teclado;
* contraste adecuado;
* focus states;
* botones accesibles.

---

# 34. SEO

Implementar SEO básico:

* title;
* description;
* Open Graph;
* URLs amigables;
* slugs;
* sitemap preparado;
* robots preparado.

Cada producto debe tener URL propia.

Ejemplo:

/producto/nombre-del-producto

---

# 35. PERFORMANCE

Optimizar:

* imágenes;
* lazy loading;
* code splitting;
* consultas;
* índices;
* paginación;
* caché cuando corresponda.

No descargar toda la base de productos para mostrar una página.

---

# 36. CONFIGURACIÓN

Toda información sensible debe estar en variables de entorno.

Crear:

.env.example

Variables esperadas, por ejemplo:

DATABASE_URL=
TURSO_AUTH_TOKEN=

JWT_SECRET=
JWT_REFRESH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

APP_URL=
API_URL=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=

No colocar valores ficticios como credenciales reales.

---

# 37. SEED DE DESARROLLO

Crear seed opcional para desarrollo.

Debe permitir generar:

* categorías;
* productos;
* usuario administrador;
* usuarios de prueba;
* pedidos de prueba.

Los datos de seed deben estar claramente identificados como DEVELOPMENT.

Nunca ejecutar seed destructivo automáticamente en producción.

---

# 38. DOCUMENTACIÓN

Crear README completo.

Debe explicar:

1. requisitos;
2. instalación;
3. variables de entorno;
4. configuración de Turso;
5. migraciones;
6. seed;
7. ejecución frontend;
8. ejecución backend;
9. Mercado Pago;
10. Google OAuth;
11. Facebook OAuth;
12. emails;
13. deployment;
14. creación de administrador.

Incluir comandos exactos.

---

# 39. SCRIPTS

package.json debe tener scripts claros.

Ejemplo:

npm run dev
npm run build
npm run start
npm run migrate
npm run seed
npm run lint

Si se utiliza otro sistema de migraciones, adaptar los comandos.

---

# 40. TESTING

Crear tests para las partes críticas.

Como mínimo:

* registro;
* login;
* autorización;
* creación de producto;
* stock;
* carrito;
* checkout;
* generación de pedido;
* aplicación de cupón;
* cálculo de totales;
* Mercado Pago;
* webhook;
* cambio de estado;
* permisos administrativos.

No considerar terminado el proyecto solamente porque compila.

---

# 41. REGLA SOBRE EL ESTADO DEL PROYECTO

Después de implementar cada módulo:

1. Ejecutar lint.
2. Ejecutar build.
3. Revisar errores.
4. Corregirlos.
5. Ejecutar tests relacionados.
6. Verificar integración con módulos anteriores.

NO avanzar dejando errores conocidos.

---

# 42. CHECKOUT — REGLAS CRÍTICAS

El precio final siempre debe calcularse en backend.

El frontend NO puede decidir:

* precio;
* descuento;
* stock;
* impuestos;
* total;
* estado de pago.

El backend debe reconstruir el carrito consultando la base de datos.

Proceso:

Frontend envía productos/cantidades.

Backend:

1. consulta productos;
2. verifica existencia;
3. verifica stock;
4. obtiene precios actuales;
5. calcula subtotal;
6. valida promociones;
7. valida cupón;
8. calcula descuento;
9. calcula envío;
10. calcula total;
11. crea orden;
12. inicia pago.

Esto evita manipulación de precios desde el navegador.

---

# 43. CONSISTENCIA DEL STOCK

Implementar transacciones cuando sea posible.

Nunca:

leer stock
+
esperar
+
actualizar stock

sin protección contra concurrencia.

La operación de reducción de stock debe ser atómica.

---

# 44. ESTADOS DE PAGO Y PEDIDO

Separar:

PAYMENT STATUS

y

ORDER STATUS.

Ejemplo:

payment = APPROVED

order = PROCESSING

No mezclar ambas responsabilidades.

---

# 45. AUDITORÍA

Registrar acciones administrativas importantes:

* login admin;
* creación producto;
* modificación producto;
* eliminación;
* modificación stock;
* cambio de pedido;
* creación cupón;
* modificación promoción.

Guardar:

* usuario;
* acción;
* recurso;
* fecha;
* metadata relevante.

---

# 46. EXPERIENCIA DEL CLIENTE

Después de una compra:

mostrar pantalla:

"¡Compra realizada!"

Mostrar:

* número de pedido;
* importe;
* estado;
* resumen;
* botón seguimiento;
* botón continuar comprando.

Crear página:

/mis-compras

Con historial de pedidos.

---

# 47. PERFIL

Crear:

/mi-cuenta

Secciones:

Datos personales
Direcciones
Mis compras
Notificaciones
Seguridad

Permitir cambiar contraseña.

Permitir gestionar direcciones.

---

# 48. CARRITO ABANDONADO

Implementar recordatorio visual para usuarios que tienen productos pendientes.

Si el usuario vuelve a la tienda:

mostrar:

"Tenés productos en tu carrito."

No mostrar este mensaje si el carrito está vacío.

Preparar arquitectura para futuras notificaciones/email de carrito abandonado.

---

# 49. ADMIN DASHBOARD

La primera pantalla del administrador debe ser excelente visualmente.

Mostrar:

Ingresos
Pedidos
Clientes
Productos vendidos

y debajo:

Ventas
Productos más vendidos
Pedidos recientes
Alertas de stock

Las alertas importantes deben destacarse.

---

# 50. DISEÑO VISUAL

Quiero una estética:

PREMIUM
MODERNA
MINIMALISTA
PROFESIONAL
COMERCIAL

Evitar:

* diseños genéricos;
* gradients excesivos;
* sombras exageradas;
* demasiadas animaciones;
* colores chillones;
* interfaces que parezcan templates gratuitos.

Usar un sistema de diseño consistente.

Definir:

* colores;
* typography;
* spacing;
* radius;
* shadows;
* botones;
* inputs;
* cards;
* badges;
* modals;
* tables;
* alerts.

---

# 51. NO HACER

NO:

* usar datos hardcodeados para métricas;
* simular Mercado Pago;
* simular login;
* guardar passwords sin hash;
* confiar en roles del frontend;
* calcular precios únicamente en frontend;
* confiar en el redirect de Mercado Pago;
* exponer secretos;
* crear endpoints administrativos sin autorización;
* dejar TODOs críticos;
* dejar botones sin funcionalidad;
* ocultar errores;
* utilizar mocks en producción.

Si alguna integración externa necesita credenciales que todavía no existen, implementar correctamente la integración y documentar exactamente qué variable de entorno falta.

NO reemplazarla por una simulación.

---

# 52. CRITERIOS DE ACEPTACIÓN

El proyecto solamente puede considerarse TERMINADO cuando:

[ ] Frontend compila.
[ ] Backend inicia correctamente.
[ ] Base de datos funciona.
[ ] Migraciones funcionan.
[ ] Registro funciona.
[ ] Login funciona.
[ ] Logout funciona.
[ ] Recuperación de contraseña funciona.
[ ] Google OAuth está preparado.
[ ] Facebook OAuth está preparado.
[ ] Roles funcionan.
[ ] Visitante puede navegar.
[ ] Buscador funciona.
[ ] Filtros funcionan.
[ ] Producto funciona.
[ ] Carrito funciona.
[ ] Carrito persistente funciona.
[ ] Checkout funciona.
[ ] Validación backend funciona.
[ ] Mercado Pago está integrado.
[ ] Webhook funciona.
[ ] Pedido se crea correctamente.
[ ] Stock se descuenta correctamente.
[ ] Stock bajo genera alerta.
[ ] Sin stock bloquea compra.
[ ] Cliente puede ver pedidos.
[ ] Seguimiento funciona.
[ ] Notificaciones funcionan.
[ ] Admin funciona.
[ ] CRUD productos funciona.
[ ] Pedidos funcionan.
[ ] Promociones funcionan.
[ ] Cupones funcionan.
[ ] Métricas funcionan.
[ ] Gráficos funcionan.
[ ] Productos más vendidos funcionan.
[ ] Auditoría funciona.
[ ] Responsive funciona.
[ ] Seguridad básica implementada.
[ ] README completo.
[ ] .env.example creado.
[ ] No existen errores de build.
[ ] No existen errores críticos de consola.
[ ] No existen endpoints críticos sin autorización.

---

# 53. PROCEDIMIENTO DE IMPLEMENTACIÓN

Trabajá en estas fases:

FASE 1
Auditoría del proyecto y arquitectura.

FASE 2
Base de datos + migraciones.

FASE 3
Backend + autenticación.

FASE 4
Productos + categorías + búsqueda.

FASE 5
Carrito.

FASE 6
Checkout.

FASE 7
Mercado Pago + webhooks.

FASE 8
Pedidos + tracking.

FASE 9
Notificaciones.

FASE 10
Admin.

FASE 11
Promociones + cupones.

FASE 12
Métricas + gráficos.

FASE 13
Seguridad.

FASE 14
Responsive + UX/UI.

FASE 15
Testing.

FASE 16
Optimización.

FASE 17
Auditoría final.

Después de cada fase:

* comprobar que compile;
* ejecutar tests;
* corregir errores;
* verificar que no se hayan roto funcionalidades anteriores.

---

# 54. AUDITORÍA FINAL OBLIGATORIA

Antes de decir que terminaste:

Realizá una auditoría completa del proyecto.

Buscar:

* errores de compilación;
* imports rotos;
* rutas inexistentes;
* endpoints inconsistentes;
* problemas de autenticación;
* problemas de autorización;
* problemas de CORS;
* problemas de cookies;
* problemas de stock;
* errores de cálculo;
* race conditions;
* problemas de Mercado Pago;
* webhooks incorrectos;
* problemas responsive;
* errores de consola;
* secretos expuestos;
* datos hardcodeados;
* botones sin funcionalidad;
* páginas inaccesibles;
* estados de loading faltantes;
* errores de UX.

Corregir todo lo encontrado.

Después ejecutar nuevamente:

* lint;
* tests;
* build.

---

# 55. RESULTADO FINAL

Quiero que me entregues un proyecto funcional, organizado y profesional.

Al finalizar indicá:

1. Arquitectura utilizada.
2. Tecnologías.
3. Estructura de carpetas.
4. Base de datos.
5. Variables de entorno necesarias.
6. Cómo ejecutar frontend.
7. Cómo ejecutar backend.
8. Cómo ejecutar migraciones.
9. Cómo ejecutar seed.
10. Cómo configurar Mercado Pago.
11. Cómo configurar Google.
12. Cómo configurar Facebook.
13. Cómo desplegar.
14. Qué credenciales externas todavía deben configurarse.

NO afirmes que algo funciona si no fue implementado y verificado.

Si detectás una decisión técnica que pueda afectar la seguridad, integridad de pagos, stock o datos de usuarios, priorizá la solución segura y explícala en el README.

OBJETIVO FINAL:

Una plataforma e-commerce profesional FULL STACK, escalable y lista para producción, con una experiencia de compra moderna comparable a grandes marketplaces, pero con identidad visual propia y arquitectura limpia.
