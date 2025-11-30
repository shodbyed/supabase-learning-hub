export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_at: string
          blocked_id: string
          blocker_id: string
          reason: string | null
        }
        Insert: {
          blocked_at?: string
          blocked_id: string
          blocker_id: string
          reason?: string | null
        }
        Update: {
          blocked_at?: string
          blocked_id?: string
          blocker_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      championship_date_options: {
        Row: {
          created_at: string | null
          dev_verified: boolean
          end_date: string
          id: string
          organization: string
          start_date: string
          updated_at: string | null
          vote_count: number
          year: number
        }
        Insert: {
          created_at?: string | null
          dev_verified?: boolean
          end_date: string
          id?: string
          organization: string
          start_date: string
          updated_at?: string | null
          vote_count?: number
          year: number
        }
        Update: {
          created_at?: string | null
          dev_verified?: boolean
          end_date?: string
          id?: string
          organization?: string
          start_date?: string
          updated_at?: string | null
          vote_count?: number
          year?: number
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          is_muted: boolean
          joined_at: string
          last_read_at: string | null
          left_at: string | null
          notifications_enabled: boolean
          role: string
          unread_count: number
          user_id: string
        }
        Insert: {
          conversation_id: string
          is_muted?: boolean
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          notifications_enabled?: boolean
          role?: string
          unread_count?: number
          user_id: string
        }
        Update: {
          conversation_id?: string
          is_muted?: boolean
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          notifications_enabled?: boolean
          role?: string
          unread_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          auto_managed: boolean
          conversation_type: string | null
          created_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          scope_id: string | null
          scope_type: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          auto_managed?: boolean
          conversation_type?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          scope_id?: string | null
          scope_type?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          auto_managed?: boolean
          conversation_type?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          scope_id?: string | null
          scope_type?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      handicap_chart_3vs3: {
        Row: {
          games_to_lose: number
          games_to_tie: number | null
          games_to_win: number
          hcp_diff: number
        }
        Insert: {
          games_to_lose: number
          games_to_tie?: number | null
          games_to_win: number
          hcp_diff: number
        }
        Update: {
          games_to_lose?: number
          games_to_tie?: number | null
          games_to_win?: number
          hcp_diff?: number
        }
        Relationships: []
      }
      league_venues: {
        Row: {
          added_at: string | null
          available_bar_box_tables: number
          available_regulation_tables: number
          available_total_tables: number | null
          id: string
          league_id: string
          updated_at: string | null
          venue_id: string
        }
        Insert: {
          added_at?: string | null
          available_bar_box_tables?: number
          available_regulation_tables?: number
          available_total_tables?: number | null
          id?: string
          league_id: string
          updated_at?: string | null
          venue_id: string
        }
        Update: {
          added_at?: string | null
          available_bar_box_tables?: number
          available_regulation_tables?: number
          available_total_tables?: number | null
          id?: string
          league_id?: string
          updated_at?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_venues_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_venues_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "resolved_league_preferences"
            referencedColumns: ["league_id"]
          },
          {
            foreignKeyName: "league_venues_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          created_at: string | null
          day_of_week: string
          division: string | null
          game_type: string
          golden_break_counts_as_win: boolean
          handicap_level: string
          handicap_variant: string
          id: string
          league_start_date: string
          organization_id: string
          status: string
          team_format: string
          team_handicap_variant: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          division?: string | null
          game_type: string
          golden_break_counts_as_win?: boolean
          handicap_level?: string
          handicap_variant?: string
          id?: string
          league_start_date: string
          organization_id: string
          status?: string
          team_format: string
          team_handicap_variant?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          division?: string | null
          game_type?: string
          golden_break_counts_as_win?: boolean
          handicap_level?: string
          handicap_variant?: string
          id?: string
          league_start_date?: string
          organization_id?: string
          status?: string
          team_format?: string
          team_handicap_variant?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leagues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      match_games: {
        Row: {
          away_action: string
          away_player_id: string | null
          away_position: number | null
          break_and_run: boolean
          confirmed_at: string | null
          confirmed_by_away: string | null
          confirmed_by_home: string | null
          created_at: string
          game_number: number
          game_type: string
          golden_break: boolean
          home_action: string
          home_player_id: string | null
          home_position: number | null
          id: string
          is_tiebreaker: boolean
          match_id: string
          updated_at: string
          vacate_requested_by: string | null
          winner_player_id: string | null
          winner_team_id: string | null
        }
        Insert: {
          away_action: string
          away_player_id?: string | null
          away_position?: number | null
          break_and_run?: boolean
          confirmed_at?: string | null
          confirmed_by_away?: string | null
          confirmed_by_home?: string | null
          created_at?: string
          game_number: number
          game_type: string
          golden_break?: boolean
          home_action: string
          home_player_id?: string | null
          home_position?: number | null
          id?: string
          is_tiebreaker?: boolean
          match_id: string
          updated_at?: string
          vacate_requested_by?: string | null
          winner_player_id?: string | null
          winner_team_id?: string | null
        }
        Update: {
          away_action?: string
          away_player_id?: string | null
          away_position?: number | null
          break_and_run?: boolean
          confirmed_at?: string | null
          confirmed_by_away?: string | null
          confirmed_by_home?: string | null
          created_at?: string
          game_number?: number
          game_type?: string
          golden_break?: boolean
          home_action?: string
          home_player_id?: string | null
          home_position?: number | null
          id?: string
          is_tiebreaker?: boolean
          match_id?: string
          updated_at?: string
          vacate_requested_by?: string | null
          winner_player_id?: string | null
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_games_confirmed_by_away_member_fkey"
            columns: ["confirmed_by_away"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_games_confirmed_by_home_member_fkey"
            columns: ["confirmed_by_home"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_games_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_games_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_lineups: {
        Row: {
          created_at: string
          home_team_modifier: number
          id: string
          locked: boolean
          locked_at: string | null
          match_id: string
          player1_handicap: number
          player1_id: string | null
          player2_handicap: number
          player2_id: string | null
          player3_handicap: number
          player3_id: string | null
          player4_handicap: number | null
          player4_id: string | null
          player5_handicap: number | null
          player5_id: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          home_team_modifier?: number
          id?: string
          locked?: boolean
          locked_at?: string | null
          match_id: string
          player1_handicap: number
          player1_id?: string | null
          player2_handicap: number
          player2_id?: string | null
          player3_handicap: number
          player3_id?: string | null
          player4_handicap?: number | null
          player4_id?: string | null
          player5_handicap?: number | null
          player5_id?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          home_team_modifier?: number
          id?: string
          locked?: boolean
          locked_at?: string | null
          match_id?: string
          player1_handicap?: number
          player1_id?: string | null
          player2_handicap?: number
          player2_id?: string | null
          player3_handicap?: number
          player3_id?: string | null
          player4_handicap?: number | null
          player4_id?: string | null
          player5_handicap?: number | null
          player5_id?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_lineups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_lineups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          actual_venue_id: string | null
          away_games_to_lose: number | null
          away_games_to_tie: number | null
          away_games_to_win: number | null
          away_games_won: number
          away_lineup_id: string | null
          away_points_earned: number
          away_team_id: string | null
          away_team_score: number | null
          away_team_verified_by: string | null
          away_tiebreaker_verified_by: string | null
          completed_at: string | null
          created_at: string
          home_games_to_lose: number | null
          home_games_to_tie: number | null
          home_games_to_win: number | null
          home_games_won: number
          home_lineup_id: string | null
          home_points_earned: number
          home_team_id: string | null
          home_team_score: number | null
          home_team_verified_by: string | null
          home_tiebreaker_verified_by: string | null
          id: string
          match_number: number
          match_result: string | null
          results_confirmed_by_away: boolean
          results_confirmed_by_home: boolean
          scheduled_venue_id: string | null
          season_id: string
          season_week_id: string
          started_at: string | null
          status: string
          updated_at: string
          winner_team_id: string | null
        }
        Insert: {
          actual_venue_id?: string | null
          away_games_to_lose?: number | null
          away_games_to_tie?: number | null
          away_games_to_win?: number | null
          away_games_won?: number
          away_lineup_id?: string | null
          away_points_earned?: number
          away_team_id?: string | null
          away_team_score?: number | null
          away_team_verified_by?: string | null
          away_tiebreaker_verified_by?: string | null
          completed_at?: string | null
          created_at?: string
          home_games_to_lose?: number | null
          home_games_to_tie?: number | null
          home_games_to_win?: number | null
          home_games_won?: number
          home_lineup_id?: string | null
          home_points_earned?: number
          home_team_id?: string | null
          home_team_score?: number | null
          home_team_verified_by?: string | null
          home_tiebreaker_verified_by?: string | null
          id?: string
          match_number: number
          match_result?: string | null
          results_confirmed_by_away?: boolean
          results_confirmed_by_home?: boolean
          scheduled_venue_id?: string | null
          season_id: string
          season_week_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
          winner_team_id?: string | null
        }
        Update: {
          actual_venue_id?: string | null
          away_games_to_lose?: number | null
          away_games_to_tie?: number | null
          away_games_to_win?: number | null
          away_games_won?: number
          away_lineup_id?: string | null
          away_points_earned?: number
          away_team_id?: string | null
          away_team_score?: number | null
          away_team_verified_by?: string | null
          away_tiebreaker_verified_by?: string | null
          completed_at?: string | null
          created_at?: string
          home_games_to_lose?: number | null
          home_games_to_tie?: number | null
          home_games_to_win?: number | null
          home_games_won?: number
          home_lineup_id?: string | null
          home_points_earned?: number
          home_team_id?: string | null
          home_team_score?: number | null
          home_team_verified_by?: string | null
          home_tiebreaker_verified_by?: string | null
          id?: string
          match_number?: number
          match_result?: string | null
          results_confirmed_by_away?: boolean
          results_confirmed_by_home?: boolean
          scheduled_venue_id?: string | null
          season_id?: string
          season_week_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_actual_venue_id_fkey"
            columns: ["actual_venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_away_lineup_id_fkey"
            columns: ["away_lineup_id"]
            isOneToOne: false
            referencedRelation: "match_lineups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_away_team_verified_by_fkey"
            columns: ["away_team_verified_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_away_tiebreaker_verified_by_fkey"
            columns: ["away_tiebreaker_verified_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_lineup_id_fkey"
            columns: ["home_lineup_id"]
            isOneToOne: false
            referencedRelation: "match_lineups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_verified_by_fkey"
            columns: ["home_team_verified_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_tiebreaker_verified_by_fkey"
            columns: ["home_tiebreaker_verified_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_scheduled_venue_id_fkey"
            columns: ["scheduled_venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_season_week_id_fkey"
            columns: ["season_week_id"]
            isOneToOne: false
            referencedRelation: "season_weeks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string
          bca_member_number: string | null
          city: string
          created_at: string | null
          date_of_birth: string
          email: string
          first_name: string
          id: string
          last_name: string
          membership_paid_date: string | null
          nickname: string | null
          phone: string
          profanity_filter_enabled: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          state: string
          system_player_number: number
          updated_at: string | null
          user_id: string | null
          zip_code: string
        }
        Insert: {
          address: string
          bca_member_number?: string | null
          city: string
          created_at?: string | null
          date_of_birth: string
          email: string
          first_name: string
          id?: string
          last_name: string
          membership_paid_date?: string | null
          nickname?: string | null
          phone: string
          profanity_filter_enabled?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state: string
          system_player_number?: number
          updated_at?: string | null
          user_id?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          bca_member_number?: string | null
          city?: string
          created_at?: string | null
          date_of_birth?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          membership_paid_date?: string | null
          nickname?: string | null
          phone?: string
          profanity_filter_enabled?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string
          system_player_number?: number
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_blackout_preferences: {
        Row: {
          auto_apply: boolean
          championship_id: string | null
          created_at: string | null
          custom_end_date: string | null
          custom_name: string | null
          custom_start_date: string | null
          holiday_name: string | null
          id: string
          organization_id: string
          preference_action: Database["public"]["Enums"]["preference_action"]
          preference_type: Database["public"]["Enums"]["preference_type"]
          updated_at: string | null
        }
        Insert: {
          auto_apply?: boolean
          championship_id?: string | null
          created_at?: string | null
          custom_end_date?: string | null
          custom_name?: string | null
          custom_start_date?: string | null
          holiday_name?: string | null
          id?: string
          organization_id: string
          preference_action: Database["public"]["Enums"]["preference_action"]
          preference_type: Database["public"]["Enums"]["preference_type"]
          updated_at?: string | null
        }
        Update: {
          auto_apply?: boolean
          championship_id?: string | null
          created_at?: string | null
          custom_end_date?: string | null
          custom_name?: string | null
          custom_start_date?: string | null
          holiday_name?: string | null
          id?: string
          organization_id?: string
          preference_action?: Database["public"]["Enums"]["preference_action"]
          preference_type?: Database["public"]["Enums"]["preference_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operator_blackout_preferences_championship_id_fkey"
            columns: ["championship_id"]
            isOneToOne: false
            referencedRelation: "championship_date_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operator_blackout_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_staff: {
        Row: {
          added_at: string | null
          added_by: string | null
          id: string
          member_id: string
          organization_id: string
          position: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          member_id: string
          organization_id: string
          position: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          member_id?: string
          organization_id?: string
          position?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_staff_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_staff_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_staff_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_zip: string
          card_brand: string
          card_last4: string
          created_at: string | null
          created_by: string
          expiry_month: number
          expiry_year: number
          id: string
          organization_address: string
          organization_city: string
          organization_email: string
          organization_email_visibility: string
          organization_name: string
          organization_phone: string
          organization_phone_visibility: string
          organization_state: string
          organization_zip_code: string
          payment_method_id: string
          payment_verified: boolean
          profanity_filter_enabled: boolean
          stripe_customer_id: string
          updated_at: string | null
        }
        Insert: {
          billing_zip: string
          card_brand: string
          card_last4: string
          created_at?: string | null
          created_by: string
          expiry_month: number
          expiry_year: number
          id?: string
          organization_address: string
          organization_city: string
          organization_email: string
          organization_email_visibility?: string
          organization_name: string
          organization_phone: string
          organization_phone_visibility?: string
          organization_state: string
          organization_zip_code: string
          payment_method_id: string
          payment_verified?: boolean
          profanity_filter_enabled?: boolean
          stripe_customer_id: string
          updated_at?: string | null
        }
        Update: {
          billing_zip?: string
          card_brand?: string
          card_last4?: string
          created_at?: string | null
          created_by?: string
          expiry_month?: number
          expiry_year?: number
          id?: string
          organization_address?: string
          organization_city?: string
          organization_email?: string
          organization_email_visibility?: string
          organization_name?: string
          organization_phone?: string
          organization_phone_visibility?: string
          organization_state?: string
          organization_zip_code?: string
          payment_method_id?: string
          payment_verified?: boolean
          profanity_filter_enabled?: boolean
          stripe_customer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      preferences: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          game_history_limit: number | null
          golden_break_counts_as_win: boolean | null
          handicap_variant: string | null
          id: string
          team_format: string | null
          team_handicap_variant: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          game_history_limit?: number | null
          golden_break_counts_as_win?: boolean | null
          handicap_variant?: string | null
          id?: string
          team_format?: string | null
          team_handicap_variant?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          game_history_limit?: number | null
          golden_break_counts_as_win?: boolean | null
          handicap_variant?: string | null
          id?: string
          team_format?: string | null
          team_handicap_variant?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      report_actions: {
        Row: {
          action_notes: string
          action_type: Database["public"]["Enums"]["moderation_action"]
          actor_id: string
          actor_role: string
          created_at: string
          id: string
          report_id: string
          suspension_until: string | null
        }
        Insert: {
          action_notes: string
          action_type: Database["public"]["Enums"]["moderation_action"]
          actor_id: string
          actor_role: string
          created_at?: string
          id?: string
          report_id: string
          suspension_until?: string | null
        }
        Update: {
          action_notes?: string
          action_type?: Database["public"]["Enums"]["moderation_action"]
          actor_id?: string
          actor_role?: string
          created_at?: string
          id?: string
          report_id?: string
          suspension_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_actions_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_actions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "user_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_updates: {
        Row: {
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["report_status"]
          old_status: Database["public"]["Enums"]["report_status"]
          report_id: string
          update_notes: string | null
          updater_id: string
          updater_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["report_status"]
          old_status: Database["public"]["Enums"]["report_status"]
          report_id: string
          update_notes?: string | null
          updater_id: string
          updater_role: string
        }
        Update: {
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["report_status"]
          old_status?: Database["public"]["Enums"]["report_status"]
          report_id?: string
          update_notes?: string | null
          updater_id?: string
          updater_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_updates_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "user_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_updates_updater_id_fkey"
            columns: ["updater_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      season_weeks: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          scheduled_date: string
          season_id: string
          updated_at: string | null
          week_completed: boolean
          week_name: string
          week_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_date: string
          season_id: string
          updated_at?: string | null
          week_completed?: boolean
          week_name: string
          week_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_date?: string
          season_id?: string
          updated_at?: string | null
          week_completed?: boolean
          week_name?: string
          week_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "season_weeks_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          league_id: string
          season_completed: boolean | null
          season_length: number
          season_name: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          league_id: string
          season_completed?: boolean | null
          season_length: number
          season_name: string
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          league_id?: string
          season_completed?: boolean | null
          season_length?: number
          season_name?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seasons_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seasons_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "resolved_league_preferences"
            referencedColumns: ["league_id"]
          },
        ]
      }
      team_players: {
        Row: {
          id: string
          individual_losses: number | null
          individual_wins: number | null
          is_captain: boolean | null
          joined_at: string | null
          member_id: string
          season_id: string
          skill_level: number | null
          status: string | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          individual_losses?: number | null
          individual_wins?: number | null
          is_captain?: boolean | null
          joined_at?: string | null
          member_id: string
          season_id: string
          skill_level?: number | null
          status?: string | null
          team_id: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          individual_losses?: number | null
          individual_wins?: number | null
          is_captain?: boolean | null
          joined_at?: string | null
          member_id?: string
          season_id?: string
          skill_level?: number | null
          status?: string | null
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_players_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          captain_id: string
          created_at: string | null
          games_lost: number | null
          games_won: number | null
          home_venue_id: string | null
          id: string
          league_id: string
          losses: number | null
          points: number | null
          roster_size: number
          season_id: string
          status: string | null
          team_name: string
          ties: number | null
          updated_at: string | null
          wins: number | null
        }
        Insert: {
          captain_id: string
          created_at?: string | null
          games_lost?: number | null
          games_won?: number | null
          home_venue_id?: string | null
          id?: string
          league_id: string
          losses?: number | null
          points?: number | null
          roster_size: number
          season_id: string
          status?: string | null
          team_name: string
          ties?: number | null
          updated_at?: string | null
          wins?: number | null
        }
        Update: {
          captain_id?: string
          created_at?: string | null
          games_lost?: number | null
          games_won?: number | null
          home_venue_id?: string | null
          id?: string
          league_id?: string
          losses?: number | null
          points?: number | null
          roster_size?: number
          season_id?: string
          status?: string | null
          team_name?: string
          ties?: number | null
          updated_at?: string | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_home_venue_id_fkey"
            columns: ["home_venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "resolved_league_preferences"
            referencedColumns: ["league_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reports: {
        Row: {
          assigned_organization_id: string | null
          auto_flagged: boolean | null
          category: Database["public"]["Enums"]["report_category"]
          context_data: Json | null
          created_at: string
          description: string
          escalated_to_dev: boolean | null
          evidence_snapshot: Json | null
          id: string
          reported_user_id: string
          reporter_id: string
          resolved_at: string | null
          reviewed_at: string | null
          severity: Database["public"]["Enums"]["report_severity"] | null
          status: Database["public"]["Enums"]["report_status"] | null
        }
        Insert: {
          assigned_organization_id?: string | null
          auto_flagged?: boolean | null
          category: Database["public"]["Enums"]["report_category"]
          context_data?: Json | null
          created_at?: string
          description: string
          escalated_to_dev?: boolean | null
          evidence_snapshot?: Json | null
          id?: string
          reported_user_id: string
          reporter_id: string
          resolved_at?: string | null
          reviewed_at?: string | null
          severity?: Database["public"]["Enums"]["report_severity"] | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Update: {
          assigned_organization_id?: string | null
          auto_flagged?: boolean | null
          category?: Database["public"]["Enums"]["report_category"]
          context_data?: Json | null
          created_at?: string
          description?: string
          escalated_to_dev?: boolean | null
          evidence_snapshot?: Json | null
          id?: string
          reported_user_id?: string
          reporter_id?: string
          resolved_at?: string | null
          reviewed_at?: string | null
          severity?: Database["public"]["Enums"]["report_severity"] | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_assigned_organization_id_fkey"
            columns: ["assigned_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_owners: {
        Row: {
          business_name: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          business_name: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          business_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      venues: {
        Row: {
          bar_box_tables: number
          business_hours: string | null
          city: string
          created_at: string | null
          id: string
          is_active: boolean
          league_contact_email: string | null
          league_contact_name: string | null
          league_contact_phone: string | null
          name: string
          notes: string | null
          organization_id: string | null
          phone: string
          proprietor_name: string | null
          proprietor_phone: string | null
          regulation_tables: number
          state: string
          street_address: string
          total_tables: number | null
          updated_at: string | null
          venue_owner_id: string | null
          website: string | null
          zip_code: string
        }
        Insert: {
          bar_box_tables?: number
          business_hours?: string | null
          city: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          league_contact_email?: string | null
          league_contact_name?: string | null
          league_contact_phone?: string | null
          name: string
          notes?: string | null
          organization_id?: string | null
          phone: string
          proprietor_name?: string | null
          proprietor_phone?: string | null
          regulation_tables?: number
          state: string
          street_address: string
          total_tables?: number | null
          updated_at?: string | null
          venue_owner_id?: string | null
          website?: string | null
          zip_code: string
        }
        Update: {
          bar_box_tables?: number
          business_hours?: string | null
          city?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          league_contact_email?: string | null
          league_contact_name?: string | null
          league_contact_phone?: string | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string
          proprietor_name?: string | null
          proprietor_phone?: string | null
          regulation_tables?: number
          state?: string
          street_address?: string
          total_tables?: number | null
          updated_at?: string | null
          venue_owner_id?: string | null
          website?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_venue_owner_id_fkey"
            columns: ["venue_owner_id"]
            isOneToOne: false
            referencedRelation: "venue_owners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      resolved_league_preferences: {
        Row: {
          game_history_limit: number | null
          golden_break_counts_as_win: boolean | null
          handicap_variant: string | null
          league_id: string | null
          organization_id: string | null
          team_format: string | null
          team_handicap_variant: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leagues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_announcement_conversation: {
        Args: { p_member_ids: string[]; p_season_id: string; p_title: string }
        Returns: string
      }
      create_dm_conversation: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      create_group_conversation: {
        Args: { creator_id: string; group_name: string; member_ids: string[] }
        Returns: string
      }
      create_organization_announcement_conversation: {
        Args: {
          p_member_ids: string[]
          p_organization_id: string
          p_title: string
        }
        Returns: string
      }
      get_current_member_id: { Args: never; Returns: string }
      get_operator_stats: { Args: { operator_id_param: string }; Returns: Json }
      is_conversation_participant: {
        Args: { conv_id: string; uid: string }
        Returns: boolean
      }
    }
    Enums: {
      moderation_action:
        | "warning"
        | "temporary_suspension"
        | "permanent_ban"
        | "account_deletion"
        | "no_action"
      preference_action: "blackout" | "ignore"
      preference_type: "holiday" | "championship" | "custom"
      report_category:
        | "inappropriate_message"
        | "harassment"
        | "fake_account"
        | "cheating"
        | "poor_sportsmanship"
        | "impersonation"
        | "spam"
        | "other"
      report_severity: "low" | "medium" | "high" | "critical"
      report_status:
        | "pending"
        | "under_review"
        | "escalated"
        | "action_taken"
        | "resolved"
        | "dismissed"
      user_role: "player" | "league_operator" | "developer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      moderation_action: [
        "warning",
        "temporary_suspension",
        "permanent_ban",
        "account_deletion",
        "no_action",
      ],
      preference_action: ["blackout", "ignore"],
      preference_type: ["holiday", "championship", "custom"],
      report_category: [
        "inappropriate_message",
        "harassment",
        "fake_account",
        "cheating",
        "poor_sportsmanship",
        "impersonation",
        "spam",
        "other",
      ],
      report_severity: ["low", "medium", "high", "critical"],
      report_status: [
        "pending",
        "under_review",
        "escalated",
        "action_taken",
        "resolved",
        "dismissed",
      ],
      user_role: ["player", "league_operator", "developer"],
    },
  },
} as const

