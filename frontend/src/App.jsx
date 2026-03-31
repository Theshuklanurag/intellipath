import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Lazy load pages to isolate errors
import { Suspense, lazy } from 'react'

const LandingPage     = lazy(() => import('./pages/LandingPage'))
const LoginPage       = lazy(() => import('./pages/LoginPage'))
const SignupPage      = lazy(() => import('./pages/SignupPage'))
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'))

const Loader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0A0B0F'
  }}>
    <div className="loader" />
  </div>
)

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/" />
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/"        element={<LandingPage />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/signup"  element={<SignupPage />} />
        <Route path="/student/*" element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/*" element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
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