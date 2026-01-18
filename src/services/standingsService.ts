import { supabase } from '../lib/supabase'
import type { Standing } from '../types'

export async function getStandings(tournamentId: string): Promise<Standing[]> {
  const { data, error } = await supabase
    .from('standings')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('points', { ascending: false })
    .order('goal_difference', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateStandings(tournamentId: string): Promise<void> {
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('status', 'completed')

  if (matchesError) throw matchesError

  const teamStats = new Map<string, Standing>()

  matches?.forEach(match => {
    const homeKey = match.home_team_id
    const awayKey = match.away_team_id

    if (!teamStats.has(homeKey)) {
      const team = { data: { name: 'Team' } }
      teamStats.set(homeKey, {
        team_id: homeKey,
        team_name: team.data.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0,
      })
    }

    if (!teamStats.has(awayKey)) {
      const team = { data: { name: 'Team' } }
      teamStats.set(awayKey, {
        team_id: awayKey,
        team_name: team.data.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0,
      })
    }

    const homeStats = teamStats.get(homeKey)!
    const awayStats = teamStats.get(awayKey)!

    homeStats.played += 1
    awayStats.played += 1

    const homeScore = match.home_score || 0
    const awayScore = match.away_score || 0

    homeStats.goals_for += homeScore
    homeStats.goals_against += awayScore
    homeStats.goal_difference = homeStats.goals_for - homeStats.goals_against

    awayStats.goals_for += awayScore
    awayStats.goals_against += homeScore
    awayStats.goal_difference = awayStats.goals_for - awayStats.goals_against

    if (homeScore > awayScore) {
      homeStats.won += 1
      homeStats.points += 3
      awayStats.lost += 1
    } else if (homeScore < awayScore) {
      awayStats.won += 1
      awayStats.points += 3
      homeStats.lost += 1
    } else {
      homeStats.drawn += 1
      homeStats.points += 1
      awayStats.drawn += 1
      awayStats.points += 1
    }
  })

  const standings = Array.from(teamStats.values())

  await supabase
    .from('standings')
    .delete()
    .eq('tournament_id', tournamentId)

  for (const standing of standings) {
    await supabase
      .from('standings')
      .insert([{
        ...standing,
        tournament_id: tournamentId,
      }])
  }
}
