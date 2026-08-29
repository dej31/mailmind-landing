/** Types miroir du schéma SQL (supabase/migrations). Écrits à la main pour
 * ce projet plutôt que générés, mais avec la même forme que la sortie de
 * `supabase gen types typescript` — on peut les remplacer par une
 * génération automatique sans changer le reste du code. */
export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string
          slug: string
          name: string
          date: string
          start_time: string
          target_end_time: string
          status: string
          pool_match_duration: number
          semi_final_duration: number
          final_duration: number
          transition_duration: number
          points_win: number
          points_draw: number
          points_loss: number
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['tournaments']['Row']> & {
          slug: string
          name: string
          date: string
          start_time: string
          target_end_time: string
          owner_id: string
        }
        Update: Partial<Database['public']['Tables']['tournaments']['Row']>
        Relationships: []
      }
      pools: {
        Row: {
          id: string
          tournament_id: string
          name: string
          order_index: number
        }
        Insert: Partial<Database['public']['Tables']['pools']['Row']> & {
          tournament_id: string
          name: string
          order_index: number
        }
        Update: Partial<Database['public']['Tables']['pools']['Row']>
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          tournament_id: string
          name: string
          short_name: string | null
          category: string
          level: string | null
          status: string
          pool_id: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['teams']['Row']> & {
          tournament_id: string
          name: string
          category: string
        }
        Update: Partial<Database['public']['Tables']['teams']['Row']>
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          pool_id: string | null
          type: string
          team_a_id: string
          team_b_id: string
          scheduled_start: string
          planned_duration: number
          actual_start: string | null
          actual_end: string | null
          score_a: number | null
          score_b: number | null
          status: string
          order_index: number
        }
        Insert: Partial<Database['public']['Tables']['matches']['Row']> & {
          tournament_id: string
          type: string
          team_a_id: string
          team_b_id: string
          scheduled_start: string
          planned_duration: number
          order_index: number
        }
        Update: Partial<Database['public']['Tables']['matches']['Row']>
        Relationships: []
      }
      qualifications: {
        Row: {
          id: string
          tournament_id: string
          team_id: string
          seed: number
          source: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['qualifications']['Row']> & {
          tournament_id: string
          team_id: string
          seed: number
        }
        Update: Partial<Database['public']['Tables']['qualifications']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
