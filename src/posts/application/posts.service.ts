import { WithId } from 'mongodb';
import { Post } from '../types/post';
import { PostInputDto } from '../dto/post.input-dto';
import { BlogPostInputDto } from '../dto/blog-post.input-dto';
import { PostQueryInput } from '../dto/post-query.input';
import { postsRepository } from '../repositories/posts.repository';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';
import { Blog } from '../../blogs/types/blog';

export const postsService = {
  async findMany(
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return postsRepository.findMany(queryDto);
  },

  async findManyByBlogId(
    blogId: string,
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return postsRepository.findManyByBlogId(blogId, queryDto);
  },

  async findById(id: string): Promise<WithId<Post> | null> {
    return postsRepository.findById(id);
  },

  // blogId уже провалидирован (существование блога проверено выше по стеку),
  // поэтому здесь достаточно найти блог заново для актуального blogName.
  async create(dto: PostInputDto): Promise<WithId<Post>> {
    const blog = (await blogsRepository.findById(dto.blogId)) as WithId<Blog>;
    return createPost(dto, dto.blogId, blog.name);
  },

  async createForBlog(
    blogId: string,
    dto: BlogPostInputDto,
    blog: WithId<Blog>,
  ): Promise<WithId<Post>> {
    return createPost(dto, blogId, blog.name);
  },

  async update(id: string, dto: PostInputDto): Promise<boolean> {
    const blog = (await blogsRepository.findById(dto.blogId)) as WithId<Blog>;

    return postsRepository.update(id, {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog._id.toString(),
      blogName: blog.name,
    });
  },

  async delete(id: string): Promise<boolean> {
    return postsRepository.delete(id);
  },
};

async function createPost(
  dto: BlogPostInputDto,
  blogId: string,
  blogName: string,
): Promise<WithId<Post>> {
  const newPost: Post = {
    title: dto.title,
    shortDescription: dto.shortDescription,
    content: dto.content,
    blogId,
    blogName,
    createdAt: new Date().toISOString(),
  };

  return postsRepository.create(newPost);
}
