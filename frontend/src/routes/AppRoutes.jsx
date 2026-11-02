import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import ComingSoon from '../pages/ComingSoon'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Dashboards: placeholders until they are built */}
      <Route path="/patient/dashboard" element={<ComingSoon title="Patient Dashboard" />} />
      <Route path="/doctor/dashboard" element={<ComingSoon title="Doctor Dashboard" />} />
      <Route path="/admin/dashboard" element={<ComingSoon title="Super Admin Dashboard" />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
