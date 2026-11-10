import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { CurriculumPage } from './pages/public/CurriculumPage';
import { InstructorsPage } from './pages/public/InstructorsPage';
import { PricingPage } from './pages/public/PricingPage';
import { ContactPage } from './pages/public/ContactPage';

// Auth Pages
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { DashboardWorkshops } from './pages/dashboard/DashboardWorkshops';
import { DashboardLiveClasses } from './pages/dashboard/DashboardLiveClasses';
import { DashboardMaterials } from './pages/dashboard/DashboardMaterials';
import { DashboardAssignments } from './pages/dashboard/DashboardAssignments';
import { DashboardProgress } from './pages/dashboard/DashboardProgress';
import { DashboardCertificates } from './pages/dashboard/DashboardCertificates';
import { DashboardPayments } from './pages/dashboard/DashboardPayments';
import { DashboardProfile } from './pages/dashboard/DashboardProfile';

// Admin Dashboard Pages (Phase 6 — RBAC Protected)
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminWorkshops } from './pages/admin/AdminWorkshops';
import { AdminCalendar } from './pages/admin/AdminCalendar';
import { AdminSessions } from './pages/admin/AdminSessions';
import { AdminInstructors } from './pages/admin/AdminInstructors';
import { AdminEnrollments } from './pages/admin/AdminEnrollments';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminCertificates } from './pages/admin/AdminCertificates';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminSettings } from './pages/admin/AdminSettings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/curriculum" element={<CurriculumPage />} />
          <Route path="/instructors" element={<InstructorsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Authentication Routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/admin/login" element={<SignInPage />} />
          <Route path="/admin/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Student Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="workshops" element={<DashboardWorkshops />} />
            <Route path="live-classes" element={<DashboardLiveClasses />} />
            <Route path="materials" element={<DashboardMaterials />} />
            <Route path="assignments" element={<DashboardAssignments />} />
            <Route path="progress" element={<DashboardProgress />} />
            <Route path="certificates" element={<DashboardCertificates />} />
            <Route path="payments" element={<DashboardPayments />} />
            <Route path="profile" element={<DashboardProfile />} />
          </Route>

          {/* Protected Administrator Dashboard Routes (RBAC: Admin Only) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="workshops" element={<AdminWorkshops />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="sessions" element={<AdminSessions />} />
            <Route path="instructors" element={<AdminInstructors />} />
            <Route path="enrollments" element={<AdminEnrollments />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
