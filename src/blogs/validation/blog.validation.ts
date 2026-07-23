import { body } from 'express-validator';

const websiteUrlPattern =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

const nameValidation = body('name')
  .isString()
  .withMessage('name should be string')
  .trim()
  .isLength({ min: 1, max: 15 })
  .withMessage('name is required and max length is 15');

const descriptionValidation = body('description')
  .isString()
  .withMessage('description should be string')
  .trim()
  .isLength({ min: 1, max: 500 })
  .withMessage('description is required and max length is 500');

const websiteUrlValidation = body('websiteUrl')
  .isString()
  .withMessage('websiteUrl should be string')
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage('websiteUrl is required and max length is 100')
  .matches(websiteUrlPattern)
  .withMessage('websiteUrl is invalid');

export const blogInputValidation = [
  nameValidation,
  descriptionValidation,
  websiteUrlValidation,
];
