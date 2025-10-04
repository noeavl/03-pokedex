import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  MONGODB_URI: Joi.string().required(),
  DEFAULT_LIMIT: Joi.number().default(9),
  PORT: Joi.number().default(3000),
});
