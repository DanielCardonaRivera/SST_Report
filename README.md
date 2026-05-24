# SST Report – PROTELA S.A.

Dashboard de gestión y seguimiento de condiciones inseguras para PROTELA S.A., con backend Flask + SQLite y frontend Angular 17.

---

## Estructura del proyecto

```
SST_Report/
├── backend/
│   ├── app.py           # API Flask
│   ├── requirements.txt
│   └── sst.db           # generado automáticamente al iniciar
├── frontend/
│   ├── angular.json
│   ├── package.json
│   ├── proxy.conf.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts
│       ├── styles.scss
│       └── app/
│           ├── app.component.*
│           ├── app.config.ts
│           ├── models/sst.models.ts
│           ├── services/sst.service.ts
│           └── components/
│               ├── header/
│               ├── filter-bar/
│               ├── kpi-cards/
│               ├── charts-row/
│               ├── planta-chart/
│               ├── reports-table/
│               ├── new-report-modal/
│               └── report-detail-modal/
├── MOCKUP_SST.html      # prototipo estático original
└── README.md
```

---

## Requisitos

| Herramienta | Versión mínima |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Puesta en marcha

### 1 · Backend (Flask)

```bash
cd backend

# Crear y activar entorno virtual (recomendado)
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
La base de datos `sst.db` se crea automáticamente en la primera ejecución con 30 registros de ejemplo.

---

### 2 · Frontend (Angular)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (proxy → Flask en :5000)
npm start
```

Abrir `http://localhost:4200` en el navegador.

> El archivo `proxy.conf.json` redirige todas las peticiones `/api/*` al backend Flask, evitando problemas de CORS en desarrollo.

---

### 3 · Build de producción

```bash
cd frontend
npm run build
# Artefactos en frontend/dist/sst-report/
```

Para servir el build desde Flask se puede añadir una ruta estática en `app.py` apuntando a `dist/sst-report/browser/`.

---

## Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/sst_data` | Reportes filtrados + KPIs + tendencia mensual |
| `GET` | `/api/sst_options` | Listas de valores: sedes, plantas, riesgos, estados, niveles |
| `POST` | `/api/sst_add_report` | Crea un nuevo reporte (estado inicial: Abierto) |
| `PUT` | `/api/sst_update_report/<id>` | Actualiza el estado de un reporte |

### Parámetros de filtro para `GET /api/sst_data`

| Parámetro | Ejemplo | Descripción |
|---|---|---|
| `sede` | `ALAMOS` | Filtra por sede |
| `planta` | `Tintorería` | Filtra por área / planta |
| `riesgo` | `Químico` | Filtra por tipo de riesgo |
| `estado` | `Abierto` | Filtra por estado |
| `desde` | `2026-01-01` | Fecha de inicio (YYYY-MM-DD) |
| `hasta` | `2026-05-14` | Fecha de fin (YYYY-MM-DD) |

### Ejemplo — crear reporte

```bash
curl -X POST http://localhost:5000/api/sst_add_report \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2026-05-24",
    "sede": "ALAMOS",
    "planta": "Tintorería",
    "riesgo": "Químico",
    "nivel": "Alto",
    "descripcion": "Descripción de la condición insegura.",
    "reportador": "Juan Pérez",
    "cargo": "Operario",
    "ubicacion": "Nave 1",
    "accion": "Se señalizó el área."
  }'
```

### Ejemplo — cambiar estado

```bash
curl -X PUT http://localhost:5000/api/sst_update_report/1 \
  -H "Content-Type: application/json" \
  -d '{"estado": "En gestión"}'
```

---

## KPIs calculados

Los indicadores se calculan sobre el conjunto de reportes filtrado, usando **85 000 h-h** de período como denominador.

| Indicador | Fórmula |
|---|---|
| **IF** – Índice de Frecuencia | `accidentes (Alto/Crítico) × 200 000 / HH` |
| **IS** – Índice de Severidad | `días perdidos (accidentes × 4) × 200 000 / HH` |
| **ILI** – Índice de Lesión Incapacitante | `IF × IS / 1 000` |

---

## Tecnologías

- **Backend**: Python 3, Flask 3, Flask-CORS, SQLite 3
- **Frontend**: Angular 17 (standalone components), Chart.js 4, TypeScript 5.4
- **Estilos**: SCSS con tema oscuro propio (sin frameworks externos)
