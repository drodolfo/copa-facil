import { supabase } from '../lib/supabase'
import type { Match, Team } from '../types'

export interface MatchWithTeams extends Match {
  home_team: Team
  away_team: Team
}

export async function getMatchesByTournament(tournamentId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('match_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getMatchesWithTeamsByTournament(tournamentId: string): Promise<MatchWithTeams[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq('tournament_id', tournamentId)
    .order('match_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getAllMatchesWithTeams(tournamentId: string): Promise<MatchWithTeams[]> {
  console.log('getAllMatchesWithTeams called with tournamentId:', tournamentId)

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq('tournament_id', tournamentId)
    .order('match_date', { ascending: false })

  if (error) {
    console.error('getAllMatchesWithTeams error:', error)
    throw error
  }
  console.log('getAllMatchesWithTeams success:', data)
  return data || []
}

export async function getCompletedMatches(tournamentId: string): Promise<MatchWithTeams[]> {
  console.log('getCompletedMatches called with tournamentId:', tournamentId)

  // First, let's check if there are any matches at all
  const { data: allMatches, error: allMatchesError } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournamentId)

  console.log('All matches for tournament:', allMatches)
  console.log('All matches error:', allMatchesError)

  // Check matches by status
  const { data: completedMatches } = await supabase
    .from('matches')
    .select('status')
    .eq('tournament_id', tournamentId)

  console.log('Match statuses:', completedMatches)

  // Now check for completed matches with team relations
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq('tournament_id', tournamentId)
    .eq('status', 'completed')
    .order('match_date', { ascending: false })

  if (error) {
    console.error('getCompletedMatches error:', error)
    throw error
  }
  console.log('getCompletedMatches success:', data)
  return data || []
}

export async function getMatchById(id: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createMatch(match: Omit<Match, 'id' | 'created_at'>): Promise<Match> {
  const { data, error } = await supabase
    .from('matches')
    .insert([match])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMatch(id: string, updates: Partial<Match>): Promise<Match> {
  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMatch(id: string): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', id)

  if (error) throw error
}
