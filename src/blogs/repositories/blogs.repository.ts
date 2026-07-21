import { ObjectId, WithId } from 'mongodb';
import { Blog } from '../types/blog';
import { blogCollection } from '../../db/collections';

// Репозиторий отвечает ТОЛЬКО за доступ к данным (CRUD).
// Он не знает про HTTP и не решает, что делать при "не найдено" —
// операции изменения возвращают boolean, а статус ответа выбирает роутер.
export const blogsRepository = {
  async findAll(): Promise<WithId<Blog>[]> {
    return blogCollection.find().toArray();
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
