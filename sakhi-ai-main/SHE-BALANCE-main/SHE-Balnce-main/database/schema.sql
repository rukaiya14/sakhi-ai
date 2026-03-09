-- SHE-BALANCE Database Schema
-- Local Development Database (SQLite/PostgreSQL)

-- Users Table
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('artisan', 'buyer', 'corporate', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'inactive')),
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE
);

-- Artisan Profiles
CREATE TABLE artisan_profiles (
    artisan_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
    skills TEXT[], -- Array of skills
    experience_years INTEGER,
    location VARCHAR(255),
    bio TEXT,
    portfolio_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_date TIMESTAMP,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    resilience_score INTEGER DEFAULT 0,
    household_hours_weekly INTEGER DEFAULT 0,
    craft_hours_weekly INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buyer Profiles
CREATE TABLE buyer_profiles (
    buyer_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Corporate Profiles
CREATE TABLE corporate_profiles (
    corporate_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_type VARCHAR(100),
    gst_number VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    contact_person VARCHAR(255),
    total_contracts INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills Catalog
CREATE TABLE skills (
    skill_id VARCHAR(50) PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SkillScan Results
CREATE TABLE skillscan_results (
    scan_id VARCHAR(50) PRIMARY KEY,
    artisan_id VARCHAR(50) REFERENCES artisan_profiles(artisan_id) ON DELETE CASCADE,
    skill_category VARCHAR(50) NOT NULL,
    overall_score INTEGER NOT NULL,
    skill_level VARCHAR(20) NOT NULL CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
    breakdown_scores JSONB, -- JSON object with detailed scores
    strengths TEXT[],
    improvements TEXT[],
    recommendations TEXT[],
    image_urls TEXT[],
    analysis_metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products/Services
CREATE TABLE products (
    product_id VARCHAR(50) PRIMARY KEY,
    artisan_id VARCHAR(50) REFERENCES artisan_profiles(artisan_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    images TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'draft')),
    stock_quantity INTEGER DEFAULT 1,
    customizable BOOLEAN DEFAULT FALSE,
    delivery_time_days INTEGER,
    tags TEXT[],
    views INTEGER DEFAULT 0,
    favorites INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    buyer_id VARCHAR(50) REFERENCES buyer_profiles(buyer_id),
    artisan_id VARCHAR(50) REFERENCES artisan_profiles(artisan_id),
    product_id VARCHAR(50) REFERENCES products(product_id),
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('product', 'service', 'bulk', 'custom')),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    delivery_address TEXT,
    special_instructions TEXT,
    craft_hours DECIMAL(5,2),
    household_hours DECIMAL(5,2),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP,
    completed_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bulk Orders (Corporate)
CREATE TABLE bulk_orders (
    bulk_order_id VARCHAR(50) PRIMARY KEY,
    corporate_id VARCHAR(50) REFERENCES corporate_profiles(corporate_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    total_quantity INTEGER NOT NULL,
    completed_quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    start_date TIMESTAMP,
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bulk Order Assignments
CREATE TABLE bulk_order_assignments (
    assignment_id VARCHAR(50) PRIMARY KEY,
    bulk_order_id VARCHAR(50) REFERENCES bulk_orders(bulk_order_id) ON DELETE CASCADE,
    artisan_id VARCHAR(50) REFERENCES artisan_profiles(artisan_id),
    assigned_quantity INTEGER NOT NULL,
    completed_quantity INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_date TIMESTAMP
);

-- Messages
CREATE TABLE messages (
    message_id VARCHAR(50) PRIMARY KEY,
    sender_id VARCHAR(50) REFERENCES users(user_id),
    receiver_id VARCHAR(50) REFERENCES users(user_id),
    order_id VARCHAR(50) REFERENCES orders(order_id),
    subject VARCHAR(255),
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews and Ratings
CREATE TABLE reviews (
    review_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id),
    artisan_id VARCHAR(50) REFERENCES artisan_profiles(artisan_id),
    buyer_id VARCHAR(50) REFERENCES buyer_profiles(buyer_id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    images TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites
CREATE TABLE favorites (
    favorite_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(product_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Learning Progress
CREATE TABLE learning_progress (
    progress_id VARCHAR(50) PRIMARY KEY,
    artisan_id VARCHAR(50) REFERENCES artisan_profiles(artisan_id) ON DELETE CASCADE,
    course_id VARCHAR(50),
    course_name VARCHAR(255),
    progress_percentage INTEGER DEFAULT 0,
    hours_spent DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Sakhi Conversations
CREATE TABLE ai_conversations (
    conversation_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
    messages JSONB, -- Array of message objects
    context_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets
CREATE TABLE support_tickets (
    ticket_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to VARCHAR(50) REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Payment Requests
CREATE TABLE payment_requests (
    request_id VARCHAR(50) PRIMARY KEY,
    artisan_id VARCHAR(50) REFERENCES artisan_profiles(artisan_id),
    order_id VARCHAR(50) REFERENCES orders(order_id),
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('advance', 'payment', 'emergency')),
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'emergency')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by VARCHAR(50) REFERENCES users(user_id)
);

-- Health Alerts
CREATE TABLE health_alerts (
    alert_id VARCHAR(50) PRIMARY KEY,
    artisan_id VARCHAR(50) REFERENCES artisan_profiles(artisan_id),
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('health', 'emergency', 'inactivity', 'wellness')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
    action_taken TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Activity Logs
CREATE TABLE activity_logs (
    log_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    notification_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_artisan_profiles_user_id ON artisan_profiles(user_id);
CREATE INDEX idx_artisan_profiles_verification ON artisan_profiles(verification_status);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_artisan_id ON orders(artisan_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_artisan_id ON products(artisan_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_skillscan_artisan_id ON skillscan_results(artisan_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
