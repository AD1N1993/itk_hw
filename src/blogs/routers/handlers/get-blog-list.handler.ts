import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { HttpStatus } from '../../../core/types/http-statuses';
import { blogsService } from '../../application/blogs.service';
import { mapBlogListToPaginator } from '../mappers/map-blog-list-to-paginator';
import { BlogQueryInput } from '../../dto/blog-query.input';

export async function getBlogListHandler(req: Request, res: Response) {
  // В Express 5 req.query — read-only геттер, express-validator не может
  // мутировать его (default/toInt). Провалидированные значения достаём через matchedData(req).
  const queryInput = matchedData(req) as BlogQueryInput;

  const { items, totalCount } = await blogsService.findMany(queryInput);

  const paginator = mapBlogListToPaginator(items, {
    pageNumber: queryInput.pageNumber,
    pageSize: queryInput.pageSize,
    totalCount,
  });

  res.status(HttpStatus.Ok).send(paginator);
}
