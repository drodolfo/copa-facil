import { supabase } from '../lib/supabase'
import type { Match } from '../types'

export async function getMatchesByTournament(tournamentId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('match_date', { ascending: true })

  if (error) throw error
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
