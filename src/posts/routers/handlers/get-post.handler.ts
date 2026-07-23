import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsService } from '../../application/posts.service';
import { mapPostToViewModel } from '../mappers/map-post-to-view-model';

export async function getPostHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const post = await postsService.findById(req.params.id);

  if (!post) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  res.status(HttpStatus.Ok).send(mapPostToViewModel(post));
}
