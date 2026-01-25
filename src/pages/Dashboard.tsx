import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { getAllTournaments } from '../services/tournamentService'
import { getAllUsers } from '../services/userService'
import { getStandings, updateStandings } from '../services/standingsService'
import { getCompletedMatches, getAllMatchesWithTeams } from '../services/matchService'
import type { Tournament, User, Standing } from '../types'
import type { MatchWithTeams } from '../services/matchService'

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'matches' | 'contacts' | 'standings' | 'results'>('matches')
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [standings, setStandings] = useState<Standing[]>([])
  const [results, setResults] = useState<MatchWithTeams[]>([])
  const [selectedTournament, setSelectedTournament] = useState<string>('')
  const [selectedResultsTournament, setSelectedResultsTournament] = useState<string>('')
  const [loading, setLoading] = useState(true)

  console.log('Dashboard rendered. User:', user)
  console.log('Dashboard loading state:', loading)
  console.log('Dashboard activeTab:', activeTab)
  console.log('Dashboard tournaments length:', tournaments.length)

  const loadData = useCallback(async () => {
    console.log('Dashboard: Starting to load data...')
    try {
      const [tournamentsData, usersData] = await Promise.all([
        getAllTournaments(),
        getAllUsers(),
      ])
      console.log('Dashboard: Data loaded', { tournaments: tournamentsData.length, users: usersData.length })
      setTournaments(tournamentsData)
      setUsers(usersData.filter(u => u.id !== user?.id))
    } catch (error) {
      console.error('Dashboard: Error loading data:', error)
    } finally {
      console.log('Dashboard: Setting loading to false')
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    console.log('Dashboard: useEffect triggered, user:', user)
    if (user) {
      console.log('Dashboard: User exists, loading data...')
      loadData()
    } else {
      console.log('Dashboard: No user, setting loading to false')
      setLoading(false)
    }
  }, [user, loadData])

  useEffect(() => {
    console.log('Active tab changed to:', activeTab)
    if (activeTab === 'results' && selectedResultsTournament) {
      console.log('Auto-loading results when switching to results tab')
      loadResults(selectedResultsTournament)
    }
  }, [activeTab])

  // Force load results when switching to results tab, even if no tournament selected
  useEffect(() => {
    if (activeTab === 'results' && !selectedResultsTournament && tournaments.length > 0) {
      console.log('Auto-selecting first tournament for results')
      const firstTournament = tournaments[0].id
      setSelectedResultsTournament(firstTournament)
      loadResults(firstTournament)
    }
  }, [activeTab, tournaments])

  useEffect(() => {
    console.log('selectedResultsTournament changed:', selectedResultsTournament)
    if (selectedResultsTournament && activeTab === 'results') {
      console.log('Auto-loading results for selected tournament')
      loadResults(selectedResultsTournament)
    }
  }, [selectedResultsTournament, activeTab])

  const loadStandings = async (tournamentId: string) => {
    if (!tournamentId) {
      setStandings([])
      return
    }
    try {
      console.log('Loading standings for tournament:', tournamentId)
      let standingsData = await getStandings(tournamentId)
      console.log('Standings data received:', standingsData)
      
      // If no standings exist, try to update them first
      if (standingsData.length === 0) {
        console.log('No standings found, updating...')
        await updateStandings(tournamentId)
        standingsData = await getStandings(tournamentId)
        console.log('Updated standings data:', standingsData)
      }
      
      setStandings(standingsData)
    } catch (error) {
      console.error('Error loading standings:', error)
      setStandings([])
    }
  }

  const loadResults = async (tournamentId: string) => {
    console.log('=== loadResults called ===')
    console.log('Tournament ID:', tournamentId)
    
    if (!tournamentId) {
      console.log('loadResults: No tournamentId provided')
      setResults([])
      return
    }
    
    try {
      console.log('Loading results for tournament:', tournamentId)
      
      // First try completed matches
      console.log('--- Trying completed matches ---')
      let resultsData = await getCompletedMatches(tournamentId)
      console.log('Completed matches result:', resultsData)
      
      // If no completed matches, try to get all matches
      if (resultsData.length === 0) {
        console.log('--- No completed matches found, trying all matches ---')
        resultsData = await getAllMatchesWithTeams(tournamentId)
        console.log('All matches result:', resultsData)
      }
      
      console.log('Final results data length:', resultsData.length)
      console.log('Setting results in state...')
      setResults(resultsData)
      console.log('Results state updated')
    } catch (error) {
      console.error('Error loading results:', error)
      setResults([])
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
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium ${
                activeTab === 'results'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Resultados
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
                    value={selectedTournament}
                    onChange={(e) => {
                      const tournamentId = e.target.value
                      setSelectedTournament(tournamentId)
                      loadStandings(tournamentId)
                    }}
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

            {activeTab === 'results' && (
              (() => {
                console.log('Rendering results section. selectedResultsTournament:', selectedResultsTournament)
                console.log('Available tournaments:', tournaments)
                return (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Resultados de Partidos</h2>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Seleccionar Torneo</label>
                      <select
                        value={selectedResultsTournament}
                        onChange={(e) => {
                          console.log('Select onChange triggered, value:', e.target.value)
                          const tournamentId = e.target.value
                          console.log('Calling setSelectedResultsTournament with:', tournamentId)
                          setSelectedResultsTournament(tournamentId)
                          console.log('Calling loadResults with:', tournamentId)
                          loadResults(tournamentId)
                        }}
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

                {results.length === 0 ? (
                  <p className="text-gray-500">Selecciona un torneo para ver los resultados de los partidos</p>
                ) : (
                  <div className="space-y-4">
                    {results.map((match) => (
                      <div key={match.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="flex-1 text-center">
                            <p className="font-semibold">{match.home_team.name}</p>
                          </div>
                          <div className="px-4">
                            <div className="text-2xl font-bold">
                              {match.home_score} - {match.away_score}
                            </div>
                          </div>
                          <div className="flex-1 text-center">
                            <p className="font-semibold">{match.away_team.name}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 text-center">
                          <p>{new Date(match.match_date).toLocaleDateString()} • {match.venue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                  </div>
                )
              })()
            )}
          </>
        )}
      </div>
    </Layout>
  )
}