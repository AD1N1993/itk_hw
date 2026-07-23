import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsService } from '../../application/posts.service';
import { PostInputDto } from '../../dto/post.input-dto';

export async function updatePostHandler(
  req: Request<{ id: string }, {}, PostInputDto>,
  res: Response,
) {
  const post = await postsService.findById(req.params.id);

  if (!post) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  await postsService.update(req.params.id, req.body);

  res.sendStatus(HttpStatus.NoContent);
}
