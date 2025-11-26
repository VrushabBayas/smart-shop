import { db } from './connection';
import {
  categories,
  products,
  productVariants,
  productReviews,
  type NewCategory,
  type NewProduct,
  type NewProductVariant,
  type NewProductReview,
} from './schema';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('Clearing existing data...');
    await db.delete(productReviews);
    await db.delete(productVariants);
    await db.delete(products);
    await db.delete(categories);

    // Reset sequences
    await db.execute(
      sql`ALTER SEQUENCE IF EXISTS categories_id_seq RESTART WITH 1`,
    );
    await db.execute(
      sql`ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1`,
    );

    // ============================================================================
    // SEED CATEGORIES (with hierarchy)
    // ============================================================================
    console.log('Seeding categories...');

    // Root categories
    const [electronics] = await db
      .insert(categories)
      .values({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        status: 'active',
        imageUrl:
          'https://images.unsplash.com/photo-1498049794561-7780e7231661',
      } satisfies NewCategory)
      .returning();

    const [clothing] = await db
      .insert(categories)
      .values({
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        status: 'active',
        imageUrl:
          'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f',
      } satisfies NewCategory)
      .returning();

    const [homeGarden] = await db
      .insert(categories)
      .values({
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home improvement and garden supplies',
        status: 'active',
        imageUrl:
          'https://images.unsplash.com/photo-1484101403633-562f891dc89a',
      } satisfies NewCategory)
      .returning();

    // Electronics sub-categories
    const [laptops] = await db
      .insert(categories)
      .values({
        name: 'Laptops',
        slug: 'laptops',
        description: 'Portable computers and notebooks',
        parentId: electronics.id,
        status: 'active',
        imageUrl:
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
      } satisfies NewCategory)
      .returning();

    const [phones] = await db
      .insert(categories)
      .values({
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Mobile phones and accessories',
        parentId: electronics.id,
        status: 'active',
        imageUrl:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
      } satisfies NewCategory)
      .returning();

    const [headphones] = await db
      .insert(categories)
      .values({
        name: 'Headphones',
        slug: 'headphones',
        description: 'Audio equipment and headphones',
        parentId: electronics.id,
        status: 'active',
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      } satisfies NewCategory)
      .returning();

    // Laptops sub-categories
    const [gamingLaptops] = await db
      .insert(categories)
      .values({
        name: 'Gaming Laptops',
        slug: 'gaming-laptops',
        description: 'High-performance laptops for gaming',
        parentId: laptops.id,
        status: 'active',
      } satisfies NewCategory)
      .returning();

    const [businessLaptops] = await db
      .insert(categories)
      .values({
        name: 'Business Laptops',
        slug: 'business-laptops',
        description: 'Professional laptops for work',
        parentId: laptops.id,
        status: 'active',
      } satisfies NewCategory)
      .returning();

    // Clothing sub-categories
    const [mensClothing] = await db
      .insert(categories)
      .values({
        name: "Men's Clothing",
        slug: 'mens-clothing',
        description: 'Fashion for men',
        parentId: clothing.id,
        status: 'active',
      } satisfies NewCategory)
      .returning();

    const [womensClothing] = await db
      .insert(categories)
      .values({
        name: "Women's Clothing",
        slug: 'womens-clothing',
        description: 'Fashion for women',
        parentId: clothing.id,
        status: 'active',
      } satisfies NewCategory)
      .returning();

    console.log(`✅ Seeded ${10} categories`);

    // ============================================================================
    // SEED PRODUCTS
    // ============================================================================
    console.log('Seeding products...');

    // Gaming Laptops
    const [laptop1] = await db
      .insert(products)
      .values({
        name: 'ASUS ROG Strix G16',
        slug: 'asus-rog-strix-g16',
        description:
          'High-performance gaming laptop with Intel Core i9, RTX 4070, 32GB RAM, and 1TB SSD. Perfect for gaming and content creation.',
        shortDescription: 'Gaming laptop with RTX 4070 and 165Hz display',
        price: '1899.99',
        sku: 'LAPTOP-ROG-001',
        stockQuantity: 15,
        barcode: '0195553791878',
        categoryId: gamingLaptops.id,
        brand: 'ASUS',
        tags: ['gaming', 'laptop', 'rtx', 'high-performance'],
        images: [
          'https://images.unsplash.com/photo-1603302576837-37561b2e2302',
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed',
        ],
        thumbnailUrl:
          'https://images.unsplash.com/photo-1603302576837-37561b2e2302',
        weight: '2.5',
        dimensions: { length: 35.4, width: 25.5, height: 2.24, unit: 'cm' },
        color: 'Eclipse Gray',
        status: 'active',
        isFeatured: true,
        isOnSale: false,
        isNewArrival: true,
        publiushedAt: new Date(),
      } satisfies NewProduct)
      .returning();

    const [laptop2] = await db
      .insert(products)
      .values({
        name: 'Dell XPS 15',
        slug: 'dell-xps-15',
        description:
          'Premium laptop for professionals with stunning InfinityEdge display, Intel Core i7, 16GB RAM, and 512GB SSD.',
        shortDescription: 'Premium ultrabook with 15.6" 4K display',
        price: '1599.99',
        sku: 'LAPTOP-DELL-XPS-002',
        stockQuantity: 20,
        categoryId: businessLaptops.id,
        brand: 'Dell',
        tags: ['business', 'laptop', 'premium', 'ultrabook'],
        images: [
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
        ],
        thumbnailUrl:
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
        weight: '1.8',
        dimensions: { length: 34.4, width: 23.0, height: 1.8, unit: 'cm' },
        color: 'Platinum Silver',
        status: 'active',
        isFeatured: true,
        isOnSale: true,
        salePrice: '1399.99',
        isNewArrival: false,
        publiushedAt: new Date(),
      } satisfies NewProduct)
      .returning();

    // Smartphones
    const [phone1] = await db
      .insert(products)
      .values({
        name: 'iPhone 15 Pro Max',
        slug: 'iphone-15-pro-max',
        description:
          'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Available in multiple storage options.',
        shortDescription: 'Flagship iPhone with titanium design',
        price: '1199.99',
        sku: 'PHONE-IPHONE-15-001',
        stockQuantity: 50,
        barcode: '0194253407287',
        categoryId: phones.id,
        brand: 'Apple',
        tags: ['smartphone', 'iphone', 'flagship', 'premium'],
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
          'https://images.unsplash.com/photo-1695048133082-f6c05b720f6b',
        ],
        thumbnailUrl:
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
        weight: '0.221',
        dimensions: { length: 15.9, width: 7.65, height: 0.83, unit: 'cm' },
        status: 'active',
        isFeatured: true,
        isOnSale: false,
        isNewArrival: true,
        publiushedAt: new Date(),
      } satisfies NewProduct)
      .returning();

    const [phone2] = await db
      .insert(products)
      .values({
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        description:
          'Premium Android flagship with S Pen, 200MP camera, and AI features. The ultimate productivity smartphone.',
        shortDescription: 'Android flagship with S Pen and 200MP camera',
        price: '1299.99',
        sku: 'PHONE-SAMSUNG-S24-002',
        stockQuantity: 35,
        categoryId: phones.id,
        brand: 'Samsung',
        tags: ['smartphone', 'android', 'flagship', 's-pen'],
        images: [
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c',
        ],
        thumbnailUrl:
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c',
        weight: '0.233',
        dimensions: { length: 16.2, width: 7.9, height: 0.86, unit: 'cm' },
        color: 'Titanium Gray',
        status: 'active',
        isFeatured: true,
        isOnSale: false,
        isNewArrival: true,
        publiushedAt: new Date(),
      } satisfies NewProduct)
      .returning();

    // Headphones
    const [headphone1] = await db
      .insert(products)
      .values({
        name: 'Sony WH-1000XM5',
        slug: 'sony-wh-1000xm5',
        description:
          'Industry-leading noise canceling headphones with exceptional sound quality and 30-hour battery life.',
        shortDescription: 'Premium noise-canceling headphones',
        price: '399.99',
        sku: 'AUDIO-SONY-XM5-001',
        stockQuantity: 40,
        barcode: '4548736134717',
        categoryId: headphones.id,
        brand: 'Sony',
        tags: ['headphones', 'noise-canceling', 'wireless', 'premium'],
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b'],
        thumbnailUrl:
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b',
        weight: '0.250',
        color: 'Black',
        status: 'active',
        isFeatured: true,
        isOnSale: true,
        salePrice: '349.99',
        isNewArrival: false,
        publiushedAt: new Date(),
      } satisfies NewProduct)
      .returning();

    // Clothing
    const [shirt1] = await db
      .insert(products)
      .values({
        name: 'Classic Cotton T-Shirt',
        slug: 'classic-cotton-t-shirt',
        description:
          'Premium 100% cotton t-shirt with comfortable fit. Perfect for casual wear.',
        shortDescription: 'Comfortable cotton t-shirt',
        price: '29.99',
        sku: 'CLOTH-TSHIRT-001',
        stockQuantity: 100,
        categoryId: mensClothing.id,
        brand: 'BasicWear',
        tags: ['clothing', 't-shirt', 'casual', 'cotton'],
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        ],
        thumbnailUrl:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        status: 'active',
        isFeatured: false,
        isOnSale: false,
        isNewArrival: false,
        publiushedAt: new Date(),
      } satisfies NewProduct)
      .returning();

    const [dress1] = await db
      .insert(products)
      .values({
        name: 'Summer Floral Dress',
        slug: 'summer-floral-dress',
        description:
          'Elegant floral dress perfect for summer occasions. Lightweight and breathable.',
        shortDescription: 'Elegant summer dress',
        price: '79.99',
        sku: 'CLOTH-DRESS-001',
        stockQuantity: 45,
        categoryId: womensClothing.id,
        brand: 'Fashion House',
        tags: ['clothing', 'dress', 'summer', 'floral'],
        images: [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
        ],
        thumbnailUrl:
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
        color: 'Floral Print',
        status: 'active',
        isFeatured: false,
        isOnSale: true,
        salePrice: '59.99',
        isNewArrival: false,
        publiushedAt: new Date(),
      } satisfies NewProduct)
      .returning();

    console.log(`✅ Seeded ${8} products`);

    // ============================================================================
    // SEED PRODUCT VARIANTS
    // ============================================================================
    console.log('Seeding product variants...');

    // iPhone 15 Pro Max variants (storage options)
    const phoneVariants = await db
      .insert(productVariants)
      .values([
        {
          productId: phone1.id,
          variantName: 'iPhone 15 Pro Max - 256GB - Natural Titanium',
          sku: 'PHONE-IPHONE-15-256-NATURAL',
          price: '1199.99',
          stockQuantity: 20,
          atributes: { storage: '256GB', color: 'Natural Titanium' },
          imageUrl:
            'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
          status: 'active',
        },
        {
          productId: phone1.id,
          variantName: 'iPhone 15 Pro Max - 512GB - Natural Titanium',
          sku: 'PHONE-IPHONE-15-512-NATURAL',
          price: '1399.99',
          stockQuantity: 15,
          atributes: { storage: '512GB', color: 'Natural Titanium' },
          imageUrl:
            'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
          status: 'active',
        },
        {
          productId: phone1.id,
          variantName: 'iPhone 15 Pro Max - 256GB - Blue Titanium',
          sku: 'PHONE-IPHONE-15-256-BLUE',
          price: '1199.99',
          stockQuantity: 15,
          atributes: { storage: '256GB', color: 'Blue Titanium' },
          imageUrl:
            'https://images.unsplash.com/photo-1695048133082-f6c05b720f6b',
          status: 'active',
        },
      ] satisfies NewProductVariant[])
      .returning();

    // T-Shirt variants (sizes and colors)
    const shirtVariants = await db
      .insert(productVariants)
      .values([
        {
          productId: shirt1.id,
          variantName: 'Classic T-Shirt - Black - Small',
          sku: 'TSHIRT-BLACK-S',
          price: '29.99',
          stockQuantity: 25,
          atributes: { color: 'Black', size: 'S' },
          status: 'active',
        },
        {
          productId: shirt1.id,
          variantName: 'Classic T-Shirt - Black - Medium',
          sku: 'TSHIRT-BLACK-M',
          price: '29.99',
          stockQuantity: 30,
          atributes: { color: 'Black', size: 'M' },
          status: 'active',
        },
        {
          productId: shirt1.id,
          variantName: 'Classic T-Shirt - Black - Large',
          sku: 'TSHIRT-BLACK-L',
          price: '29.99',
          stockQuantity: 30,
          atributes: { color: 'Black', size: 'L' },
          status: 'active',
        },
        {
          productId: shirt1.id,
          variantName: 'Classic T-Shirt - White - Small',
          sku: 'TSHIRT-WHITE-S',
          price: '29.99',
          stockQuantity: 20,
          atributes: { color: 'White', size: 'S' },
          status: 'active',
        },
        {
          productId: shirt1.id,
          variantName: 'Classic T-Shirt - White - Medium',
          sku: 'TSHIRT-WHITE-M',
          price: '29.99',
          stockQuantity: 35,
          atributes: { color: 'White', size: 'M' },
          status: 'active',
        },
        {
          productId: shirt1.id,
          variantName: 'Classic T-Shirt - White - Large',
          sku: 'TSHIRT-WHITE-L',
          price: '29.99',
          stockQuantity: 25,
          atributes: { color: 'White', size: 'L' },
          status: 'active',
        },
      ] satisfies NewProductVariant[])
      .returning();

    // Dress variants (sizes)
    const dressVariants = await db
      .insert(productVariants)
      .values([
        {
          productId: dress1.id,
          variantName: 'Summer Dress - Small',
          sku: 'DRESS-FLORAL-S',
          price: '79.99',
          stockQuantity: 15,
          atributes: { size: 'S' },
          status: 'active',
        },
        {
          productId: dress1.id,
          variantName: 'Summer Dress - Medium',
          sku: 'DRESS-FLORAL-M',
          price: '79.99',
          stockQuantity: 18,
          atributes: { size: 'M' },
          status: 'active',
        },
        {
          productId: dress1.id,
          variantName: 'Summer Dress - Large',
          sku: 'DRESS-FLORAL-L',
          price: '79.99',
          stockQuantity: 12,
          atributes: { size: 'L' },
          status: 'active',
        },
      ] satisfies NewProductVariant[])
      .returning();

    console.log(`✅ Seeded ${12} product variants`);

    // ============================================================================
    // SEED PRODUCT REVIEWS
    // ============================================================================
    console.log('Seeding product reviews...');

    // Sample user IDs (these should match real users from user-service in production)
    const sampleUserIds = [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
      '550e8400-e29b-41d4-a716-446655440003',
      '550e8400-e29b-41d4-a716-446655440004',
      '550e8400-e29b-41d4-a716-446655440005',
    ];

    const reviews = await db
      .insert(productReviews)
      .values([
        // ASUS ROG Strix reviews
        {
          productId: laptop1.id,
          userId: sampleUserIds[0],
          rating: 5,
          title: 'Amazing gaming performance!',
          comment:
            'This laptop handles all the latest games at max settings. The 165Hz display is incredibly smooth. Best purchase I made this year!',
          isVerifiedPurchase: true,
          isApproved: true,
        },
        {
          productId: laptop1.id,
          userId: sampleUserIds[1],
          rating: 4,
          title: 'Great laptop but runs hot',
          comment:
            'Performance is excellent for gaming and video editing. However, it does get quite warm during intensive tasks. Otherwise, very satisfied.',
          isVerifiedPurchase: true,
          isApproved: true,
        },
        // Dell XPS reviews
        {
          productId: laptop2.id,
          userId: sampleUserIds[2],
          rating: 5,
          title: 'Perfect for work',
          comment:
            'The build quality is outstanding and the 4K display is gorgeous. Battery life is great for a laptop this powerful.',
          isVerifiedPurchase: true,
          isApproved: true,
        },
        {
          productId: laptop2.id,
          userId: sampleUserIds[3],
          rating: 5,
          title: 'Premium ultrabook',
          comment:
            'Sleek design, powerful performance, and excellent keyboard. Worth every penny!',
          isVerifiedPurchase: false,
          isApproved: true,
        },
        // iPhone 15 Pro Max reviews
        {
          productId: phone1.id,
          userId: sampleUserIds[0],
          rating: 5,
          title: 'Best iPhone yet!',
          comment:
            'The titanium design feels premium and the camera quality is outstanding. Battery lasts all day even with heavy use.',
          isVerifiedPurchase: true,
          isApproved: true,
        },
        {
          productId: phone1.id,
          userId: sampleUserIds[4],
          rating: 4,
          title: 'Excellent but pricey',
          comment:
            "Amazing phone with incredible performance. The only downside is the price, but you're paying for quality.",
          isVerifiedPurchase: true,
          isApproved: true,
        },
        {
          productId: phone1.id,
          userId: sampleUserIds[1],
          rating: 5,
          title: 'Camera is incredible',
          comment:
            "As a photographer, I'm blown away by the camera system. The 5x zoom and night mode are game-changers.",
          isVerifiedPurchase: true,
          isApproved: true,
        },
        // Samsung Galaxy reviews
        {
          productId: phone2.id,
          userId: sampleUserIds[2],
          rating: 5,
          title: 'S Pen makes all the difference',
          comment:
            'The S Pen is incredibly useful for note-taking and editing. The display is the best on any smartphone.',
          isVerifiedPurchase: true,
          isApproved: true,
        },
        {
          productId: phone2.id,
          userId: sampleUserIds[3],
          rating: 4,
          title: 'Great Android flagship',
          comment:
            'Powerful phone with great features. Battery could be better with heavy use.',
          isVerifiedPurchase: false,
          isApproved: true,
        },
        // Sony headphones reviews
        {
          productId: headphone1.id,
          userId: sampleUserIds[4],
          rating: 5,
          title: 'Best noise cancellation',
          comment:
            'These headphones have the best noise cancellation I have ever experienced. Sound quality is superb too.',
          isVerifiedPurchase: true,
          isApproved: true,
        },
        {
          productId: headphone1.id,
          userId: sampleUserIds[0],
          rating: 5,
          title: 'Perfect for travel',
          comment:
            'I use these on flights and they completely block out engine noise. Comfortable for long periods.',
          isVerifiedPurchase: true,
          isApproved: true,
        },
        {
          productId: headphone1.id,
          userId: sampleUserIds[1],
          rating: 4,
          title: 'Great but expensive',
          comment:
            'Excellent sound quality and comfort. A bit pricey but worth it for the features.',
          isVerifiedPurchase: true,
          isApproved: true,
        },
        // T-Shirt reviews
        {
          productId: shirt1.id,
          userId: sampleUserIds[2],
          rating: 5,
          title: 'Comfortable and quality',
          comment:
            'Great quality cotton, fits perfectly and holds up well after washing.',
          isVerifiedPurchase: true,
          isApproved: true,
        },
        {
          productId: shirt1.id,
          userId: sampleUserIds[3],
          rating: 4,
          title: 'Good basic tee',
          comment:
            'Nice shirt for the price. Colors are vibrant and fabric is soft.',
          isVerifiedPurchase: true,
          isApproved: true,
        },
        // Dress reviews
        {
          productId: dress1.id,
          userId: sampleUserIds[4],
          rating: 5,
          title: 'Beautiful dress!',
          comment:
            'The floral pattern is gorgeous and the fit is perfect. Got many compliments!',
          isVerifiedPurchase: true,
          isApproved: true,
        },
        {
          productId: dress1.id,
          userId: sampleUserIds[0],
          rating: 5,
          title: 'Perfect for summer',
          comment:
            'Light and airy fabric, perfect for hot weather. Very flattering fit.',
          isVerifiedPurchase: true,
          isApproved: true,
        },
      ] satisfies NewProductReview[])
      .returning();

    console.log(`✅ Seeded ${16} product reviews`);

    // ============================================================================
    // SUMMARY
    // ============================================================================
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('─────────────────────────────────────────────');
    console.log(`📁 Categories: 10 (with 3 levels of hierarchy)`);
    console.log(`📦 Products: 8 (across multiple categories)`);
    console.log(`🎨 Product Variants: 12`);
    console.log(`⭐ Product Reviews: 16`);
    console.log('─────────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log('Seeding process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding process failed:', err);
      process.exit(1);
    });
}
