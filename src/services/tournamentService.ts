import { supabase } from '../lib/supabase'
import type { Tournament } from '../types'

export async function getAllTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getTournamentById(id: string): Promise<Tournament | null> {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createTournament(tournament: Omit<Tournament, 'id' | 'created_at'>): Promise<Tournament> {
  const { data, error } = await supabase
    .from('tournaments')
    .insert([tournament])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament> {
  const { data, error } = await supabase
    .from('tournaments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTournament(id: string): Promise<void> {
  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', id)

  if (error) throw error
}
