-- SHE-BALANCE Database Schema
-- SQLite for local development, can be adapted for PostgreSQL/MySQL

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK(role IN ('artisan', 'buyer', 'corporate', 'admin')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('active', 'pending', 'suspended', 'inactive')),
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Artisan Profiles
CREATE TABLE IF NOT EXISTS artisan_profiles (
    artisan_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    skills TEXT, -- JSON array of skills
    experience_years INTEGER,
    location TEXT,
    bio TEXT,
    portfolio_images TEXT, -- JSON array of image URLs
    verification_status TEXT DEFAULT 'pending' CHECK(verification_status IN ('pending', 'verified', 'rejected')),
    verification_documents TEXT, -- JSON array
    rating REAL DEFAULT 0.0,
    total_orders INTEGER DEFAULT 0,
    total_earnings REAL DEFAULT 0.0,
    resilience_score REAL DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Buyer Profiles
CREATE TABLE IF NOT EXISTS buyer_profiles (
    buyer_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_name TEXT,
    address TEXT,
    preferences TEXT, -- JSON
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Corporate Profiles
CREATE TABLE IF NOT EXISTS corporate_profiles (
    corporate_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_type TEXT,
    gst_number TEXT,
    address TEXT,
    contact_person TEXT,
    total_contracts INTEGER DEFAULT 0,
    total_value REAL DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL,
    artisan_id TEXT,
    order_type TEXT NOT NULL CHECK(order_type IN ('regular', 'bulk', 'corporate')),
    product_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id),
    FOREIGN KEY (artisan_id) REFERENCES users(user_id)
);

-- Bulk Orders
CREATE TABLE IF NOT EXISTS bulk_orders (
    bulk_order_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    total_quantity INTEGER NOT NULL,
    completed_quantity INTEGER DEFAULT 0,
    progress_percentage REAL DEFAULT 0.0,
    assigned_artisans TEXT, -- JSON array of artisan IDs
    coordinator_notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- SkillScan Results
CREATE TABLE IF NOT EXISTS skillscan_results (
    scan_id TEXT PRIMARY KEY,
    artisan_id TEXT NOT NULL,
    category TEXT NOT NULL,
    skill_level TEXT NOT NULL CHECK(skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
    overall_score REAL NOT NULL,
    breakdown_scores TEXT, -- JSON object
    strengths TEXT, -- JSON array
    improvements TEXT, -- JSON array
    recommendations TEXT, -- JSON array
    image_urls TEXT, -- JSON array
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artisan_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Labour Tracking (Invisible Labour)
CREATE TABLE IF NOT EXISTS labour_tracking (
    labour_id TEXT PRIMARY KEY,
    artisan_id TEXT NOT NULL,
    order_id TEXT,
    craft_hours REAL DEFAULT 0.0,
    household_hours REAL DEFAULT 0.0,
    total_hours REAL GENERATED ALWAYS AS (craft_hours + household_hours) STORED,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artisan_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    payer_id TEXT NOT NULL,
    payee_id TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_type TEXT NOT NULL CHECK(payment_type IN ('order', 'advance', 'milestone', 'final')),
    payment_method TEXT,
    transaction_id TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (payer_id) REFERENCES users(user_id),
    FOREIGN KEY (payee_id) REFERENCES users(user_id)
);

-- AI Sakhi Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    conversation_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK(message_type IN ('user', 'bot')),
    message TEXT NOT NULL,
    intent TEXT, -- classified intent
    sentiment TEXT, -- positive, negative, neutral
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Health Alerts
CREATE TABLE IF NOT EXISTS health_alerts (
    alert_id TEXT PRIMARY KEY,
    artisan_id TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK(alert_type IN ('health_issue', 'inactivity', 'emergency')),
    severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'acknowledged', 'resolved')),
    action_taken TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (artisan_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Learning Progress
CREATE TABLE IF NOT EXISTS learning_progress (
    progress_id TEXT PRIMARY KEY,
    artisan_id TEXT NOT NULL,
    course_name TEXT NOT NULL,
    category TEXT NOT NULL,
    progress_percentage REAL DEFAULT 0.0,
    hours_spent REAL DEFAULT 0.0,
    status TEXT DEFAULT 'in_progress' CHECK(status IN ('not_started', 'in_progress', 'completed')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (artisan_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Favorites (Buyer favorites)
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL,
    artisan_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (artisan_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(buyer_id, artisan_id)
);

-- Reviews and Ratings
CREATE TABLE IF NOT EXISTS reviews (
    review_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    reviewee_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id),
    FOREIGN KEY (reviewee_id) REFERENCES users(user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read_status INTEGER DEFAULT 0,
    action_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_artisan ON orders(artisan_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_skillscan_artisan ON skillscan_results(artisan_id);
CREATE INDEX IF NOT EXISTS idx_labour_artisan ON labour_tracking(artisan_id);
CREATE INDEX IF NOT EXISTS idx_labour_date ON labour_tracking(date);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_health_alerts_artisan ON health_alerts(artisan_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
