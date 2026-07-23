import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { blogsService } from '../../application/blogs.service';
import { postsService } from '../../../posts/application/posts.service';
import { BlogPostInputDto } from '../../../posts/dto/blog-post.input-dto';
import { mapPostToViewModel } from '../../../posts/routers/mappers/map-post-to-view-model';

export async function createPostForBlogHandler(
  req: Request<{ blogId: string }, {}, BlogPostInputDto>,
  res: Response,
) {
  const blog = await blogsService.findById(req.params.blogId);

  if (!blog) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  const createdPost = await postsService.createForBlog(
    req.params.blogId,
    req.body,
    blog,
  );

  res.status(HttpStatus.Created).send(mapPostToViewModel(createdPost));
}
