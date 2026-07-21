import { ObjectId, WithId } from 'mongodb';
import { Video } from '../types/video';
import { videoCollection } from '../../db/collections';

export const videosRepository = {
  async findAll(): Promise<WithId<Video>[]> {
    return videoCollection.find().toArray();
  },

  async findById(id: string): Promise<WithId<Video> | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    return videoCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(newVideo: Video): Promise<WithId<Video>> {
    const insertResult = await videoCollection.insertOne(newVideo);
    return { ...newVideo, _id: insertResult.insertedId };
  },

  async update(id: string, video: Partial<Video>): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }
    const updateResult = await videoCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: video },
    );
    return updateResult.matchedCount > 0;
  },

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }
    const deleteResult = await videoCollection.deleteOne({
      _id: new ObjectId(id),
    });
    return deleteResult.deletedCount > 0;
  },
};
