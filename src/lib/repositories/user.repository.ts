import { supabase } from "../supabaseClient";
import {
  User,
  CreateUserData,
  UserFilters,
  PaginatedUsers,
} from "../../types/user-system";

export class UserRepository {
  private supabase = supabase;

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("users_new")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Error fetching user: ${error.message}`);
    }

    return data;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("users_new")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Error fetching user: ${error.message}`);
    }

    return data;
  }

  async create(userData: CreateUserData & { id?: string }): Promise<User> {
    const { data, error } = await (this.supabase as any)
      .from("users_new")
      .insert(userData as any)
      .select()
      .single();

    if (error) throw new Error(`Error creating user: ${error.message}`);
    return data;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await (this.supabase as any)
      .from("users_new")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
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
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from("users_new")
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
    const { data, error } = await (this.supabase as any)
      .from("users_new")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Error updating role: ${error.message}`);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await (this.supabase as any)
      .from("users_new")
      .delete()
      .eq("id", id);

    if (error) throw new Error(`Error deleting user: ${error.message}`);
  }
}
