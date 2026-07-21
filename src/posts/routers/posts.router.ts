import { Router, Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/validation-error';
import { basicAuthMiddleware } from '../../core/middlewares/basic-auth.middleware';
import { PostInputDto } from '../dto/post.input-dto';
import { Post } from '../types/post';
import { validatePostInput } from '../validation/post.validation';
import { postsRepository } from '../repositories/posts.repository';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';
import { mapPostToViewModel } from './mappers/map-post-to-view-model';

export const postsRouter = Router({});

postsRouter
  .get('', async (req: Request, res: Response) => {
    const posts = await postsRepository.findAll();
    res.status(HttpStatus.Ok).send(posts.map(mapPostToViewModel));
  })
  .get('/:id', async (req: Request<{ id: string }>, res: Response) => {
    const post = await postsRepository.findById(req.params.id);

    if (!post) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }
    res.status(HttpStatus.Ok).send(mapPostToViewModel(post));
  })
  .post(
    '',
    basicAuthMiddleware,
    async (req: Request<{}, {}, PostInputDto>, res: Response) => {
      const errors = await validatePostInput(req.body);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        return;
      }

      const blog = await blogsRepository.findById(req.body.blogId);

      const newPost: Post = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: blog!._id.toString(),
        blogName: blog!.name,
        createdAt: new Date().toISOString(),
      };

      const createdPost = await postsRepository.create(newPost);
      res.status(HttpStatus.Created).send(mapPostToViewModel(createdPost));
    },
  )
  .put(
    '/:id',
    basicAuthMiddleware,
    async (req: Request<{ id: string }, {}, PostInputDto>, res: Response) => {
      const post = await postsRepository.findById(req.params.id);

      if (!post) {
        res.sendStatus(HttpStatus.NotFound);
        return;
      }

      const errors = await validatePostInput(req.body);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        return;
      }

      const blog = await blogsRepository.findById(req.body.blogId);

      await postsRepository.update(req.params.id, {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: blog!._id.toString(),
        blogName: blog!.name,
      });

      res.sendStatus(HttpStatus.NoContent);
    },
  )
  .delete(
    '/:id',
    basicAuthMiddleware,
    async (req: Request<{ id: string }>, res: Response) => {
      const isDeleted = await postsRepository.delete(req.params.id);

      if (!isDeleted) {
        res.sendStatus(HttpStatus.NotFound);
        return;
      }

      res.sendStatus(HttpStatus.NoContent);
    },
  );
