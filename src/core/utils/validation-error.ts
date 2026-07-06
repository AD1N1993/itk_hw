import { ValidationError } from '../types/validation-error';

export const createErrorMessages = (
  errors: ValidationError[],
): { errorsMessages: ValidationError[] } => {
  return { errorsMessages: errors };
};
