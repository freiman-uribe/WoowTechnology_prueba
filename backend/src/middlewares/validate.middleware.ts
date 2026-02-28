import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// ─── Esquemas de validación ────────────────────────────────────────────────────

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'El nombre es requerido',
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'any.required': 'El nombre es requerido',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'El email no es válido',
    'string.empty': 'El email es requerido',
    'any.required': 'El email es requerido',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'El password debe tener al menos 8 caracteres',
    'string.empty': 'El password es requerido',
    'any.required': 'El password es requerido',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El email no es válido',
    'string.empty': 'El email es requerido',
    'any.required': 'El email es requerido',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'El password es requerido',
    'any.required': 'El password es requerido',
  }),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'El email no es válido',
  }),
  password: Joi.string().min(8).optional().messages({
    'string.min': 'El password debe tener al menos 8 caracteres',
  }),
}).min(1).messages({
  'object.min': 'Debes enviar al menos un campo para actualizar',
});

// ─── Schema de actualización de usuario por admin ───────────────────────────

export const adminUpdateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'El email no es válido',
  }),
  password: Joi.string().min(8).optional().messages({
    'string.min': 'El password debe tener al menos 8 caracteres',
  }),
  role: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'El rol debe tener al menos 2 caracteres',
  }),
}).min(1).messages({
  'object.min': 'Debes enviar al menos un campo para actualizar',
});

// ─── Schemas de roles ─────────────────────────────────────────────────────────

export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'El nombre del rol es requerido',
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede superar los 50 caracteres',
    'any.required': 'El nombre del rol es requerido',
  }),
  description: Joi.string().max(255).optional().allow('').messages({
    'string.max': 'La descripción no puede superar los 255 caracteres',
  }),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede superar los 50 caracteres',
  }),
  description: Joi.string().max(255).optional().allow('').messages({
    'string.max': 'La descripción no puede superar los 255 caracteres',
  }),
}).min(1).messages({
  'object.min': 'Debes enviar al menos un campo para actualizar',
});

// ─── Factory de middleware de validación ──────────────────────────────────────

export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const messages = error.details.map((d) => d.message);
      res.status(400).json({ message: 'Error de validación', errors: messages });
      return;
    }

    next();
  };
}
