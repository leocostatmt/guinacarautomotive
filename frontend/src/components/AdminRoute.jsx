import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children, allowedRoles = ['ADMIN', 'FUNCIONARIO'] }) {
  const { isLoggedIn, user, loadingUser } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (loadingUser || !user) {
    return (
      <div className="page">
        <div className="container page-section">
          <div className="skeleton" style={{ height: 220 }} />
        </div>
      </div>
    )
  }

  if (!allowedRoles.includes(user.role)) {
    // Se for funcionário tentando abrir rota exclusiva de ADMIN, envia para Pedidos
    if (user.role === 'FUNCIONARIO') {
      return <Navigate to="/admin/pedidos" replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}
