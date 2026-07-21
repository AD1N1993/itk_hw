import { WithId } from 'mongodb';
import { Video } from '../../types/video';
import { VideoViewModel } from '../../types/video.view-model';

// Превращает документ из БД (с ObjectId) в объект ответа API (id как строка).
export const mapVideoToViewModel = (video: WithId<Video>): VideoViewModel => {
  return {
    id: video._id.toString(),
    title: video.title,
    author: video.author,
    canBeDownloaded: video.canBeDownloaded,
    minAgeRestriction: video.minAgeRestriction,
    createdAt: video.createdAt,
    publicationDate: video.publicationDate,
    availableResolutions: video.availableResolutions,
  };
};
