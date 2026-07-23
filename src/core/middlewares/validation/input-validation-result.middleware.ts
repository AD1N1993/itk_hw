import {
  validationResult,
  ValidationError as ExpressValidationError,
} from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../../types/http-statuses';
import { createErrorMessages } from '../../utils/validation-error';

const formatErrors = (error: ExpressValidationError) => {
  if (error.type === 'field') {
    return { field: error.path, message: error.msg };
  }
  return { field: '', message: error.msg };
};

export const inputValidationResultMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req)
    .formatWith(formatErrors)
    .array({ onlyFirstError: true });

  if (errors.length > 0) {
    res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
    return;
  }

  next();
};
