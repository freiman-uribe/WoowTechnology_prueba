import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register({ name, email, password });
      res.status(201).json(result);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EMAIL_TAKEN') {
        res.status(400).json({ message: err.message });
        return;
      }
      console.error('Error en registro:', err);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      res.status(200).json(result);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'INVALID_CREDENTIALS') {
        res.status(401).json({ message: err.message });
        return;
      }
      console.error('Error en login:', err);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export const authController = new AuthController();
