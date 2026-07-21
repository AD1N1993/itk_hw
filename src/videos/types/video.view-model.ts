import { Resolutions } from './video';

export type VideoViewModel = {
  id: string;
  title: string;
  author: string;
  canBeDownloaded: boolean;
  minAgeRestriction: number | null;
  createdAt: string;
  publicationDate: string;
  availableResolutions: Resolutions[];
};
