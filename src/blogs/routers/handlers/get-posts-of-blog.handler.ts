import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { HttpStatus } from '../../../core/types/http-statuses';
import { blogsService } from '../../application/blogs.service';
import { postsService } from '../../../posts/application/posts.service';
import { mapPostListToPaginator } from '../../../posts/routers/mappers/map-post-list-to-paginator';
import { PostQueryInput } from '../../../posts/dto/post-query.input';

export async function getPostsOfBlogHandler(
  req: Request<{ blogId: string }>,
  res: Response,
) {
  const blog = await blogsService.findById(req.params.blogId);

  if (!blog) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  const queryInput = matchedData(req) as PostQueryInput;

  const { items, totalCount } = await postsService.findManyByBlogId(
    req.params.blogId,
    queryInput,
  );

  const paginator = mapPostListToPaginator(items, {
    pageNumber: queryInput.pageNumber,
    pageSize: queryInput.pageSize,
    totalCount,
  });

  res.status(HttpStatus.Ok).send(paginator);
}
