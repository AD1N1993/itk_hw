import { Router, Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/validation-error';
import { basicAuthMiddleware } from '../../core/middlewares/basic-auth.middleware';
import { BlogInputDto } from '../dto/blog.input-dto';
import { Blog } from '../types/blog';
import { validateBlogInput } from '../validation/blog.validation';
import { blogsRepository } from '../repositories/blogs.repository';
import { mapBlogToViewModel } from './mappers/map-blog-to-view-model';

export const blogsRouter = Router({});

blogsRouter
  .get('', async (req: Request, res: Response) => {
    const blogs = await blogsRepository.findAll();
    res.status(HttpStatus.Ok).send(blogs.map(mapBlogToViewModel));
  })
  .get('/:id', async (req: Request<{ id: string }>, res: Response) => {
    const blog = await blogsRepository.findById(req.params.id);

    if (!blog) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }
    res.status(HttpStatus.Ok).send(mapBlogToViewModel(blog));
  })
  .post(
    '',
    basicAuthMiddleware,
    async (req: Request<{}, {}, BlogInputDto>, res: Response) => {
      const errors = validateBlogInput(req.body);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        return;
      }

      const newBlog: Blog = {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
        createdAt: new Date().toISOString(),
        isMembership: false,
      };

      const createdBlog = await blogsRepository.create(newBlog);
      res.status(HttpStatus.Created).send(mapBlogToViewModel(createdBlog));
    },
  )
  .put(
    '/:id',
    basicAuthMiddleware,
    async (req: Request<{ id: string }, {}, BlogInputDto>, res: Response) => {
      const blog = await blogsRepository.findById(req.params.id);

      if (!blog) {
        res.sendStatus(HttpStatus.NotFound);
        return;
      }

      const errors = validateBlogInput(req.body);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        return;
      }

      await blogsRepository.update(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
      });

      res.sendStatus(HttpStatus.NoContent);
    },
  )
  .delete(
    '/:id',
    basicAuthMiddleware,
    async (req: Request<{ id: string }>, res: Response) => {
      const isDeleted = await blogsRepository.delete(req.params.id);

      if (!isDeleted) {
        res.sendStatus(HttpStatus.NotFound);
        return;
      }

      res.sendStatus(HttpStatus.NoContent);
    },
  );
