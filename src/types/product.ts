export type ProductStatus = 'published' | 'draft';

export interface Product {
  id: string; // Unique permanent Product ID (e.g. EF-2026-001)
  title: string;
  slug: string;
  category: string; // e.g. "Summer", "Winter", etc.
  image: string; // Main product image URL
  images?: string[]; // All uploaded product images for gallery
  video?: string; // Optional product video URL
  description: string;
  regularPrice: number;
  salePrice?: number;
  discount?: number; // Automatic percentage (e.g. 20%)
  brand?: string;
  sizes?: string[]; // e.g. ["S", "M", "L", "XL"]
  colours?: string[]; // e.g. ["Black", "Red", "Blue"]
  amazonAffiliateLink: string; // Required validated affiliate URL
  status: ProductStatus;
  seoTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  total: number;
  published: number;
  drafts: number;
}

export interface AdminUser {
  email: string;
  token: string;
}
