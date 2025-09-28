import { UserRepository } from "../repositories/user.repository";
import {
  User,
  CreateUserData,
  UserFilters,
  PaginatedUsers,
} from "../../types/user-system";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async createUser(userData: CreateUserData & { id?: string }): Promise<User> {
    // Validar que el email no exista
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    return await this.userRepository.create(userData);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return await this.userRepository.update(id, updates);
  }

  async getUsers(
    page: number = 1,
    limit: number = 10,
    filters: UserFilters = {}
  ): Promise<PaginatedUsers> {
    return await this.userRepository.getUsersWithPagination(
      page,
      limit,
      filters
    );
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    return await this.userRepository.updateRole(id, role);
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  // Métodos de utilidad
  async getUserStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const { users } = await this.userRepository.getUsersWithPagination(1, 1000);

    const byRole = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byStatus = users.reduce(
      (acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: users.length,
      byRole,
      byStatus,
    };
  }
}
