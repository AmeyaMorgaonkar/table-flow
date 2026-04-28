-- ============================================================
-- TableFlow — Seed Data
-- Demo restaurant with tables, menu categories, and items
-- ============================================================

-- 1. Demo restaurant
INSERT INTO restaurants (id, slug, name, logo_url, brand_color, currency, timezone)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'demo-bistro',
  'Demo Bistro',
  NULL,
  '#E63946',
  'INR',
  'Asia/Kolkata'
);

-- 2. Three tables
INSERT INTO tables (id, restaurant_id, label) VALUES
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Table 1'),
  ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Table 2'),
  ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Table 3');

-- 3. Two menu categories
INSERT INTO menu_categories (id, restaurant_id, name, display_order) VALUES
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mains', 1),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Drinks', 2);

-- 4. Five menu items
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available, display_order) VALUES
  (
    'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Paneer Butter Masala',
    'Rich and creamy cottage cheese curry with butter and tomato gravy',
    320.00,
    true,
    1
  ),
  (
    'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Chicken Biryani',
    'Fragrant basmati rice layered with spiced chicken and caramelized onions',
    280.00,
    true,
    2
  ),
  (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Margherita Pizza',
    'Wood-fired pizza with fresh mozzarella, basil, and San Marzano tomatoes',
    350.00,
    true,
    3
  ),
  (
    'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Masala Chai',
    'Traditional Indian spiced tea with cardamom and ginger',
    60.00,
    true,
    1
  ),
  (
    'd5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Fresh Lime Soda',
    'Refreshing lime soda — sweet, salty, or mixed',
    80.00,
    true,
    2
  );
