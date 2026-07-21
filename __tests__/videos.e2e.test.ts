import request from 'supertest';
import express from 'express';
import { setupApp } from '../src/setup-app';
import { HttpStatus } from '../src/core/types/http-statuses';
import { Resolutions } from '../src/videos/types/video';
import { CreateVideoInputDto } from '../src/videos/dto/video.input-dto';
import { stopDb } from '../src/db/mongo.db';

const app = setupApp(express());

const BASE = '/hometask_01/api/videos';
const TESTING = '/hometask_01/api/testing/all-data';

const validCreateInput: CreateVideoInputDto = {
  title: 'My video',
  author: 'Me',
  availableResolutions: [Resolutions.P144, Resolutions.P720],
};

const createVideo = (input: CreateVideoInputDto = validCreateInput) =>
  request(app).post(BASE).send(input).expect(HttpStatus.Created);

describe('Videos API', () => {
  beforeEach(async () => {
    await request(app).delete(TESTING).expect(HttpStatus.NoContent);
  });

  afterAll(async () => {
    await stopDb();
  });

  describe('GET /videos', () => {
    it('should return empty array initially', async () => {
      const res = await request(app).get(BASE).expect(HttpStatus.Ok);
      expect(res.body).toEqual([]);
    });

    it('should return list of created videos', async () => {
      await createVideo();
      await createVideo();

      const res = await request(app).get(BASE).expect(HttpStatus.Ok);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('POST /videos', () => {
    it('should create a video with correct defaults', async () => {
      const res = await createVideo();

      expect(res.body).toEqual({
        id: expect.any(String),
        title: validCreateInput.title,
        author: validCreateInput.author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: expect.any(String),
        publicationDate: expect.any(String),
        availableResolutions: validCreateInput.availableResolutions,
      });

      // publicationDate = createdAt + 1 day
      const created = new Date(res.body.createdAt).getTime();
      const published = new Date(res.body.publicationDate).getTime();
      expect(published - created).toBe(24 * 60 * 60 * 1000);
    });

    it('should return 400 with errorsMessages when title is missing', async () => {
      const res = await request(app)
        .post(BASE)
        .send({ ...validCreateInput, title: '' })
        .expect(HttpStatus.BadRequest);

      expect(res.body).toEqual({
        errorsMessages: expect.arrayContaining([
          expect.objectContaining({ field: 'title' }),
        ]),
      });
    });

    it('should return 400 when title exceeds 40 chars', async () => {
      const res = await request(app)
        .post(BASE)
        .send({ ...validCreateInput, title: 'a'.repeat(41) })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'title' }),
      );
    });

    it('should return 400 when author exceeds 20 chars', async () => {
      const res = await request(app)
        .post(BASE)
        .send({ ...validCreateInput, author: 'a'.repeat(21) })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'author' }),
      );
    });

    it('should return 400 when availableResolutions is empty', async () => {
      const res = await request(app)
        .post(BASE)
        .send({ ...validCreateInput, availableResolutions: [] })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'availableResolutions' }),
      );
    });

    it('should return 400 with invalid resolution value', async () => {
      const res = await request(app)
        .post(BASE)
        .send({ ...validCreateInput, availableResolutions: ['P999'] })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'availableResolutions' }),
      );
    });
  });

  describe('GET /videos/:id', () => {
    it('should return a video by id', async () => {
      const created = await createVideo();
      const res = await request(app)
        .get(`${BASE}/${created.body.id}`)
        .expect(HttpStatus.Ok);
      expect(res.body.id).toBe(created.body.id);
    });

    it('should return 404 for non-existing id', async () => {
      await request(app).get(`${BASE}/9999`).expect(HttpStatus.NotFound);
    });
  });

  describe('PUT /videos/:id', () => {
    const validUpdate = {
      title: 'Updated',
      author: 'Author',
      availableResolutions: [Resolutions.P240],
      canBeDownloaded: true,
      minAgeRestriction: 16,
      publicationDate: '2026-07-10T00:00:00.000Z',
    };

    it('should update a video and return 204', async () => {
      const created = await createVideo();

      await request(app)
        .put(`${BASE}/${created.body.id}`)
        .send(validUpdate)
        .expect(HttpStatus.NoContent);

      const res = await request(app)
        .get(`${BASE}/${created.body.id}`)
        .expect(HttpStatus.Ok);

      expect(res.body).toMatchObject(validUpdate);
    });

    it('should allow minAgeRestriction to be null', async () => {
      const created = await createVideo();

      await request(app)
        .put(`${BASE}/${created.body.id}`)
        .send({ ...validUpdate, minAgeRestriction: null })
        .expect(HttpStatus.NoContent);
    });

    it('should return 404 for non-existing id', async () => {
      await request(app)
        .put(`${BASE}/9999`)
        .send(validUpdate)
        .expect(HttpStatus.NotFound);
    });

    it('should return 400 when minAgeRestriction is out of range', async () => {
      const created = await createVideo();

      const res = await request(app)
        .put(`${BASE}/${created.body.id}`)
        .send({ ...validUpdate, minAgeRestriction: 50 })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'minAgeRestriction' }),
      );
    });

    it('should return 400 when canBeDownloaded is not a boolean', async () => {
      const created = await createVideo();

      const res = await request(app)
        .put(`${BASE}/${created.body.id}`)
        .send({ ...validUpdate, canBeDownloaded: 'yes' })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'canBeDownloaded' }),
      );
    });

    it('should return 400 with invalid publicationDate', async () => {
      const created = await createVideo();

      const res = await request(app)
        .put(`${BASE}/${created.body.id}`)
        .send({ ...validUpdate, publicationDate: 'not-a-date' })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'publicationDate' }),
      );
    });
  });

  describe('DELETE /videos/:id', () => {
    it('should delete a video and return 204', async () => {
      const created = await createVideo();

      await request(app)
        .delete(`${BASE}/${created.body.id}`)
        .expect(HttpStatus.NoContent);

      await request(app)
        .get(`${BASE}/${created.body.id}`)
        .expect(HttpStatus.NotFound);
    });

    it('should return 404 for non-existing id', async () => {
      await request(app).delete(`${BASE}/9999`).expect(HttpStatus.NotFound);
    });
  });

  describe('DELETE /testing/all-data', () => {
    it('should clear all videos and return 204', async () => {
      await createVideo();
      await request(app).delete(TESTING).expect(HttpStatus.NoContent);

      const res = await request(app).get(BASE).expect(HttpStatus.Ok);
      expect(res.body).toEqual([]);
    });
  });
});
