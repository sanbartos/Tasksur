import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  receiverId: Joi.string().required(),
  taskId: Joi.string().optional(),
  content: Joi.string().min(1).required(),
});