import { createClient } from "../supabase/client";
import {
  User,
  CreateUserData,
  UserFilters,
  PaginatedUsers,
} from "../../types/user-system";
import {
  UserInsert,
  UserUpdate,
  SecurityEventInsert,
} from "../../types/supabase";

export class UserRepository {
  private getSupabase() {
    return createClient();
  }

  async findById(id: string): Promise<User | null> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Error fetching user: ${error.message}`);
    }

    return data;
  }

  async findByEmail(email: string): Promise<User | null> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Error fetching user: ${error.message}`);
    }

    return data;
  }

  async create(userData: CreateUserData & { id?: string }): Promise<User> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from("users")
      .insert(userData as UserInsert)
      .select()
      .single();

    if (error) throw new Error(`Error creating user: ${error.message}`);
    return data;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as UserUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Error updating user: ${error.message}`);
    return data;
  }

  async getUsersWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: UserFilters = {}
  ): Promise<PaginatedUsers> {
    const supabase = this.getSupabase();
    const offset = (page - 1) * limit;

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);

    // Aplicar filtros
    if (filters.role) query = query.eq("role", filters.role);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }
    if (filters.created_after) {
      query = query.gte("created_at", filters.created_after);
    }
    if (filters.created_before) {
      query = query.lte("created_at", filters.created_before);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(`Error fetching users: ${error.message}`);

    return {
      users: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async updateRole(id: string, role: string): Promise<User> {
    const supabase = this.getSupabase();
    // 1. Actualizar rol en users (el trigger se encargará de sincronizar con auth.users)
    const { data, error } = await supabase
      .from("users")
      .update({
        role: role as
          | "super_admin"
          | "admin"
          | "manager"
          | "staff"
          | "customer"
          | "guest",
        updated_at: new Date().toISOString(),
      } as UserUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Error updating role: ${error.message}`);

    // 2. Log del evento para auditoría
    const securityEvent: SecurityEventInsert = {
      event_type: "role_updated",
      user_id: id,
      details: {
        success: true,
        reason: `Role updated to ${role}`,
        new_role: role,
        source: "user_repository",
        timestamp: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    };

    await supabase.from("security_events").insert(securityEvent);

    return data;
  }

  async delete(id: string): Promise<void> {
    const supabase = this.getSupabase();
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) throw new Error(`Error deleting user: ${error.message}`);
  }
}
