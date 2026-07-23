import { WithId } from 'mongodb';
import { Post } from '../../types/post';
import { PostViewModel } from '../../types/post.view-model';
import { Paginator, buildPaginator } from '../../../core/types/paginator';
import { mapPostToViewModel } from './map-post-to-view-model';

export const mapPostListToPaginator = (
  posts: WithId<Post>[],
  meta: { pageNumber: number; pageSize: number; totalCount: number },
): Paginator<PostViewModel> => {
  return buildPaginator(
    posts.map(mapPostToViewModel),
    meta.totalCount,
    meta.pageNumber,
    meta.pageSize,
  );
};
