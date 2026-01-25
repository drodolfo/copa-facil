import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { getAllTournaments, createTournament } from '../services/tournamentService'
import { getMatchesWithTeamsByTournament, createMatch, updateMatch } from '../services/matchService'
import { getTeamsByTournament, createTeam, deleteTeam } from '../services/teamService'
import { getAllUsers } from '../services/userService'
import { updateStandings } from '../services/standingsService'
import type { Tournament, Team, User } from '../types'
import type { MatchWithTeams } from '../services/matchService'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'tournaments' | 'matches' | 'teams'>('tournaments')
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState<string>('')
  const [matches, setMatches] = useState<MatchWithTeams[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])

  const loadTournaments = async () => {
    try {
      const data = await getAllTournaments()
      setTournaments(data)
    } catch (error) {
      console.error('Error loading tournaments:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadMatches = async (tournamentId: string) => {
    try {
      const data = await getMatchesWithTeamsByTournament(tournamentId)
      setMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
    }
  }

  const loadTeams = async (tournamentId: string) => {
    try {
      const data = await getTeamsByTournament(tournamentId)
      setTeams(data)
    } catch (error) {
      console.error('Error loading teams:', error)
    }
  }

  useEffect(() => {
    if (selectedTournament) {
      loadMatches(selectedTournament)
      loadTeams(selectedTournament)
    }
  }, [selectedTournament])

  useEffect(() => {
    if (user?.profile?.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    loadTournaments()
    loadUsers()
  }, [user, navigate])

  const handleCreateTournament = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const tournament = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      status: 'active' as const,
      created_by: user?.id || '',
    }
    try {
      await createTournament(tournament)
      loadTournaments()
      e.currentTarget.reset()
    } catch (error) {
      console.error('Error creating tournament:', error)
    }
  }

  const handleCreateMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const match = {
      tournament_id: selectedTournament,
      home_team_id: formData.get('home_team_id') as string,
      away_team_id: formData.get('away_team_id') as string,
      home_score: null,
      away_score: null,
      match_date: formData.get('match_date') as string,
      venue: '',
      status: 'scheduled' as const,
      round: formData.get('round') as string,
    }
    try {
      await createMatch(match)
      loadMatches(selectedTournament)
      e.currentTarget.reset()
    } catch (error) {
      console.error('Error creating match:', error)
    }
  }

  const handleUpdateMatch = async (matchId: string, homeScore: number, awayScore: number) => {
    try {
      await updateMatch(matchId, {
        home_score: homeScore,
        away_score: awayScore,
        status: 'completed',
      })
      await updateStandings(selectedTournament)
      loadMatches(selectedTournament)
    } catch (error) {
      console.error('Error updating match:', error)
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'tournaments'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Torneos
            </button>
            <button
              onClick={() => {
                setActiveTab('teams')
                loadUsers()
              }}
              className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'teams'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Equipos
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'matches'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Partidos
            </button>
          </nav>
        </div>

        {activeTab === 'tournaments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Crear Torneo</h2>
              <form onSubmit={handleCreateTournament} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Nombre del Torneo</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Descripción</label>
                  <textarea
                    name="description"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Fecha de Inicio</label>
                    <input
                      type="date"
                      name="start_date"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Fecha de Fin</label>
                    <input
                      type="date"
                      name="end_date"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Crear Torneo
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Torneos Existentes</h2>
              {tournaments.length === 0 ? (
                <p className="text-gray-500">No hay torneos creados</p>
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
                      <button
                        onClick={() => {
                          setSelectedTournament(tournament.id)
                          setActiveTab('teams')
                        }}
                        className="mt-3 bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition"
                      >
                        Gestionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Seleccionar Torneo</label>
              <select
                value={selectedTournament}
                onChange={(e) => {
                  setSelectedTournament(e.target.value)
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

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Asociar Equipos de Usuarios</h2>
              <p className="text-gray-600 mb-4">Selecciona los equipos registrados por usuarios para agregarlos al torneo:</p>
              <div className="space-y-3">
                {users.filter(u => u.team_name && u.team_name !== 'Sin equipo').map((user) => {
                  const isTeamInTournament = teams.some(t => t.captain_id === user.id && t.tournament_id === selectedTournament)
                  return (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">{user.team_name}</p>
                        <p className="text-sm text-gray-600">Capitán: {user.full_name} ({user.email})</p>
                      </div>
                      {!isTeamInTournament ? (
                        <button
                          onClick={() => {
                            const team = {
                              name: user.team_name,
                              captain_id: user.id,
                              tournament_id: selectedTournament,
                            }
                            createTeam(team).then(() => loadTeams(selectedTournament))
                          }}
                          disabled={!selectedTournament}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:bg-gray-400 text-sm"
                        >
                          Agregar al Torneo
                        </button>
                      ) : (
                        <span className="text-green-600 text-sm font-medium">Ya está en el torneo</span>
                      )}
                    </div>
                  )
                })}
                {users.filter(u => u.team_name && u.team_name !== 'Sin equipo').length === 0 && (
                  <p className="text-gray-500">No hay equipos registrados por usuarios</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Equipos del Torneo</h2>
              {teams.length === 0 ? (
                <p className="text-gray-500">Selecciona un torneo para ver los equipos</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <div key={team.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-gray-600">Capitán: {team.captain_id}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar este equipo?')) {
                            deleteTeam(team.id).then(() => loadTeams(selectedTournament))
                          }
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Seleccionar Torneo</label>
              <select
                value={selectedTournament}
                onChange={(e) => {
                  setSelectedTournament(e.target.value)
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

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Crear Partido</h2>
              <form onSubmit={handleCreateMatch} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Equipo Local</label>
                    <select
                      name="home_team_id"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      required
                    >
                      <option value="">Seleccionar equipo</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Equipo Visitante</label>
                    <select
                      name="away_team_id"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      required
                    >
                      <option value="">Seleccionar equipo</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Fecha del Partido</label>
                  <input
                    type="datetime-local"
                    name="match_date"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Ronda</label>
                  <input
                    type="text"
                    name="round"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Ej: Jornada 1, Semifinal"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!selectedTournament}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  Crear Partido
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Partidos del Torneo</h2>
              {matches.length === 0 ? (
                <p className="text-gray-500">Selecciona un torneo para ver los partidos</p>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => {
                    return (
                      <div key={match.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-semibold">{match.home_team.name}</p>
                          </div>
                          <div className="px-4">
                            {match.status === 'completed' ? (
                              <span className="text-2xl font-bold">
                                {match.home_score} - {match.away_score}
                              </span>
                            ) : (
                              <span className="text-gray-500">VS</span>
                            )}
                          </div>
                          <div className="flex-1 text-right">
                            <p className="font-semibold">{match.away_team.name}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 flex justify-between">
                          <span>{new Date(match.match_date).toLocaleString()}</span>
                          <span className={`px-2 py-1 rounded ${match.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {match.status}
                          </span>
                        </div>
                        {match.status !== 'completed' && (
                          <div className="mt-3 flex space-x-2">
                            <input
                              type="number"
                              placeholder="Goles local"
                              className="w-24 px-2 py-1 border rounded"
                              id={`home-${match.id}`}
                            />
                            <input
                              type="number"
                              placeholder="Goles visitante"
                              className="w-24 px-2 py-1 border rounded"
                              id={`away-${match.id}`}
                            />
                            <button
                              onClick={() => {
                                const homeScore = parseInt((document.getElementById(`home-${match.id}`) as HTMLInputElement)?.value || '0')
                                const awayScore = parseInt((document.getElementById(`away-${match.id}`) as HTMLInputElement)?.value || '0')
                                handleUpdateMatch(match.id, homeScore, awayScore)
                              }}
                              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                            >
                              Actualizar
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
