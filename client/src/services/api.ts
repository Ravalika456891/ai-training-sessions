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

export interface RegistrationPayload {
  name: string;
  email: string;
  phone: string;
  batchId: string;
}

export interface RegistrationApiResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    batchId: string;
    registrationStatus: string;
    paymentStatus: string;
    createdAt: string;
  };
  emailDispatched?: boolean;
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

const REG_PROOFS_KEY = 'ailp_reg_proofs';

function saveRegistrationProof(email?: string, proof?: string) {
  if (!email || !proof) return;
  try {
    const raw = localStorage.getItem(REG_PROOFS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[email.toLowerCase().trim()] = proof;
    localStorage.setItem(REG_PROOFS_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

function getRegistrationProof(email?: string): string | undefined {
  if (!email) return undefined;
  try {
    const raw = localStorage.getItem(REG_PROOFS_KEY);
    if (!raw) return undefined;
    const map: Record<string, string> = JSON.parse(raw);
    return map[email.toLowerCase().trim()];
  } catch {
    return undefined;
  }
}

export const api = {
  // Workshops
  async getWorkshops(): Promise<{ success: boolean; data: ApiWorkshop[] }> {
    const res = await fetch(`${API_BASE}/workshops`, {
      headers: customHeaders,
      cache: 'no-store',
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
      cache: 'no-store',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch workshop details');
    }
    return res.json();
  },

  // Direct Student Registrations (POST /api/registrations)
  async createRegistration(payload: RegistrationPayload): Promise<RegistrationApiResponse> {
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: customHeaders,
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 409) {
        throw new Error(data.message || 'You are already registered for this training batch with this email address.');
      }
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        throw new Error(data.errors.map((e: any) => e.message).join('. '));
      }
      throw new Error(data.message || 'Registration failed. Please check your information and try again.');
    }
    return data;
  },

  async getRegistrations(params?: { email?: string; batchId?: string }): Promise<{ success: boolean; data: any[] }> {
    const query = new URLSearchParams();
    if (params?.email) query.set('email', params.email);
    if (params?.batchId) query.set('batchId', params.batchId);
    const queryString = query.toString() ? `?${query.toString()}` : '';

    const res = await fetch(`${API_BASE}/registrations${queryString}`, {
      headers: customHeaders,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch registrations');
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
    if (data.data?.registrationProof) {
      saveRegistrationProof(formData.email, data.data.registrationProof);
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
    const registrationProof = getRegistrationProof(email);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: customHeaders,
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
        ...(registrationProof ? { registrationProof } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid credentials');
    }
    if (data.data?.registrationProof) {
      saveRegistrationProof(email, data.data.registrationProof);
    }
    return data;
  },

  async register(userData: {
    name: string;
    email: string;
    password?: string;
    phone?: { countryCode: string; number: string };
  }): Promise<{ success: boolean; data: { user: ApiUser } }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: customHeaders,
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    if (data.data?.registrationProof) {
      saveRegistrationProof(userData.email, data.data.registrationProof);
    }
    return data;
  },

  async googleAuth(payload: {
    credential?: string;
    email?: string;
    password?: string;
    name?: string;
    googleId?: string;
    avatarUrl?: string;
    requestedRole?: string;
    mode?: 'login' | 'register';
  }): Promise<{ success: boolean; data: { user: ApiUser } }> {
    const registrationProof = getRegistrationProof(payload.email);
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: customHeaders,
      credentials: 'include',
      body: JSON.stringify({
        ...payload,
        ...(registrationProof ? { registrationProof } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Google authentication failed');
    }
    if (payload.email && data.data?.registrationProof) {
      saveRegistrationProof(payload.email, data.data.registrationProof);
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

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: customHeaders,
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to request password reset.');
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: customHeaders,
      credentials: 'include',
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reset password.');
    return data;
  },

  async updateProfile(profileData: {
    name?: string;
    phone?: { countryCode: string; number: string };
    experienceLevel?: string;
    userCategory?: string;
  }): Promise<{ success: boolean; data: { user: ApiUser } }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: customHeaders,
      credentials: 'include',
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile.');
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: customHeaders,
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to change password.');
    return data;
  },

  async getLearnerPayments(): Promise<{ success: boolean; data: any[] }> {
    const res = await fetch(`${API_BASE}/learners/payments`, {
      headers: customHeaders,
      credentials: 'include',
    });
    return res.json();
  },

  async getLearnerProgress(): Promise<{ success: boolean; data: any[] }> {
    const res = await fetch(`${API_BASE}/learners/progress`, {
      headers: customHeaders,
      credentials: 'include',
    });
    return res.json();
  },
};
