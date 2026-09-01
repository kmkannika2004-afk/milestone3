# Community Emergency Response Platform — Backend Setup

## Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

---

## 1. Create Virtual Environment

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

## 3. Configure Environment

```bash
copy .env.example .env
# Edit .env with your actual DB credentials, Twilio keys, etc.
```

## 4. Create PostgreSQL Database

```sql
CREATE DATABASE cerp_db;
```

## 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## 6. Create Superuser (Admin)

```bash
python manage.py createsuperuser
```

## 7. Run Development Server

```bash
# HTTP only (no WebSocket)
python manage.py runserver

# With WebSocket support (use daphne)
daphne -b 0.0.0.0 -p 8000 cerp_project.asgi:application
```

## 8. Start Celery Worker (notifications)

```bash
celery -A cerp_project worker -l info
```

## 9. Start Celery Beat (scheduled tasks)

```bash
celery -A cerp_project beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

---

## Docker (All-in-One)

```bash
docker-compose up --build
```

---

## API Documentation

Once running, open:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc:       http://localhost:8000/api/redoc/
- Admin Panel: http://localhost:8000/admin/

---

## API Endpoints Summary

| Module              | Base URL                          |
|---------------------|-----------------------------------|
| Auth / Users        | /api/v1/auth/                     |
| Society / Blocks    | /api/v1/society/                  |
| SOS Alerts          | /api/v1/sos/                      |
| Response / Escalation | /api/v1/response/               |
| Chat / Announcements | /api/v1/communication/           |

### Key Endpoints

#### Authentication
- POST /api/v1/auth/register/          — Register user
- POST /api/v1/auth/login/             — Login (returns JWT)
- POST /api/v1/auth/token/refresh/     — Refresh JWT
- POST /api/v1/auth/logout/            — Logout

#### SOS Alerts
- POST /api/v1/sos/alerts/                        — Trigger SOS
- GET  /api/v1/sos/alerts/                        — List alerts
- GET  /api/v1/sos/alerts/active/                 — Active alerts only
- POST /api/v1/sos/alerts/{id}/resolve/           — Resolve alert
- POST /api/v1/sos/alerts/{id}/cancel/            — Cancel alert
- POST /api/v1/sos/alerts/{id}/respond/           — Responder action
- POST /api/v1/sos/alerts/{id}/assign-responder/  — Assign responder
- GET  /api/v1/sos/alerts/dashboard-stats/        — Stats summary

#### Community Response
- POST /api/v1/response/escalations/manual-escalate/ — Manual escalation
- GET  /api/v1/response/incident-reports/            — All reports
- GET  /api/v1/response/incident-reports/summary/    — Analytics
- POST /api/v1/response/assignments/{id}/accept/     — Accept assignment
- POST /api/v1/response/assignments/{id}/decline/    — Decline assignment

#### Communication
- GET/POST /api/v1/communication/chat-rooms/          — Chat rooms
- POST     /api/v1/communication/chat-rooms/{id}/join/ — Join room
- GET      /api/v1/communication/chat-rooms/{id}/messages/ — Get messages
- GET/POST /api/v1/communication/announcements/       — Announcements
- GET      /api/v1/communication/contact-directory/   — Emergency contacts

#### WebSocket
- ws://localhost:8000/ws/chat/{room_id}/        — Real-time chat
- ws://localhost:8000/ws/alerts/{society_id}/   — Real-time alert updates
