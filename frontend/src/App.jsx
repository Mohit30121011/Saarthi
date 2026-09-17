import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import OnboardingWizard from './pages/onboarding/OnboardingWizard'
import Dashboard from './pages/Dashboard'
import SchemeExplorer from './pages/SchemeExplorer'
import SchemeDetail from './pages/SchemeDetail'
import Checklist from './pages/Checklist'
import Bookmarks from './pages/Bookmarks'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSchemes from './pages/admin/AdminSchemes'
import AdminReports from './pages/admin/AdminReports'

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/explorer" element={<SchemeExplorer />} />
              <Route path="/schemes/:schemeId" element={<SchemeDetail />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/schemes" element={<AdminSchemes />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
