import pool from '../config/database';
import { User, RegisterDTO, UpdateProfileDTO, AdminUpdateUserDTO } from '../models/user.model';

// Fragmento SQL reutilizable para traer usuario + nombre del rol via JOIN
const USER_WITH_ROLE = `
  SELECT u.*, r.name AS role
  FROM users u
  INNER JOIN roles r ON r.id = u.role_id
`;

export class UserRepository {
  /**
   * Busca un usuario por su email incluyendo el nombre de su rol (JOIN).
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>({
      text: `${USER_WITH_ROLE} WHERE u.email = $1`,
      values: [email],
    });
    return result.rows[0] ?? null;
  }

  /**
   * Busca un usuario por su ID incluyendo el nombre de su rol (JOIN).
   */
  async findById(id: string): Promise<User | null> {
    const result = await pool.query<User>({
      text: `${USER_WITH_ROLE} WHERE u.id = $1`,
      values: [id],
    });
    return result.rows[0] ?? null;
  }

  /**
   * Crea un nuevo usuario.
   * Recibe el nombre del rol (roleName) y resuelve el role_id con una subconsulta.
   * Usa CTE para devolver el usuario con el nombre del rol en un solo query.
   */
  async create(data: RegisterDTO & { hashedPassword: string; roleName?: string }): Promise<User> {
    const { name, email, hashedPassword, roleName = 'user' } = data;
    const result = await pool.query<User>({
      text: `
        WITH inserted AS (
          INSERT INTO users (name, email, password, role_id)
          VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = $4))
          RETURNING *
        )
        SELECT i.*, r.name AS role
        FROM inserted i
        INNER JOIN roles r ON r.id = i.role_id
      `,
      values: [name, email, hashedPassword, roleName],
    });
    return result.rows[0];
  }

  /**
   * Actualiza los datos del perfil de un usuario.
   * Usa CTE para devolver el usuario actualizado con el nombre del rol.
   */
  async update(id: string, data: (UpdateProfileDTO | AdminUpdateUserDTO) & { hashedPassword?: string }): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.hashedPassword !== undefined) {
      fields.push(`password = $${paramIndex++}`);
      values.push(data.hashedPassword);
    }
    // Soporte de cambio de rol por nombre
    if ((data as AdminUpdateUserDTO).role !== undefined) {
      fields.push(`role_id = (SELECT id FROM roles WHERE name = $${paramIndex++})`);
      values.push((data as AdminUpdateUserDTO).role);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query<User>({
      text: `
        WITH updated AS (
          UPDATE users
          SET ${fields.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        )
        SELECT u.*, r.name AS role
        FROM updated u
        INNER JOIN roles r ON r.id = u.role_id
      `,
      values,
    });
    return result.rows[0] ?? null;
  }

  /**
   * Obtiene todos los usuarios con su rol (para admins).
   */
  async findAll(): Promise<User[]> {
    const result = await pool.query<User>({
      text: `${USER_WITH_ROLE} ORDER BY u.created_at DESC`,
      values: [],
    });
    return result.rows;
  }
}

export const userRepository = new UserRepository();
