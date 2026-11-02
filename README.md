# AI Launchpad — 2-Day Hands-On AI Bootcamp

Production-grade MERN Stack web application for high-converting Generative AI training cohorts, with real-time seat reservation, atomic concurrency controls, secure JWT authentication, and **Razorpay Payment Gateway Integration**.

---

## Architecture & Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React icons
- **Backend:** Node.js, Express.js (v4/v5), TypeScript
- **Database:** MongoDB Atlas with Mongoose ODM
- **Payment Gateway:** Razorpay REST API, Webhooks, HMAC-SHA256 verification
- **Authentication:** Stateless dual-token JWT delivered via secure, HTTP-only cookies (`SameSite=Lax/Strict`, `HttpOnly=true`)
- **API Architecture:** REST API with Zod validation, Helmet security headers, rate limiting, and centralized error handling

---

## Directory Structure

```
.
├── client/                     # React 19 + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── checkout/       # CheckoutModal (Razorpay checkout, coupon discounts, GST calculation)
│   │   │   ├── common/         # Button, Badge, Card
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   └── sections/       # Hero, Curriculum, Tools, Mentors, Reviews, Pricing, Registration, FAQ
│   │   ├── context/            # AuthContext (state, login, logout, profile)
│   │   ├── data/               # Configurable workshop dataset & fallback
│   │   ├── services/           # API client with Razorpay order creation & signature verification
│   │   ├── utils/              # Razorpay checkout.js script loader
│   │   └── types/              # Domain TypeScript types
│   ├── vite.config.ts          # Dev server & /api proxy to Express backend
│   └── package.json
│
├── server/                     # Node.js + Express + Mongoose backend
│   ├── src/
│   │   ├── config/             # Environment, DB & Razorpay client initialization
│   │   ├── controllers/        # Auth, Workshop, Enrollment, and Payment controllers
│   │   ├── middleware/         # Auth, RBAC, RateLimiter, Validator, ErrorHandler
│   │   ├── models/             # User, Workshop, Enrollment, Payment models
│   │   ├── routes/             # REST API routes (/api/auth, /api/workshops, /api/enrollments, /api/payments)
│   │   ├── services/           # Payment HMAC verification, webhook idempotency, seat management
│   │   ├── utils/              # JWT, ApiError, Database Seeder
│   │   ├── validators/         # Strict Zod schemas for payments and orders
│   │   ├── app.ts              # Express configuration & security pipeline
│   │   └── server.ts           # Server bootstrap & graceful shutdown
│   ├── .env.example            # Environment variables template
│   └── package.json
│
├── HLD.md                      # Complete High-Level Design document
└── README.md
```

---

## Quickstart: Running Locally

### 1. Backend Setup
```bash
cd server
npm install
```

Configure your credentials in `server/.env`:
```bash
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai_launchpad?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
CLIENT_ORIGIN=http://localhost:5173

# Razorpay Test Credentials (Never expose Key Secret to client)
RAZORPAY_KEY_ID=rzp_test_YourTestKeyId
RAZORPAY_KEY_SECRET=YourTestKeySecret12345
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecret67890
```

Compile and run the server:
```bash
npm run build
npm start
```
The REST API will be available at: `http://localhost:5000/api`

### 2. Frontend Setup
In a second terminal:
```bash
cd client
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## Phase 4: Payment System & Verification Architecture

### Dual-Path Verification
1. **Client Callback Verification (`POST /api/payments/verify`):**
   - Razorpay Checkout modal returns `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`.
   - Backend calculates HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET` and compares with `crypto.timingSafeEqual`.
   - Updates `Payment` status to `'captured'` and `Enrollment` status to `'confirmed'`.
   - Atomically decrements `reservedCount` and increments `enrolledCount` on the `Workshop` record.
2. **Server-to-Server Webhook (`POST /api/payments/webhook`):**
   - Cryptographically validates `x-razorpay-signature` against `RAZORPAY_WEBHOOK_SECRET`.
   - Idempotently processes events (`payment.captured`, `payment.failed`).

### Built-In Valid Test Coupons
- `LAUNCH10`: 10% discount on base registration fee
- `EARLYBIRD`: Flat ₹300 discount
- `AIFIRST`: Flat ₹500 community discount

---

## Payment REST API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create-order` | Public/Auth | Creates server-calculated order, applies coupon, calculates GST |
| `POST` | `/api/payments/verify` | Public/Auth | Cryptographically validates HMAC-SHA256 signature & confirms seat |
| `POST` | `/api/payments/webhook` | Webhook | Asynchronous idempotent server-to-server Razorpay webhook handler |
| `POST` | `/api/payments/validate-coupon`| Public | Checks coupon validity and returns discount breakdown |
| `GET` | `/api/payments/my-payments` | Authenticated | Retrieves payment history for authenticated learner |
| `GET` | `/api/payments/enrollment/:id`| Public | Retrieves payment and order details for a specific enrollment |

---

## Phase 5: Post-Enrollment Experience & Admin Operations

### 1. Learner Self-Service Dashboard
- **Access:** Direct from top navbar after signing in or completing enrollment.
- **Enrolled Workshops:** Live batch schedule, direct Google Meet / Zoom link, agenda, and instructor info.
- **Resource Repository:** One-click download for 40+ production AI prompt templates, starter code repositories, slide decks, and tool discount codes.
- **Capstone Project Submission:** Form to submit GitHub repository URL, live demo URL, and architectural notes for peer & mentor review.
- **Issued Credentials:** Preview earned certificates with credential ID, issuance date, and single-click copy of the public verification link.

### 2. Admin Operations Console
- **Access:** Role-restricted (`role: 'admin'`). Accessible via "Admin Ops" badge in navbar.
- **Live Metrics Dashboard:** Real-time Gross Revenue, Active Enrollments, Live Batches, and Capacity Utilization percentage.
- **Cohort Roster & Search:** Full attendee directory with payment status badges, search by learner name/email, and one-click CSV roster download.
- **Attendance Checklist:** Day 1 and Day 2 live session toggle tracker per learner.
- **Certificate Issuance Pipeline:** Single-click generation of verifiable serial numbers (`AILP-YYYY-XXXXXX`) for completed learners.

### 3. Public Certificate Verification Portal
- **Access:** Direct modal via "Verify Cert" on the navigation bar.
- **Zero-Login Required:** Anyone (employers, recruiters, clients) can verify the authenticity of a credential.
- **Verification Data:** Learner name, workshop title, cohort completion date, instructor name, and verified security stamp.

### Learner & Admin REST API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/learners/dashboard` | Authenticated | Retrieves learner's enrolled cohorts, live links, and materials |
| `POST` | `/api/learners/submissions` | Authenticated | Submits capstone project GitHub/demo URL for grading |
| `GET` | `/api/learners/certificates` | Authenticated | Retrieves all verified certificates issued to the learner |
| `GET` | `/api/admin/metrics` | Admin | Aggregate revenue, seat occupancy, and enrollment metrics |
| `GET` | `/api/admin/roster/:id` | Admin | Complete cohort roster with search and attendance status |
| `POST` | `/api/admin/attendance` | Admin | Updates Day 1 / Day 2 attendance status for an attendee |
| `POST` | `/api/admin/certificates/issue`| Admin | Issues official certificate with unique serial number |
| `GET` | `/api/certificates/verify/:serial`| Public | Validates authentic certificate details for employers & recruiters |
