import { Collection, Db } from 'mongodb';
import { Blog } from '../blogs/types/blog';
import { Post } from '../posts/types/post';
import { Video } from '../videos/types/video';

export const BLOG_COLLECTION_NAME = 'blogs';
export const POST_COLLECTION_NAME = 'posts';
export const VIDEO_COLLECTION_NAME = 'videos';

// Коллекции инициализируются один раз в initCollections() после подключения к БД.
// До этого момента они undefined, поэтому обращаться к ним можно только после runDB().
export let blogCollection: Collection<Blog>;
export let postCollection: Collection<Post>;
export let videoCollection: Collection<Video>;

// Создаём объекты коллекций из подключённой базы.
export function initCollections(db: Db): void {
  blogCollection = db.collection<Blog>(BLOG_COLLECTION_NAME);
  postCollection = db.collection<Post>(POST_COLLECTION_NAME);
  videoCollection = db.collection<Video>(VIDEO_COLLECTION_NAME);
}

// Список всех коллекций считаем в МОМЕНТ вызова (уже после initCollections),
// а не на этапе загрузки модуля — иначе сюда попали бы ещё не инициализированные (undefined) коллекции.
export function getAllCollections(): Collection<any>[] {
  return [blogCollection, postCollection, videoCollection];
}
