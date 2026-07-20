import request from 'supertest';
import express from 'express';
import { setupApp } from '../src/setup-app';
import { HttpStatus } from '../src/core/types/http-statuses';
import { BlogInputDto } from '../src/blogs/dto/blog.input-dto';
import { PostInputDto } from '../src/posts/dto/post.input-dto';

const app = setupApp(express());

const POSTS_BASE = '/ht_02/api/posts';
const BLOGS_BASE = '/ht_02/api/blogs';
const TESTING = '/ht_02/api/testing/all-data';

const AUTH = {
  Authorization: 'Basic ' + Buffer.from('admin:qwerty').toString('base64'),
};

const validBlogInput: BlogInputDto = {
  name: 'My blog',
  description: 'Some description',
  websiteUrl: 'https://example.com',
};

const createBlog = () =>
  request(app)
    .post(BLOGS_BASE)
    .set(AUTH)
    .send(validBlogInput)
    .expect(HttpStatus.Created);

const createPost = (input: PostInputDto) =>
  request(app)
    .post(POSTS_BASE)
    .set(AUTH)
    .send(input)
    .expect(HttpStatus.Created);

describe('Posts API', () => {
  beforeEach(async () => {
    await request(app).delete(TESTING).expect(HttpStatus.NoContent);
  });

  describe('GET /posts', () => {
    it('should return empty array initially', async () => {
      const res = await request(app).get(POSTS_BASE).expect(HttpStatus.Ok);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /posts', () => {
    it('should return 401 without auth', async () => {
      const blog = await createBlog();
      await request(app)
        .post(POSTS_BASE)
        .send({
          title: 'Post',
          shortDescription: 'Short desc',
          content: 'Content',
          blogId: blog.body.id,
        })
        .expect(HttpStatus.Unauthorized);
    });

    it('should create a post with correct data', async () => {
      const blog = await createBlog();

      const input: PostInputDto = {
        title: 'Post',
        shortDescription: 'Short desc',
        content: 'Content',
        blogId: blog.body.id,
      };

      const res = await createPost(input);

      expect(res.body).toEqual({
        id: expect.any(String),
        title: input.title,
        shortDescription: input.shortDescription,
        content: input.content,
        blogId: blog.body.id,
        blogName: blog.body.name,
      });
    });

    it('should return 400 when blogId does not exist', async () => {
      const res = await request(app)
        .post(POSTS_BASE)
        .set(AUTH)
        .send({
          title: 'Post',
          shortDescription: 'Short desc',
          content: 'Content',
          blogId: 'non-existing-id',
        })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'blogId' }),
      );
    });

    it('should return 400 when title exceeds 30 chars', async () => {
      const blog = await createBlog();

      const res = await request(app)
        .post(POSTS_BASE)
        .set(AUTH)
        .send({
          title: 'a'.repeat(31),
          shortDescription: 'Short desc',
          content: 'Content',
          blogId: blog.body.id,
        })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'title' }),
      );
    });

    it('should return 400 when content exceeds 1000 chars', async () => {
      const blog = await createBlog();

      const res = await request(app)
        .post(POSTS_BASE)
        .set(AUTH)
        .send({
          title: 'Post',
          shortDescription: 'Short desc',
          content: 'a'.repeat(1001),
          blogId: blog.body.id,
        })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'content' }),
      );
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a post by id', async () => {
      const blog = await createBlog();
      const created = await createPost({
        title: 'Post',
        shortDescription: 'Short desc',
        content: 'Content',
        blogId: blog.body.id,
      });

      const res = await request(app)
        .get(`${POSTS_BASE}/${created.body.id}`)
        .expect(HttpStatus.Ok);
      expect(res.body.id).toBe(created.body.id);
    });

    it('should return 404 for non-existing id', async () => {
      await request(app)
        .get(`${POSTS_BASE}/non-existing-id`)
        .expect(HttpStatus.NotFound);
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update a post and return 204', async () => {
      const blog = await createBlog();
      const created = await createPost({
        title: 'Post',
        shortDescription: 'Short desc',
        content: 'Content',
        blogId: blog.body.id,
      });

      const update: PostInputDto = {
        title: 'Updated',
        shortDescription: 'Updated desc',
        content: 'Updated content',
        blogId: blog.body.id,
      };

      await request(app)
        .put(`${POSTS_BASE}/${created.body.id}`)
        .set(AUTH)
        .send(update)
        .expect(HttpStatus.NoContent);

      const res = await request(app)
        .get(`${POSTS_BASE}/${created.body.id}`)
        .expect(HttpStatus.Ok);

      expect(res.body).toMatchObject(update);
    });

    it('should return 404 for non-existing id', async () => {
      const blog = await createBlog();

      await request(app)
        .put(`${POSTS_BASE}/non-existing-id`)
        .set(AUTH)
        .send({
          title: 'Post',
          shortDescription: 'Short desc',
          content: 'Content',
          blogId: blog.body.id,
        })
        .expect(HttpStatus.NotFound);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post and return 204', async () => {
      const blog = await createBlog();
      const created = await createPost({
        title: 'Post',
        shortDescription: 'Short desc',
        content: 'Content',
        blogId: blog.body.id,
      });

      await request(app)
        .delete(`${POSTS_BASE}/${created.body.id}`)
        .set(AUTH)
        .expect(HttpStatus.NoContent);

      await request(app)
        .get(`${POSTS_BASE}/${created.body.id}`)
        .expect(HttpStatus.NotFound);
    });

    it('should return 404 for non-existing id', async () => {
      await request(app)
        .delete(`${POSTS_BASE}/non-existing-id`)
        .set(AUTH)
        .expect(HttpStatus.NotFound);
    });
  });
});
