import { Router } from 'express';
import { Response } from 'express';
import { roleController } from '../controllers/role.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createRoleSchema, updateRoleSchema } from '../middlewares/validate.middleware';
import { AuthRequest } from '../models/user.model';

const router = Router();

const adminGuard = [authMiddleware, requireRole('admin')];

router.get('/', ...adminGuard, (req, res) =>
  roleController.listRoles(req as AuthRequest, res as Response)
);

router.get('/:id', ...adminGuard, (req, res) =>
  roleController.getRole(req as AuthRequest, res as Response)
);

router.post('/', ...adminGuard, validate(createRoleSchema), (req, res) =>
  roleController.createRole(req as AuthRequest, res as Response)
);

router.put('/:id', ...adminGuard, validate(updateRoleSchema), (req, res) =>
  roleController.updateRole(req as AuthRequest, res as Response)
);

router.delete('/:id', ...adminGuard, (req, res) =>
  roleController.deleteRole(req as AuthRequest, res as Response)
);

export default router;
