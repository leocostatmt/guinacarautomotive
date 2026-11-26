import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { isLoggedIn, loadingUser } = useAuth()
  const location = useLocation()

  if (loadingUser) {
    return (
      <div className="page">
        <div className="container page-section">
          <div className="skeleton" style={{ height: 220 }} />
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
