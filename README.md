# SACARF - Sistema Automatizado de Control de Asistencia por Reconocimiento Facial

Aplicación web full-stack para el registro de asistencia universitaria mediante reconocimiento facial. Desarrollada para la **Universidad Nacional de Loja (UNL), Ecuador**.

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Angular                   │
│                    sacarf-web                        │
│              http://localhost:4200                    │
└──────────────────┬──────────────────────────────────┘
                   │  HTTP / JSON (JWT Auth)
┌──────────────────▼──────────────────────────────────┐
│              Backend Django REST API                  │
│              http://localhost:8000/api/v1/            │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ accounts │ │ students │ │attendance│ │schedules│ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │exceptions│ │  reports │ │notific.  │ │  cloud   │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              Base de Datos (SQLite/PostgreSQL)        │
└─────────────────────────────────────────────────────┘
```

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Python 3.12, Django 4.2+, Django REST Framework |
| **Frontend** | Angular 17, TypeScript, Bootstrap 5 |
| **Base de datos** | SQLite (desarrollo) / PostgreSQL 15 (producción) |
| **Autenticación** | JWT (SimpleJWT) con refresh tokens |
| **Servicios Cloud** | AWS S3 (imágenes), AWS Rekognition (rostros), AWS SES (correos) |
| **Reportes** | ReportLab (PDF), OpenPyXL (Excel) |
| **Documentación API** | Swagger UI + ReDoc (drf-yasg) |
| **Contenedores** | Docker + docker-compose |
| **Servidor web** | Gunicorn (API), Nginx (frontend) |

## Funcionalidades Principales

- **Reconocimiento Facial**: Los estudiantes registran asistencia tomándose una foto. AWS Rekognition identifica al estudiante comparando con imágenes indexadas en S3.
- **Roles de Usuario**: Administrador, Docente y Estudiante, cada uno con permisos diferenciados.
- **Horarios Académicos**: Gestión de horarios por materia, docente, día y aula.
- **Validación por Red**: El endpoint de captura solo funciona dentro de la red universitaria (middleware de validación IP).
- **Reportes**: Reportes de asistencia exportables a PDF y Excel por estudiante, materia, docente o período.
- **Notificaciones**: Correos electrónicos para confirmación de asistencia, recuperación de contraseña, etc.
- **Seguridad**: Bloqueo de cuenta tras 5 intentos fallidos (15 min), historial de 3 contraseñas anteriores, tokens JWT con expiración.

## Estructura del Proyecto

```
Proyecto_Procesos/
├── backend/                        # Backend Django
│   ├── manage.py
│   ├── requirements.txt
│   ├── sacarf/                     # Configuración principal de Django
│   │   ├── settings.py
│   │   ├── urls.py                 # Rutas globales
│   │   ├── wsgi.py / asgi.py
│   ├── apps/                       # Aplicaciones modulares
│   │   ├── accounts/               # Usuarios, autenticación, auditoría
│   │   ├── students/               # Estudiantes, carreras, materias
│   │   ├── attendance/             # Captura e historial de asistencia
│   │   ├── schedules/              # Horarios y períodos académicos
│   │   ├── exceptions_management/  # Justificaciones y excepciones
│   │   ├── reports/                # Reportes PDF/Excel
│   │   └── notifications/          # Notificaciones
│   ├── cloud/                      # Integraciones AWS
│   │   ├── rekognition.py
│   │   ├── s3.py
│   │   └── ses.py
│   └── middleware/
│       └── network_validation.py   # Validación de IP universitaria
├── frontend/                       # Frontend Angular
│   ├── package.json
│   ├── angular.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/               # Servicios, guards, interceptors
│   │   │   ├── features/           # Componentes por módulo
│   │   │   └── ...
│   │   └── environments/           # Configuración por entorno
│   └── dist/                       # Compilación de producción
├── docker/                         # Configuración Docker
│   ├── Dockerfile                  # Backend
│   ├── frontend.Dockerfile         # Frontend (build + nginx)
│   ├── docker-compose.yml          # PostgreSQL + API + Frontend
│   ├── entrypoint.sh
│   └── default.conf                # Nginx
├── scripts/                        # Scripts auxiliares
├── .env.example                    # Plantilla de variables de entorno
└── .gitignore
```

## Requisitos

- Python 3.12+
- Node.js 20+
- npm 10+
- Docker y docker-compose (opcional, para producción)
- Cuenta AWS con S3, Rekognition y SES habilitados (para funcionalidad completa)

## Instalación y Ejecución

### 1. Variables de Entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

Variables disponibles:

| Variable | Descripción | Valor por defecto |
|----------|------------|-------------------|
| `DJANGO_SECRET_KEY` | Clave secreta de Django | `change-me-in-production` |
| `DJANGO_DEBUG` | Modo debug | `True` |
| `DB_NAME` | Nombre de BD PostgreSQL | `sacarfd` |
| `DB_USER` | Usuario BD | `postgres` |
| `DB_PASSWORD` | Contraseña BD | `postgres` |
| `DB_HOST` | Host BD | `localhost` |
| `DB_PORT` | Puerto BD | `5432` |
| `AWS_ACCESS_KEY_ID` | Access Key AWS | — |
| `AWS_SECRET_ACCESS_KEY` | Secret Key AWS | — |
| `AWS_REGION` | Región AWS | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | Bucket S3 para imágenes | `sacar-facial-images` |
| `AWS_SES_SOURCE_EMAIL` | Correo remitente SES | `noreply@sacar.unl.edu.ec` |

> **Nota**: Si no se configura PostgreSQL, el proyecto usará SQLite automáticamente para desarrollo local.

### 2. Desarrollo Local (sin Docker)

#### Backend

```bash
cd backend

# Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Iniciar servidor de desarrollo
python manage.py runserver
# API disponible en http://localhost:8000
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start        # o ng serve
# Frontend disponible en http://localhost:4200
```

### 3. Producción con Docker

```bash
docker-compose -f docker/docker-compose.yml up --build
```

Esto levanta tres servicios:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `db` | 5432 | PostgreSQL 15 |
| `api` | 8000 | Django + Gunicorn |
| `frontend` | 80 | Nginx sirviendo Angular + proxy a API |

### 4. Producción Manual

```bash
# Backend con Gunicorn
cd backend
gunicorn sacarf.wsgi:application --bind 0.0.0.0:8000 --workers 4

# Frontend compilado
cd frontend
npm run build -- --configuration production
# Servir frontend/dist/sacarf-web con Nginx o similar
```

## API Endpoints

Todas las rutas bajo el prefijo `/api/v1/`.

| Área | Endpoints | Descripción |
|------|-----------|-------------|
| **Auth** | `auth/login/`, `auth/logout/`, `auth/change-password/`, `auth/recover-password/`, `auth/reset-password/`, `auth/profile/` | Autenticación y gestión de usuarios |
| **Students** | `students/`, `students/{id}/`, `students/search/`, `students/{id}/enroll/`, `students/{id}/subjects/` | CRUD estudiantes, carreras y materias |
| **Attendance** | `attendance/records/capture/`, `attendance/records/history/` | Captura con foto e historial |
| **Schedules** | `schedules/`, `schedules/active_session/` | Horarios y períodos académicos |
| **Exceptions** | `exceptions/` | Justificaciones de inasistencia |
| **Reports** | `reports/student/`, `reports/subject/`, `reports/teacher/`, `reports/period/`, `reports/export/pdf/`, `reports/export/excel/` | Reportes y exportaciones |
| **Notifications** | `notifications/` | Notificaciones del sistema |
| **Docs** | `swagger/`, `redoc/` | Documentación interactiva de la API |

### Documentación Interactiva

Una vez corriendo el backend, acceder a:
- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/

## Configuración AWS

Para el funcionamiento completo del reconocimiento facial, se requiere:

1. **S3**: Bucket para almacenar imágenes de referencia de estudiantes.
2. **Rekognition**: Colección para indexar y buscar rostros.
3. **SES**: Identidad de correo verificada para envío de notificaciones.

Las funciones están en `backend/cloud/`:
- `rekognition.py`: `create_collection()`, `index_face()`, `search_face()`, `update_face()`, `delete_face()`
- `s3.py`: `upload_student_image()`, `delete_image()`, `generate_presigned_url()`
- `ses.py`: Envío de correos (credenciales, asistencia, recuperación, cambio de contraseña, estado de cuenta)

## Seguridad

- **JWT**: Access token (1 hora) + Refresh token (7 días) con blacklisting.
- **Bloqueo de cuenta**: 5 intentos fallidos → bloqueo por 15 minutos.
- **Historial de contraseñas**: No se permite reutilizar las últimas 3 contraseñas.
- **Validación de red**: El endpoint `capture/` solo acepta conexiones desde IPs de red privada (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) para garantizar que el registro de asistencia se realice físicamente en el campus.
- **CORS**: Configurado para permitir comunicación entre frontend y API.

## Licencia

Proyecto académico de la Universidad Nacional de Loja (UNL).
