/**
 * Data-access contracts. The storefront currently reads in-memory seed data (lib/products.ts);
 * implement these interfaces against Supabase / Postgres (Prisma) / Firebase and swap them in
 * app/api/* without touching the UI. Payments: create a Stripe PaymentIntent in a new /api/checkout route.
 */
import type { Product } from "./products";

export interface ProductRepo { list(q?: { category?: string; gender?: string }): Promise<Product[]>; get(slug: string): Promise<Product | null>; upsert(p: Product): Promise<Product>; remove(slug: string): Promise<void> }
export interface OrderRepo { create(o: { email: string; lines: { slug: string; size: string; color: string; qty: number }[]; total: number }): Promise<{ id: string }>; list(): Promise<unknown[]> }
export interface InventoryRepo { adjust(slug: string, size: string, delta: number): Promise<void> }
export interface UserRepo { wishlist(userId: string): Promise<string[]>; toggleWish(userId: string, slug: string): Promise<void> }
export interface ReviewRepo { list(slug: string): Promise<{ rating: number; body: string; author: string }[]> }

import { products } from "./products";
export const memoryProducts: ProductRepo = {
  async list(q) { return products.filter((p) => (!q?.category || p.category === q.category) && (!q?.gender || p.gender === q.gender || p.gender === "unisex")); },
  async get(slug) { return products.find((p) => p.slug === slug) ?? null; },
  async upsert(p) { return p; },
  async remove() {},
};
