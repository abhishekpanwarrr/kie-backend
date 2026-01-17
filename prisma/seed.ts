import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (be careful in production!)
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  // Hash password for users
  const hashedPassword = await hash("password123", 10);

  // 1. Create Users
  await prisma.user.createMany({
    data: [
      {
        email: "john.doe@example.com",
        password_hash: hashedPassword,
        first_name: "John",
        last_name: "Doe",
        phone: "+1234567890",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        is_email_verified: true,
        role: "customer",
      },
      {
        email: "jane.smith@example.com",
        password_hash: hashedPassword,
        first_name: "Jane",
        last_name: "Smith",
        phone: "+0987654321",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
        is_email_verified: true,
        role: "customer",
      },
      {
        email: "admin@example.com",
        password_hash: hashedPassword,
        first_name: "Admin",
        last_name: "User",
        phone: "+1111111111",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
        is_email_verified: true,
        role: "admin",
      },
      {
        email: "michael.johnson@example.com",
        password_hash: hashedPassword,
        first_name: "Michael",
        last_name: "Johnson",
        phone: "+2222222222",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
        is_email_verified: true,
        role: "customer",
      },
      {
        email: "sarah.wilson@example.com",
        password_hash: hashedPassword,
        first_name: "Sarah",
        last_name: "Wilson",
        phone: "+3333333333",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        is_email_verified: true,
        role: "customer",
      },
    ],
  });

  const users = await prisma.user.findMany({ orderBy: { created_at: "asc" } });
  console.log(`✅ Created ${users.length} users`);

  // 2. Create User Addresses
  await prisma.userAddress.createMany({
    data: [
      {
        user_id: users[0].id,
        address_type: "home",
        address_line1: "123 Main Street",
        city: "New York",
        state: "NY",
        country: "USA",
        postal_code: "10001",
        is_default: true,
      },
      {
        user_id: users[0].id,
        address_type: "work",
        address_line1: "456 Park Avenue",
        address_line2: "Suite 101",
        city: "New York",
        state: "NY",
        country: "USA",
        postal_code: "10022",
      },
      {
        user_id: users[1].id,
        address_type: "home",
        address_line1: "789 Oak Lane",
        city: "Los Angeles",
        state: "CA",
        country: "USA",
        postal_code: "90001",
        is_default: true,
      },
      {
        user_id: users[2].id,
        address_type: "home",
        address_line1: "321 Pine Road",
        city: "Chicago",
        state: "IL",
        country: "USA",
        postal_code: "60007",
        is_default: true,
      },
    ],
  });

  const addresses = await prisma.userAddress.findMany({
    orderBy: { created_at: "asc" },
  });

  console.log(`✅ Created ${addresses.length} user addresses`);

  // 3. Create Categories
  const electronics = await prisma.category.create({
    data: { name: "Electronics", slug: "electronics", sort_order: 1 },
  });
  const clothing = await prisma.category.create({
    data: { name: "Clothing", slug: "clothing", sort_order: 2 },
  });
  const homeKitchen = await prisma.category.create({
    data: { name: "Home & Kitchen", slug: "home-kitchen", sort_order: 3 },
  });

  console.log("✅ Created categories");

  // Sub-categories
  await prisma.category.createMany({
    data: [
      {
        name: "Smartphones",
        slug: "smartphones",
        parent_id: electronics.id,
        description: "Latest smartphones and mobile devices",
        sort_order: 1,
      },
      {
        name: "Laptops",
        slug: "laptops",
        parent_id: electronics.id,
        description: "Powerful laptops for work and play",
        sort_order: 2,
      },
      {
        name: "Men's Clothing",
        slug: "mens-clothing",
        parent_id: clothing.id,
        description: "Clothing for men",
        sort_order: 1,
      },
      {
        name: "Women's Clothing",
        slug: "womens-clothing",
        parent_id: clothing.id,
        description: "Clothing for women",
        sort_order: 2,
      },
      {
        name: "Kitchen Appliances",
        slug: "kitchen-appliances",
        parent_id: homeKitchen.id,
        description: "Modern kitchen appliances",
        sort_order: 1,
      },
    ],
  });

  console.log("✅ Created categories");

  // 4. Create Products
  await prisma.product.createMany({
    data: [
      {
        sku: "IPHONE-14-128GB",
        name: "iPhone 14 Pro",
        slug: "iphone-14-pro",
        category_id: electronics.id,
        brand: "Apple",
        base_price: 999.99,
      },
      {
        sku: "MACBOOK-AIR-M2",
        name: "MacBook Air M2",
        slug: "macbook-air-m2",
        category_id: electronics.id,
        brand: "Apple",
        base_price: 1199.99,
      },
      {
        sku: "TSHIRT-MEN-COTTON",
        name: "Premium Cotton T-Shirt",
        slug: "premium-cotton-tshirt",
        category_id: clothing.id,
        brand: "FashionCo",
        base_price: 29.99,
      },
    ],
  });

  const products = await prisma.product.findMany({
    orderBy: { created_at: "asc" },
  });

  console.log(`✅ Created ${products.length} products`);
  // 5. Create Product Variants
  const variants = await prisma.productVariant.createMany({
    data: [
      // iPhone variants
      {
        product_id: products[0].id,
        sku: "IPHONE-14-128GB-BLACK",
        variant_name: "Black",
        attributes: { color: "Black", storage: "128GB", ram: "6GB" },
        price: 999.99,
        stock_quantity: 25,
        image_url: "https://images.unsplash.com/photo-1663499482523-1c0c1eae708d",
      },
      {
        product_id: products[0].id,
        sku: "IPHONE-14-256GB-SILVER",
        variant_name: "Silver",
        attributes: { color: "Silver", storage: "256GB", ram: "6GB" },
        price: 1099.99,
        stock_quantity: 15,
        image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab",
      },
      {
        product_id: products[0].id,
        sku: "IPHONE-14-512GB-GOLD",
        variant_name: "Gold",
        attributes: { color: "Gold", storage: "512GB", ram: "6GB" },
        price: 1299.99,
        stock_quantity: 8,
        image_url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd",
      },
      // T-Shirt variants
      {
        product_id: products[2].id,
        sku: "TSHIRT-MEN-BLACK-S",
        variant_name: "Black - Small",
        attributes: { color: "Black", size: "S", material: "Cotton" },
        price: 24.99,
        stock_quantity: 50,
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      },
      {
        product_id: products[2].id,
        sku: "TSHIRT-MEN-BLACK-M",
        variant_name: "Black - Medium",
        attributes: { color: "Black", size: "M", material: "Cotton" },
        price: 24.99,
        stock_quantity: 75,
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      },
      {
        product_id: products[2].id,
        sku: "TSHIRT-MEN-WHITE-L",
        variant_name: "White - Large",
        attributes: { color: "White", size: "L", material: "Cotton" },
        price: 24.99,
        stock_quantity: 40,
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      },
      {
        product_id: products[2].id,
        sku: "TSHIRT-MEN-BLUE-XL",
        variant_name: "Blue - XL",
        attributes: { color: "Blue", size: "XL", material: "Cotton" },
        price: 24.99,
        stock_quantity: 30,
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      },
    ],
  });

  console.log(`✅ Created ${variants.count} product variants`);

  // 6. Create Product Images
  const images = await prisma.productImage.createMany({
    data: [
      // iPhone images
      {
        product_id: products[0].id,
        image_url: "https://images.unsplash.com/photo-1663499482523-1c0c1eae708d",
        alt_text: "iPhone 14 Pro Black front view",
        sort_order: 1,
        is_primary: true,
      },
      {
        product_id: products[0].id,
        image_url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd",
        alt_text: "iPhone 14 Pro side view",
        sort_order: 2,
        is_primary: false,
      },
      {
        product_id: products[0].id,
        image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab",
        alt_text: "iPhone 14 Pro camera closeup",
        sort_order: 3,
        is_primary: false,
      },
      // MacBook images
      {
        product_id: products[1].id,
        image_url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef",
        alt_text: "MacBook Air M2 opened",
        sort_order: 1,
        is_primary: true,
      },
      {
        product_id: products[1].id,
        image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
        alt_text: "MacBook Air M2 side view",
        sort_order: 2,
        is_primary: false,
      },
      // T-Shirt images
      {
        product_id: products[2].id,
        variant_id: variants[0]?.id,
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
        alt_text: "Black Cotton T-Shirt",
        sort_order: 1,
        is_primary: true,
      },
      {
        product_id: products[2].id,
        image_url: "https://images.unsplash.com/photo-1503341455253-b6eec34a0e20",
        alt_text: "T-Shirt on model",
        sort_order: 2,
        is_primary: false,
      },
    ],
  });

  console.log(`✅ Created ${images.count} product images`);

  // 7. Create Reviews
  const reviews = await prisma.review.createMany({
    data: [
      {
        product_id: products[0].id,
        user_id: users[0].id,
        rating: 5,
        title: "Amazing phone!",
        comment: "The camera quality is outstanding and battery life lasts all day.",
        is_approved: true,
      },
      {
        product_id: products[0].id,
        user_id: users[1].id,
        rating: 4,
        title: "Great but expensive",
        comment: "Love the features but wish it was more affordable.",
        is_approved: true,
      },
      {
        product_id: products[1].id,
        user_id: users[2].id,
        rating: 5,
        title: "Best laptop ever",
        comment: "Incredible performance and battery life. Perfect for developers.",
        is_approved: true,
      },
      {
        product_id: products[2].id,
        user_id: users[3].id,
        rating: 4,
        title: "Comfortable fit",
        comment: "Great quality fabric and true to size.",
        is_approved: true,
      },
    ],
  });

  console.log(`✅ Created ${reviews.count} reviews`);

  // 8. Create Wishlist Items
  const wishlistItems = await prisma.wishlistItem.createMany({
    data: [
      {
        user_id: users[0].id,
        product_id: products[1].id, // MacBook
      },
      {
        user_id: users[1].id,
        product_id: products[0].id, // iPhone
      },
    ],
  });

  console.log(`✅ Created ${wishlistItems.count} wishlist items`);

  // 9. Create Cart Items
  const cartItems = await prisma.cartItem.createMany({
    data: [
      {
        user_id: users[0].id,
        product_id: products[0].id,
        variant_id: variants[0]?.id, // iPhone Black 128GB
        quantity: 1,
      },
      {
        user_id: users[0].id,
        product_id: products[2].id,
        variant_id: variants[3]?.id, // T-Shirt Black Medium
        quantity: 2,
      },
    ],
  });

  console.log(`✅ Created ${cartItems.count} cart items`);

  // 10. Create Orders
  const order = await prisma.order.create({
    data: {
      order_number: `ORD-${Date.now()}-001`,
      user_id: users[0].id,
      status: "delivered",
      subtotal: 1000,
      tax: 100,
      shipping: 0,
      total: 1100,
      shipping_address_id: addresses[0].id,
      billing_address_id: addresses[0].id,
      payment_method: "credit_card",
      payment_status: "paid",
    },
  });

  await prisma.orderItem.create({
    data: {
      order_id: order.id,
      product_id: products[0].id,
      quantity: 1,
      price: 999.99,
      total: 999.99,
    },
  });

  console.log("✅ Created order and order items");
  console.log("🌱 Seed completed successfully!");
}
main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
