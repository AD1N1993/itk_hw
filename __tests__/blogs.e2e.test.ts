import request from 'supertest';
import express from 'express';
import { setupApp } from '../src/setup-app';
import { HttpStatus } from '../src/core/types/http-statuses';
import { BlogInputDto } from '../src/blogs/dto/blog.input-dto';
import { stopDb } from '../src/db/mongo.db';

const app = setupApp(express());

const BASE = '/hometask_04/api/blogs';
const TESTING = '/hometask_04/api/testing/all-data';

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

  afterAll(async () => {
    await stopDb();
  });

  describe('GET /blogs', () => {
    it('should return empty paginator initially', async () => {
      const res = await request(app).get(BASE).expect(HttpStatus.Ok);
      expect(res.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return paginated list of created blogs', async () => {
      await createBlog({ ...validBlogInput, name: 'Blog A' });
      await createBlog({ ...validBlogInput, name: 'Blog B' });

      const res = await request(app).get(BASE).expect(HttpStatus.Ok);
      expect(res.body.totalCount).toBe(2);
      expect(res.body.pagesCount).toBe(1);
      expect(res.body.page).toBe(1);
      expect(res.body.pageSize).toBe(10);
      expect(res.body.items).toHaveLength(2);
    });

    it('should respect pageNumber and pageSize', async () => {
      await createBlog({ ...validBlogInput, name: 'Blog A' });
      await createBlog({ ...validBlogInput, name: 'Blog B' });
      await createBlog({ ...validBlogInput, name: 'Blog C' });

      const res = await request(app)
        .get(BASE)
        .query({ pageNumber: 2, pageSize: 2 })
        .expect(HttpStatus.Ok);

      expect(res.body.page).toBe(2);
      expect(res.body.pageSize).toBe(2);
      expect(res.body.totalCount).toBe(3);
      expect(res.body.pagesCount).toBe(2);
      expect(res.body.items).toHaveLength(1);
    });

    it('should filter by searchNameTerm', async () => {
      await createBlog({ ...validBlogInput, name: 'Apple' });
      await createBlog({ ...validBlogInput, name: 'Banana' });

      const res = await request(app)
        .get(BASE)
        .query({ searchNameTerm: 'app' })
        .expect(HttpStatus.Ok);

      expect(res.body.totalCount).toBe(1);
      expect(res.body.items[0].name).toBe('Apple');
    });

    it('should sort by sortBy/sortDirection', async () => {
      await createBlog({ ...validBlogInput, name: 'Blog A' });
      await createBlog({ ...validBlogInput, name: 'Blog B' });

      const res = await request(app)
        .get(BASE)
        .query({ sortBy: 'name', sortDirection: 'asc' })
        .expect(HttpStatus.Ok);

      expect(res.body.items.map((b: { name: string }) => b.name)).toEqual([
        'Blog A',
        'Blog B',
      ]);
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
        createdAt: expect.any(String),
        isMembership: false,
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
        .get(`${BASE}/507f1f77bcf86cd799439011`)
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
        .put(`${BASE}/507f1f77bcf86cd799439011`)
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
        .delete(`${BASE}/507f1f77bcf86cd799439011`)
        .set(AUTH)
        .expect(HttpStatus.NotFound);
    });
  });

  describe('GET /blogs/:blogId/posts', () => {
    it('should return 404 if blog does not exist', async () => {
      await request(app)
        .get(`${BASE}/507f1f77bcf86cd799439011/posts`)
        .expect(HttpStatus.NotFound);
    });

    it('should return empty paginator for a blog without posts', async () => {
      const blog = await createBlog();

      const res = await request(app)
        .get(`${BASE}/${blog.body.id}/posts`)
        .expect(HttpStatus.Ok);

      expect(res.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return paginated posts of a specific blog', async () => {
      const blog = await createBlog();
      const otherBlog = await createBlog({
        ...validBlogInput,
        name: 'Other',
      });

      await request(app)
        .post(`${BASE}/${blog.body.id}/posts`)
        .set(AUTH)
        .send({ title: 'Post 1', shortDescription: 'Desc', content: 'C' })
        .expect(HttpStatus.Created);
      await request(app)
        .post(`${BASE}/${otherBlog.body.id}/posts`)
        .set(AUTH)
        .send({ title: 'Post 2', shortDescription: 'Desc', content: 'C' })
        .expect(HttpStatus.Created);

      const res = await request(app)
        .get(`${BASE}/${blog.body.id}/posts`)
        .expect(HttpStatus.Ok);

      expect(res.body.totalCount).toBe(1);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].title).toBe('Post 1');
      expect(res.body.items[0].blogId).toBe(blog.body.id);
    });
  });

  describe('POST /blogs/:blogId/posts', () => {
    it('should return 401 without auth', async () => {
      const blog = await createBlog();
      await request(app)
        .post(`${BASE}/${blog.body.id}/posts`)
        .send({ title: 'Post', shortDescription: 'Desc', content: 'C' })
        .expect(HttpStatus.Unauthorized);
    });

    it('should return 404 if blog does not exist', async () => {
      await request(app)
        .post(`${BASE}/507f1f77bcf86cd799439011/posts`)
        .set(AUTH)
        .send({ title: 'Post', shortDescription: 'Desc', content: 'C' })
        .expect(HttpStatus.NotFound);
    });

    it('should create a post for the specific blog', async () => {
      const blog = await createBlog();

      const res = await request(app)
        .post(`${BASE}/${blog.body.id}/posts`)
        .set(AUTH)
        .send({
          title: 'Post',
          shortDescription: 'Short desc',
          content: 'Content',
        })
        .expect(HttpStatus.Created);

      expect(res.body).toEqual({
        id: expect.any(String),
        title: 'Post',
        shortDescription: 'Short desc',
        content: 'Content',
        blogId: blog.body.id,
        blogName: blog.body.name,
        createdAt: expect.any(String),
      });
    });

    it('should return 400 when title exceeds 30 chars', async () => {
      const blog = await createBlog();

      const res = await request(app)
        .post(`${BASE}/${blog.body.id}/posts`)
        .set(AUTH)
        .send({
          title: 'a'.repeat(31),
          shortDescription: 'Desc',
          content: 'Content',
        })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'title' }),
      );
    });
  });
});
