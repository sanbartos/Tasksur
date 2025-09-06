import Joi from 'joi';

export const categorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'El nombre es obligatorio',
    'string.min': 'El nombre debe tener al menos 1 carácter',
    'string.max': 'El nombre no puede exceder 100 caracteres',
  }),
  slug: Joi.string().min(1).max(100).required().pattern(/^[a-z0-9-]+$/).messages({
    'string.empty': 'El slug es obligatorio',
    'string.pattern.base': 'El slug solo puede contener letras minúsculas, números y guiones',
    'string.min': 'El slug debe tener al menos 1 carácter',
    'string.max': 'El slug no puede exceder 100 caracteres',
  }),
  description: Joi.string().allow('', null).max(500).messages({
    'string.max': 'La descripción no puede exceder 500 caracteres',
  }),
  icon: Joi.string().allow('', null).max(100).messages({
    'string.max': 'El icono no puede exceder 100 caracteres',
  }),
  color: Joi.string().allow('', null).pattern(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).messages({
    'string.pattern.base': 'El color debe ser un código hexadecimal válido',
  }),
});