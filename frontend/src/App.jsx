import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

const LandingPage      = lazy(() => import('./pages/LandingPage'))
const LoginPage        = lazy(() => import('./pages/LoginPage'))
const SignupPage       = lazy(() => import('./pages/SignupPage'))
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'))
const OAuthCallback    = lazy(() => import('./pages/OAuthCallback'))
const OAuthRolePage    = lazy(() => import('./pages/OAuthRolePage'))

const Loader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0A0B0F',
    gap: 16
  }}>
    <div style={{
      width: 40, height: 40,
      border: '3px solid rgba(0,212,255,0.2)',
      borderTop: '3px solid #00D4FF',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <p style={{ color: '#4A5275', fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
      Loading IntelliPath...
    </p>
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
)

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/"               element={<LandingPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/signup"         element={<SignupPage />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/oauth-role"     element={<OAuthRolePage />} />
        <Route path="/student/*"      element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/*"      element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#161820',
              color: '#F0F2FF',
              border: '1px solid rgba(0,212,255,0.2)',
            },
            duration: 3000,
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}