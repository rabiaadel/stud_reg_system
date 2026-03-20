import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';

// Pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { GradesPage } from './pages/GradesPage';
import { AcademicStandingPage } from './pages/AcademicStandingPage';
import { GraduationPage } from './pages/GraduationPage';
import { ProgressPage } from './pages/ProgressPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';

// Layout
import { LayoutComponent } from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return <LayoutComponent>{children}</LayoutComponent>;
};

const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" />;
  }

  if (user?.role === 'doctor') {
    return <Navigate to="/doctor" />;
  }

  return <Navigate to="/dashboard" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Student Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/registration"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <RegistrationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <GradesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academic-standing"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AcademicStandingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/graduation"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <GraduationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ProgressPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rules"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Rules Page - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Students Page - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Audit Logs Page - Coming Soon</div>
            </ProtectedRoute>
          }
        />

        {/* Protected Doctor Routes */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
