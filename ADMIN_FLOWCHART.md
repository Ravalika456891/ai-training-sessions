# AI Launchpad — Complete Administrator Flowcharts

This document defines the 8 core operational and architectural flowcharts for the **AI Launchpad** Administrator Portal (`https://ai-training-sessions-zeta.vercel.app/admin` and `http://localhost:5173/admin`).

---

## 1. Complete Admin Navigation Architecture

```mermaid
flowchart TD
    Start(["Admin Opens AI Launchpad Portal"]) --> AuthCheck{"Authenticated HTTP-Only Cookie?"}
    AuthCheck -- "No" --> SignIn["Redirect to /signin?redirect=/admin"]
    SignIn --> RoleCheck{"Server Role == 'admin'?"}
    AuthCheck -- "Yes" --> RoleCheck
    RoleCheck -- "No" --> AccessDenied["Render Access Restricted Screen & Return to /dashboard"]
    RoleCheck -- "Yes" --> AdminShell["Render AdminLayout (/admin)"]

    AdminShell --> NavOverview["1. Overview (/admin)"]
    AdminShell --> NavStudents["2. Students (/admin/students)"]
    AdminShell --> NavWorkshops["3. Workshops (/admin/workshops)"]
    AdminShell --> NavSessions["4. Batches & Sessions (/admin/sessions)"]
    AdminShell --> NavInstructors["5. Instructors (/admin/instructors)"]
    AdminShell --> NavEnrollments["6. Registrations & Attendance (/admin/enrollments)"]
    AdminShell --> NavPayments["7. Payments (/admin/payments)"]
    AdminShell --> NavContent["8. Content, Assignments & Notifications (/admin/content)"]
    AdminShell --> NavCertificates["9. Certificates (/admin/certificates)"]
    AdminShell --> NavAnalytics["10. Analytics (/admin/analytics)"]
    AdminShell --> NavSettings["11. Settings & Audit Logs (/admin/settings)"]
```

---

## 2. Admin Authentication and Server-Side RBAC Verification

```mermaid
flowchart TD
    A(["Admin Submits Email & Password"]) --> B["POST /api/auth/login"]
    B --> C{"Valid Credentials & Active Account?"}
    C -- "No" --> D["Return 401 Invalid Email or Password"]
    C -- "Yes" --> E["Issue Signed JWT in HTTP-Only Cookie (ai_launchpad_token)"]
    E --> F{"Check user.role === 'admin'"}
    F -- "No (learner / instructor)" --> G["Redirect to /dashboard (Block /admin)"]
    F -- "Yes (admin)" --> H["Redirect to /admin"]
    H --> I["Every Request: authenticate + requireRole('admin') Middleware"]
    I --> J{"Valid Token & Admin Role?"}
    J -- "No" --> K["Return 401/403 & Block Mutation"]
    J -- "Yes" --> L["Execute Protected Admin Controller & Record AuditLog"]
```

---

## 3. Workshop Creation and Publishing Flow

```mermaid
flowchart TD
    W1(["Admin Opens /admin/workshops"]) --> W2["Click Create Workshop Cohort or Edit Existing"]
    W2 --> W3["Configure Title, Batch Code, Dates, Timings, Capacity, Base Price, Instructor"]
    W3 --> W4{"Select Publication Status"}
    W4 -- "Draft" --> W5["Save with status = 'draft'"]
    W5 --> W6["Hidden from Public Discovery (/api/workshops)"]
    W4 -- "Published" --> W7["Validate Required Fields & Seat Capacity"]
    W7 --> W8{"Validation Passed?"}
    W8 -- "No" --> W9["Return 400 Validation Error"]
    W8 -- "Yes" --> W10["Save to MongoDB Workshop Collection + AuditLog"]
    W10 --> W11["Immediately Visible on Public Landing Page & Student Dashboard"]
```

---

## 4. Batch and Live Session Scheduling Flow

```mermaid
flowchart TD
    S1(["Admin Opens /admin/sessions"]) --> S2["Select Cohort Batch & Day (Day 1 / Day 2)"]
    S2 --> S3["Configure Session Date, Start/End Time, Timezone, Instructor"]
    S3 --> S4["Add Protected Live Meeting URL & Passcode"]
    S4 --> S5["POST /api/admin/sessions"]
    S5 --> S6["Persist in WorkshopSession Collection & Record AuditLog"]
    S6 --> S7{"Student Views /dashboard/live-classes"}
    S7 -- "Unpaid / Registered User" --> S8["View Public Schedule Preview Only (Meeting URL Stripped by Backend)"]
    S7 -- "Confirmed Paid Student" --> S9["Backend Unlocks Protected Meeting Link & Passcode"]
```

