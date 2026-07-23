import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { blogsService } from '../../application/blogs.service';
import { BlogInputDto } from '../../dto/blog.input-dto';
import { mapBlogToViewModel } from '../mappers/map-blog-to-view-model';

export async function createBlogHandler(
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) {
  const createdBlog = await blogsService.create(req.body);
  res.status(HttpStatus.Created).send(mapBlogToViewModel(createdBlog));
}
