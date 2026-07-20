import { ValidationError } from '../../core/types/validation-error';
import { BlogInputDto } from '../dto/blog.input-dto';

const websiteUrlPattern =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

const validateName = (name: unknown, errors: ValidationError[]): void => {
  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'name is required' });
    return;
  }
  if (name.length > 15) {
    errors.push({ field: 'name', message: 'name max length is 15' });
  }
};

const validateDescription = (
  description: unknown,
  errors: ValidationError[],
): void => {
  if (typeof description !== 'string' || description.trim().length === 0) {
    errors.push({ field: 'description', message: 'description is required' });
    return;
  }
  if (description.length > 500) {
    errors.push({
      field: 'description',
      message: 'description max length is 500',
    });
  }
};

const validateWebsiteUrl = (
  websiteUrl: unknown,
  errors: ValidationError[],
): void => {
  if (typeof websiteUrl !== 'string' || websiteUrl.trim().length === 0) {
    errors.push({ field: 'websiteUrl', message: 'websiteUrl is required' });
    return;
  }
  if (websiteUrl.length > 100) {
    errors.push({
      field: 'websiteUrl',
      message: 'websiteUrl max length is 100',
    });
    return;
  }
  if (!websiteUrlPattern.test(websiteUrl)) {
    errors.push({ field: 'websiteUrl', message: 'websiteUrl is invalid' });
  }
};

export const validateBlogInput = (
  data: Partial<BlogInputDto>,
): ValidationError[] => {
  const errors: ValidationError[] = [];
  validateName(data.name, errors);
  validateDescription(data.description, errors);
  validateWebsiteUrl(data.websiteUrl, errors);
  return errors;
};
