import { Router, Request, Response } from 'express';
import { db } from '../../db/in-memory.db';
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

export const videoRouter = Router({});

videoRouter
  .get('', (req: Request, res: Response) => {
    res.status(HttpStatus.Ok).send(db.videos);
  })
  .get('/:id', (req: Request<{ id: string }>, res: Response) => {
    const video = db.videos.find((v) => v.id === +req.params.id);

    if (!video) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }
    res.status(HttpStatus.Ok).send(video);
  })
  .post('', (req: Request<{}, {}, CreateVideoInputDto>, res: Response) => {
    const errors = validateCreateVideoInput(req.body);

    if (errors.length > 0) {
      res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
      return;
    }

    const createdAt = new Date();
    const publicationDate = new Date(createdAt);
    publicationDate.setDate(publicationDate.getDate() + 1);

    const newVideo: Video = {
      id: db.videos.length ? db.videos[db.videos.length - 1].id + 1 : 1,
      title: req.body.title,
      author: req.body.author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: createdAt.toISOString(),
      publicationDate: publicationDate.toISOString(),
      availableResolutions: req.body.availableResolutions,
    };

    db.videos.push(newVideo);
    res.status(HttpStatus.Created).send(newVideo);
  })
  .put(
    '/:id',
    (req: Request<{ id: string }, {}, UpdateVideoInputDto>, res: Response) => {
      const video = db.videos.find((v) => v.id === +req.params.id);

      if (!video) {
        res.sendStatus(HttpStatus.NotFound);
        return;
      }

      const errors = validateUpdateVideoInput(req.body);

      if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
        return;
      }

      video.title = req.body.title;
      video.author = req.body.author;
      video.availableResolutions = req.body.availableResolutions;
      video.canBeDownloaded = req.body.canBeDownloaded;
      video.minAgeRestriction = req.body.minAgeRestriction ?? null;
      video.publicationDate = req.body.publicationDate;

      res.sendStatus(HttpStatus.NoContent);
    },
  )
  .delete('/:id', (req: Request<{ id: string }>, res: Response) => {
    const index = db.videos.findIndex((v) => v.id === +req.params.id);

    if (index === -1) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    db.videos.splice(index, 1);
    res.sendStatus(HttpStatus.NoContent);
  });
