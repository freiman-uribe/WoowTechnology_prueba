import { Response } from 'express';
import { roleService } from '../services/role.service';
import { AuthRequest } from '../models/user.model';

export class RoleController {
  async listRoles(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const roles = await roleService.listAll();
      res.status(200).json(roles);
    } catch (error) {
      console.error('Error al listar roles:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const role = await roleService.getById(req.params.id);
      res.status(200).json(role);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ROLE_NOT_FOUND') {
        res.status(404).json({ message: err.message });
        return;
      }
      console.error('Error al obtener rol:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async createRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      const role = await roleService.create({ name, description });
      res.status(201).json(role);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ROLE_NAME_TAKEN') {
        res.status(409).json({ message: err.message });
        return;
      }
      console.error('Error al crear rol:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async updateRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      const role = await roleService.update(req.params.id, { name, description });
      res.status(200).json(role);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ROLE_NOT_FOUND') {
        res.status(404).json({ message: err.message });
        return;
      }
      if (err.code === 'ROLE_NAME_TAKEN') {
        res.status(409).json({ message: err.message });
        return;
      }
      console.error('Error al actualizar rol:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const role = await roleService.remove(req.params.id);
      res.status(200).json({ message: 'Rol eliminado correctamente', role });
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ROLE_NOT_FOUND') {
        res.status(404).json({ message: err.message });
        return;
      }
      if (err.code === 'ROLE_IN_USE') {
        res.status(409).json({ message: err.message });
        return;
      }
      console.error('Error al eliminar rol:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export const roleController = new RoleController();
