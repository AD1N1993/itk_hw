import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../../db/in-memory.db';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/validation-error';
import { basicAuthMiddleware } from '../../core/middlewares/basic-auth.middleware';
import { PostInputDto } from '../dto/post.input-dto';
import { Post } from '../types/post';
import { validatePostInput } from '../validation/post.validation';

export const postsRouter = Router({});

postsRouter
  .get('', (req: Request, res: Response) => {
    res.status(HttpStatus.Ok).send(db.posts);
  })
  .get('/:id', (req: Request<{ id: string }>, res: Response) => {
    const post = db.posts.find((p) => p.id === req.params.id);

    if (!post) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }
    res.status(HttpStatus.Ok).send(post);
  })
  .post(
    '',
    basicAuthMiddleware,
    (req: Request<{}, {}, PostInputDto>, res: Response) => {
      const errors = validatePostInput(req.body, db.blogs);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        return;
      }

      const blog = db.blogs.find((b) => b.id === req.body.blogId)!;

      const newPost: Post = {
        id: randomUUID(),
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: blog.id,
        blogName: blog.name,
      };

      db.posts.push(newPost);
      res.status(HttpStatus.Created).send(newPost);
    },
  )
  .put(
    '/:id',
    basicAuthMiddleware,
    (req: Request<{ id: string }, {}, PostInputDto>, res: Response) => {
      const post = db.posts.find((p) => p.id === req.params.id);

      if (!post) {
        res.sendStatus(HttpStatus.NotFound);
        return;
      }

      const errors = validatePostInput(req.body, db.blogs);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        return;
      }

      const blog = db.blogs.find((b) => b.id === req.body.blogId)!;

      post.title = req.body.title;
      post.shortDescription = req.body.shortDescription;
      post.content = req.body.content;
      post.blogId = blog.id;
      post.blogName = blog.name;

      res.sendStatus(HttpStatus.NoContent);
    },
  )
  .delete(
    '/:id',
    basicAuthMiddleware,
    (req: Request<{ id: string }>, res: Response) => {
      const index = db.posts.findIndex((p) => p.id === req.params.id);

      if (index === -1) {
        res.sendStatus(HttpStatus.NotFound);
        return;
      }

      db.posts.splice(index, 1);
      res.sendStatus(HttpStatus.NoContent);
    },
  );
