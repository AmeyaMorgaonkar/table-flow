-- ============================================================
-- TableFlow — Seed Data
-- Demo restaurant with tables, menu categories, and items
-- ============================================================

-- 1. Demo restaurant
INSERT INTO restaurants (id, slug, name, logo_url, brand_color, currency, timezone)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'demo-bistro',
  'The Brass Leaf',
  NULL,
  '#1A1A1A',
  'INR',
  'Asia/Kolkata'
);

-- 2. Eight tables
INSERT INTO tables (id, restaurant_id, label) VALUES
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Table 1'),
  ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Table 2'),
  ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Table 3'),
  ('b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Table 4'),
  ('b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Table 5'),
  ('b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bar 1'),
  ('b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bar 2'),
  ('b8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Patio 1');

-- 3. Five menu categories
INSERT INTO menu_categories (id, restaurant_id, name, display_order) VALUES
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Small Plates', 1),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mains', 2),
  ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Breads & Rice', 3),
  ('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Desserts', 4),
  ('c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Beverages', 5);

-- 4. Menu items
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available, display_order) VALUES
  -- Small Plates
  ('d01ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Truffle Mushroom Bruschetta', 'Wild mushroom medley on sourdough with truffle oil and micro herbs', 280.00, true, 1),
  ('d02ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Paneer Tikka', 'Tandoor-grilled cottage cheese with smoked paprika and mint chutney', 320.00, true, 2),
  ('d03ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Crispy Calamari', 'Lightly battered squid rings with sriracha aioli', 340.00, true, 3),
  ('d04ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Hummus & Lavash', 'Roasted garlic hummus with warm house-baked lavash', 220.00, true, 4),

  -- Mains
  ('d05ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Paneer Butter Masala', 'Rich and creamy cottage cheese in a slow-cooked tomato and cashew gravy', 380.00, true, 1),
  ('d06ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Chicken Biryani', 'Fragrant basmati rice layered with spiced chicken, saffron, and caramelized onions', 420.00, true, 2),
  ('d07ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Grilled Atlantic Salmon', 'Pan-seared salmon fillet with lemon butter sauce and seasonal greens', 680.00, true, 3),
  ('d08ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Lamb Rogan Josh', 'Tender lamb slow-braised in Kashmiri chili and aromatic spices', 520.00, true, 4),
  ('d09ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Margherita Pizza', 'Wood-fired pizza with buffalo mozzarella, basil, and San Marzano tomatoes', 450.00, true, 5),
  ('d10ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Dal Makhani', 'Overnight-simmered black lentils finished with cream and butter', 320.00, true, 6),

  -- Breads & Rice
  ('d11ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Garlic Naan', 'Tandoor-baked bread brushed with roasted garlic butter', 90.00, true, 1),
  ('d12ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Butter Roti', 'Whole wheat flatbread finished on open flame', 50.00, true, 2),
  ('d13ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Jeera Rice', 'Basmati rice tempered with cumin and fresh coriander', 160.00, true, 3),
  ('d14ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Laccha Paratha', 'Flaky layered bread with a hint of ghee', 70.00, true, 4),

  -- Desserts
  ('d15ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Gulab Jamun', 'Warm milk-solid dumplings in rose-cardamom syrup', 180.00, true, 1),
  ('d16ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Tiramisu', 'Classic Italian layers of espresso-soaked ladyfingers and mascarpone', 320.00, true, 2),
  ('d17ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Kulfi Falooda', 'Saffron kulfi with vermicelli, basil seeds, and rose syrup', 240.00, false, 3),

  -- Beverages
  ('d18ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Masala Chai', 'House-blend spiced tea with cardamom and ginger', 80.00, true, 1),
  ('d19ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Fresh Lime Soda', 'Refreshing lime soda — sweet, salty, or mixed', 100.00, true, 2),
  ('d20ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Cold Brew Coffee', 'Slow-steeped 18-hour cold brew served over ice', 180.00, true, 3),
  ('d21ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Mango Lassi', 'Thick yogurt smoothie with Alphonso mango pulp', 150.00, true, 4),
  ('d22ebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'Sparkling Water', 'San Pellegrino 500ml', 120.00, true, 5);
