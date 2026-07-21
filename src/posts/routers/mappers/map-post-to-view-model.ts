import { WithId } from 'mongodb';
import { Post } from '../../types/post';
import { PostViewModel } from '../../types/post.view-model';

// Превращает документ из БД (с ObjectId) в объект ответа API (id как строка).
export const mapPostToViewModel = (post: WithId<Post>): PostViewModel => {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
  };
};
