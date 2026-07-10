/**
 * Supabase generated types placeholder.
 * Regenerate with: pnpm db:types
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<
  Row extends Record<string, unknown>,
  Insert extends Record<string, unknown>,
  Update extends Record<string, unknown>,
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      tenants: Table<
        {
          id: string;
          name: string;
          slug: string;
          status: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          slug: string;
          status?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          name?: string;
          slug?: string;
          status?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        }
      >;
      workspaces: Table<
        {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          description: string | null;
          type: string;
          status: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          description?: string | null;
          type?: string;
          status?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          type?: string;
          status?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        }
      >;
      profiles: Table<
        {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          status: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          status?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          status?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        }
      >;
      roles: Table<
        {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          description: string | null;
          permissions: Json;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          description?: string | null;
          permissions?: Json;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          permissions?: Json;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      tenant_memberships: Table<
        {
          id: string;
          tenant_id: string;
          user_id: string;
          role_id: string;
          status: string;
          invited_at: string | null;
          joined_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          tenant_id: string;
          user_id: string;
          role_id: string;
          status?: string;
          invited_at?: string | null;
          joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          role_id?: string;
          status?: string;
          invited_at?: string | null;
          joined_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      workspace_memberships: Table<
        {
          id: string;
          workspace_id: string;
          user_id: string;
          role_id: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          workspace_id: string;
          user_id: string;
          role_id: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role_id?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      installed_plugins: Table<
        {
          id: string;
          tenant_id: string;
          plugin_id: string;
          manifest: Json;
          status: string;
          config: Json;
          installed_at: string;
          updated_at: string;
        },
        {
          id?: string;
          tenant_id: string;
          plugin_id: string;
          manifest: Json;
          status?: string;
          config?: Json;
          installed_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          tenant_id?: string;
          plugin_id?: string;
          manifest?: Json;
          status?: string;
          config?: Json;
          installed_at?: string;
          updated_at?: string;
        }
      >;
      audit_events: Table<
        {
          id: string;
          tenant_id: string;
          workspace_id: string | null;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        },
        {
          id?: string;
          tenant_id: string;
          workspace_id?: string | null;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          tenant_id?: string;
          workspace_id?: string | null;
          user_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        }
      >;
      command_centre_sessions: Table<
        {
          id: string;
          tenant_id: string;
          workspace_id: string;
          user_id: string;
          title: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          tenant_id: string;
          workspace_id: string;
          user_id: string;
          title?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          tenant_id?: string;
          workspace_id?: string;
          user_id?: string;
          title?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      command_centre_messages: Table<
        {
          id: string;
          session_id: string;
          role: string;
          content: string;
          metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          session_id: string;
          role: string;
          content: string;
          metadata?: Json;
          created_at?: string;
        },
        {
          id?: string;
          session_id?: string;
          role?: string;
          content?: string;
          metadata?: Json;
          created_at?: string;
        }
      >;
      platform_settings: Table<
        {
          id: string;
          tenant_id: string;
          workspace_id: string | null;
          key: string;
          value: Json;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          tenant_id: string;
          workspace_id?: string | null;
          key: string;
          value: Json;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          tenant_id?: string;
          workspace_id?: string | null;
          key?: string;
          value?: Json;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      get_user_tenant_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
      has_permission: {
        Args: {
          p_resource: string;
          p_action: string;
          p_tenant_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
