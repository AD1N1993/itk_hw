import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsService } from '../../application/posts.service';
import { mapPostListToPaginator } from '../mappers/map-post-list-to-paginator';
import { PostQueryInput } from '../../dto/post-query.input';

export async function getPostListHandler(req: Request, res: Response) {
  const queryInput = matchedData(req) as PostQueryInput;

  const { items, totalCount } = await postsService.findMany(queryInput);

  const paginator = mapPostListToPaginator(items, {
    pageNumber: queryInput.pageNumber,
    pageSize: queryInput.pageSize,
    totalCount,
  });

  res.status(HttpStatus.Ok).send(paginator);
}
