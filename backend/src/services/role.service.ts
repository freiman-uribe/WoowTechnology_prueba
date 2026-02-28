import { roleRepository } from '../repositories/role.repository';
import { Role, CreateRoleDTO, UpdateRoleDTO } from '../models/role.model';

export class RoleService {
  /**
   * Devuelve la lista completa de roles.
   */
  async listAll(): Promise<Role[]> {
    return roleRepository.findAll();
  }

  /**
   * Obtiene un rol por su ID o lanza error si no existe.
   */
  async getById(id: string): Promise<Role> {
    const role = await roleRepository.findById(id);
    if (!role) {
      const err = new Error('Rol no encontrado') as NodeJS.ErrnoException;
      err.code = 'ROLE_NOT_FOUND';
      throw err;
    }
    return role;
  }

  /**
   * Crea un nuevo rol.
   * Verifica que el nombre no esté duplicado.
   */
  async create(data: CreateRoleDTO): Promise<Role> {
    const existing = await roleRepository.findByName(data.name);
    if (existing) {
      const err = new Error(`Ya existe un rol con el nombre "${data.name}"`) as NodeJS.ErrnoException;
      err.code = 'ROLE_NAME_TAKEN';
      throw err;
    }
    return roleRepository.create(data);
  }

  /**
   * Actualiza un rol existente.
   * Verifica que el nuevo nombre no esté en uso por otro rol.
   */
  async update(id: string, data: UpdateRoleDTO): Promise<Role> {
    await this.getById(id); // garantiza que existe

    if (data.name) {
      const existing = await roleRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        const err = new Error(`Ya existe un rol con el nombre "${data.name}"`) as NodeJS.ErrnoException;
        err.code = 'ROLE_NAME_TAKEN';
        throw err;
      }
    }

    const updated = await roleRepository.update(id, data);
    return updated!;
  }

  /**
   * Elimina un rol.
   * No permite eliminar el rol si tiene usuarios asignados.
   */
  async remove(id: string): Promise<Role> {
    await this.getById(id); // garantiza que existe

    const usersCount = await roleRepository.countUsersWithRole(id);
    if (usersCount > 0) {
      const err = new Error(
        `No se puede eliminar el rol porque tiene ${usersCount} usuario(s) asignado(s)`
      ) as NodeJS.ErrnoException;
      err.code = 'ROLE_IN_USE';
      throw err;
    }

    const deleted = await roleRepository.delete(id);
    return deleted!;
  }
}

export const roleService = new RoleService();
