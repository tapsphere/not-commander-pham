export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      aria_conversations: {
        Row: {
          created_at: string | null
          id: string
          message_content: string
          message_role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_content: string
          message_role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_content?: string
          message_role?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_customizations: {
        Row: {
          brand_id: string
          created_at: string | null
          custom_config: Json | null
          customization_prompt: string | null
          generated_game_html: string | null
          id: string
          live_end_date: string | null
          live_start_date: string | null
          logo_url: string | null
          primary_color: string | null
          published_at: string | null
          secondary_color: string | null
          template_id: string
          unique_code: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          custom_config?: Json | null
          customization_prompt?: string | null
          generated_game_html?: string | null
          id?: string
          live_end_date?: string | null
          live_start_date?: string | null
          logo_url?: string | null
          primary_color?: string | null
          published_at?: string | null
          secondary_color?: string | null
          template_id: string
          unique_code?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          custom_config?: Json | null
          customization_prompt?: string | null
          generated_game_html?: string | null
          id?: string
          live_end_date?: string | null
          live_start_date?: string | null
          logo_url?: string | null
          primary_color?: string | null
          published_at?: string | null
          secondary_color?: string | null
          template_id?: string
          unique_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_customizations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "game_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      game_results: {
        Row: {
          competency_id: string | null
          created_at: string | null
          customization_id: string | null
          gameplay_data: Json | null
          id: string
          passed: boolean
          proficiency_level: string | null
          scoring_metrics: Json
          sub_competency_id: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          competency_id?: string | null
          created_at?: string | null
          customization_id?: string | null
          gameplay_data?: Json | null
          id?: string
          passed: boolean
          proficiency_level?: string | null
          scoring_metrics?: Json
          sub_competency_id?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          competency_id?: string | null
          created_at?: string | null
          customization_id?: string | null
          gameplay_data?: Json | null
          id?: string
          passed?: boolean
          proficiency_level?: string | null
          scoring_metrics?: Json
          sub_competency_id?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_results_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "master_competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_results_customization_id_fkey"
            columns: ["customization_id"]
            isOneToOne: false
            referencedRelation: "brand_customizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_results_sub_competency_id_fkey"
            columns: ["sub_competency_id"]
            isOneToOne: false
            referencedRelation: "sub_competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_results_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "game_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      game_templates: {
        Row: {
          base_prompt: string | null
          competency_id: string | null
          created_at: string | null
          creator_id: string
          custom_game_url: string | null
          description: string | null
          game_config: Json
          id: string
          is_published: boolean | null
          name: string
          preview_image: string | null
          selected_sub_competencies: string[] | null
          template_type: string
          updated_at: string | null
        }
        Insert: {
          base_prompt?: string | null
          competency_id?: string | null
          created_at?: string | null
          creator_id: string
          custom_game_url?: string | null
          description?: string | null
          game_config?: Json
          id?: string
          is_published?: boolean | null
          name: string
          preview_image?: string | null
          selected_sub_competencies?: string[] | null
          template_type?: string
          updated_at?: string | null
        }
        Update: {
          base_prompt?: string | null
          competency_id?: string | null
          created_at?: string | null
          creator_id?: string
          custom_game_url?: string | null
          description?: string | null
          game_config?: Json
          id?: string
          is_published?: boolean | null
          name?: string
          preview_image?: string | null
          selected_sub_competencies?: string[] | null
          template_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_templates_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "master_competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      master_competencies: {
        Row: {
          cbe_category: string
          created_at: string | null
          departments: string[]
          id: string
          name: string
        }
        Insert: {
          cbe_category: string
          created_at?: string | null
          departments?: string[]
          id?: string
          name: string
        }
        Update: {
          cbe_category?: string
          created_at?: string | null
          departments?: string[]
          id?: string
          name?: string
        }
        Relationships: []
      }
      performance_indicators: {
        Row: {
          competency_id: string
          created_at: string | null
          description: string
          id: string
        }
        Insert: {
          competency_id: string
          created_at?: string | null
          description: string
          id?: string
        }
        Update: {
          competency_id?: string
          created_at?: string | null
          description?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_indicators_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "master_competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          company_description: string | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          location: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          bio?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          bio?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      sub_competencies: {
        Row: {
          backend_data_captured: Json | null
          competency_id: string
          created_at: string | null
          id: string
          player_action: string | null
          scoring_logic: Json | null
          statement: string
        }
        Insert: {
          backend_data_captured?: Json | null
          competency_id: string
          created_at?: string | null
          id?: string
          player_action?: string | null
          scoring_logic?: Json | null
          statement: string
        }
        Update: {
          backend_data_captured?: Json | null
          competency_id?: string
          created_at?: string | null
          id?: string
          player_action?: string | null
          scoring_logic?: Json | null
          statement?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "master_competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      template_competencies: {
        Row: {
          behavior_triggers: Json | null
          competency_name: string
          created_at: string | null
          id: string
          scoring_rules: Json | null
          sub_competencies: string[] | null
          template_id: string
          xp_values: Json | null
        }
        Insert: {
          behavior_triggers?: Json | null
          competency_name: string
          created_at?: string | null
          id?: string
          scoring_rules?: Json | null
          sub_competencies?: string[] | null
          template_id: string
          xp_values?: Json | null
        }
        Update: {
          behavior_triggers?: Json | null
          competency_name?: string
          created_at?: string | null
          id?: string
          scoring_rules?: Json | null
          sub_competencies?: string[] | null
          template_id?: string
          xp_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "template_competencies_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "game_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string | null
          earned_from: string | null
          id: string
          skill_level: string | null
          skill_name: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string | null
          earned_from?: string | null
          id?: string
          skill_level?: string | null
          skill_name: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string | null
          earned_from?: string | null
          id?: string
          skill_level?: string | null
          skill_name?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      work_preferences: {
        Row: {
          created_at: string | null
          id: string
          max_salary: number | null
          min_salary: number | null
          preferred_industries: string[] | null
          preferred_locations: string[] | null
          updated_at: string | null
          user_id: string
          work_type: string[] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_salary?: number | null
          min_salary?: number | null
          preferred_industries?: string[] | null
          preferred_locations?: string[] | null
          updated_at?: string | null
          user_id: string
          work_type?: string[] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_salary?: number | null
          min_salary?: number | null
          preferred_industries?: string[] | null
          preferred_locations?: string[] | null
          updated_at?: string | null
          user_id?: string
          work_type?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "creator" | "brand" | "player"
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
  public: {
    Enums: {
      app_role: ["creator", "brand", "player"],
    },
  },
} as const
