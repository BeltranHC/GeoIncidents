# 🗺️ Sistema de Geolocalización con Análisis de Patrones de Incidentes

<div align="center">

![GitHub stars](https://img.shields.io/badge/stars-⭐⭐⭐⭐⭐-yellow?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/status-active-success?style=for-the-badge)

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/World%20Map.png" alt="World Map" width="150" />

### 🌍 Plataforma de reportes ciudadanos con geolocalización en tiempo real

*Registra, visualiza y analiza incidentes urbanos de forma inteligente*

[🚀 Demo](#-instalación) • [📖 Docs](#-api-documentation) • [🐛 Issues](https://github.com/issues) • [✨ Features](#-características)

---

</div>

## ✨ Características

<table>
<tr>
<td width="50%">

### 🗺️ Mapas Interactivos
- Visualización en tiempo real
- Mapas de calor por zonas de riesgo
- Clustering de incidentes
- Geolocalización automática

</td>
<td width="50%">

### 📊 Análisis Inteligente
- Predicción de zonas de riesgo con ML
- Patrones temporales de incidentes
- Estadísticas y métricas avanzadas
- Alertas automáticas por proximidad

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Seguridad
- Autenticación JWT
- Reportes anónimos
- Control de roles (Admin/Usuario)
- Validación de incidentes

</td>
<td width="50%">

### 📱 Experiencia de Usuario
- Diseño responsive
- Interfaz intuitiva
- Notificaciones en tiempo real
- Categorías personalizables

</td>
</tr>
</table>

## 🏗️ Arquitectura

```
geo-incidents/
├── backend/                 # API REST Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuraciones
│   │   ├── controllers/    # Controladores
│   │   ├── middlewares/    # Middlewares (auth, validation)
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rutas API
│   │   ├── services/       # Lógica de negocio
│   │   ├── utils/          # Utilidades
│   │   └── app.ts          # Entrada principal
│   └── package.json
│
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas/Vistas
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Servicios API
│   │   ├── store/          # Estado global (Zustand)
│   │   ├── types/          # Tipos TypeScript
│   │   └── App.tsx
│   └── package.json
│
├── ml-service/             # Servicio ML Python + FastAPI
│   ├── app/
│   │   ├── models/         # Modelos ML
│   │   ├── services/       # Lógica de predicción
│   │   └── main.py
│   └── requirements.txt
│
└── docker-compose.yml      # Orquestación de servicios
```

## 🚀 Tech Stack

<div align="center">

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

### ML & DevOps
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

## 🚀 Tecnologías

### Backend
- **Node.js 20** + **Express 4**
- **TypeScript 5**
- **PostgreSQL 16** + **PostGIS 3.4**
- **Sequelize ORM**
- **JWT** para autenticación
- **Socket.IO** para tiempo real
- **Redis** para caché

### Frontend
- **React 18** + **TypeScript**
- **Vite** como bundler
- **Leaflet** + **React-Leaflet** para mapas
- **Leaflet.heat** para mapas de calor
- **Zustand** para estado global
- **React Query** para caché de datos
- **Tailwind CSS** para estilos
- **Chart.js** para gráficos

### ML Service
- **Python 3.11**
- **FastAPI**
- **Scikit-learn**
- **Pandas** + **NumPy**
- **HDBSCAN** para clustering

## 📋 Requisitos Previos

- Node.js >= 20
- Python >= 3.11
- PostgreSQL >= 16 con PostGIS
- Redis >= 7
- Docker & Docker Compose (opcional)

## 🛠️ Instalación

### Con Docker (Recomendado)
```bash
docker-compose up -d
```

### Manual

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### ML Service
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🔐 Variables de Entorno

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/geo_incidents
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

## 📚 API Documentation

Una vez ejecutado el backend, la documentación Swagger está disponible en:
`http://localhost:3000/api-docs`

## 👥 Roles

- **Ciudadano**: Puede reportar incidentes, ver mapa y recibir alertas
- **Administrador**: Gestiona reportes, ve estadísticas, configura categorías

## 🔑 Credenciales de Prueba

<div align="center">

| 👤 Rol | 📧 Email | 🔐 Contraseña |
|:------:|:--------:|:-------------:|
| **Admin** | `admin@geoincidents.com` | `admin123` |
| **Usuario** | `usuario@test.com` | `test123` |
| **Usuario** | `maria@test.com` | `test123` |

</div>

---

## 👨‍💻 Desarrolladores

<div align="center">

<table>
<tr>
<td align="center">
<a href="https://github.com/junidev">
<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png" width="100px;" alt="Juni Dev"/>
<br />
<sub><b>🚀 Juni Dev</b></sub>
</a>
<br />
<a href="#" title="Code">💻</a>
<a href="#" title="Documentation">📖</a>
<a href="#" title="Design">🎨</a>

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](https://github.com/junidev)

</td>
<td align="center">
<a href="https://github.com/nayelivilca">
<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Technologist.png" width="100px;" alt="Nayeli Vilca"/>
<br />
<sub><b>✨ Nayeli Vilca</b></sub>
</a>
<br />
<a href="#" title="Code">💻</a>
<a href="#" title="Documentation">📖</a>
<a href="#" title="Design">🎨</a>

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](https://github.com/nayelivilca)

</td>
</tr>
</table>

<br />

### 💝 Hecho con amor y mucho ☕

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Heart%20Hands.png" alt="Heart Hands" width="80" />

---

<sub>⭐ Si te gustó el proyecto, ¡déjanos una estrella!</sub>

</div>

## 📄 Licencia

<div align="center">

MIT License © 2025 - **Juni Dev** & **Nayeli Vilca**

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Scroll.png" alt="Scroll" width="50" />

</div>
