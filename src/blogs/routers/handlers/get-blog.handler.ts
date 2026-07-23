import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { blogsService } from '../../application/blogs.service';
import { mapBlogToViewModel } from '../mappers/map-blog-to-view-model';

export async function getBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const blog = await blogsService.findById(req.params.id);

  if (!blog) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  res.status(HttpStatus.Ok).send(mapBlogToViewModel(blog));
}
