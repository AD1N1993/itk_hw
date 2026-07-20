import { Resolutions } from '../types/video';
import { ValidationError } from '../../core/types/validation-error';
import {
  CreateVideoInputDto,
  UpdateVideoInputDto,
} from '../dto/video.input-dto';

const allowedResolutions = Object.values(Resolutions);

const validateTitle = (title: unknown, errors: ValidationError[]): void => {
  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'title is required' });
    return;
  }
  if (title.length > 40) {
    errors.push({ field: 'title', message: 'title max length is 40' });
  }
};

const validateAuthor = (author: unknown, errors: ValidationError[]): void => {
  if (typeof author !== 'string' || author.trim().length === 0) {
    errors.push({ field: 'author', message: 'author is required' });
    return;
  }
  if (author.length > 20) {
    errors.push({ field: 'author', message: 'author max length is 20' });
  }
};

const validateResolutions = (
  availableResolutions: unknown,
  errors: ValidationError[],
): void => {
  if (
    !Array.isArray(availableResolutions) ||
    availableResolutions.length === 0
  ) {
    errors.push({
      field: 'availableResolutions',
      message: 'At least one resolution should be added',
    });
    return;
  }
  const hasInvalid = availableResolutions.some(
    (r) => !allowedResolutions.includes(r as Resolutions),
  );
  if (hasInvalid) {
    errors.push({
      field: 'availableResolutions',
      message: 'Invalid resolution value',
    });
  }
};

export const validateCreateVideoInput = (
  data: Partial<CreateVideoInputDto>,
): ValidationError[] => {
  const errors: ValidationError[] = [];
  validateTitle(data.title, errors);
  validateAuthor(data.author, errors);
  validateResolutions(data.availableResolutions, errors);
  return errors;
};

export const validateUpdateVideoInput = (
  data: Partial<UpdateVideoInputDto>,
): ValidationError[] => {
  const errors: ValidationError[] = [];
  validateTitle(data.title, errors);
  validateAuthor(data.author, errors);
  validateResolutions(data.availableResolutions, errors);

  if (typeof data.canBeDownloaded !== 'boolean') {
    errors.push({
      field: 'canBeDownloaded',
      message: 'canBeDownloaded must be a boolean',
    });
  }

  const { minAgeRestriction } = data;
  if (minAgeRestriction !== null && minAgeRestriction !== undefined) {
    if (
      typeof minAgeRestriction !== 'number' ||
      !Number.isInteger(minAgeRestriction) ||
      minAgeRestriction < 1 ||
      minAgeRestriction > 18
    ) {
      errors.push({
        field: 'minAgeRestriction',
        message:
          'minAgeRestriction must be an integer between 1 and 18 or null',
      });
    }
  }

  if (
    typeof data.publicationDate !== 'string' ||
    isNaN(Date.parse(data.publicationDate))
  ) {
    errors.push({
      field: 'publicationDate',
      message: 'publicationDate must be a valid date-time string',
    });
  }

  return errors;
};
