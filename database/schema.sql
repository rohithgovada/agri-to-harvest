-- Agri to Harvest - Database Schema
-- MySQL 8.0+ Compatible

CREATE DATABASE IF NOT EXISTS agri_to_harvest;
USE agri_to_harvest;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('shopkeeper', 'compost_producer', 'farmer', 'admin') NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Hyderabad',
    lat DECIMAL(10, 7) DEFAULT 17.385044,
    lng DECIMAL(10, 7) DEFAULT 78.486671,
    status ENUM('active', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Vegetable Waste Listings
CREATE TABLE IF NOT EXISTS waste_listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shopkeeper_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    vegetable_type VARCHAR(100) NOT NULL,
    description TEXT,
    quantity_kg DECIMAL(10, 2) NOT NULL,
    available_quantity_kg DECIMAL(10, 2) NOT NULL,
    waste_condition ENUM('Freshly Cut / Trimmings', 'Wilted / Overripe', 'Spoiled / Excess Market Produce', 'Dry Husks, Peels & Stems') NOT NULL,
    available_datetime VARCHAR(100) NOT NULL,
    collection_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Hyderabad',
    lat DECIMAL(10, 7) DEFAULT 17.385044,
    lng DECIMAL(10, 7) DEFAULT 78.486671,
    price_per_kg DECIMAL(10, 2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    contact_phone VARCHAR(30) NOT NULL,
    status ENUM('available', 'collection_requested', 'partially_reserved', 'accepted', 'scheduled_for_pickup', 'collected', 'cancelled') DEFAULT 'available',
    is_compostable_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shopkeeper_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_waste_status (status),
    INDEX idx_waste_type (vegetable_type),
    INDEX idx_waste_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Waste Collection Requests
CREATE TABLE IF NOT EXISTS waste_collection_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    waste_listing_id INT NOT NULL,
    producer_id INT NOT NULL,
    shopkeeper_id INT NOT NULL,
    requested_quantity_kg DECIMAL(10, 2) NOT NULL,
    actual_collected_kg DECIMAL(10, 2) DEFAULT NULL,
    proposed_pickup_datetime VARCHAR(100) NOT NULL,
    notes TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'scheduled', 'collected', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (waste_listing_id) REFERENCES waste_listings(id) ON DELETE CASCADE,
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shopkeeper_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_req_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Compost Production Records (Batches)
CREATE TABLE IF NOT EXISTS compost_production_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producer_id INT NOT NULL,
    batch_code VARCHAR(100) NOT NULL UNIQUE,
    source_waste_type VARCHAR(150) NOT NULL,
    collection_request_ids TEXT,
    input_waste_kg DECIMAL(10, 2) NOT NULL,
    processing_method ENUM('Aerobic Windrow', 'Vermicomposting', 'Bokashi Fermentation', 'In-Vessel / Pit Composting') NOT NULL,
    processing_start_date DATE NOT NULL,
    estimated_completion_date DATE NOT NULL,
    actual_completion_date DATE DEFAULT NULL,
    finished_compost_kg DECIMAL(10, 2) DEFAULT NULL,
    moisture_loss_percent DECIMAL(5, 2) DEFAULT 65.00,
    status ENUM('not_started', 'in_progress', 'quality_check', 'completed') DEFAULT 'in_progress',
    npk_ratio VARCHAR(50) DEFAULT '2.4 - 1.5 - 1.8',
    moisture_percent DECIMAL(5, 2) DEFAULT 35.00,
    ph_level DECIMAL(4, 2) DEFAULT 7.20,
    quality_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_batch_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Products (Finished Organic Products)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producer_id INT NOT NULL,
    batch_id INT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    category ENUM('Vegetable Compost', 'Vermicompost', 'Organic Manure', 'Soil Conditioners', 'Bio-fertilizers') NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'kg',
    image_url TEXT,
    production_date DATE NOT NULL,
    usage_instructions TEXT,
    delivery_options VARCHAR(100) DEFAULT 'Delivery & Pickup',
    is_verified_organic BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 4.90,
    total_reviews INT DEFAULT 0,
    status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES compost_production_records(id) ON DELETE SET NULL,
    INDEX idx_product_cat (category),
    INDEX idx_product_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_product (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Orders
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(100) NOT NULL UNIQUE,
    buyer_id INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('order_placed', 'confirmed', 'processing', 'ready_for_pickup', 'dispatched', 'delivered', 'cancelled') DEFAULT 'order_placed',
    fulfillment_type ENUM('delivery', 'pickup') DEFAULT 'delivery',
    shipping_name VARCHAR(120) NOT NULL,
    shipping_phone VARCHAR(30) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL DEFAULT 'Hyderabad',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI / QR',
    payment_status ENUM('simulated_paid', 'pending', 'refunded') DEFAULT 'simulated_paid',
    payment_ref VARCHAR(100) DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    producer_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'kg',
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_item_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    farmer_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Complaints & Reports
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    target_type ENUM('waste_listing', 'product', 'user', 'order') NOT NULL,
    target_id INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    details TEXT,
    status ENUM('open', 'investigating', 'resolved', 'dismissed') DEFAULT 'open',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INT DEFAULT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
