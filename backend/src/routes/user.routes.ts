import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate, updateProfileSchema, adminUpdateUserSchema } from '../middlewares/validate.middleware';
import { AuthRequest } from '../models/user.model';
import { Response } from 'express';

const router = Router();

const adminGuard = [authMiddleware, requireRole('admin')];

router.get('/me', authMiddleware, (req, res) =>
  userController.getMe(req as AuthRequest, res as Response)
);

router.put('/me', authMiddleware, validate(updateProfileSchema), (req, res) =>
  userController.updateMe(req as AuthRequest, res as Response)
);

router.get('/', ...adminGuard, (req, res) =>
  userController.listUsers(req as AuthRequest, res as Response)
);

router.get('/:id', ...adminGuard, (req, res) =>
  userController.getUser(req as AuthRequest, res as Response)
);

router.put('/:id', ...adminGuard, validate(adminUpdateUserSchema), (req, res) =>
  userController.adminUpdateUser(req as AuthRequest, res as Response)
);

export default router;
