import { relations } from 'drizzle-orm';
import {
  varchar,
  pgEnum,
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  decimal,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';

export const productStatusEnum = pgEnum('product_status', [
  'active',
  'inactive',
  'out_of_stock',
  'discontinued',
]);

export const categoryStatusEnum = pgEnum('category_status', [
  'active',
  'inactive',
]);

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id').references((): any => categories.id),
  status: categoryStatusEnum('status').notNull().default('active'),
  imageUrl: varchar('image_url', { length: 512 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),

  //inventory
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  barcode: varchar('barcode', { length: 100 }).unique(),

  //Category and organization
  categoryId: uuid('category_id')
    .references(() => categories.id)
    .notNull(),
  brand: varchar('brand', { length: 100 }),
  tags: jsonb('tags').$type<string[]>().default([]),

  //Media
  images: jsonb('images').$type<string[]>().default([]),
  thumbnailUrl: varchar('thumbnail_url', { length: 512 }),

  // product attributes
  weight: decimal('weight', { precision: 10, scale: 2 }),
  dimensions: jsonb('dimensions').$type<{
    length: number;
    width: number;
    height: number;
    unit: string;
  }>(),
  color: varchar('color', { length: 50 }),

  // sattus nd flags
  status: productStatusEnum('status').notNull().default('active'),
  isFeatured: boolean('is_featured').default(false),
  isOnSale: boolean('is_on_sale').default(false),
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
  isNewArrival: boolean('is_new_arrival').default(false),

  //Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  publiushedAt: timestamp('published_at'),
});

// product varients pgTable
export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  variantName: varchar('variant_name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  barcode: varchar('barcode', { length: 100 }).unique(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  atributes: jsonb('attributes').$type<{
    color?: string;
    size?: string;
    material?: string;
    [key: string]: string | undefined;
  }>(),
  imageUrl: varchar('image_url', { length: 512 }),
  status: productStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
});

// product reviews

export const productReviews = pgTable('product_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id').notNull(),
  rating: integer('rating').notNull(),
  title: varchar('title', { length: 255 }),
  comment: text('comment').notNull(),

  isVerifiedPurchase: boolean('is_verified_purchase').default(false),
  isApproved: boolean('is_approved').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// RELATIONS for Query Builders

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  // parent category (one to one)
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'parentChild',
  }),

  // Child categories (one to many)
  children: many(categories, {
    relationName: 'parentChild',
  }),

  products: many(products),
}));

// Product categoriesRelations
export const productsRelations = relations(products, ({ one, many }) => ({
  // category ( many to one )
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  // Product variants (one to many)
  variants: many(productVariants),
  // Product reviews (one to many)
  reviews: many(productReviews),
}));

// Product variants relations
export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    // Parent product (many to one)
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  }),
);

// Product reviews relations
export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  // Parent product (many to one)
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

export type ProductReview = typeof productReviews.$inferSelect;
export type NewProductReview = typeof productReviews.$inferInsert;
