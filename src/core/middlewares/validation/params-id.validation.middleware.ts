import { param } from 'express-validator';

export const idValidation = param('id')
  .exists()
  .withMessage('id is required')
  .isString()
  .withMessage('id must be a string')
  .isMongoId()
  .withMessage('id has invalid format');

export const blogIdParamValidation = param('blogId')
  .exists()
  .withMessage('blogId is required')
  .isString()
  .withMessage('blogId must be a string')
  .isMongoId()
  .withMessage('blogId has invalid format');
