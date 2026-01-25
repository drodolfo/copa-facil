import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import type { User as UserType } from '../types'

export default function Profile() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      if (user.profile) {
        setUserData(user.profile)
      } else {
        setUserData({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          team_name: user.user_metadata?.team_name || '',
          role: 'user',
          created_at: user.created_at || '',
        })
      }
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10">Cargando...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-10 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Mi Perfil</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Nombre</label>
              <p className="text-gray-900">{userData?.full_name}</p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email</label>
              <p className="text-gray-900">{userData?.email}</p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Teléfono</label>
              <p className="text-gray-900">{userData?.phone}</p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Rol</label>
              <p className="text-gray-900">
                {userData?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Fecha de Registro</label>
              <p className="text-gray-900">
                {new Date(userData?.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
