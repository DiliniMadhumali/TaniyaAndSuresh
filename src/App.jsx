import { Route, Routes } from 'react-router-dom'
import SiteLayout from './components/layout/SiteLayout.jsx'
import Events from './pages/Events.jsx'
import Home from './pages/Home.jsx'
import RSVP from './pages/RSVP.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import RequireAdmin from './pages/admin/RequireAdmin.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="rsvp" element={<RSVP />} />
      </Route>
      <Route path="admin/login" element={<AdminLogin />} />
      <Route
        path="admin"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />
    </Routes>
  )
}
