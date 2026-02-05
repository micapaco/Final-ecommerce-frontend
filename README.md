# E-commerce Skincare - Frontend

Frontend profesional para tienda de skincare desarrollado con React + Vite.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)

## Características

- **Catálogo de productos** con filtros por categoría
- **Carrito de compras** funcional
- **Autenticación** de usuarios (login/registro)
- **Sistema de reseñas** por producto
- **Panel de administración** con:
  - Dashboard con métricas en tiempo real (Health Check)
  - CRUD completo: productos, categorías, clientes, pedidos
- **Optimizaciones**: caché, cola de peticiones, retry automático

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/ecommerce-frontend.git
cd ecommerce-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# Ejecutar en desarrollo
npm run dev
```

## Variables de Entorno

```env
VITE_API_URL=http://localhost:8000  # URL del backend
```

## Estructura del Proyecto

```
src/
├── api/           # Clientes API (products, orders, clients...)
├── components/    # Componentes reutilizables
├── pages/         # Páginas de la aplicación
│   ├── admin/     # Panel de administración
│   └── ...        # Home, ProductDetail, Cart...
├── context/       # Context API (Auth, Cart)
└── utils/         # Utilidades y helpers
```

## Backend

Este frontend consume una API REST desarrollada con FastAPI + PostgreSQL.

**Repositorio del backend:** [ecommerce-backend](https://github.com/micapaco/Final-ecommerce-backend.git)

## 🌐 Deploy

- **Frontend:** Vercel
- **Backend:** Render

### Deploy en Vercel

1. Conectar repositorio a Vercel
2. Agregar variable de entorno: `VITE_API_URL` = URL del backend en Render
3. Deploy automático

## Licencia

Este proyecto fue desarrollado como trabajo final académico.
