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

export type SocialLink = {
  platform: string;
  url: string;
};

export type AboutContent = {
  _id?: ObjectId;
  key: 'about';
  title: string;
  intro: string;
  content: string;
  image: string;
  socials: SocialLink[];
  phones: string[];
  updatedAt: string;
};

export const SOCIAL_PLATFORMS = ['Facebook', 'Instagram', 'YouTube', 'Twitter/X', 'WhatsApp', 'Website'];

export const DEFAULT_ABOUT: Omit<AboutContent, '_id'> = {
  key: 'about',
  title: 'About Us',
  intro: '',
  content: '',
  image: '',
  socials: [],
  phones: [],
  updatedAt: '',
};

export type DonationField = {
  label: string;
  value: string;
};

export type DonationAccount = {
  id: string;
  method: string;
  holder: string;
  fields: DonationField[];
};

export type DonationContent = {
  _id?: ObjectId;
  key: 'donation';
  enabled: boolean;
  title: string;
  description: string;
  accounts: DonationAccount[];
  updatedAt: string;
};

export const DONATION_METHODS = ['Bank Account', 'EasyPaisa', 'JazzCash', 'SadaPay', 'NayaPay', 'Visa / Debit Card', 'PayPal', 'Other'];

export const DONATION_FIELD_LABELS = ['Account Number', 'IBAN', 'Phone Number', 'Card Number', 'Branch', 'Bank Name', 'Other'];

export const DEFAULT_DONATION: Omit<DonationContent, '_id'> = {
  key: 'donation',
  enabled: true,
  title: 'Support Our Work',
  description: '',
  accounts: [],
  updatedAt: '',
};

export function stripMongoId<T extends { _id?: unknown }>(doc: T): Omit<T, '_id'> {
  const copy = { ...doc } as Record<string, unknown>;
  delete copy._id;
  return copy as Omit<T, '_id'>;
}

export function toUserProfile(user: User): UserProfile {
  const { passwordHash, ...profile } = user;
  return profile;
}
