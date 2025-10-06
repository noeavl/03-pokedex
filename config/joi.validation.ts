import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  MONGODB_URI: Joi.string().required(),
  DEFAULT_LIMIT: Joi.number().default(9),
  PORT: Joi.number().default(3000),
  HOST: Joi.string().default(
    `http://localhost:${process.env.PORT || 3000}/api/v1`,
  ),
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
});
