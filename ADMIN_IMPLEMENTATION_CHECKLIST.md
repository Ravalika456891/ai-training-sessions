# AI Launchpad — Admin Implementation Checklist

This checklist tracks the audit, architecture documentation, backend API implementation, frontend UI integration, and security verification across all 22 requirements.

---

## 1. Documentation & Architecture Deliverables
- [x] `ADMIN_FLOWCHART.md` — 8 complete Mermaid flowcharts (Navigation, Auth & RBAC, Workshop Publishing, Batch & Live Session Scheduling, Payment Verification, Materials/Assignments/Notifications, Attendance & Certificates, Admin-to-Student Sync)
- [x] `ADMIN_USER_JOURNEY.md` — Step-by-step narrative of all administrator workflows
- [x] `ADMIN_ACCESS_MATRIX.md` — Role-Based Access Control (RBAC) matrix across `guest`, `learner`, `instructor`, and `admin`
- [x] `ADMIN_API_MAPPING.md` — Complete mapping between React Admin pages, Express endpoints, controllers, and Mongoose models
- [x] `ADMIN_IMPLEMENTATION_CHECKLIST.md` — Verification and implementation status checklist

---

## 2. Admin Portal Functional Modules
- [x] **Admin Authentication & RBAC (`/signin`, `/admin`, `ProtectedRoute.tsx`, `auth.middleware.ts`)**
  - Server-side JWT verification via HTTP-only cookie (`ai_launchpad_token`)
  - Public registration strictly creates `role: 'learner'` (privilege escalation blocked)
  - Non-admin users visiting `/admin` see "Access Restricted" and are redirected to `/dashboard`
  - Admin users see direct **Admin Console** buttons in the public Navbar and Student Dashboard (`/dashboard`)
- [x] **Admin Dashboard Overview (`AdminOverview.tsx`, `GET /api/admin/dashboard`)**
  - Displays real MongoDB metrics: Total Registered Students, Confirmed Enrollments, Upcoming Workshops, Verified Revenue, Attendance Rate, Issued Certificates, Enrollment & Revenue Trends, Recent Registrations, Upcoming Sessions, and Pending Actions
- [x] **User / Student Management (`AdminStudents.tsx`, `GET /api/admin/students`, `GET /api/admin/users`)**
  - Search by name/email/phone, filter by account status & category, inspect student enrollment/payment history, suspend or reactivate learner accounts with audit logging (admin self-suspension blocked)
- [x] **Workshop & Batch Management (`AdminWorkshops.tsx`, `GET/POST/PATCH/DELETE /api/admin/workshops`, `/api/admin/batches`)**
  - Create, edit, publish, unpublish (`draft`), archive, and delete empty workshops
  - Deletion of workshops with existing enrollments is blocked (`409 Conflict`)
  - Only `published` workshops appear in public discovery (`GET /api/workshops`)
- [x] **Class Calendar & Anytime Scheduling (`AdminCalendar.tsx`, `/admin/calendar`, `GET/POST/PATCH /api/admin/calendar/*`)**
  - Month View, Week View, Day View, and Agenda/List View with Today, Prev/Next, Date Picker, Search, and Filters (Workshop, Batch, Instructor, Status, Class Type, Date Range)
  - Anytime scheduling on any valid future date & arbitrary 12-hour AM/PM time with configurable duration, IANA timezone, meeting provider, and protected meeting link
  - Backend-enforced conflict detection (`existingStart < newEnd && existingEnd > newStart`) across instructors, batches, and meeting rooms (`409 Conflict`)
  - Edit, reschedule, cancel (retaining history as `status: 'cancelled'`), and recurring class generator (`daily`, `weekly`, `weekdays`) with live occurrence preview
  - Synchronized with Student Dashboard (`DashboardLiveClasses.tsx`) with `.ics` calendar invitation download and Google Calendar links for confirmed enrolled students
- [x] **Live Session Scheduling (`AdminSessions.tsx`, `GET/POST/PATCH /api/admin/sessions`)**
  - Configure Day 1 & Day 2 dates, timings, timezones, instructors, capacities, and protected meeting links/passcodes
  - Meeting links are hidden from unpaid users in `GET /api/learners/live-classes`
- [x] **Instructor Management (`AdminInstructors.tsx`, `GET/POST/PATCH /api/admin/instructors`)**
  - Add/manage instructor biographies, expertise tags, assigned cohorts, and availability status
- [x] **Payment Ledger & Gateway Reconciliation (`AdminPayments.tsx`, `GET /api/admin/payments`, `POST /api/admin/payments/:id/reconcile`)**
  - Displays captured revenue, pending orders, failed attempts, refunded totals, and HMAC signature verification status
  - Gateway sync reconciles against Razorpay API; manual unverified paid overrides are strictly forbidden
  - Financial CSV export included
- [x] **Enrollment & Attendance Management (`AdminEnrollments.tsx`, `GET /api/admin/enrollments`, `PATCH /api/admin/enrollments/:id/cancel`, `POST /api/admin/attendance`)**
  - Filter by status and payment state, cancel enrollments with seat release and audit reason
  - Interactive Day 1 & Day 2 attendance toggles (`D1` / `D2`) with audit logging
- [x] **Learning Materials, Assignments, Submissions Review & Notifications (`AdminContent.tsx`)**
  - Upload/manage PDFs, Prompt Templates, Code Repositories, Assignments, FAQs, Testimonials, and Website CMS sections with `public` vs `enrolled_only` access control
  - Review student capstone/assignment submissions and publish instructor feedback (`PATCH /api/admin/submissions/:id/review`)
  - Broadcast cohort announcements and reminders (`POST /api/admin/notifications`)
- [x] **Certificate Issuance & Revocation (`AdminCertificates.tsx`, `GET /api/admin/certificates`, `POST /api/admin/certificates/issue`, `PATCH /api/admin/certificates/:id/revoke`)**
  - Evaluates completion eligibility, prevents duplicate issuance, generates unique serial numbers (`AILP-CERT-2026-XXXX`) + HMAC-SHA256 verification hash, and supports audited revocation
- [x] **Analytics & Platform Settings (`AdminAnalytics.tsx`, `AdminSettings.tsx`, `GET /api/admin/analytics`, `GET/PATCH /api/admin/settings`, `GET /api/admin/audit-logs`)**
  - Cohort fill-rate & revenue breakdown reports
  - Platform branding, seat limits, instructor permissions, and immutable security audit log viewer
