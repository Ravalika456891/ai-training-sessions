# Admin User Journey

The admin experience follows a strict, secure, role‑based flow from initial login to all subsequent management actions. Below is a step‑by‑step narrative of what the admin sees and what the backend does at each stage.

---

## 1. Access Admin Portal
1. **Open** `https://ai‑training‑sessions‑zeta.vercel.app/admin`.
2. The **router** checks if a session cookie (`ai_launchpad_token`) exists.
3. If **no cookie**, the user is redirected to `/admin/login` (public login page).
4. If a cookie exists, the **auth middleware** validates the JWT and populates `req.user`.
5. **Require‑role middleware** verifies `req.user.role === 'admin'`.
6. If the role check fails, the admin receives an **Access Denied** screen and is redirected to the public site.

---

## 2. Admin Dashboard (Home)
1. After successful authentication, the admin lands on the **Dashboard** (`/admin`).
2. The **frontend** calls `GET /api/admin/dashboard`.
3. The controller aggregates real‑time metrics from MongoDB (users, workshops, enrollments, payments, attendance, certificates, etc.) and falls back to the in‑memory `memoryStore` when needed.
4. The dashboard renders widgets:
   - Total Registered Students
   - Active Students
   - Upcoming Workshops
   - Confirmed / Pending Enrollments
   - Verified Revenue
   - Attendance %
   - Capacity Fill Rate
   - Recent Registrations & Upcoming Sessions
   - Pending Administrative Actions
5. Clicking any widget navigates to the corresponding management page.

---

## 3. User Management
1. Admin selects **Users** from the sidebar → route `/admin/users`.
2. Frontend issues `GET /api/admin/students` with optional query params (`search`, `status`, `category`, `page`, `limit`).
3. Controller returns a paginated list of sanitized user objects (passwords stripped).
4. Admin can **search**, **filter**, and **select** a user.
5. On a user detail view, admin may **patch** the user status (`PATCH /api/admin/students/:id/status`) to suspend or reactivate.
6. All mutations are logged via `logAudit` and stored in `AuditLog`.

---

## 4. Workshop Management
1. Admin navigates to **Workshops** → `/admin/workshops`.
2. `GET /api/admin/workshops` returns all workshop documents.
3. To **create** a workshop, admin clicks **New Workshop**, fills a form, and submits `POST /api/admin/workshops`.
4. Backend validates required fields (title, curriculum, capacity, price, dates, instructor) and saves the document.
5. Admin can **save as draft** (status=`draft`) or **publish** (status=`published`). Drafts are hidden from the public site.
6. Editing uses `PATCH /api/admin/workshops/:id`; deleting uses `DELETE /api/admin/workshops/:id` (soft‑delete with audit log).

---

## 5. Batch Management
1. From a workshop detail, admin clicks **Batches** → `/admin/workshops/:id/batches`.
2. `GET /api/admin/batches?workshopId=...` lists existing batches.
3. **Create Batch** → `POST /api/admin/batches` with payload `{ workshopId, batchCode, startDate, endDate, capacity, instructorId }`.
4. The system checks **capacity limits** and **date conflicts** before persisting.
5. Published batches become selectable for student enrollment; cancelled batches are flagged and hidden.

---

## 6. Instructor Management
1. Admin opens **Instructors** → `/admin/instructors`.
2. `GET /api/admin/instructors` returns all instructor records.
3. **Add Instructor** → `POST /api/admin/instructors` with profile data.
4. **Edit** → `PATCH /api/admin/instructors/:id`.
5. Sensitive fields (e.g., payment details) are never exposed; only public profile info is returned.

---

## 7. Enrollment Management
1. Admin visits **Enrollments** → `/admin/enrollments`.
2. `GET /api/admin/enrollments` returns enrolments with status (`pending`, `confirmed`, `cancelled`, `expired`).
3. Admin can **cancel** an enrollment (`PATCH /api/admin/enrollments/:id/cancel`). The controller refunds via Razorpay if payment captured and updates enrollment status.
4. Capacity checks prevent over‑booking when confirming pending enrollments.

