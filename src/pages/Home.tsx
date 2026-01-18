import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="py-20 bg-gradient-to-r from-green-800 to-green-600">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-6xl font-bold mb-6">⚽ Copa Fácil</h1>
          <p className="text-2xl mb-8">Sistema de Gestión de Torneos de Fútbol</p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-green-800 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
            >
              Registrarse
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-white rounded-lg font-bold text-lg hover:bg-white hover:text-green-800 transition"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">Torneos</h3>
              <p className="text-gray-600">Organiza torneos de fútbol</p>
            </div>
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Estadísticas</h3>
              <p className="text-gray-600">Tablas de posiciones</p>
            </div>
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">Comunidad</h3>
              <p className="text-gray-600">Conecta con jugadores</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