---

## 5. Payment Verification and Enrollment Confirmation Flow

```mermaid
flowchart TD
    P1(["Admin Opens /admin/payments"]) --> P2["GET /api/admin/payments"]
    P2 --> P3["Inspect Transaction Status & HMAC Signature"]
    P3 --> P4{"Transaction State?"}
    P4 -- "Captured & HMAC Verified" --> P5["Enrollment Confirmed (status='confirmed', paymentStatus='captured')"]
    P5 --> P6["Full Workshop Learning Access Unlocked"]
    P4 -- "Pending / Failed" --> P7["Admin Clicks Sync Gateway (POST /api/admin/payments/:id/reconcile)"]
    P7 --> P8["Query Trusted Razorpay Orders API"]
    P8 --> P9{"Gateway Confirms Captured?"}
    P9 -- "No" --> P10["Keep Pending/Failed (Prevent Manual Unverified Override)"]
    P9 -- "Yes" --> P11["Update Payment to Captured, Confirm Enrollment & Write AuditLog"]
```

---

## 6. Learning Materials, Assignments, and Notifications Flow

```mermaid
flowchart TD
    M1(["Admin Opens /admin/content"]) --> M2{"Select Content Workflow"}
    M2 -- "Learning Material / Website CMS" --> M3["Configure Title, Category, URL, Access Level"]
    M3 --> M4{"Access Level?"}
    M4 -- "public" --> M5["Visible to All Visitors & Registered Users"]
    M4 -- "enrolled_only" --> M6["Protected by Backend Enrollment Check"]

    M2 -- "Assignment & Submission Review" --> M7["Publish Assignment or Inspect Student Submission"]
    M7 --> M8["PATCH /api/admin/submissions/:id/review"]
    M8 --> M9["Save Instructor Feedback, Mark Approved & Write AuditLog"]

    M2 -- "Broadcast Announcement" --> M10["POST /api/admin/notifications"]
    M10 --> M11["Select Target Audience & Cohort -> Record Delivery & AuditLog"]
```

---

## 7. Attendance Verification and Certificate Issuance Flow

```mermaid
flowchart TD
    C1(["Admin Opens /admin/enrollments or /admin/certificates"]) --> C2["Mark Day 1 & Day 2 Attendance (POST /api/admin/attendance)"]
    C2 --> C3["Write Attendance Record & AuditLog"]
    C3 --> C4["Admin Checks Completion Eligibility in /admin/certificates"]
    C4 --> C5{"Confirmed Enrollment & Requirements Met?"}
    C5 -- "No" --> C6["Block Issuance & Show Pending Requirements"]
    C5 -- "Yes" --> C7["Click Approve & Issue (POST /api/admin/certificates/issue)"]
    C7 --> C8["Generate Unique Serial (AILP-CERT-2026-XXXX) & HMAC-SHA256 Hash"]
    C8 --> C9["Store in Certificate Collection & Enable Student Download + Public Verification"]
```

---

## 8. Admin-to-Student Real-Time Data Synchronization

```mermaid
flowchart LR
    subgraph AdminPortal ["Admin Console (/admin)"]
        A1["Publish Workshop / Update Price"]
        A2["Schedule Live Session & Meeting Link"]
        A3["Upload Material / Review Assignment"]
        A4["Mark Attendance & Issue Certificate"]
    end

    subgraph BackendDB ["Express REST API + MongoDB Atlas"]
        B1[("Workshops & Sessions")]
        B2[("Resources & Submissions")]
        B3[("Enrollments, Attendance & Certificates")]
    end

    subgraph StudentPortal ["Public Website & Student Dashboard (/dashboard)"]
        S1["HomePage & /dashboard/workshops"]
        S2["/dashboard/live-classes (Gated Link)"]
        S3["/dashboard/materials & /dashboard/assignments"]
        S4["/dashboard/progress & /dashboard/certificates"]
    end

    A1 --> B1 --> S1
    A2 --> B1 --> S2
    A3 --> B2 --> S3
    A4 --> B3 --> S4
```
