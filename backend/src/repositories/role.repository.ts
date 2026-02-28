import pool from '../config/database';
import { Role, CreateRoleDTO, UpdateRoleDTO } from '../models/role.model';

export class RoleRepository {
  async findAll(): Promise<Role[]> {
    const result = await pool.query<Role>({
      text: 'SELECT * FROM roles ORDER BY name ASC',
      values: [],
    });
    return result.rows;
  }

  async findById(id: string): Promise<Role | null> {
    const result = await pool.query<Role>({
      text: 'SELECT * FROM roles WHERE id = $1',
      values: [id],
    });
    return result.rows[0] ?? null;
  }


  async findByName(name: string): Promise<Role | null> {
    const result = await pool.query<Role>({
      text: 'SELECT * FROM roles WHERE LOWER(name) = LOWER($1)',
      values: [name],
    });
    return result.rows[0] ?? null;
  }

  async create(data: CreateRoleDTO): Promise<Role> {
    const { name, description = null } = data;
    const result = await pool.query<Role>({
      text: `
        INSERT INTO roles (name, description)
        VALUES ($1, $2)
        RETURNING *
      `,
      values: [name, description],
    });
    return result.rows[0];
  }

  async update(id: string, data: UpdateRoleDTO): Promise<Role | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query<Role>({
      text: `
        UPDATE roles
        SET ${fields.join(', ')}
        WHERE id = $${idx}
        RETURNING *
      `,
      values,
    });
    return result.rows[0] ?? null;
  }

  async delete(id: string): Promise<Role | null> {
    const result = await pool.query<Role>({
      text: 'DELETE FROM roles WHERE id = $1 RETURNING *',
      values: [id],
    });
    return result.rows[0] ?? null;
  }

  /**
   * Verifica si hay usuarios asignados a este rol (para evitar borrar roles en uso).
   */
  async countUsersWithRole(roleId: string): Promise<number> {
    const result = await pool.query<{ count: string }>({
      text: 'SELECT COUNT(*) AS count FROM users WHERE role_id = $1',
      values: [roleId],
    });
    return parseInt(result.rows[0].count, 10);
  }
}

export const roleRepository = new RoleRepository();
