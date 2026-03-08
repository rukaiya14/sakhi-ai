-- SHE-BALANCE Database Schema
-- PostgreSQL/MySQL Compatible Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('artisan', 'buyer', 'corporate', 'admin') NOT NULL,
    status ENUM('active', 'pending', 'suspended', 'inactive') DEFAULT 'pending',
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE
);

-- Artisan Profiles
CREATE TABLE IF NOT EXISTS artisan_profiles (
    artisan_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    skills JSON,
    experience_years INT,
    location VARCHAR(255),
    bio TEXT,
    portfolio_images JSON,
    certifications JSON,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verification_documents JSON,
    bank_details JSON,
    availability_status ENUM('available', 'busy', 'unavailable') DEFAULT 'available',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Buyer Profiles
CREATE TABLE IF NOT EXISTS buyer_profiles (
    buyer_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255),
    address TEXT,
    preferences JSON,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Corporate Profiles
CREATE TABLE IF NOT EXISTS corporate_profiles (
    corporate_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_type VARCHAR(100),
    gst_number VARCHAR(50),
    address TEXT,
    contact_person VARCHAR(255),
    total_contracts INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Products/Services
CREATE TABLE IF NOT EXISTS products (
    product_id VARCHAR(50) PRIMARY KEY,
    artisan_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    images JSON,
    customizable BOOLEAN DEFAULT FALSE,
    delivery_time_days INT,
    status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artisan_id) REFERENCES artisan_profiles(artisan_id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(50) PRIMARY KEY,
    buyer_id VARCHAR(50) NOT NULL,
    artisan_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50),
    order_type ENUM('product', 'service', 'bulk', 'custom') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    delivery_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (buyer_id) REFERENCES buyer_profiles(buyer_id),
    FOREIGN KEY (artisan_id) REFERENCES artisan_profiles(artisan_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
);

-- Bulk Orders (Corporate)
CREATE TABLE IF NOT EXISTS bulk_orders (
    bulk_order_id VARCHAR(50) PRIMARY KEY,
    corporate_id VARCHAR(50) NOT NULL,
    artisan_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_quantity INT NOT NULL,
    completed_quantity INT DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    start_date DATE,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (corporate_id) REFERENCES corporate_profiles(corporate_id),
    FOREIGN KEY (artisan_id) REFERENCES artisan_profiles(artisan_id)
);

-- SkillScan Results
CREATE TABLE IF NOT EXISTS skillscan_results (
    scan_id VARCHAR(50) PRIMARY KEY,
    artisan_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    skill_level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    overall_score INT NOT NULL,
    breakdown_scores JSON,
    strengths JSON,
    improvements JSON,
    recommendations JSON,
    images JSON,
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artisan_id) REFERENCES artisan_profiles(artisan_id) ON DELETE CASCADE
);

-- Learning Progress
CREATE TABLE IF NOT EXISTS learning_progress (
    progress_id VARCHAR(50) PRIMARY KEY,
    artisan_id VARCHAR(50) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    progress_percentage INT DEFAULT 0,
    hours_spent DECIMAL(6,2) DEFAULT 0.00,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (artisan_id) REFERENCES artisan_profiles(artisan_id) ON DELETE CASCADE
);

-- Invisible Labour Tracking
CREATE TABLE IF NOT EXISTS labour_tracking (
    labour_id VARCHAR(50) PRIMARY KEY,
    artisan_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50),
    craft_hours DECIMAL(6,2) DEFAULT 0.00,
    household_hours DECIMAL(6,2) DEFAULT 0.00,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artisan_id) REFERENCES artisan_profiles(artisan_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL
);

-- AI Sakhi Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    conversation_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    message_type ENUM('user', 'bot') NOT NULL,
    message TEXT NOT NULL,
    intent VARCHAR(100),
    sentiment VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Support Requests
CREATE TABLE IF NOT EXISTS support_requests (
    request_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assigned_to VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Payment Requests
CREATE TABLE IF NOT EXISTS payment_requests (
    payment_request_id VARCHAR(50) PRIMARY KEY,
    artisan_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50),
    request_type ENUM('advance', 'milestone', 'final') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by VARCHAR(50),
    FOREIGN KEY (artisan_id) REFERENCES artisan_profiles(artisan_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50),
    transaction_type ENUM('payment', 'refund', 'advance', 'payout') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_gateway_ref VARCHAR(255),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id VARCHAR(50) PRIMARY KEY,
    buyer_id VARCHAR(50) NOT NULL,
    artisan_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyer_profiles(buyer_id) ON DELETE CASCADE,
    FOREIGN KEY (artisan_id) REFERENCES artisan_profiles(artisan_id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (buyer_id, artisan_id)
);

-- Reviews and Ratings
CREATE TABLE IF NOT EXISTS reviews (
    review_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    buyer_id VARCHAR(50) NOT NULL,
    artisan_id VARCHAR(50) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES buyer_profiles(buyer_id) ON DELETE CASCADE,
    FOREIGN KEY (artisan_id) REFERENCES artisan_profiles(artisan_id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    read_status BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Health Alerts (AI Monitoring)
CREATE TABLE IF NOT EXISTS health_alerts (
    alert_id VARCHAR(50) PRIMARY KEY,
    artisan_id VARCHAR(50) NOT NULL,
    alert_type ENUM('inactivity', 'health_issue', 'emergency', 'wellness_check') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    description TEXT,
    status ENUM('open', 'acknowledged', 'resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (artisan_id) REFERENCES artisan_profiles(artisan_id) ON DELETE CASCADE
);

-- Create Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_artisan ON orders(artisan_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_skillscan_artisan ON skillscan_results(artisan_id);
CREATE INDEX idx_labour_artisan_date ON labour_tracking(artisan_id, date);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_status);
CREATE INDEX idx_health_alerts_artisan ON health_alerts(artisan_id, status);
