import { Router, Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import {
  CreateVideoInputDto,
  UpdateVideoInputDto,
} from '../dto/video.input-dto';
import { Video } from '../types/video';
import { createErrorMessages } from '../../core/utils/validation-error';
import {
  validateCreateVideoInput,
  validateUpdateVideoInput,
} from '../validation/video.validation';
import { videosRepository } from '../repositories/videos.repository';
import { mapVideoToViewModel } from './mappers/map-video-to-view-model';

export const videoRouter = Router({});

videoRouter
  .get('', async (req: Request, res: Response) => {
    const videos = await videosRepository.findAll();
    res.status(HttpStatus.Ok).send(videos.map(mapVideoToViewModel));
  })
  .get('/:id', async (req: Request<{ id: string }>, res: Response) => {
    const video = await videosRepository.findById(req.params.id);

    if (!video) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }
    res.status(HttpStatus.Ok).send(mapVideoToViewModel(video));
  })
  .post(
    '',
    async (req: Request<{}, {}, CreateVideoInputDto>, res: Response) => {
      const errors = validateCreateVideoInput(req.body);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        return;
      }

      const createdAt = new Date();
      const publicationDate = new Date(createdAt);
      publicationDate.setDate(publicationDate.getDate() + 1);

      const newVideo: Video = {
        title: req.body.title,
        author: req.body.author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: createdAt.toISOString(),
        publicationDate: publicationDate.toISOString(),
        availableResolutions: req.body.availableResolutions,
      };

      const createdVideo = await videosRepository.create(newVideo);
      res.status(HttpStatus.Created).send(mapVideoToViewModel(createdVideo));
    },
  )
  .put(
    '/:id',
    async (
      req: Request<{ id: string }, {}, UpdateVideoInputDto>,
      res: Response,
    ) => {
      const video = await videosRepository.findById(req.params.id);

      if (!video) {
        res.sendStatus(HttpStatus.NotFound);
        return;
      }

      const errors = validateUpdateVideoInput(req.body);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        return;
      }

      await videosRepository.update(req.params.id, {
        title: req.body.title,
        author: req.body.author,
        availableResolutions: req.body.availableResolutions,
        canBeDownloaded: req.body.canBeDownloaded,
        minAgeRestriction: req.body.minAgeRestriction ?? null,
        publicationDate: req.body.publicationDate,
      });

      res.sendStatus(HttpStatus.NoContent);
    },
  )
  .delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
    const isDeleted = await videosRepository.delete(req.params.id);

    if (!isDeleted) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
  });
