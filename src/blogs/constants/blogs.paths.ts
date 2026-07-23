export const BLOGS_PATH = '/blogs';

export const BLOGS_ROUTES = {
  ROOT: '',
  BY_ID: '/:id',
  POSTS_OF_BLOG: '/:blogId/posts',
} as const;
