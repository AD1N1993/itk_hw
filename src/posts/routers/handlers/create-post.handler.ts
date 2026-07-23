import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsService } from '../../application/posts.service';
import { PostInputDto } from '../../dto/post.input-dto';
import { mapPostToViewModel } from '../mappers/map-post-to-view-model';

export async function createPostHandler(
  req: Request<{}, {}, PostInputDto>,
  res: Response,
) {
  const createdPost = await postsService.create(req.body);
  res.status(HttpStatus.Created).send(mapPostToViewModel(createdPost));
}
