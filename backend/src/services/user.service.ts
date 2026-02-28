import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { UpdateProfileDTO, AdminUpdateUserDTO, UserPublicDTO } from '../models/user.model';

export class UserService {
  /**
   * Obtiene el perfil público de un usuario por su ID (sin password).
   */
  async getProfile(userId: string): Promise<UserPublicDTO> {
    const user = await userRepository.findById(userId);

    if (!user) {
      const error = new Error('Usuario no encontrado');
      (error as NodeJS.ErrnoException).code = 'USER_NOT_FOUND';
      throw error;
    }

    const { password: _password, ...userPublic } = user;
    return userPublic as UserPublicDTO;
  }

  /**
   * Actualiza el perfil de un usuario.
   * Si se cambia el email, verifica que no esté en uso.
   * Si se cambia el password, lo hashea antes de guardar.
   */
  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<{ message: string; user: UserPublicDTO }> {
    const currentUser = await userRepository.findById(userId);

    if (!currentUser) {
      const error = new Error('Usuario no encontrado');
      (error as NodeJS.ErrnoException).code = 'USER_NOT_FOUND';
      throw error;
    }

    // Verificar que el nuevo email no esté tomado por otro usuario
    if (data.email && data.email !== currentUser.email) {
      const emailTaken = await userRepository.findByEmail(data.email);
      if (emailTaken) {
        const error = new Error('El email ya está en uso por otro usuario');
        (error as NodeJS.ErrnoException).code = 'EMAIL_TAKEN';
        throw error;
      }
    }

    let hashedPassword: string | undefined;
    if (data.password) {
      const SALT_ROUNDS = 12;
      hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    const updated = await userRepository.update(userId, {
      name: data.name,
      email: data.email,
      hashedPassword,
    });

    if (!updated) {
      const error = new Error('Error al actualizar el perfil');
      (error as NodeJS.ErrnoException).code = 'UPDATE_ERROR';
      throw error;
    }

    const { password: _password, ...userPublic } = updated;
    return {
      message: 'Perfil actualizado',
      user: userPublic as UserPublicDTO,
    };
  }

  /**
   * Lista todos los usuarios del sistema (solo para admins).
   */
  async listAll(): Promise<{ users: UserPublicDTO[] }> {
    const users = await userRepository.findAll();

    const usersPublic = users.map(({ password: _password, ...u }) => u as UserPublicDTO);
    return { users: usersPublic };
  }

  /**
   * Permite a un admin actualizar cualquier usuario: nombre, email, rol y contraseña.
   */
  async adminUpdateUser(
    targetUserId: string,
    data: AdminUpdateUserDTO
  ): Promise<{ message: string; user: UserPublicDTO }> {
    const currentUser = await userRepository.findById(targetUserId);

    if (!currentUser) {
      const error = new Error('Usuario no encontrado');
      (error as NodeJS.ErrnoException).code = 'USER_NOT_FOUND';
      throw error;
    }

    // Verificar que el nuevo email no esté tomado por otro usuario
    if (data.email && data.email !== currentUser.email) {
      const emailTaken = await userRepository.findByEmail(data.email);
      if (emailTaken) {
        const error = new Error('El email ya está en uso por otro usuario');
        (error as NodeJS.ErrnoException).code = 'EMAIL_TAKEN';
        throw error;
      }
    }

    let hashedPassword: string | undefined;
    if (data.password) {
      const SALT_ROUNDS = 12;
      hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    const updated = await userRepository.update(targetUserId, {
      name: data.name,
      email: data.email,
      hashedPassword,
      role: data.role,
    });

    if (!updated) {
      const error = new Error('Error al actualizar el usuario');
      (error as NodeJS.ErrnoException).code = 'UPDATE_ERROR';
      throw error;
    }

    const { password: _password, ...userPublic } = updated;
    return {
      message: 'Usuario actualizado correctamente',
      user: userPublic as UserPublicDTO,
    };
  }
}

export const userService = new UserService();
