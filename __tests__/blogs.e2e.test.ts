import request from 'supertest';
import express from 'express';
import { setupApp } from '../src/setup-app';
import { HttpStatus } from '../src/core/types/http-statuses';
import { BlogInputDto } from '../src/blogs/dto/blog.input-dto';

const app = setupApp(express());

const BASE = '/ht_02/api/blogs';
const TESTING = '/ht_02/api/testing/all-data';

const AUTH = {
  Authorization: 'Basic ' + Buffer.from('admin:qwerty').toString('base64'),
};

const validBlogInput: BlogInputDto = {
  name: 'My blog',
  description: 'Some description',
  websiteUrl: 'https://example.com',
};

const createBlog = (input: BlogInputDto = validBlogInput) =>
  request(app).post(BASE).set(AUTH).send(input).expect(HttpStatus.Created);

describe('Blogs API', () => {
  beforeEach(async () => {
    await request(app).delete(TESTING).expect(HttpStatus.NoContent);
  });

  describe('GET /blogs', () => {
    it('should return empty array initially', async () => {
      const res = await request(app).get(BASE).expect(HttpStatus.Ok);
      expect(res.body).toEqual([]);
    });

    it('should return list of created blogs', async () => {
      await createBlog();
      await createBlog();

      const res = await request(app).get(BASE).expect(HttpStatus.Ok);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('POST /blogs', () => {
    it('should return 401 without auth', async () => {
      await request(app)
        .post(BASE)
        .send(validBlogInput)
        .expect(HttpStatus.Unauthorized);
    });

    it('should return 401 with wrong credentials', async () => {
      await request(app)
        .post(BASE)
        .set({
          Authorization:
            'Basic ' + Buffer.from('admin:wrong').toString('base64'),
        })
        .send(validBlogInput)
        .expect(HttpStatus.Unauthorized);
    });

    it('should create a blog with correct data', async () => {
      const res = await createBlog();

      expect(res.body).toEqual({
        id: expect.any(String),
        name: validBlogInput.name,
        description: validBlogInput.description,
        websiteUrl: validBlogInput.websiteUrl,
      });
    });

    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post(BASE)
        .set(AUTH)
        .send({ ...validBlogInput, name: '' })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'name' }),
      );
    });

    it('should return 400 when name exceeds 15 chars', async () => {
      const res = await request(app)
        .post(BASE)
        .set(AUTH)
        .send({ ...validBlogInput, name: 'a'.repeat(16) })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'name' }),
      );
    });

    it('should return 400 when description exceeds 500 chars', async () => {
      const res = await request(app)
        .post(BASE)
        .set(AUTH)
        .send({ ...validBlogInput, description: 'a'.repeat(501) })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'description' }),
      );
    });

    it('should return 400 with invalid websiteUrl', async () => {
      const res = await request(app)
        .post(BASE)
        .set(AUTH)
        .send({ ...validBlogInput, websiteUrl: 'not-a-url' })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'websiteUrl' }),
      );
    });
  });

  describe('GET /blogs/:id', () => {
    it('should return a blog by id', async () => {
      const created = await createBlog();
      const res = await request(app)
        .get(`${BASE}/${created.body.id}`)
        .expect(HttpStatus.Ok);
      expect(res.body.id).toBe(created.body.id);
    });

    it('should return 404 for non-existing id', async () => {
      await request(app)
        .get(`${BASE}/non-existing-id`)
        .expect(HttpStatus.NotFound);
    });
  });

  describe('PUT /blogs/:id', () => {
    const validUpdate: BlogInputDto = {
      name: 'Updated',
      description: 'Updated description',
      websiteUrl: 'https://updated.com',
    };

    it('should return 401 without auth', async () => {
      const created = await createBlog();
      await request(app)
        .put(`${BASE}/${created.body.id}`)
        .send(validUpdate)
        .expect(HttpStatus.Unauthorized);
    });

    it('should update a blog and return 204', async () => {
      const created = await createBlog();

      await request(app)
        .put(`${BASE}/${created.body.id}`)
        .set(AUTH)
        .send(validUpdate)
        .expect(HttpStatus.NoContent);

      const res = await request(app)
        .get(`${BASE}/${created.body.id}`)
        .expect(HttpStatus.Ok);

      expect(res.body).toMatchObject(validUpdate);
    });

    it('should return 404 for non-existing id', async () => {
      await request(app)
        .put(`${BASE}/non-existing-id`)
        .set(AUTH)
        .send(validUpdate)
        .expect(HttpStatus.NotFound);
    });

    it('should return 400 with incorrect input', async () => {
      const created = await createBlog();

      const res = await request(app)
        .put(`${BASE}/${created.body.id}`)
        .set(AUTH)
        .send({ ...validUpdate, name: '' })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'name' }),
      );
    });
  });

  describe('DELETE /blogs/:id', () => {
    it('should return 401 without auth', async () => {
      const created = await createBlog();
      await request(app)
        .delete(`${BASE}/${created.body.id}`)
        .expect(HttpStatus.Unauthorized);
    });

    it('should delete a blog and return 204', async () => {
      const created = await createBlog();

      await request(app)
        .delete(`${BASE}/${created.body.id}`)
        .set(AUTH)
        .expect(HttpStatus.NoContent);

      await request(app)
        .get(`${BASE}/${created.body.id}`)
        .expect(HttpStatus.NotFound);
    });

    it('should return 404 for non-existing id', async () => {
      await request(app)
        .delete(`${BASE}/non-existing-id`)
        .set(AUTH)
        .expect(HttpStatus.NotFound);
    });
  });
});
