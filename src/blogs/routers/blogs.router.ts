import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../../db/in-memory.db';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/validation-error';
import { basicAuthMiddleware } from '../../core/middlewares/basic-auth.middleware';
import { BlogInputDto } from '../dto/blog.input-dto';
import { Blog } from '../types/blog';
import { validateBlogInput } from '../validation/blog.validation';

export const blogsRouter = Router({});

blogsRouter
  .get('', (req: Request, res: Response) => {
    res.status(HttpStatus.Ok).send(db.blogs);
  })
  .get('/:id', (req: Request<{ id: string }>, res: Response) => {
    const blog = db.blogs.find((b) => b.id === req.params.id);

    if (!blog) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }
    res.status(HttpStatus.Ok).send(blog);
  })
  .post(
    '',
    basicAuthMiddleware,
    (req: Request<{}, {}, BlogInputDto>, res: Response) => {
      const errors = validateBlogInput(req.body);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        return;
      }

      const newBlog: Blog = {
        id: randomUUID(),
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
      };

      db.blogs.push(newBlog);
      res.status(HttpStatus.Created).send(newBlog);
    },
  )
  .put(
    '/:id',
    basicAuthMiddleware,
    (req: Request<{ id: string }, {}, BlogInputDto>, res: Response) => {
      const blog = db.blogs.find((b) => b.id === req.params.id);

      if (!blog) {
        res.sendStatus(HttpStatus.NotFound);
        return;
      }

      const errors = validateBlogInput(req.body);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        return;
      }

      blog.name = req.body.name;
      blog.description = req.body.description;
      blog.websiteUrl = req.body.websiteUrl;

      res.sendStatus(HttpStatus.NoContent);
    },
  )
  .delete(
    '/:id',
    basicAuthMiddleware,
    (req: Request<{ id: string }>, res: Response) => {
      const index = db.blogs.findIndex((b) => b.id === req.params.id);

      if (index === -1) {
        res.sendStatus(HttpStatus.NotFound);
        return;
      }

      db.blogs.splice(index, 1);
      res.sendStatus(HttpStatus.NoContent);
    },
  );
