import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { blogsService } from '../../application/blogs.service';

export async function deleteBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const isDeleted = await blogsService.delete(req.params.id);

  if (!isDeleted) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  res.sendStatus(HttpStatus.NoContent);
}
