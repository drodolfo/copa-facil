import { supabase } from '../lib/supabase'
import type { Team } from '../types'

export async function getTeamsByTournament(tournamentId: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getTeamById(id: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createTeam(team: Omit<Team, 'id' | 'created_at'>): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .insert([team])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTeam(id: string): Promise<void> {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id)

  if (error) throw error
}
