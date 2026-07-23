import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsService } from '../../application/posts.service';

export async function deletePostHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const isDeleted = await postsService.delete(req.params.id);

  if (!isDeleted) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  res.sendStatus(HttpStatus.NoContent);
}
