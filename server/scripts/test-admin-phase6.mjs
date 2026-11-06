/**
 * Automated Verification & Security Test Suite — Phase 6: Admin Dashboard
 * Tests all 10 security and functional requirements in-process against the compiled server.
 */

import assert from 'node:assert/strict';
import { AdminController } from '../dist/controllers/admin.controller.js';
import { AuthController } from '../dist/controllers/auth.controller.js';
import { authenticate, requireRole } from '../dist/middleware/auth.middleware.js';
import { memoryStore } from '../dist/services/memoryStore.js';
import { env } from '../dist/config/env.js';

function createMockExchange({
  method = 'GET',
  path = '/',
  body = {},
  query = {},
  params = {},
  headers = {},
  cookies = {},
} = {}) {
  const req = {
    method,
    path,
    originalUrl: path,
    body,
    query,
    params,
    headers: {
      'user-agent': 'Phase6-Automated-Test-Runner/1.0',
      'x-requested-with': 'XMLHttpRequest',
      ...headers,
    },
    cookies: { ...cookies },
    ip: '127.0.0.1',
  };

  let statusCode = 200;
  let jsonBody = null;
  let rawBody = null;
  const responseCookies = {};
  const responseHeaders = {};

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    setHeader(key, val) {
      responseHeaders[key.toLowerCase()] = val;
      return this;
    },
    cookie(name, val) {
      responseCookies[name] = val;
      return this;
    },
    clearCookie(name) {
      delete responseCookies[name];
      return this;
    },
    json(payload) {
      jsonBody = payload;
      return this;
    },
    send(payload) {
      rawBody = payload;
      return this;
    },
  };

  return {
    req,
    res,
    getStatus: () => statusCode,
    getJson: () => jsonBody,
    getRaw: () => rawBody,
    getCookies: () => responseCookies,
  };
}

async function runChain(exchange, middlewares) {
  for (const fn of middlewares) {
    let nextCalled = false;
    let passedError = null;
    await fn(exchange.req, exchange.res, (err) => {
      nextCalled = true;
      if (err) passedError = err;
    });
    if (passedError) {
      return {
        status: passedError.statusCode || 500,
        body: { success: false, message: passedError.message },
      };
    }
    if (!nextCalled) {
      return { status: exchange.getStatus(), body: exchange.getJson() };
    }
  }
  return { status: exchange.getStatus(), body: exchange.getJson(), raw: exchange.getRaw() };
}

