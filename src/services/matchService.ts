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

  try {
    // Try to get matches with status 'completed' first
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
  } catch (error) {
    console.error('Error in getCompletedMatches:', error)
    // Fallback: try to get any matches with scores
    try {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .eq('tournament_id', tournamentId)
        .not('home_score', 'is', null)
        .not('away_score', 'is', null)
        .order('match_date', { ascending: false })

      if (fallbackError) {
        throw fallbackError
      }

      console.log('getCompletedMatches fallback success:', fallbackData)
      return fallbackData || []
    } catch (fallbackError) {
      console.error('Both primary and fallback queries failed:', fallbackError)
      throw fallbackError
    }
  }
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
