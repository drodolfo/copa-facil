import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { getAllTournaments } from '../services/tournamentService'
import { getAllUsers } from '../services/userService'
import { getStandings } from '../services/standingsService'
import type { Tournament, User, Standing } from '../types'

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'matches' | 'contacts' | 'standings'>('matches')
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [standings, setStandings] = useState<Standing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tournamentsData, usersData] = await Promise.all([
        getAllTournaments(),
        getAllUsers(),
      ])
      setTournaments(tournamentsData)
      setUsers(usersData.filter(u => u.id !== user?.id))
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const loadStandings = async (tournamentId: string) => {
    try {
      const standingsData = await getStandings(tournamentId)
      setStandings(standingsData)
    } catch (error) {
      console.error('Error loading standings:', error)
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('matches')}
              className={`py-4 px-1 border-b-2 font-medium ${
                activeTab === 'matches'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Partidos
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-4 px-1 border-b-2 font-medium ${
                activeTab === 'contacts'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Contactos
            </button>
            <button
              onClick={() => setActiveTab('standings')}
              className={`py-4 px-1 border-b-2 font-medium ${
                activeTab === 'standings'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tabla de Posiciones
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-10">Cargando...</div>
        ) : (
          <>
            {activeTab === 'matches' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Torneos Disponibles</h2>
                {tournaments.length === 0 ? (
                  <p className="text-gray-500">No hay torneos disponibles</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {tournaments.map((tournament) => (
                      <div key={tournament.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg">{tournament.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{tournament.description}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>Inicio: {new Date(tournament.start_date).toLocaleDateString()}</p>
                          <p>Estado: {tournament.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Contactos</h2>
                {users.length === 0 ? (
                  <p className="text-gray-500">No hay otros usuarios registrados</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {users.map((contact) => (
                      <div key={contact.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg">{contact.full_name}</h3>
                        <p className="text-gray-600 text-sm mt-1">📧 {contact.email}</p>
                        <p className="text-gray-600 text-sm">📞 {contact.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'standings' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Tabla de Posiciones</h2>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Seleccionar Torneo</label>
                  <select
                    onChange={(e) => loadStandings(e.target.value)}
                    className="w-full md:w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="">Seleccionar torneo</option>
                    {tournaments.map((tournament) => (
                      <option key={tournament.id} value={tournament.id}>
                        {tournament.name}
                      </option>
                    ))}
                  </select>
                </div>

                {standings.length === 0 ? (
                  <p className="text-gray-500">Selecciona un torneo para ver la tabla de posiciones</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pos</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PJ</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PG</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PE</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PP</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GF</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GC</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DIF</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PTS</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {standings.map((standing, index) => (
                          <tr key={standing.team_id}>
                            <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">{standing.team_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{standing.played}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{standing.won}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{standing.drawn}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{standing.lost}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{standing.goals_for}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{standing.goals_against}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{standing.goal_difference}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold">{standing.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
