/**
 * Automated End-to-End User Journey & Mandatory Payment Access Control Test Suite
 * Verifies all 10 required security & functional cases:
 *  1. Logged-out users cannot access private dashboard data (401)
 *  2. Unpaid registered user can open dashboard sections & receive safe previews (userState: 'registered')
 *  3. Unpaid user cannot view protected workshop materials (403)
 *  4. Unpaid user cannot join restricted live sessions (403)
 *  5. Unpaid user cannot submit paid workshop assignments (403)
 *  6. Payment failure (invalid signature) or payment.created / payment.authorized webhooks do NOT confirm enrollment
 *  7. Payment success (captured) confirms only the purchased workshop (userState: 'enrolled')
 *  8. Duplicate payment.captured webhook events are idempotent and do not duplicate enrollments
 *  9. One paid workshop (batch-nov-14) does NOT unlock another paid workshop (batch-nov-28 -> 403)
 * 10. Certificate access requires verified completion (403 before completion, 200 after completion)
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { WorkshopController } from '../dist/controllers/workshop.controller.js';
import { AuthController } from '../dist/controllers/auth.controller.js';
import { LearnerController } from '../dist/controllers/learner.controller.js';
import { PaymentController } from '../dist/controllers/payment.controller.js';
import { authenticate } from '../dist/middleware/auth.middleware.js';
import { requireVerifiedWorkshopAccess } from '../dist/middleware/enrollmentAccess.middleware.js';
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
      'user-agent': 'UserJourney-Test-Runner/1.0',
      'x-requested-with': 'XMLHttpRequest',
      ...headers,
    },
    cookies: { ...cookies },
    ip: '127.0.0.1',
  };

  let statusCode = 200;
  let jsonBody = null;
  const responseCookies = {};

  const res = {
    status(code) {
      statusCode = code;
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
  };

  return {
    req,
    res,
    getStatus: () => statusCode,
    getJson: () => jsonBody,
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
  return { status: exchange.getStatus(), body: exchange.getJson() };
}

async function main() {
  console.log('==================================================================');
  console.log(' MANDATORY PAYMENT & ACCESS CONTROL — 10-CASE E2E SECURITY SUITE');
  console.log('==================================================================\n');

  // CASE 1: Logged-out users cannot access private dashboard data (401)
  {
    const ex = createMockExchange({ method: 'GET', path: '/api/learners/dashboard' });
    const res = await runChain(ex, [authenticate, LearnerController.getDashboard]);
    assert.equal(res.status, 401, 'Logged-out user must receive 401 on private dashboard');
    console.log('✅ CASE 1 (Logged-Out Guard): Unauthenticated requests to private dashboard return 401');
  }

  // Guest explores published workshops & Sign Up / Sign In
  let primaryWorkshopId = '';
  let secondWorkshopId = '';
  {
    const ex = createMockExchange({ method: 'GET', path: '/api/workshops' });
    const res = await runChain(ex, [WorkshopController.getWorkshops]);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 2, 'At least 2 published workshops must exist for cross-workshop isolation test');
    primaryWorkshopId = res.body.data[0]._id;
    secondWorkshopId = res.body.data[1]._id;
  }

  let sessionToken = '';
  const testEmail = `journey.${Date.now()}@example.com`;
  {
    const signUpEx = createMockExchange({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        name: 'Priya Nair',
        email: testEmail,
        password: 'Password123!',
        phone: { countryCode: '+91', number: '9876543210' },
      },
    });
    const signUpRes = await runChain(signUpEx, [AuthController.register]);
    assert.equal(signUpRes.status, 201);

    const signInEx = createMockExchange({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: testEmail, password: 'Password123!' },
    });
    const signInRes = await runChain(signInEx, [AuthController.login]);
    assert.equal(signInRes.status, 200);
    sessionToken = signInEx.getCookies()[env.COOKIE_NAME];
    assert.ok(sessionToken, 'Session cookie must be issued upon Sign In');
  }

  // CASE 2: Unpaid registered user can open dashboard sections & receive safe previews
  {
    const dashEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/dashboard',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const dashRes = await runChain(dashEx, [authenticate, LearnerController.getDashboard]);
    assert.equal(dashRes.status, 200);
    assert.equal(dashRes.body.data.userState, 'registered');
    assert.equal(dashRes.body.data.hasConfirmedEnrollment, false);
    assert.ok(dashRes.body.data.availableWorkshops.length >= 2, 'Unpaid user sees available workshops');
    assert.ok(dashRes.body.data.availableWorkshops[0].sessionsPreview.length >= 2, 'Unpaid user sees live class schedule previews');
    assert.equal(dashRes.body.data.availableWorkshops[0].sessionsPreview[0].liveSessionUrl, null, 'Preview liveSessionUrl must be null');
    assert.ok(dashRes.body.data.availableWorkshops[0].materialsPreview.length >= 4, 'Unpaid user sees learning material previews');
    assert.equal(dashRes.body.data.availableWorkshops[0].materialsPreview[0].downloadUrl, null, 'Preview downloadUrl must be null');
    assert.ok(dashRes.body.data.assignments.length >= 2, 'Unpaid user sees assignment descriptions');
    console.log('✅ CASE 2 (Unpaid Dashboard Previews): Registered user opens all sections with safe previews (joinUrl/downloadUrl stripped)');
  }

  // CASE 3: Unpaid user cannot view protected workshop materials (403)
  {
    const matEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/materials',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const matRes = await runChain(matEx, [
      authenticate,
      requireVerifiedWorkshopAccess({ resourceType: 'materials' }),
      LearnerController.getAuthorizedMaterials,
    ]);
    assert.equal(matRes.status, 403, 'Protected materials must return 403 for unpaid user');
    console.log('✅ CASE 3 (Protected Materials Guard): Unpaid user blocked (403) from protected workshop materials');
  }

  // CASE 4: Unpaid user cannot join restricted live sessions (403)
  {
    const liveEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/live-classes',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const liveRes = await runChain(liveEx, [
      authenticate,
      requireVerifiedWorkshopAccess({ resourceType: 'live_class' }),
      LearnerController.getAuthorizedLiveClasses,
    ]);
    assert.equal(liveRes.status, 403, 'Restricted live classes must return 403 for unpaid user');
    console.log('✅ CASE 4 (Restricted Live Session Guard): Unpaid user blocked (403) from live session joining links');
  }

  // CASE 5: Unpaid user cannot submit paid workshop assignments (403)
  {
    const subEx = createMockExchange({
      method: 'POST',
      path: '/api/learners/submissions',
      body: {
        workshopId: primaryWorkshopId,
        projectTitle: 'Unauthorized Attempt',
      },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const subRes = await runChain(subEx, [
      authenticate,
      requireVerifiedWorkshopAccess({ resourceType: 'assignment_submission' }),
      LearnerController.submitProject,
    ]);
    assert.equal(subRes.status, 403, 'Assignment submission must return 403 for unpaid user');
    console.log('✅ CASE 5 (Assignment Submission Guard): Unpaid user blocked (403) from submitting workshop assignments');
  }

  // Reserve seat (status: pending_payment, paymentStatus: created)
  let enrollmentId = '';
  let orderId = '';
  {
    const enrollEx = createMockExchange({
      method: 'POST',
      path: '/api/learners/enroll',
      body: { workshopId: primaryWorkshopId },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const enrollRes = await runChain(enrollEx, [authenticate, LearnerController.enrollInWorkshop]);
    assert.equal(enrollRes.status, 201);
    assert.equal(enrollRes.body.data.enrollment.status, 'pending_payment');
    assert.equal(enrollRes.body.data.enrollment.paymentStatus, 'created');
    enrollmentId = enrollRes.body.data.enrollment.enrollmentId;

    const orderEx = createMockExchange({
      method: 'POST',
      path: '/api/payments/create-order',
      body: { enrollmentId, couponCode: 'LAUNCH10' },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const orderRes = await runChain(orderEx, [authenticate, PaymentController.createOrder]);
    assert.equal(orderRes.status, 200);
    orderId = orderRes.body.data.orderId;
  }

  // CASE 6: Payment failure or payment.created / payment.authorized does NOT confirm enrollment
  {
    // 6a: Forged signature rejected (400)
    const badVerifyEx = createMockExchange({
      method: 'POST',
      path: '/api/payments/verify',
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: 'pay_forged_123',
        razorpay_signature: '0000000000000000000000000000000000000000000000000000000000000000',
        enrollmentId,
      },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const badVerifyRes = await runChain(badVerifyEx, [authenticate, PaymentController.verify]);
    assert.equal(badVerifyRes.status, 400, 'Invalid Razorpay signature must be rejected with 400');

    // 6b: Webhook payment.authorized does NOT confirm enrollment
    const authPayload = {
      event: 'payment.authorized',
      payload: {
        payment: {
          entity: {
            id: 'pay_auth_only_123',
            order_id: orderId,
          },
        },
      },
    };
    const authSig = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(authPayload))
      .digest('hex');

    const whAuthEx = createMockExchange({
      method: 'POST',
      path: '/api/payments/webhook',
      headers: { 'x-razorpay-signature': authSig },
      body: authPayload,
    });
    const whAuthRes = await runChain(whAuthEx, [PaymentController.webhook]);
    assert.equal(whAuthRes.status, 200);

    // Check dashboard: still payment_pending, NOT confirmed
    const dashEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/dashboard',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const dashRes = await runChain(dashEx, [authenticate, LearnerController.getDashboard]);
    assert.equal(dashRes.body.data.hasConfirmedEnrollment, false, 'payment.authorized must NOT confirm enrollment');
    assert.equal(dashRes.body.data.userState, 'payment_pending');
    console.log('✅ CASE 6 (Failed & Authorized-Only Guard): Invalid signature & payment.authorized never confirm enrollment');
  }

  // CASE 7: Payment success (captured) confirms only the purchased workshop
  const capturedPaymentId = `pay_${Date.now()}`;
  {
    const validSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${capturedPaymentId}`)
      .digest('hex');

    const verifyEx = createMockExchange({
      method: 'POST',
      path: '/api/payments/verify',
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: capturedPaymentId,
        razorpay_signature: validSignature,
        enrollmentId,
      },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const verifyRes = await runChain(verifyEx, [authenticate, PaymentController.verify]);
    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.body.data.verified, true);
    assert.equal(verifyRes.body.data.paymentStatus, 'captured');

    const dashEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/dashboard',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const dashRes = await runChain(dashEx, [authenticate, LearnerController.getDashboard]);
    assert.equal(dashRes.body.data.hasConfirmedEnrollment, true);
    assert.equal(dashRes.body.data.userState, 'enrolled');
    assert.equal(dashRes.body.data.workshops[0].status, 'confirmed');
    assert.equal(dashRes.body.data.workshops[0].paymentStatus, 'captured');

    // Authorized access to purchased workshop's materials & live classes
    const matEx = createMockExchange({
      method: 'GET',
      path: `/api/learners/workshops/${primaryWorkshopId}/materials`,
      params: { workshopId: primaryWorkshopId },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const matRes = await runChain(matEx, [
      authenticate,
      requireVerifiedWorkshopAccess({ resourceType: 'materials' }),
      LearnerController.getAuthorizedMaterials,
    ]);
    assert.equal(matRes.status, 200);
    assert.ok(matRes.body.data.length >= 4);
    console.log(`✅ CASE 7 (Captured Payment Confirmation): Verified captured payment (${capturedPaymentId}) unlocked purchased workshop (${primaryWorkshopId})`);
  }

  // CASE 8: Duplicate webhook events do not duplicate enrollments (Idempotency)
  {
    const capPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: capturedPaymentId,
            order_id: orderId,
          },
        },
      },
    };
    const capSig = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(capPayload))
      .digest('hex');

    // First delivery
    const wh1Ex = createMockExchange({
      method: 'POST',
      path: '/api/payments/webhook',
      headers: { 'x-razorpay-signature': capSig },
      body: capPayload,
    });
    const wh1Res = await runChain(wh1Ex, [PaymentController.webhook]);
    assert.equal(wh1Res.status, 200);

    // Duplicate delivery of identical webhook event
    const wh2Ex = createMockExchange({
      method: 'POST',
      path: '/api/payments/webhook',
      headers: { 'x-razorpay-signature': capSig },
      body: capPayload,
    });
    const wh2Res = await runChain(wh2Ex, [PaymentController.webhook]);
    assert.equal(wh2Res.status, 200);

    const dashEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/dashboard',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const dashRes = await runChain(dashEx, [authenticate, LearnerController.getDashboard]);
    assert.equal(dashRes.body.data.workshops.length, 1, 'Duplicate webhooks must not create duplicate enrollments');
    console.log('✅ CASE 8 (Idempotent Webhooks): Duplicate payment.captured webhooks processed idempotently without duplicating records');
  }

  // CASE 9: One paid workshop does NOT unlock another paid workshop (403)
  {
    const otherMatEx = createMockExchange({
      method: 'GET',
      path: `/api/learners/workshops/${secondWorkshopId}/materials`,
      params: { workshopId: secondWorkshopId },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const otherMatRes = await runChain(otherMatEx, [
      authenticate,
      requireVerifiedWorkshopAccess({ resourceType: 'materials' }),
      LearnerController.getAuthorizedMaterials,
    ]);
    assert.equal(otherMatRes.status, 403, 'Student enrolled in Workshop A must receive 403 when requesting Workshop B materials');

    const otherLiveEx = createMockExchange({
      method: 'GET',
      path: `/api/learners/workshops/${secondWorkshopId}/live-classes`,
      params: { workshopId: secondWorkshopId },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const otherLiveRes = await runChain(otherLiveEx, [
      authenticate,
      requireVerifiedWorkshopAccess({ resourceType: 'live_class' }),
      LearnerController.getAuthorizedLiveClasses,
    ]);
    assert.equal(otherLiveRes.status, 403, 'Student enrolled in Workshop A must receive 403 when requesting Workshop B live classes');
    console.log(`✅ CASE 9 (Cross-Workshop Isolation): Paid enrollment in ${primaryWorkshopId} strictly blocked (403) from ${secondWorkshopId}`);
  }

  // CASE 10: Certificate access requires verified completion (403 before completion, 200 after completion)
  {
    // 10a: Before submitting assignment, certificate endpoint returns 403
    const certBeforeEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/certificates/download',
      query: { enrollmentId },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const certBeforeRes = await runChain(certBeforeEx, [
      authenticate,
      requireVerifiedWorkshopAccess({ resourceType: 'certificate' }),
      LearnerController.downloadCertificate,
    ]);
    assert.equal(certBeforeRes.status, 403, 'Certificate access must return 403 before workshop completion requirements are met');

    // 10b: Submit capstone assignment for the purchased workshop
    const subEx = createMockExchange({
      method: 'POST',
      path: '/api/learners/submissions',
      body: {
        enrollmentId,
        projectTitle: 'Autonomous Customer Support Agent & Workflow',
        repositoryUrl: 'https://github.com/priyanair/ai-support-agent',
        liveDemoUrl: 'https://ai-support-agent.vercel.app',
        notes: 'Built with structured system prompts and multi-step tool calling.',
      },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const subRes = await runChain(subEx, [
      authenticate,
      requireVerifiedWorkshopAccess({ resourceType: 'assignment_submission' }),
      LearnerController.submitProject,
    ]);
    assert.equal(subRes.status, 201);

    // 10c: Now that completion requirements are met, certificate endpoint returns 200
    const certAfterEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/certificates/download',
      query: { enrollmentId },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const certAfterRes = await runChain(certAfterEx, [
      authenticate,
      requireVerifiedWorkshopAccess({ resourceType: 'certificate' }),
      LearnerController.downloadCertificate,
    ]);
    assert.equal(certAfterRes.status, 200, 'Certificate endpoint must return 200 once completion requirements are verified');
    assert.ok(certAfterRes.body.data.serialNumber, 'Certificate serialNumber must be returned');
    console.log(`✅ CASE 10 (Completion-Gated Certificate): Blocked (403) before completion, unlocked (200: ${certAfterRes.body.data.serialNumber}) after capstone submission`);
  }

  console.log('\n🎉 ALL 10/10 MANDATORY PAYMENT & ACCESS CONTROL SECURITY CASES PASSED!');
}

main().catch((err) => {
  console.error('❌ Security & Journey test failed:', err);
  process.exit(1);
});
