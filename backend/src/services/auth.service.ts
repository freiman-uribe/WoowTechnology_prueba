import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { RegisterDTO, LoginDTO, JwtPayload, UserPublicDTO } from '../models/user.model';
import { jwtConfig } from '../config/jwt';

export class AuthService {
  async register(data: RegisterDTO): Promise<{ message: string }> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      const error = new Error('El email ya está registrado');
      (error as NodeJS.ErrnoException).code = 'EMAIL_TAKEN';
      throw error;
    }

    const SALT_ROUNDS = 12;
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    await userRepository.create({ ...data, hashedPassword });

    return { message: 'Usuario registrado exitosamente' };
  }

  async login(data: LoginDTO): Promise<{ token: string; user: UserPublicDTO }> {
    const user = await userRepository.findByEmail(data.email);

    if (!user) {
      const error = new Error('Credenciales inválidas');
      (error as NodeJS.ErrnoException).code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      const error = new Error('Credenciales inválidas');
      (error as NodeJS.ErrnoException).code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn as jwt.SignOptions['expiresIn'],
    });

    const { password: _password, ...userPublic } = user;

    return { token, user: userPublic as UserPublicDTO };
  }
}

export const authService = new AuthService();
