import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './index.css'
import App from './App'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

import Applications from './pages/Applications'
import ApplicationDetails from './pages/ApplicationDetails'
import Interviews from './pages/Interviews'
import Assessments from './pages/Assessments'
import Tasks from './pages/Tasks'
import ResumeMatching from './pages/ResumeMatching'
import Insights from './pages/Insights'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interviews"
          element={
            <ProtectedRoute>
              <Interviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <Assessments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume-matching"
          element={
            <ProtectedRoute>
              <ResumeMatching />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications/:applicationId"
          element={
            <ProtectedRoute>
              <ApplicationDetails />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  </StrictMode>,
)