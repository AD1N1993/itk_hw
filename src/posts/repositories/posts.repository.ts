import { Filter, ObjectId, WithId } from 'mongodb';
import { Post } from '../types/post';
import { postCollection } from '../../db/collections';
import { PostQueryInput } from '../dto/post-query.input';
import { SortDirection } from '../../core/types/paginator';
import { PostSortField } from '../types/post-sort-field';

const resolveSortField = (sortBy: string): PostSortField =>
  Object.values(PostSortField).includes(sortBy as PostSortField)
    ? (sortBy as PostSortField)
    : PostSortField.CreatedAt;

export const postsRepository = {
  async findMany(
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return findManyWithFilter({}, queryDto);
  },

  async findManyByBlogId(
    blogId: string,
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return findManyWithFilter({ blogId }, queryDto);
  },

  async findById(id: string): Promise<WithId<Post> | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    return postCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(newPost: Post): Promise<WithId<Post>> {
    const insertResult = await postCollection.insertOne(newPost);
    return { ...newPost, _id: insertResult.insertedId };
  },

  async update(id: string, post: Partial<Post>): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }
    const updateResult = await postCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: post },
    );
    return updateResult.matchedCount > 0;
  },

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }
    const deleteResult = await postCollection.deleteOne({
      _id: new ObjectId(id),
    });
    return deleteResult.deletedCount > 0;
  },
};

async function findManyWithFilter(
  filter: Filter<Post>,
  queryDto: PostQueryInput,
): Promise<{ items: WithId<Post>[]; totalCount: number }> {
  const { sortBy, sortDirection, pageNumber, pageSize } = queryDto;
  const sortField = resolveSortField(sortBy);
  const skip = (pageNumber - 1) * pageSize;

  const items = await postCollection
    .find(filter)
    .sort({ [sortField]: sortDirection === SortDirection.Asc ? 1 : -1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();

  const totalCount = await postCollection.countDocuments(filter);

  return { items, totalCount };
}
