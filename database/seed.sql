-- Agri to Harvest - Seed Data
-- Demo passwords for all accounts:
-- admin@agritoharvest.org -> admin123 (bcrypt hash: $2b$10$Dz3qfOElF2lFwHuVoRoU/eYqrJk2Fgtk3JUCkL8Ne7RaaBXLdZDku)
-- All other demo users -> password123 (bcrypt hash: $2b$10$9q5SKS.dfncZvNhXw9yh9e7tZzMGjaXdlZoFiopd8DH/LcWxoRKWK)

USE agri_to_harvest;

-- 1. Insert Users
INSERT INTO users (id, name, email, phone, password_hash, role, address, city, lat, lng, status) VALUES
(1, 'AgriAdmin - System Monitor', 'admin@agritoharvest.org', '+91 98490 11223', '$2b$10$Dz3qfOElF2lFwHuVoRoU/eYqrJk2Fgtk3JUCkL8Ne7RaaBXLdZDku', 'admin', 'Agri Innovation Center, Hitec City', 'Hyderabad', 17.4474, 78.3762, 'active'),
(2, 'Ramesh Babu - Rythu Bazar Stall #14', 'ramesh.veggies@gmail.com', '+91 94401 22334', '$2b$10$9q5SKS.dfncZvNhXw9yh9e7tZzMGjaXdlZoFiopd8DH/LcWxoRKWK', 'shopkeeper', 'Bowenpally Agricultural Market Yard, Secunderabad', 'Hyderabad', 17.4721, 78.4842, 'active'),
(3, 'Lakshmi Devi - Fresh Green Grocers', 'lakshmi.greens@gmail.com', '+91 98480 33445', '$2b$10$9q5SKS.dfncZvNhXw9yh9e7tZzMGjaXdlZoFiopd8DH/LcWxoRKWK', 'shopkeeper', 'Plot 42, Ayyappa Society Main Road, Madhapur', 'Hyderabad', 17.4483, 78.3915, 'active'),
(4, 'Suresh Reddy - GreenSoil Bio-Organics', 'suresh.compost@gmail.com', '+91 97011 44556', '$2b$10$9q5SKS.dfncZvNhXw9yh9e7tZzMGjaXdlZoFiopd8DH/LcWxoRKWK', 'compost_producer', 'Survey No 128, Shamshabad Rural Organic Hub', 'Hyderabad', 17.2403, 78.4294, 'active'),
(5, 'Haritha Rao - Haritha Krishi Earth Solutions', 'haritha.eco@gmail.com', '+91 99590 55667', '$2b$10$9q5SKS.dfncZvNhXw9yh9e7tZzMGjaXdlZoFiopd8DH/LcWxoRKWK', 'compost_producer', 'Sector 4, Medchal Agro-Industrial Park', 'Hyderabad', 17.6297, 78.4814, 'active'),
(6, 'Venkat Rao - Organic Paddy & Veg Farmer', 'venkat.farmer@gmail.com', '+91 96180 66778', '$2b$10$9q5SKS.dfncZvNhXw9yh9e7tZzMGjaXdlZoFiopd8DH/LcWxoRKWK', 'farmer', 'Sy No 54, Chevella Mandal, Rangareddy District', 'Rangareddy', 17.3075, 78.1362, 'active'),
(7, 'Anjamma Goud - Sustainable Horticulturist', 'anjamma.organic@gmail.com', '+91 98660 77889', '$2b$10$9q5SKS.dfncZvNhXw9yh9e7tZzMGjaXdlZoFiopd8DH/LcWxoRKWK', 'farmer', 'Village Kondapur, Sangareddy Agri Belt', 'Sangareddy', 17.6190, 78.0818, 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Waste Listings
INSERT INTO waste_listings (id, shopkeeper_id, title, vegetable_type, description, quantity_kg, available_quantity_kg, waste_condition, available_datetime, collection_address, city, lat, lng, price_per_kg, is_free, image_url, contact_phone, status, is_compostable_verified) VALUES
(1, 2, 'Fresh Spinach, Coriander & Mint Trimmings', 'Leafy Greens', 'Daily morning market cuts and trimmings. Clean, 100% organic matter without plastics or chemical residue. Highly nitrogen-rich, perfect for aerobic compost.', 180.00, 180.00, 'Freshly Cut / Trimmings', 'Today, 2:00 PM - 7:00 PM', 'Bowenpally Market Yard Stall 14', 'Hyderabad', 17.4721, 78.4842, 0.00, TRUE, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', '+91 94401 22334', 'available', TRUE),
(2, 2, 'Cabbage, Cauliflower Outer Leaves & Carrot Stems', 'Brassicas & Root Vegetables', 'Crisp discarded vegetable leaves and tops from bulk unpacking. Great carbon-nitrogen balance for vermicomposting pits.', 350.00, 150.00, 'Freshly Cut / Trimmings', 'Daily between 4:00 PM - 8:00 PM', 'Bowenpally Market Yard Stall 14', 'Hyderabad', 17.4721, 78.4842, 0.50, FALSE, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80', '+91 94401 22334', 'partially_reserved', TRUE),
(3, 3, 'Surplus Ripe Tomatoes, Bell Peppers & Gourds', 'Tomatoes, Gourds & Solanaceae', 'Overripe tomatoes and gourd trimmings separated this morning. High moisture content, ideal for pre-fermentation or Bokashi digestion.', 220.00, 220.00, 'Wilted / Overripe', 'Today from 1:00 PM onwards', 'Madhapur Ayyappa Society Grocers', 'Hyderabad', 17.4483, 78.3915, 0.00, TRUE, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80', '+91 98480 33445', 'available', TRUE),
(4, 3, 'Sweet Corn Husks, Pea Shells & Banana Peels', 'Dry Husks, Peels & Stems', 'Bulk dry vegetable biomass, banana skins, and corn outer skins. Excellent brown carbon source to aerate wet compost piles.', 400.00, 0.00, 'Dry Husks, Peels & Stems', 'Yesterday collection completed', 'Madhapur Ayyappa Society Grocers', 'Hyderabad', 17.4483, 78.3915, 0.00, TRUE, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80', '+91 98480 33445', 'collected', TRUE),
(5, 2, 'Mixed Market Sorting Residue (Brinjals, Beans, Okra)', 'Mixed Market Produce', 'Clean unsold surplus veggies sorted at closing hours. Completely biodegradable, zero trash.', 260.00, 260.00, 'Spoiled / Excess Market Produce', 'Tomorrow morning 8:00 AM - 12:00 PM', 'Bowenpally Market Yard Stall 14', 'Hyderabad', 17.4721, 78.4842, 0.00, TRUE, 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80', '+91 94401 22334', 'available', TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 3. Insert Waste Collection Requests
INSERT INTO waste_collection_requests (id, waste_listing_id, producer_id, shopkeeper_id, requested_quantity_kg, actual_collected_kg, proposed_pickup_datetime, notes, status) VALUES
(1, 2, 4, 2, 200.00, NULL, 'Today at 5:30 PM with 1-ton truck', 'We have airtight collection bins and a dedicated hydraulic tipper. Will pay cash on spot.', 'accepted'),
(2, 4, 4, 3, 400.00, 400.00, 'Yesterday 3:00 PM', 'Successfully collected full batch for Shamshabad Vermicompost windrows.', 'collected'),
(3, 1, 5, 2, 80.00, NULL, 'Tomorrow 10:00 AM', 'Requested for Haritha Krishi bio-fertilizer trial pilot.', 'pending')
ON DUPLICATE KEY UPDATE notes=VALUES(notes);

-- 4. Insert Compost Production Records
INSERT INTO compost_production_records (id, producer_id, batch_code, source_waste_type, collection_request_ids, input_waste_kg, processing_method, processing_start_date, estimated_completion_date, actual_completion_date, finished_compost_kg, moisture_loss_percent, status, npk_ratio, moisture_percent, ph_level, quality_notes) VALUES
(1, 4, 'BATCH-2026-SHM-01', 'Corn husks, pea shells & vegetable greens', '[2]', 850.00, 'Vermicomposting', '2026-08-15', '2026-09-25', '2026-09-26', 310.00, 63.50, 'completed', '2.8 - 1.9 - 2.1', 28.00, 7.30, 'Rich dark brown granular texture, earthworm activity completed, lab verified weed-seed free with superior microbial counts.'),
(2, 4, 'BATCH-2026-SHM-02', 'Market leafy cuts, cabbage & tomato residue', '[1]', 920.00, 'Aerobic Windrow', '2026-09-28', '2026-11-10', NULL, NULL, 65.00, 'in_progress', '2.4 - 1.5 - 1.8', 42.00, 6.90, 'Turned twice weekly, core temperature maintained at 58°C ensuring pathogen elimination.'),
(3, 5, 'BATCH-2026-MDC-01', 'Mixed vegetable market waste & dry biomass', '[]', 600.00, 'Bokashi Fermentation', '2026-09-10', '2026-10-12', '2026-10-13', 240.00, 60.00, 'completed', '2.6 - 1.7 - 2.0', 30.00, 7.10, 'Anaerobic microbial starter inoculated, high lactic acid bacterium count, excellent soil conditioner.')
ON DUPLICATE KEY UPDATE quality_notes=VALUES(quality_notes);

-- 5. Insert Products
INSERT INTO products (id, producer_id, batch_id, title, category, description, price, stock_quantity, unit, image_url, production_date, usage_instructions, delivery_options, is_verified_organic, rating, total_reviews, status) VALUES
(1, 4, 1, 'Premium Pure Vermicompost (Black Gold)', 'Vermicompost', 'Crafted from 100% recycled Bowenpally and Madhapur vegetable waste. Inoculated with Eisenia fetida earthworms. 100% organic, weed-free, odorless, and packed with beneficial soil microbes.', 320.00, 45.00, '25kg bag', 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80', '2026-09-27', 'Mix 1 to 2 kg per fruit tree or 200g per vegetable pot. Incorporate into top 2-3 inches of soil before irrigation.', 'Delivery & Pickup', TRUE, 4.90, 8, 'active'),
(2, 4, 1, 'Enriched Vegetable Compost - High Nitrogen', 'Vegetable Compost', 'Aerobically decomposed vegetable waste trimmings fortified with rock phosphate and neem cake. Accelerates root development and enhances soil moisture retention by 40%.', 240.00, 60.00, '25kg bag', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80', '2026-09-28', 'Apply 1 ton per acre during land preparation or basal dose for horticultural crops.', 'Delivery & Pickup', TRUE, 4.80, 5, 'active'),
(3, 5, 3, 'Bio-Fermented Bokashi Soil Conditioner', 'Soil Conditioners', 'Fermented vegetable organic biomass treated with probiotic beneficial micro-organisms. Restores degraded farmland, prevents fungal root rots, and unlocks bound soil phosphorus.', 450.00, 30.00, '25kg bag', 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?auto=format&fit=crop&w=800&q=80', '2026-10-14', 'Broadcast 50g per square meter or mix with farmyard manure prior to sowing.', 'Delivery & Pickup', TRUE, 5.00, 3, 'active'),
(4, 5, NULL, 'Organic Microbial Plant Booster Liquid (Bio-wash)', 'Bio-fertilizers', 'Nutrient-rich liquid leachate extracted from active vermicompost beds. Rich in fulvic and humic acids. Provides rapid leaf greening and pest resistance.', 180.00, 50.00, '5L can', 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80', '2026-10-05', 'Dilute 10ml in 1 liter of fresh water. Foliar spray every 15 days on flowering crops.', 'Standard Delivery', TRUE, 4.70, 4, 'active')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 6. Insert Orders
INSERT INTO orders (id, order_number, buyer_id, subtotal, delivery_fee, total_amount, status, fulfillment_type, shipping_name, shipping_phone, shipping_address, shipping_city, payment_method, payment_status, payment_ref) VALUES
(1, 'ATH-2026-8812', 6, 640.00, 80.00, 720.00, 'delivered', 'delivery', 'Venkat Rao', '+91 96180 66778', 'Survey No 54, Chevella Farm Road', 'Rangareddy', 'UPI / QR', 'simulated_paid', 'UPI-TXN-9021882'),
(2, 'ATH-2026-9045', 7, 450.00, 0.00, 450.00, 'processing', 'pickup', 'Anjamma Goud', '+91 98660 77889', 'Pickup from Medchal Agro Hub', 'Medchal', 'Cash on Delivery', 'simulated_paid', 'CASH-REC-1092')
ON DUPLICATE KEY UPDATE order_number=VALUES(order_number);

-- 7. Insert Order Items
INSERT INTO order_items (id, order_id, product_id, producer_id, product_name, quantity, unit, price_per_unit, total_item_price) VALUES
(1, 1, 1, 4, 'Premium Pure Vermicompost (Black Gold)', 2, '25kg bag', 320.00, 640.00),
(2, 2, 3, 5, 'Bio-Fermented Bokashi Soil Conditioner', 1, '25kg bag', 450.00, 450.00)
ON DUPLICATE KEY UPDATE product_name=VALUES(product_name);

-- 8. Insert Reviews
INSERT INTO reviews (id, product_id, farmer_id, rating, comment) VALUES
(1, 1, 6, 5, 'Exceptional quality vermicompost! Used it for my chili and tomato plots in Chevella. The earthworm casts are visible, pleasant earthy smell, zero weeds.'),
(2, 2, 7, 5, 'Best compost made from vegetable market waste. My drip irrigated gourds showed dark green vigorous foliage within 10 days of application.')
ON DUPLICATE KEY UPDATE comment=VALUES(comment);

-- 9. Insert Audit Logs
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES
(1, 1, 'SYSTEM_INIT', 'system', NULL, 'Database schema initialized and seed records created for Agri to Harvest.'),
(2, 4, 'BATCH_COMPLETED', 'compost_batch', 1, 'Batch BATCH-2026-SHM-01 completed. 850kg waste transformed into 310kg vermicompost.'),
(3, 6, 'ORDER_PLACED', 'order', 1, 'Farmer Venkat Rao placed order ATH-2026-8812 for 50kg vermicompost.')
ON DUPLICATE KEY UPDATE action=VALUES(action);
