import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate, registerSchema, loginSchema } from '../middlewares/validate.middleware';

const router = Router();

router.post('/register', validate(registerSchema), (req, res) => authController.register(req, res));

router.post('/login', validate(loginSchema), (req, res) => authController.login(req, res));

export default router;
