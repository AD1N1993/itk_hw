import { ValidationError } from '../../core/types/validation-error';
import { PostInputDto } from '../dto/post.input-dto';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';

const validateTitle = (title: unknown, errors: ValidationError[]): void => {
  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'title is required' });
    return;
  }
  if (title.length > 30) {
    errors.push({ field: 'title', message: 'title max length is 30' });
  }
};

const validateShortDescription = (
  shortDescription: unknown,
  errors: ValidationError[],
): void => {
  if (
    typeof shortDescription !== 'string' ||
    shortDescription.trim().length === 0
  ) {
    errors.push({
      field: 'shortDescription',
      message: 'shortDescription is required',
    });
    return;
  }
  if (shortDescription.length > 100) {
    errors.push({
      field: 'shortDescription',
      message: 'shortDescription max length is 100',
    });
  }
};

const validateContent = (content: unknown, errors: ValidationError[]): void => {
  if (typeof content !== 'string' || content.trim().length === 0) {
    errors.push({ field: 'content', message: 'content is required' });
    return;
  }
  if (content.length > 1000) {
    errors.push({ field: 'content', message: 'content max length is 1000' });
  }
};

const validateBlogId = async (
  blogId: unknown,
  errors: ValidationError[],
): Promise<void> => {
  if (typeof blogId !== 'string' || blogId.trim().length === 0) {
    errors.push({ field: 'blogId', message: 'blogId is required' });
    return;
  }
  const blog = await blogsRepository.findById(blogId);
  if (!blog) {
    errors.push({
      field: 'blogId',
      message: 'blog with this id does not exist',
    });
  }
};

export const validatePostInput = async (
  data: Partial<PostInputDto>,
): Promise<ValidationError[]> => {
  const errors: ValidationError[] = [];
  validateTitle(data.title, errors);
  validateShortDescription(data.shortDescription, errors);
  validateContent(data.content, errors);
  await validateBlogId(data.blogId, errors);
  return errors;
};
