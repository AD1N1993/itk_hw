import { WithId } from 'mongodb';
import { Blog } from '../../types/blog';
import { BlogViewModel } from '../../types/blog.view-model';
import { Paginator, buildPaginator } from '../../../core/types/paginator';
import { mapBlogToViewModel } from './map-blog-to-view-model';

export const mapBlogListToPaginator = (
  blogs: WithId<Blog>[],
  meta: { pageNumber: number; pageSize: number; totalCount: number },
): Paginator<BlogViewModel> => {
  return buildPaginator(
    blogs.map(mapBlogToViewModel),
    meta.totalCount,
    meta.pageNumber,
    meta.pageSize,
  );
};
