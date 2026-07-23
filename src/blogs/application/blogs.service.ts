import { WithId } from 'mongodb';
import { Blog } from '../types/blog';
import { BlogInputDto } from '../dto/blog.input-dto';
import { BlogQueryInput } from '../dto/blog-query.input';
import { blogsRepository } from '../repositories/blogs.repository';

// BLL модуля блогов: бизнес-логика живёт здесь, а не в handler'ах.
export const blogsService = {
  async findMany(
    queryDto: BlogQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    return blogsRepository.findMany(queryDto);
  },

  async findById(id: string): Promise<WithId<Blog> | null> {
    return blogsRepository.findById(id);
  },

  async create(dto: BlogInputDto): Promise<WithId<Blog>> {
    const newBlog: Blog = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    return blogsRepository.create(newBlog);
  },

  async update(id: string, dto: BlogInputDto): Promise<boolean> {
    return blogsRepository.update(id, {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });
  },

  async delete(id: string): Promise<boolean> {
    return blogsRepository.delete(id);
  },
};
