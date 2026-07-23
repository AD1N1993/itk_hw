import { body } from 'express-validator';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';

const titleValidation = body('title')
  .isString()
  .withMessage('title should be string')
  .trim()
  .isLength({ min: 1, max: 30 })
  .withMessage('title is required and max length is 30');

const shortDescriptionValidation = body('shortDescription')
  .isString()
  .withMessage('shortDescription should be string')
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage('shortDescription is required and max length is 100');

const contentValidation = body('content')
  .isString()
  .withMessage('content should be string')
  .trim()
  .isLength({ min: 1, max: 1000 })
  .withMessage('content is required and max length is 1000');

// Общие для BlogPostInputModel (blogId берётся из path) и PostInputModel.
export const blogPostFieldsValidation = [
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
];

const blogIdValidation = body('blogId')
  .isString()
  .withMessage('blogId should be string')
  .trim()
  .isLength({ min: 1 })
  .withMessage('blogId is required')
  .bail()
  .custom(async (blogId: string) => {
    const blog = await blogsRepository.findById(blogId);
    if (!blog) {
      throw new Error('blog with this id does not exist');
    }
    return true;
  });

export const postInputValidation = [
  ...blogPostFieldsValidation,
  blogIdValidation,
];
