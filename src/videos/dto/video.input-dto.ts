import { Resolutions } from '../types/video';

export type CreateVideoInputDto = {
  title: string;
  author: string;
  availableResolutions: Resolutions[];
};

export type UpdateVideoInputDto = {
  title: string;
  author: string;
  availableResolutions: Resolutions[];
  canBeDownloaded: boolean;
  minAgeRestriction: number | null;
  publicationDate: string;
};
