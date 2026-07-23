import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { blogsService } from '../../application/blogs.service';
import { BlogInputDto } from '../../dto/blog.input-dto';

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response,
) {
  const isUpdated = await blogsService.update(req.params.id, req.body);

  if (!isUpdated) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  res.sendStatus(HttpStatus.NoContent);
}
