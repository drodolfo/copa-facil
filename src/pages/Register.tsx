import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      console.log('Submitting registration...')
      const result = await signUp(formData.email, formData.password, formData.fullName, formData.phone)
      console.log('Registration result:', result)

      if (result.user?.email_confirmed_at) {
        console.log('Email already confirmed, redirecting to dashboard...')
        navigate('/dashboard')
      } else {
        console.log('Email confirmation required')
        setSuccess(true)
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">Registrarse</h2>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">¡Registro exitoso!</p>
              <p className="text-sm mt-1">Hemos enviado un correo de confirmación a <strong>{formData.email}</strong>.</p>
              <p className="text-sm mt-2">Por favor, revisa tu correo y haz clic en el enlace de confirmación para iniciar sesión.</p>
              <Link
                to="/login"
                className="inline-block mt-3 text-green-700 hover:underline font-medium"
              >
                Ir a Iniciar Sesión
              </Link>
            </div>
          )}

          {error && !success && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
          )}

          <p className="text-center mt-4 text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-green-600 hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  )
}
