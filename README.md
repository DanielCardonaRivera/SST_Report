# SST Report – TEXTILES S.A.

Dashboard de gestión y seguimiento de condiciones inseguras para TEXTILES S.A., con backend Flask + SQLite y frontend Angular 17.

---

## Inicio rápido

Hay dos formas de correr el proyecto: **con Docker** (recomendado, sin instalar nada extra) o **en modo desarrollo** (para editar código).

---

## Opción A — Docker (recomendado)

### Requisitos

| Herramienta | Versión mínima |
|---|---|
| Docker Desktop | 4.x |

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/<tu-usuario>/SST_Report.git
cd SST_Report

# 2. Construir y levantar los contenedores
docker-compose up --build

# 3. Abrir en el navegador
#    Frontend → http://localhost:4200
#    Backend  → http://localhost:5000
```

Para detener:

```bash
docker-compose down
```

> La base de datos `backend/sst.db` se crea automáticamente en la primera ejecución con 30 registros de ejemplo. Se persiste en el host mediante un volumen de Docker, por lo que los datos sobreviven al reinicio de los contenedores.

---

## Opción B — Desarrollo local

### Requisitos

| Herramienta | Versión mínima |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

### 1 · Backend (Flask)

```bash
cd backend

# Crear y activar entorno virtual
python -m venv .venv

# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar el servidor (crea sst.db y carga los 30 registros seed)
python app.py
```

El backend queda disponible en `http://localhost:5000`.

### 2 · Frontend (Angular)

Abrir una segunda terminal:

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (proxy → Flask en :5000)
npm start
```

Abrir `http://localhost:4200` en el navegador.

> `proxy.conf.json` redirige todas las peticiones `/api/*` al backend Flask para evitar problemas de CORS en desarrollo.

---

## Estructura del proyecto

```
SST_Report/
├── backend/
│   ├── app.py              # API Flask
│   ├── requirements.txt
│   └── sst.db              # generado automáticamente al iniciar
├── docker/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
├── frontend/
│   ├── proxy.conf.json     # proxy de desarrollo → Flask :5000
│   └── src/
│       └── app/
│           ├── models/
│           ├── services/
│           └── components/
├── docker-compose.yml
└── README.md
```

---

## Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/sst_data` | Reportes filtrados + KPIs + tendencia mensual |
| `GET` | `/api/sst_options` | Listas de valores: sedes, plantas, riesgos, estados, niveles |
| `POST` | `/api/sst_add_report` | Crea un nuevo reporte (estado inicial: Abierto) |
| `PUT` | `/api/sst_update_report/<id>` | Actualiza el estado de un reporte |

### Parámetros de filtro — `GET /api/sst_data`

| Parámetro | Ejemplo | Descripción |
|---|---|---|
| `sede` | `ALAMOS` | Filtra por sede |
| `planta` | `Tintorería` | Filtra por área / planta |
| `riesgo` | `Químico` | Filtra por tipo de riesgo |
| `estado` | `Abierto` | Filtra por estado |
| `desde` | `2026-01-01` | Fecha de inicio (YYYY-MM-DD) |
| `hasta` | `2026-05-14` | Fecha de fin (YYYY-MM-DD) |

---

## KPIs calculados

Los indicadores se calculan sobre el conjunto filtrado, usando **85 000 h-h** como denominador.

| Indicador | Fórmula |
|---|---|
| **IF** – Índice de Frecuencia | `accidentes (Alto/Crítico) × 200 000 / HH` |
| **IS** – Índice de Severidad | `días perdidos (accidentes × 4) × 200 000 / HH` |
| **ILI** – Índice de Lesión Incapacitante | `IF × IS / 1 000` |

---

## Tecnologías

- **Backend**: Python 3, Flask 3, Flask-CORS, SQLite 3
- **Frontend**: Angular 17 (standalone components), Chart.js 4, TypeScript 5.4
- **Infraestructura**: Docker, Docker Compose, nginx
- **Estilos**: SCSS con tema oscuro propio (sin frameworks externos)
