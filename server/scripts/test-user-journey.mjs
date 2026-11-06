/**
 * Automated End-to-End User Journey Test Suite (Task 8)
 * Verifies: Guest -> Sign Up -> Sign In -> Workshop Selection -> Enrollment ->
 * Payment Verification -> Student Dashboard -> Live Class -> Learning Materials -> Certificate Eligibility
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { WorkshopController } from '../dist/controllers/workshop.controller.js';
import { AuthController } from '../dist/controllers/auth.controller.js';
import { LearnerController } from '../dist/controllers/learner.controller.js';
import { PaymentController } from '../dist/controllers/payment.controller.js';
import { authenticate } from '../dist/middleware/auth.middleware.js';
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
  console.log('==============================================================');
  console.log(' COMPLETE USER JOURNEY — AUTOMATED E2E VERIFICATION SUITE');
  console.log('==============================================================\n');

  // 1. GUEST EXPERIENCE: Explore published workshops without an account
  let selectedWorkshopId = '';
  {
    const ex = createMockExchange({ method: 'GET', path: '/api/workshops' });
    const res = await runChain(ex, [WorkshopController.getWorkshops]);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1, 'Guest must be able to view published workshops');
    selectedWorkshopId = res.body.data[0]._id;
    console.log(`✅ STEP 1 (Guest): Explored workshops without account (Selected: ${res.body.data[0].batchCode})`);
  }

  // 2. SIGN UP & SIGN IN
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
      body: {
        email: testEmail,
        password: 'Password123!',
      },
    });
    const signInRes = await runChain(signInEx, [AuthController.login]);
    assert.equal(signInRes.status, 200);
    sessionToken = signInEx.getCookies()[env.COOKIE_NAME];
    assert.ok(sessionToken, 'Session cookie must be issued upon Sign In');
    console.log('✅ STEP 2 (Sign Up & Sign In): Account created & authenticated via HTTP-only session cookie');
  }

  // 3. REGISTERED USER EXPERIENCE (Signed in, NOT enrolled yet)
  {
    const dashEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/dashboard',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const dashRes = await runChain(dashEx, [authenticate, LearnerController.getDashboard]);
    assert.equal(dashRes.status, 200);
    assert.equal(dashRes.body.data.hasConfirmedEnrollment, false, 'New user has no confirmed enrollments');
    assert.ok(dashRes.body.data.availableWorkshops.length >= 1, 'Registered user sees available workshop batches');

    // Verify paid content is strictly blocked before enrollment
    const matEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/materials',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const matRes = await runChain(matEx, [authenticate, LearnerController.getAuthorizedMaterials]);
    assert.equal(matRes.status, 403, 'Paid learning materials must be blocked (403) before enrollment');
    console.log('✅ STEP 3 (Registered User): Workshop discovery active & paid learning modules strictly gated (403)');
  }

  // 4. WORKSHOP SELECTION & ENROLLMENT (Seat Reservation, Payment Pending)
  let enrollmentId = '';
  {
    const enrollEx = createMockExchange({
      method: 'POST',
      path: '/api/learners/enroll',
      body: { workshopId: selectedWorkshopId },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const enrollRes = await runChain(enrollEx, [authenticate, LearnerController.enrollInWorkshop]);
    assert.equal(enrollRes.status, 201);
    assert.equal(enrollRes.body.data.paymentRequired, true);
    enrollmentId = enrollRes.body.data.enrollment.enrollmentId;

    // Verify paid content is STILL blocked while payment is pending
    const liveEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/live-classes',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const liveRes = await runChain(liveEx, [authenticate, LearnerController.getAuthorizedLiveClasses]);
    assert.equal(liveRes.status, 403, 'Live classes must remain blocked (403) while payment is unverified');
    console.log(`✅ STEP 4 (Enrollment): Reserved seat (${enrollmentId}) — paid content remains locked until payment verification`);
  }

  // 5. PAYMENT ORDER & CRYPTOGRAPHIC SIGNATURE VERIFICATION
  {
    const orderEx = createMockExchange({
      method: 'POST',
      path: '/api/payments/create-order',
      body: { enrollmentId, couponCode: 'LAUNCH10' },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const orderRes = await runChain(orderEx, [authenticate, PaymentController.createOrder]);
    assert.equal(orderRes.status, 200);
    const orderId = orderRes.body.data.orderId;
    const paymentId = `pay_${Date.now()}`;

    const signature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const verifyEx = createMockExchange({
      method: 'POST',
      path: '/api/payments/verify',
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        enrollmentId,
      },
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const verifyRes = await runChain(verifyEx, [authenticate, PaymentController.verify]);
    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.body.data.verified, true);
    console.log(`✅ STEP 5 (Payment Verification): Order ${orderId} cryptographically verified & seat confirmed`);
  }

  // 6. ENROLLED STUDENT DASHBOARD, LIVE CLASSES & LEARNING MATERIALS
  {
    const dashEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/dashboard',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const dashRes = await runChain(dashEx, [authenticate, LearnerController.getDashboard]);
    assert.equal(dashRes.status, 200);
    assert.equal(dashRes.body.data.hasConfirmedEnrollment, true, 'User is now an Enrolled Student');
    assert.equal(dashRes.body.data.workshops[0].isAuthorized, true);

    const liveEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/live-classes',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const liveRes = await runChain(liveEx, [authenticate, LearnerController.getAuthorizedLiveClasses]);
    assert.equal(liveRes.status, 200);
    assert.ok(liveRes.body.data[0].sessionAccess.joinUrl, 'Authorized student receives live session join URL');

    const matEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/materials',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const matRes = await runChain(matEx, [authenticate, LearnerController.getAuthorizedMaterials]);
    assert.equal(matRes.status, 200);
    assert.ok(matRes.body.data.length >= 4, 'Authorized student receives slides, notes, prompts & project resources');
    console.log('✅ STEP 6 (Student Dashboard, Live Classes & Materials): Full enrolled student experience unlocked');
  }

  // 7. ASSIGNMENT SUBMISSION & CERTIFICATE ELIGIBILITY
  {
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
    const subRes = await runChain(subEx, [authenticate, LearnerController.submitProject]);
    assert.equal(subRes.status, 201);

    const progEx = createMockExchange({
      method: 'GET',
      path: '/api/learners/progress',
      cookies: { [env.COOKIE_NAME]: sessionToken },
    });
    const progRes = await runChain(progEx, [authenticate, LearnerController.getProgress]);
    assert.equal(progRes.status, 200);
    assert.equal(progRes.body.data[0].projectSubmitted, true);
    assert.equal(progRes.body.data[0].isEligibleForCertificate, true);
    console.log('✅ STEP 7 (Assignments & Certificate Eligibility): Capstone submitted & certificate eligibility verified');
  }

  console.log('\n🎉 COMPLETE USER JOURNEY (7/7 E2E STEPS) PASSED SUCCESSFULLY!');
}

main().catch((err) => {
  console.error('❌ Journey test failed:', err);
  process.exit(1);
});
