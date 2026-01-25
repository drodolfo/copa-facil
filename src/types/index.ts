export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  team_name: string
  role: 'user' | 'admin'
  created_at: string
}

export interface Tournament {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'pending'
  created_by: string
  created_at: string
}

export interface Team {
  id: string
  name: string
  captain_id: string
  tournament_id: string
  created_at: string
}

export interface Match {
  id: string
  tournament_id: string
  home_team_id: string
  away_team_id: string
  home_score: number | null
  away_score: number | null
  match_date: string
  venue: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  round: string
  created_at: string
}

export interface MatchTeam extends Team {
  home_score?: number
  away_score?: number
}

export interface Standing {
  team_id: string
  team_name: string
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  tournament_id?: string
}

export interface KnockoutRound {
  id: string
  tournament_id: string
  name: string
  round_number: number
  created_at: string
}

export interface KnockoutMatch {
  id: string
  round_id: string
  home_team_id: string | null
  away_team_id: string | null
  home_score: number | null
  away_score: number | null
  match_date: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  winner_team_id: string | null
  created_at: string
}
