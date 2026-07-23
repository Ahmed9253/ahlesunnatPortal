import { ObjectId } from 'mongodb';

export type User = {
  _id?: ObjectId;
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  bio: string;
  role: 'user';
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = Omit<User, 'passwordHash'>;

export type Article = {
  _id?: ObjectId;
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: ArticleCategory;
  authorId: string;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
  starred: boolean;
  views: number;
};

export type ArticleCategory = 'Tafseer' | 'Hadith' | 'Fiqh' | 'Aqeedah' | 'Seerah' | 'General';

export const ARTICLE_CATEGORIES: ArticleCategory[] = ['Tafseer', 'Hadith', 'Fiqh', 'Aqeedah', 'Seerah', 'General'];

export type Comment = {
  _id?: ObjectId;
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  isAdminReply: boolean;
  starred: boolean;
  createdAt: string;
};

export type QuestionComment = {
  _id?: ObjectId;
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  isAdminReply: boolean;
  starred: boolean;
  createdAt: string;
};

export type Question = {
  _id?: ObjectId;
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  content: string;
  category: QuestionCategory;
  status: 'pending' | 'answered' | 'closed';
  images: string[];
  adminAnswer: { content: string; answeredAt: string } | null;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
};

export type QuestionCategory = 'Fiqh' | 'Aqeedah' | 'Tafseer' | 'Hadith' | 'Seerah' | 'General';

export const QUESTION_CATEGORIES: QuestionCategory[] = ['Fiqh', 'Aqeedah', 'Tafseer', 'Hadith', 'Seerah', 'General'];

export function stripMongoId<T extends { _id?: unknown }>(doc: T): Omit<T, '_id'> {
  const copy = { ...doc } as Record<string, unknown>;
  delete copy._id;
  return copy as Omit<T, '_id'>;
}

export function toUserProfile(user: User): UserProfile {
  const { passwordHash, ...profile } = user;
  return profile;
}
