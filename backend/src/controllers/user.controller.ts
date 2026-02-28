import { Response } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../models/user.model';

export class UserController {
  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const profile = await userService.getProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'USER_NOT_FOUND') {
        res.status(404).json({ message: err.message });
        return;
      }
      console.error('Error al obtener perfil:', err);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async updateMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { name, email, password } = req.body;
      const result = await userService.updateProfile(userId, { name, email, password });
      res.status(200).json(result);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'USER_NOT_FOUND') {
        res.status(404).json({ message: err.message });
        return;
      }
      if (err.code === 'EMAIL_TAKEN') {
        res.status(400).json({ message: err.message });
        return;
      }
      console.error('Error al actualizar perfil:', err);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async listUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await userService.listAll();
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const profile = await userService.getProfile(req.params.id);
      res.status(200).json(profile);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'USER_NOT_FOUND') {
        res.status(404).json({ message: err.message });
        return;
      }
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async adminUpdateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;
      const result = await userService.adminUpdateUser(req.params.id, { name, email, password, role });
      res.status(200).json(result);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'USER_NOT_FOUND') {
        res.status(404).json({ message: err.message });
        return;
      }
      if (err.code === 'EMAIL_TAKEN') {
        res.status(400).json({ message: err.message });
        return;
      }
      console.error('Error al actualizar usuario (admin):', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export const userController = new UserController();
