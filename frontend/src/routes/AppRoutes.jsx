import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/landing/Home'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import VerifyEmail from '../pages/auth/VerifyEmail'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ComingSoon from '../pages/common/ComingSoon'
import ProtectedRoute from './ProtectedRoute'
import AdminLayout from '../layouts/AdminLayout'
import AdminOverview from '../pages/admin/Overview'
import AdminPatients from '../pages/admin/Patients'
import AdminDoctors from '../pages/admin/Doctors'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Super Admin */}
      <Route element={<ProtectedRoute role="SUPERADMIN" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="doctors" element={<AdminDoctors />} />
        </Route>
      </Route>

      {/* Doctor and Patient dashboards: placeholders until they are built */}
      <Route element={<ProtectedRoute role="DOCTOR" />}>
        <Route path="/doctor/dashboard" element={<ComingSoon title="Doctor Dashboard" />} />
      </Route>
      <Route element={<ProtectedRoute role="PATIENT" />}>
        <Route path="/patient/dashboard" element={<ComingSoon title="Patient Dashboard" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
