import { Router } from 'express';
import { POSTS_ROUTES } from '../constants/posts.paths';
import { basicAuthMiddleware } from '../../core/middlewares/basic-auth.middleware';
import { idValidation } from '../../core/middlewares/validation/params-id.validation.middleware';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { paginationAndSortingValidation } from '../../core/middlewares/validation/query-pagination-sorting.validation.middleware';
import { postInputValidation } from '../validation/post.validation';
import { getPostListHandler } from './handlers/get-post-list.handler';
import { getPostHandler } from './handlers/get-post.handler';
import { createPostHandler } from './handlers/create-post.handler';
import { updatePostHandler } from './handlers/update-post.handler';
import { deletePostHandler } from './handlers/delete-post.handler';

export const postsRouter = Router({});

postsRouter
  .get(
    POSTS_ROUTES.ROOT,
    paginationAndSortingValidation,
    inputValidationResultMiddleware,
    getPostListHandler,
  )

  .get(
    POSTS_ROUTES.BY_ID,
    idValidation,
    inputValidationResultMiddleware,
    getPostHandler,
  )

  .post(
    POSTS_ROUTES.ROOT,
    basicAuthMiddleware,
    postInputValidation,
    inputValidationResultMiddleware,
    createPostHandler,
  )

  .put(
    POSTS_ROUTES.BY_ID,
    basicAuthMiddleware,
    idValidation,
    postInputValidation,
    inputValidationResultMiddleware,
    updatePostHandler,
  )

  .delete(
    POSTS_ROUTES.BY_ID,
    basicAuthMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    deletePostHandler,
  );
