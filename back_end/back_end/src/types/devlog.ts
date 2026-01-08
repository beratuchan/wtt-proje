// types/devlog.ts

// DevlogBlock tip tanımları
export type DevlogBlock = 
  | { type: 'paragraph'; content: string }
  | { type: 'heading'; level: 2 | 3; text: string; className?: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'quote'; text: string; author?: string };
  // Not: table tipi çıkarıldı

// DevlogPage tipi (backend ile uyumlu)
export interface DevlogPage {
  id: number;
  title: string;
  content: DevlogBlock[];
  coverImage: string;
  viewCount: number;
  likeCount: number;
  isPublished: boolean;
  author: User;
  originalNotebook: Notebook;
  notebooks: Notebook[];
  createdAt: string;
  updatedAt: string;
}

// Notebook tipi
export interface Notebook {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
  isPublic: boolean;
  user: User;
  devlogPages: DevlogPage[];
  createdAt: string;
  updatedAt: string;
}

// Complaint tipleri
export enum ComplaintReason {
  INAPPROPRIATE = 'inappropriate',
  SPAM = 'spam',
  COPYRIGHT = 'copyright',
  HARASSMENT = 'harassment',
  OTHER = 'other'
}

export enum ComplaintStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

export interface Complaint {
  id: number;
  reason: ComplaintReason;
  description: string;
  status: ComplaintStatus;
  user: User;
  devlogPage: DevlogPage;
  createdAt: string;
}

// User tipi (mevcut LoggedInUser ile uyumlu)
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  photo: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// API yanıt tipleri
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}