import { Filter, ObjectId, WithId } from 'mongodb';
import { Blog } from '../types/blog';
import { blogCollection } from '../../db/collections';
import { BlogQueryInput } from '../dto/blog-query.input';
import { SortDirection } from '../../core/types/paginator';
import { BlogSortField } from '../types/blog-sort-field';

// Репозиторий отвечает ТОЛЬКО за доступ к данным (CRUD).
// Он не знает про HTTP и не решает, что делать при "не найдено" —
// операции изменения возвращают boolean, а статус ответа выбирает роутер.
export const blogsRepository = {
  async findMany(
    queryDto: BlogQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryDto;

    const filter: Filter<Blog> = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: 'i' } }
      : {};

    const sortField = Object.values(BlogSortField).includes(
      sortBy as BlogSortField,
    )
      ? sortBy
      : BlogSortField.CreatedAt;

    const skip = (pageNumber - 1) * pageSize;

    const items = await blogCollection
      .find(filter)
      .sort({ [sortField]: sortDirection === SortDirection.Asc ? 1 : -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await blogCollection.countDocuments(filter);

    return { items, totalCount };
  },

  async findById(id: string): Promise<WithId<Blog> | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    return blogCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(newBlog: Blog): Promise<WithId<Blog>> {
    const insertResult = await blogCollection.insertOne(newBlog);
    return { ...newBlog, _id: insertResult.insertedId };
  },

  async update(id: string, blog: Partial<Blog>): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }
    const updateResult = await blogCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: blog },
    );
    return updateResult.matchedCount > 0;
  },

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }
    const deleteResult = await blogCollection.deleteOne({
      _id: new ObjectId(id),
    });
    return deleteResult.deletedCount > 0;
  },
};
