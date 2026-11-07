import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

export default function RequireAdmin({ children }) {
  const { configured, loading, session, isAdmin } = useAdminAuth()

  if (!configured) {
    return <Navigate to="/admin/login" replace />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory text-sm text-brown">
        Checking your session…
      </div>
    )
  }

  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
