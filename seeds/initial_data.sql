-- Insert default categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Electronics', 'electronics', 'Latest gadgets and electronics', 1),
('Clothing', 'clothing', 'Fashionable clothing for all', 2),
('Shoes', 'shoes', 'Comfortable and stylish footwear', 3),
('Home & Kitchen', 'home-kitchen', 'Home essentials and kitchenware', 4),
('Beauty & Health', 'beauty-health', 'Beauty products and health supplements', 5),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', 6),
('Books & Media', 'books-media', 'Books, movies, and music', 7),
('Toys & Games', 'toys-games', 'Toys and games for all ages', 8);

-- Insert sub-categories for electronics
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Smartphones', 'smartphones', 'Latest smartphones', (SELECT id FROM categories WHERE slug = 'electronics'), 1),
('Laptops', 'laptops', 'Laptops and notebooks', (SELECT id FROM categories WHERE slug = 'electronics'), 2),
('Headphones', 'headphones', 'Audio headphones', (SELECT id FROM categories WHERE slug = 'electronics'), 3),
('Smartwatches', 'smartwatches', 'Wearable technology', (SELECT id FROM categories WHERE slug = 'electronics'), 4);

-- Insert sub-categories for clothing
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Men''s Clothing', 'mens-clothing', 'Clothing for men', (SELECT id FROM categories WHERE slug = 'clothing'), 1),
('Women''s Clothing', 'womens-clothing', 'Clothing for women', (SELECT id FROM categories WHERE slug = 'clothing'), 2),
('Kids'' Clothing', 'kids-clothing', 'Clothing for children', (SELECT id FROM categories WHERE slug = 'clothing'), 3);

-- Create admin user (password: Admin123!)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified, is_active) VALUES
('admin@shoppingapp.com', '$2a$10$YourHashedPasswordHere', 'Admin', 'User', 'admin', true, true);
-- Note: Generate actual hash using bcrypt for production

-- Create test product attributes
INSERT INTO product_attributes (name, slug, description, filterable) VALUES
('Color', 'color', 'Product color', true),
('Size', 'size', 'Product size', true),
('Storage', 'storage', 'Storage capacity', true),
('RAM', 'ram', 'Memory size', true),
('Material', 'material', 'Product material', true),
('Brand', 'brand', 'Product brand', true);