---

## 8. Payment Management & Reconciliation
1. **Payments** page → `/admin/payments`.
2. `GET /api/admin/payments` lists all Razorpay transactions with status.
3. For any **pending** or **failed** payment, admin can invoke `POST /api/admin/payments/:id/reconcile` which:
   - Calls Razorpay API to fetch latest status.
   - Updates the local `Payment` document.
   - If now **captured**, marks associated enrollment as `confirmed`.
4. Admin cannot manually set a payment to *captured* without Razorpay verification – the endpoint enforces this.

---

## 9. Live Class / Session Management
1. Admin selects **Live Classes** → `/admin/sessions`.
2. `GET /api/admin/sessions` (admin & instructor view) lists all scheduled sessions.
3. To **create / update** a session, admin uses `POST /api/admin/sessions` (or `PATCH`). Payload includes:
   - `workshopId`, `batchId`, `instructorId`, `startTime`, `duration`, `meetingLink` (protected URL).
4. The meeting link is stored encrypted and only sent to authenticated students who have a confirmed enrollment.
5. Public API never returns the protected meeting URL.

---

## 10. Learning Materials Management
1. Admin opens **Materials** → `/admin/materials`.
2. `GET /api/admin/content` returns all resources.
3. **Upload** a new resource using `POST /api/admin/content` with `multipart/form-data` (file stored in S3‑compatible bucket).
4. Visibility flag (`public_preview` | `enrolled_only`) determines who can download:
   - Public preview: accessible to anyone.
   - Enrolled only: backend checks enrollment before serving the file.

---

## 11. Assignment Management
1. Admin navigates to **Assignments** → `/admin/assignments`.
2. `GET /api/admin/assignments` list.
3. **Create** via `POST /api/admin/assignments` with deadline and workshop/batch association.
4. Students submit through the student portal; admin can **review** and **feedback** via `PATCH /api/admin/assignments/:id`.

---

## 12. Certificate Management
1. Admin opens **Certificates** → `/admin/certificates`.
2. `GET /api/admin/certificates` lists issued certificates.
3. To **issue**, admin selects a student & workshop and calls `POST /api/admin/certificates/issue`.
4. Backend verifies **completion criteria** (attendance, assignment grades, etc.) before generating a PDF, storing it in the DB, and returning a download token.
5. Revoking uses `PATCH /api/admin/certificates/:id/revoke` (audit logged).

---

## 13. Analytics & Reporting
1. Admin accesses **Analytics** → `/admin/analytics`.
2. UI allows date range / workshop filter selection.
3. `GET /api/admin/analytics?from=...&to=...&workshopId=...` returns aggregated metrics (registrations, revenue, attendance, completion).
4. Data is rendered as charts using Tailwind‑compatible components.

---

## 14. Settings & Audit Logs
1. **Settings** page → `/admin/settings`.
2. `GET /api/admin/settings` returns whitelist‑validated config values.
3. `PATCH /api/admin/settings` updates allowed keys only; every change creates an audit entry.
4. **Audit Logs** → `/admin/audit-logs` with pagination (`GET /api/admin/audit-logs?page=&limit=`) to review historical actions.

---

## 15. Notifications
1. Admin selects **Notifications** → `/admin/notifications`.
2. `GET /api/admin/notifications` lists previous announcements.
3. **Create** new notification via `POST /api/admin/notifications` with target audience (`all`, `batchId`, `workshopId`).
4. Immediate **dispatch** uses the internal messaging service; scheduled notifications store a `sendAt` timestamp and a background job processes them.
5. Delivery status is recorded in the notification document.

---

## 16. Logout Flow
1. Admin clicks **Sign Out** in the layout.
2. Frontend calls `POST /auth/logout` which clears the HTTP‑only cookie.
3. Upon success, the UI redirects to the public landing page (`/`).

---

*All actions respect RBAC, input validation via Zod, CSRF protection, and audit logging, ensuring a secure and traceable admin experience.*
