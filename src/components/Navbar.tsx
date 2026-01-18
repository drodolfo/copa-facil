import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-green-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-white text-xl font-bold">⚽ Copa Fácil</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-green-300 transition">
              Inicio
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-green-300 transition">
                  Dashboard
                </Link>
                {user.profile?.role === 'admin' && (
                  <Link to="/admin" className="text-white hover:text-green-300 transition">
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="text-white hover:text-green-300 transition">
                  Perfil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-green-300 transition">
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
