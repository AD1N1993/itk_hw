import { ObjectId, WithId } from 'mongodb';
import { Post } from '../types/post';
import { postCollection } from '../../db/collections';

export const postsRepository = {
  async findAll(): Promise<WithId<Post>[]> {
    return postCollection.find().toArray();
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