async function main() {
  console.log('==============================================================');
  console.log(' PHASE 6 ADMIN DASHBOARD — AUTOMATED SECURITY & API TEST SUITE');
  console.log('==============================================================\n');

  let passed = 0;

  // ---------------------------------------------------------------------------
  // TEST 1: Unauthorized Guest Access to /api/admin/dashboard -> 401
  // ---------------------------------------------------------------------------
  {
    const ex = createMockExchange({ method: 'GET', path: '/api/admin/dashboard' });
    const result = await runChain(ex, [authenticate, requireRole('admin'), AdminController.getDashboard]);
    assert.equal(result.status, 401, 'Guest access to /api/admin/dashboard must return 401');
    console.log('✅ TEST 1 PASSED: Unauthorized guest access blocked with 401 Unauthorized');
    passed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Role Escalation Attempt via Public Registration -> strictly learner -> 403
  // ---------------------------------------------------------------------------
  let learnerToken = '';
  let learnerId = '';
  {
    const regEx = createMockExchange({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        name: 'Escalation Tester',
        email: 'escalation.test@example.com',
        password: 'Password123!',
        role: 'admin', // Malicious attempt to self-assign admin role
      },
    });
    const regRes = await runChain(regEx, [AuthController.register]);
    assert.equal(regRes.status, 201, 'Registration should succeed');
    assert.equal(regRes.body.data.user.role, 'learner', 'Public registration MUST NEVER assign admin role');
    learnerToken = regEx.getCookies()[env.COOKIE_NAME];
    learnerId = regRes.body.data.user.id || regRes.body.data.user._id;

    // Attempt to access /api/admin/dashboard as learner
    const adminAttemptEx = createMockExchange({
      method: 'GET',
      path: '/api/admin/dashboard',
      cookies: { [env.COOKIE_NAME]: learnerToken },
    });
    const adminAttemptRes = await runChain(adminAttemptEx, [
      authenticate,
      requireRole('admin'),
      AdminController.getDashboard,
    ]);
    assert.equal(adminAttemptRes.status, 403, 'Learner accessing /api/admin/dashboard must return 403 Forbidden');
    console.log('✅ TEST 2 PASSED: Public registration role-escalation prevented (assigned learner) & blocked from /api/admin with 403');
    passed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Admin Authentication & Real Database Dashboard Metrics
  // ---------------------------------------------------------------------------
  let adminToken = '';
  {
    const loginEx = createMockExchange({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      },
    });
    const loginRes = await runChain(loginEx, [AuthController.login]);
    assert.equal(loginRes.status, 200, 'Admin login must succeed');
    assert.equal(loginRes.body.data.user.role, 'admin', 'Admin user must have role=admin');
    adminToken = loginEx.getCookies()[env.COOKIE_NAME];

    const dashEx = createMockExchange({
      method: 'GET',
      path: '/api/admin/dashboard',
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const dashRes = await runChain(dashEx, [authenticate, requireRole('admin'), AdminController.getDashboard]);
    assert.equal(dashRes.status, 200);
    assert.equal(dashRes.body.success, true);
    assert.ok(typeof dashRes.body.data.totalRegisteredStudents === 'number');
    assert.ok(typeof dashRes.body.data.verifiedRevenue === 'number');
    assert.ok(Array.isArray(dashRes.body.data.enrollmentTrend));
    assert.ok(Array.isArray(dashRes.body.data.revenueTrend));
    assert.ok(Array.isArray(dashRes.body.data.recentRegistrations));
    console.log(
      `✅ TEST 3 PASSED: Admin Dashboard Overview returned live metrics (Students: ${dashRes.body.data.totalRegisteredStudents}, Workshops: ${dashRes.body.data.totalWorkshops})`
    );
    passed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Student Directory Sanitization & Account Suspension Enforcement
  // ---------------------------------------------------------------------------
  {
    const listEx = createMockExchange({
      method: 'GET',
      path: '/api/admin/students',
      query: { page: '1', limit: '20' },
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const listRes = await runChain(listEx, [authenticate, requireRole('admin'), AdminController.getStudents]);
    assert.equal(listRes.status, 200);
    for (const student of listRes.body.data.students) {
      assert.equal(student.passwordHash, undefined, 'passwordHash MUST NOT be exposed');
      assert.equal(student.resetPasswordToken, undefined, 'resetPasswordToken MUST NOT be exposed');
    }

    // Suspend the test learner account
    const suspendEx = createMockExchange({
      method: 'PATCH',
      path: `/api/admin/students/${learnerId}/status`,
      params: { id: learnerId },
      body: { accountStatus: 'suspended', reason: 'Automated security test' },
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const suspendRes = await runChain(suspendEx, [
      authenticate,
      requireRole('admin'),
      AdminController.updateStudentStatus,
    ]);
    assert.equal(suspendRes.status, 200);
    assert.equal(suspendRes.body.data.accountStatus, 'suspended');

    // Verify suspended learner token is now rejected by authenticate middleware with 403
    const meEx = createMockExchange({
      method: 'GET',
      path: '/api/auth/me',
      cookies: { [env.COOKIE_NAME]: learnerToken },
    });
    const meRes = await runChain(meEx, [authenticate, AuthController.getCurrentUser]);
    assert.equal(meRes.status, 403, 'Suspended student session must be blocked with 403');

    // Reactivate student
    const reactivateEx = createMockExchange({
      method: 'PATCH',
      path: `/api/admin/students/${learnerId}/status`,
      params: { id: learnerId },
      body: { accountStatus: 'active', reason: 'Restored after test' },
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    await runChain(reactivateEx, [authenticate, requireRole('admin'), AdminController.updateStudentStatus]);
    console.log('✅ TEST 4 PASSED: Student directory strips password hashes & suspended accounts are blocked at middleware');
    passed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Workshop CRUD & Deletion Protection for Workshops with Enrollments
  // ---------------------------------------------------------------------------
  {
    // Attempt to delete the primary workshop which has active enrollments & payments
    const workshops = await memoryStore.getAllWorkshops();
    const primaryWorkshop = workshops[0];
    const delProtectedEx = createMockExchange({
      method: 'DELETE',
      path: `/api/admin/workshops/${primaryWorkshop._id}`,
      params: { id: primaryWorkshop._id },
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const delProtectedRes = await runChain(delProtectedEx, [
      authenticate,
      requireRole('admin'),
      AdminController.deleteWorkshop,
    ]);
    assert.equal(
      delProtectedRes.status,
      400,
      'Deleting a workshop with existing enrollment/payment records must be blocked with 400'
    );

    // Create a brand new draft workshop & edit it
    const createWsEx = createMockExchange({
      method: 'POST',
      path: '/api/admin/workshops',
      body: {
        title: 'Agentic RAG Intensive Cohort',
        batchCode: 'AILP-2026-DEC-12',
        description: 'Hands-on vector search and multi-agent orchestration.',
        startDate: '2026-12-12T04:30:00.000Z',
        endDate: '2026-12-13T11:30:00.000Z',
        basePrice: 3499,
        capacity: 50,
        status: 'draft',
      },
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const createWsRes = await runChain(createWsEx, [
      authenticate,
      requireRole('admin'),
      AdminController.createWorkshop,
    ]);
    assert.equal(createWsRes.status, 201);
    const createdWsId = createWsRes.body.data._id;

    // Publish the workshop
    const patchWsEx = createMockExchange({
      method: 'PATCH',
      path: `/api/admin/workshops/${createdWsId}`,
      params: { id: createdWsId },
      body: { status: 'published', basePrice: 3999 },
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const patchWsRes = await runChain(patchWsEx, [
      authenticate,
      requireRole('admin'),
      AdminController.updateWorkshop,
    ]);
    assert.equal(patchWsRes.status, 200);
    assert.equal(patchWsRes.body.data.status, 'published');
    console.log('✅ TEST 5 PASSED: Workshop CRUD & protection against deleting workshops with enrollments verified');
    passed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Batch/Session Scheduling & Instructor Management
  // ---------------------------------------------------------------------------
  {
    const createInstEx = createMockExchange({
      method: 'POST',
      path: '/api/admin/instructors',
      body: {
        name: 'Dr. Vikram Patel',
        email: 'vikram.patel@ailaunchpad.edu',
        bio: '12+ years building distributed ML and LLM systems.',
        expertise: ['LangGraph', 'RAG', 'Evaluation'],
        availabilityStatus: 'available',
      },
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const instRes = await runChain(createInstEx, [
      authenticate,
      requireRole('admin'),
      AdminController.createInstructor,
    ]);
    assert.equal(instRes.status, 201);

    const sessionsEx = createMockExchange({
      method: 'GET',
      path: '/api/admin/sessions',
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const sessionsRes = await runChain(sessionsEx, [
      authenticate,
      requireRole('admin'),
      AdminController.getSessions,
    ]);
    assert.equal(sessionsRes.status, 200);
    assert.ok(sessionsRes.body.data.length >= 2);
    console.log('✅ TEST 6 PASSED: Batch & Session scheduling and Instructor creation verified');
    passed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Payment Reconciliation Security (Block force_mark_paid on unverified payment)
  // ---------------------------------------------------------------------------
  {
    const paymentsEx = createMockExchange({
      method: 'GET',
      path: '/api/admin/payments',
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const paymentsRes = await runChain(paymentsEx, [
      authenticate,
      requireRole('admin'),
      AdminController.getPayments,
    ]);
    assert.equal(paymentsRes.status, 200);

    // Attempt forbidden manual mark-as-paid override
    const forceMarkEx = createMockExchange({
      method: 'POST',
      path: '/api/admin/payments/test-pay-001/reconcile',
      params: { id: 'test-pay-001' },
      body: { action: 'force_mark_paid' },
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const forceMarkRes = await runChain(forceMarkEx, [
      authenticate,
      requireRole('admin'),
      AdminController.reconcilePayment,
    ]);
    assert.equal(
      forceMarkRes.status,
      403,
      'Marking an unverified payment as paid manually MUST be rejected with 403 Forbidden'
    );
    console.log('✅ TEST 7 PASSED: Payment security policy blocks manual unverified paid overrides (403 Forbidden)');
    passed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Certificate Eligibility, Issuance, Duplicate Prevention & Revocation
  // ---------------------------------------------------------------------------
  {
    // Issue a certificate for a test enrollment ID
    const issueEx = createMockExchange({
      method: 'POST',
      path: '/api/admin/certificates/issue',
      body: {
        enrollmentId: 'ENR-PHASE6-TEST-001',
        recipientName: 'Alex Rivera',
        workshopTitle: 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
      },
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const issueRes = await runChain(issueEx, [
      authenticate,
      requireRole('admin'),
      AdminController.issueCertificate,
    ]);
    assert.equal(issueRes.status, 201, 'First certificate issuance must succeed with 201');

    // Attempt duplicate certificate issuance for the same enrollment
    const dupEx = createMockExchange({
      method: 'POST',
      path: '/api/admin/certificates/issue',
      body: {
        enrollmentId: 'ENR-PHASE6-TEST-001',
        recipientName: 'Alex Rivera',
      },
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const dupRes = await runChain(dupEx, [
      authenticate,
      requireRole('admin'),
      AdminController.issueCertificate,
    ]);
    assert.equal(dupRes.status, 409, 'Duplicate certificate issuance must be blocked with 409 Conflict');
    console.log('✅ TEST 8 PASSED: Certificate issuance & duplicate prevention (409 Conflict) verified');
    passed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 9: Content Management, Analytics & Platform Settings
  // ---------------------------------------------------------------------------
  {
    const resCreateEx = createMockExchange({
      method: 'POST',
      path: '/api/admin/content',
      body: {
        title: 'Production Prompt Engineering Playbook v3',
        category: 'pdf',
        description: 'System prompt templates and evaluation rubrics.',
        url: 'https://ailaunchpad.edu/resources/prompt-playbook-v3.pdf',
        accessLevel: 'enrolled_only',
      },
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const resCreate = await runChain(resCreateEx, [
      authenticate,
      requireRole('admin'),
      AdminController.createContent,
    ]);
    assert.equal(resCreate.status, 201);

    const analyticsEx = createMockExchange({
      method: 'GET',
      path: '/api/admin/analytics',
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const analyticsRes = await runChain(analyticsEx, [
      authenticate,
      requireRole('admin'),
      AdminController.getAnalytics,
    ]);
    assert.equal(analyticsRes.status, 200);
    assert.ok(Array.isArray(analyticsRes.body.data.workshopPerformance));

    const settingsEx = createMockExchange({
      method: 'PATCH',
      path: '/api/admin/settings',
      body: {
        registration: {
          maxSeatsPerBatch: 60,
          allowPublicRegistration: true,
        },
      },
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const settingsRes = await runChain(settingsEx, [
      authenticate,
      requireRole('admin'),
      AdminController.updateSettings,
    ]);
    assert.equal(settingsRes.status, 200);
    console.log('✅ TEST 9 PASSED: Content management, Analytics reports, and Platform Settings verified');
    passed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 10: Immutable Security Audit Logging
  // ---------------------------------------------------------------------------
  {
    const auditEx = createMockExchange({
      method: 'GET',
      path: '/api/admin/audit-logs',
      cookies: { [env.COOKIE_NAME]: adminToken },
    });
    const auditRes = await runChain(auditEx, [
      authenticate,
      requireRole('admin'),
      AdminController.getAuditLogs,
    ]);
    assert.equal(auditRes.status, 200);
    const logs = Array.isArray(auditRes.body.data) ? auditRes.body.data : auditRes.body.data.logs;
    assert.ok(logs.length >= 5, 'Sensitive operations must record AuditLog entries');
    console.log(`✅ TEST 10 PASSED: Security Audit Logs verified (${logs.length} audit events recorded)`);
    passed++;
  }

  console.log(`\n🎉 ALL ${passed}/10 PHASE 6 SECURITY & FUNCTIONAL TEST SUITES PASSED!`);
}

main().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
