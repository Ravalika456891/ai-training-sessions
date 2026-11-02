import type { RegistrationFormData } from '../types/workshop';

const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  phone?: { countryCode: string; number: string };
  role: string;
  userCategory?: string;
  experienceLevel?: string;
}

export interface ApiWorkshop {
  _id: string;
  title: string;
  slug: string;
  batchCode: string;
  description: string;
  instructor: {
    name: string;
    role: string;
    bio: string;
    avatarUrl: string;
  };
  startDate: string;
  endDate: string;
  timings: string;
  timezone: string;
  capacity: number;
  enrolledCount: number;
  reservedCount: number;
  availableSeats: number;
  price: {
    basePrice: number;
    currency: string;
    taxPercentage: number;
    isFree: boolean;
  };
  status: string;
}

export interface EnrollmentApiResponse {
  success: boolean;
  message: string;
  data: {
    enrollment: {
      _id: string;
      enrollmentId: string;
      status: string;
      paymentStatus: string;
      reservedUntil?: string;
      attendeeDetails: {
        fullName: string;
        email: string;
        phone: string;
      };
      enrolledAt: string;
    };
    user: ApiUser;
    workshop: {
      _id: string;
      title: string;
      batchCode: string;
      startDate: string;
      endDate: string;
      timings: string;
      timezone: string;
      availableSeats: number;
    };
    paymentRequired: boolean;
    orderSummary: {
      basePrice: number;
      taxAmount: number;
      totalAmount: number;
      currency: string;
    };
  };
}

export interface RazorpayOrderData {
  orderId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  keyId: string;
  enrollmentId: string;
  attendee: {
    name: string;
    email: string;
    phone: string;
  };
  workshop: {
    id: string;
    title: string;
    batchCode: string;
    timings: string;
    dateRange: string;
  };
  breakdown: {
    basePrice: number;
    discountAmount: number;
    taxAmount: number;
    taxPercentage: number;
    totalAmount: number;
    couponCode?: string;
  };
}

export interface PaymentVerificationResult {
  verified: boolean;
  message: string;
  paymentId: string;
  orderId: string;
  enrollmentId: string;
  amount?: number;
  currency?: string;
  timestamp?: string;
}

const customHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest', // CSRF mitigation header
};

export const api = {
  // Workshops
  async getWorkshops(): Promise<{ success: boolean; data: ApiWorkshop[] }> {
    const res = await fetch(`${API_BASE}/workshops`, {
      headers: customHeaders,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch workshops');
    }
    return res.json();
  },

  async getWorkshopById(id: string): Promise<{ success: boolean; data: ApiWorkshop }> {
    const res = await fetch(`${API_BASE}/workshops/${id}`, {
      headers: customHeaders,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch workshop details');
    }
    return res.json();
  },

  // Enrollments
  async createEnrollment(formData: RegistrationFormData): Promise<EnrollmentApiResponse> {
    const payload = {
      workshopId: formData.selectedBatchId,
      fullName: formData.fullName,
      email: formData.email,
      phoneCountryCode: formData.phoneCountryCode,
      phoneNumber: formData.phoneNumber,
      userCategory: formData.userCategory,
      experienceLevel: formData.experienceLevel,
      acceptTerms: formData.acceptTerms,
      marketingConsent: formData.marketingConsent,
    };

    const res = await fetch(`${API_BASE}/enrollments`, {
      method: 'POST',
      headers: customHeaders,
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed.');
    }
    return data;
  },

  async getMyEnrollments(): Promise<{ success: boolean; data: any[] }> {
    const res = await fetch(`${API_BASE}/enrollments/me`, {
      headers: customHeaders,
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch enrollments');
    }
    return res.json();
  },

  // Payments (Razorpay Integration)
  async createPaymentOrder(
    enrollmentId: string,
    couponCode?: string
  ): Promise<{ success: boolean; data: RazorpayOrderData }> {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: customHeaders,
      credentials: 'include',
      body: JSON.stringify({ enrollmentId, couponCode }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to initialize payment order');
    }
    return data;
  },

  async verifyPayment(verificationPayload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    enrollmentId: string;
  }): Promise<{ success: boolean; data: PaymentVerificationResult }> {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: customHeaders,
      credentials: 'include',
      body: JSON.stringify(verificationPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Payment verification failed');
    }
    return data;
  },

  async validateCoupon(
    couponCode: string,
    basePrice: number
  ): Promise<{ success: boolean; data: { code: string; discountAmount: number; description: string } }> {
    const res = await fetch(`${API_BASE}/payments/validate-coupon`, {
      method: 'POST',
      headers: customHeaders,
      body: JSON.stringify({ couponCode, basePrice }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid coupon code');
    }
    return data;
  },

  async getMyPayments(): Promise<{ success: boolean; data: any[] }> {
    const res = await fetch(`${API_BASE}/payments/my-payments`, {
      headers: customHeaders,
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch payments');
    }
    return res.json();
  },

  async getPaymentByEnrollment(enrollmentId: string): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${API_BASE}/payments/enrollment/${enrollmentId}`, {
      headers: customHeaders,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch payment status');
    }
    return res.json();
  },

  // Authentication
  async getMe(): Promise<{ success: boolean; data: { user: ApiUser } }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: customHeaders,
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Not authenticated');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<{ success: boolean; data: { user: ApiUser } }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: customHeaders,
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid credentials');
    }
    return data;
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: customHeaders,
      credentials: 'include',
    });
    return res.json();
  },
};
