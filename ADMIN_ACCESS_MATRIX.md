# Admin Access Matrix

| UI Section | Required Role | Main API Endpoints (method) | Description |
|------------|---------------|----------------------------|-------------|
| Dashboard / Overview | `admin` | `GET /api/admin/dashboard` (GET) – loads all metrics | Shows high‑level platform statistics. |
| Student Management | `admin` | `GET /api/admin/students` (GET) – list, `GET /api/admin/students/:id` (GET) – detail, `PATCH /api/admin/students/:id/status` (PATCH) – update status | Search, view, suspend/reactivate users. |
| Workshop Management | `admin` | `GET /api/admin/workshops` (GET), `POST /api/admin/workshops` (POST), `PATCH /api/admin/workshops/:id` (PATCH), `DELETE /api/admin/workshops/:id` (DELETE) | Create, edit, publish, delete workshops. |
| Batch Management | `admin` | `GET /api/admin/sessions` (GET) – list batches/sessions, `POST /api/admin/sessions` (POST), `PATCH /api/admin/sessions/:id` (PATCH) | Create and schedule batches (sessions). |
| Instructor Management | `admin` | `GET /api/admin/instructors` (GET), `POST /api/admin/instructors` (POST), `PATCH /api/admin/instructors/:id` (PATCH) | Manage instructor profiles. |
| Enrollment Management | `admin` | `GET /api/admin/enrollments` (GET), `PATCH /api/admin/enrollments/:id/cancel` (PATCH) | View and cancel enrollments, enforce capacity rules. |
| Payment Management | `admin` | `GET /api/admin/payments` (GET), `POST /api/admin/payments/:id/reconcile` (POST) | Review payments, reconcile pending/failed. |
| Live Class / Session Management | `admin`, `instructor` | `GET /api/admin/sessions` (GET), `POST /api/admin/sessions` (POST), `PATCH /api/admin/sessions/:id` (PATCH) | Schedule live class sessions, protect meeting links. |
| Learning Materials | `admin`, `instructor` | `GET /api/admin/content` (GET), `POST /api/admin/content` (POST), `PATCH /api/admin/content/:id` (PATCH), `DELETE /api/admin/content/:id` (DELETE) | Upload PDFs, videos, set visibility. |
| Assignment Management | `admin`, `instructor` | `GET /api/admin/assignments` (GET), `POST /api/admin/assignments` (POST), `PATCH /api/admin/assignments/:id` (PATCH) | Create assignments, set deadlines, review submissions. |
| Certificate Management | `admin` | `GET /api/admin/certificates` (GET), `POST /api/admin/certificates/issue` (POST), `PATCH /api/admin/certificates/:id/revoke` (PATCH) | Issue and revoke certificates after eligibility checks. |
| Analytics | `admin` | `GET /api/admin/analytics` (GET) | Generate reports, export CSV. |
| Platform Settings | `admin` | `GET /api/admin/settings` (GET), `PATCH /api/admin/settings` (PATCH) | Update whitelisted configuration keys. |
| Audit Logs | `admin` | `GET /api/admin/audit-logs` (GET) – paginated | View immutable action logs. |
| Notifications | `admin` | `GET /api/admin/notifications` (GET), `POST /api/admin/notifications` (POST), `PATCH /api/admin/notifications/:id` (PATCH) | Create announcements, schedule delivery. |
| Logout | `admin` | `POST /auth/logout` (POST) | Clears HTTP‑only auth cookie and redirects to public site. |

*All routes are protected by `authenticate` middleware and `requireRole('admin')` (or `requireRole('admin','instructor')` where indicated).*