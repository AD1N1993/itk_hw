import { Router } from 'express';
import { BLOGS_ROUTES } from '../constants/blogs.paths';
import { basicAuthMiddleware } from '../../core/middlewares/basic-auth.middleware';
import {
  idValidation,
  blogIdParamValidation,
} from '../../core/middlewares/validation/params-id.validation.middleware';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import {
  paginationAndSortingValidation,
  searchNameTermValidation,
} from '../../core/middlewares/validation/query-pagination-sorting.validation.middleware';
import { blogInputValidation } from '../validation/blog.validation';
import { blogPostFieldsValidation } from '../../posts/validation/post.validation';
import { getBlogListHandler } from './handlers/get-blog-list.handler';
import { getBlogHandler } from './handlers/get-blog.handler';
import { createBlogHandler } from './handlers/create-blog.handler';
import { updateBlogHandler } from './handlers/update-blog.handler';
import { deleteBlogHandler } from './handlers/delete-blog.handler';
import { getPostsOfBlogHandler } from './handlers/get-posts-of-blog.handler';
import { createPostForBlogHandler } from './handlers/create-post-for-blog.handler';

export const blogsRouter = Router({});

blogsRouter
  .get(
    BLOGS_ROUTES.ROOT,
    searchNameTermValidation,
    paginationAndSortingValidation,
    inputValidationResultMiddleware,
    getBlogListHandler,
  )

  .get(
    BLOGS_ROUTES.POSTS_OF_BLOG,
    blogIdParamValidation,
    paginationAndSortingValidation,
    inputValidationResultMiddleware,
    getPostsOfBlogHandler,
  )

  .post(
    BLOGS_ROUTES.POSTS_OF_BLOG,
    basicAuthMiddleware,
    blogIdParamValidation,
    blogPostFieldsValidation,
    inputValidationResultMiddleware,
    createPostForBlogHandler,
  )

  .get(
    BLOGS_ROUTES.BY_ID,
    idValidation,
    inputValidationResultMiddleware,
    getBlogHandler,
  )

  .post(
    BLOGS_ROUTES.ROOT,
    basicAuthMiddleware,
    blogInputValidation,
    inputValidationResultMiddleware,
    createBlogHandler,
  )

  .put(
    BLOGS_ROUTES.BY_ID,
    basicAuthMiddleware,
    idValidation,
    blogInputValidation,
    inputValidationResultMiddleware,
    updateBlogHandler,
  )

  .delete(
    BLOGS_ROUTES.BY_ID,
    basicAuthMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    deleteBlogHandler,
  );
