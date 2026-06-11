-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║              SkillRise Academy — Supabase Schema                    ║
-- ║  Run this entire file in your Supabase SQL Editor                   ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- ── Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast text search

-- ── Drop existing tables (clean slate) ────────────────────────────────────
DROP TABLE IF EXISTS announcements   CASCADE;
DROP TABLE IF EXISTS referrals       CASCADE;
DROP TABLE IF EXISTS purchases       CASCADE;
DROP TABLE IF EXISTS payments        CASCADE;
DROP TABLE IF EXISTS courses         CASCADE;
DROP TABLE IF EXISTS users           CASCADE;

-- ══════════════════════════════════════════════════════════════════════════
-- USERS
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fullname        TEXT NOT NULL,
  username        TEXT NOT NULL UNIQUE,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT NOT NULL,
  password_hash   TEXT NOT NULL,
  referral_code   TEXT NOT NULL UNIQUE,
  referred_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  balance         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','active','suspended')),
  role            TEXT NOT NULL DEFAULT 'user'
                    CHECK (role IN ('user','admin')),
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email          ON users(email);
CREATE INDEX idx_users_username       ON users(username);
CREATE INDEX idx_users_referral_code  ON users(referral_code);
CREATE INDEX idx_users_status         ON users(status);
CREATE INDEX idx_users_referred_by    ON users(referred_by);
-- Full-text search
CREATE INDEX idx_users_search ON users USING gin(
  to_tsvector('english', coalesce(fullname,'') || ' ' || coalesce(email,'') || ' ' || coalesce(username,''))
);

-- ══════════════════════════════════════════════════════════════════════════
-- COURSES
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE courses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail   TEXT DEFAULT '',
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category    TEXT NOT NULL DEFAULT 'Web Development'
                CHECK (category IN (
                  'Web Development','Graphic Design','Digital Marketing',
                  'AI Tools','Business Growth','Cybersecurity'
                )),
  level       TEXT DEFAULT 'Beginner'
                CHECK (level IN ('Beginner','Intermediate','Advanced')),
  duration    TEXT DEFAULT '',
  video_url   TEXT DEFAULT '',
  pdf_url     TEXT DEFAULT '',
  instructor  TEXT DEFAULT 'SkillRise Academy',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_price    ON courses(price);

-- ══════════════════════════════════════════════════════════════════════════
-- PAYMENTS
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount              NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_reference   TEXT NOT NULL UNIQUE,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','success','failed')),
  type                TEXT NOT NULL DEFAULT 'membership'
                        CHECK (type IN ('membership','course')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id   ON payments(user_id);
CREATE INDEX idx_payments_status    ON payments(status);
CREATE INDEX idx_payments_reference ON payments(payment_reference);

-- ══════════════════════════════════════════════════════════════════════════
-- PURCHASES
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE purchases (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX idx_purchases_user_id   ON purchases(user_id);
CREATE INDEX idx_purchases_course_id ON purchases(course_id);

-- ══════════════════════════════════════════════════════════════════════════
-- REFERRALS
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE referrals (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward            NUMERIC(10,2) NOT NULL DEFAULT 500,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referrer_id, referred_user_id)
);

CREATE INDEX idx_referrals_referrer_id      ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);

-- ══════════════════════════════════════════════════════════════════════════
-- ANNOUNCEMENTS
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════
-- AUTO-UPDATE updated_at
-- ══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════
-- Disable RLS for service-role access (backend uses service role key).
-- Enable for anon/user access if needed in future.
ALTER TABLE users         DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses       DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments      DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases     DISABLE ROW LEVEL SECURITY;
ALTER TABLE referrals     DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET
-- ══════════════════════════════════════════════════════════════════════════
-- Run this in Supabase Dashboard > Storage > New bucket
-- Bucket name: skillrise
-- Public bucket: YES

-- Or run via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('skillrise', 'skillrise', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read skillrise"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'skillrise');

-- Allow authenticated upload
CREATE POLICY "Auth upload skillrise"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'skillrise');

CREATE POLICY "Auth update skillrise"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'skillrise');

CREATE POLICY "Auth delete skillrise"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'skillrise');

-- ══════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ══════════════════════════════════════════════════════════════════════════

-- Admin user (password: Admin@123)
INSERT INTO users (
  id, fullname, username, email, phone,
  password_hash, referral_code, balance, status, role
) VALUES (
  uuid_generate_v4(),
  'SkillRise Admin',
  'admin',
  'admin@skillrise.com',
  '08000000000',
  '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin@123
  'ADMIN001',
  0,
  'active',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Sample courses
INSERT INTO courses (id, title, description, price, category, level, duration, instructor) VALUES
(
  uuid_generate_v4(),
  'Full-Stack Web Development Bootcamp',
  'Master modern web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, and databases. Build real-world projects and launch your dev career.',
  15000, 'Web Development', 'Beginner', '40 hours', 'John Adewale'
),
(
  uuid_generate_v4(),
  'Professional Graphic Design Masterclass',
  'Adobe Photoshop, Illustrator & Canva Pro from zero to pro. Create stunning brand identities, logos, social media graphics, and marketing materials.',
  12000, 'Graphic Design', 'Beginner', '25 hours', 'Ngozi Okafor'
),
(
  uuid_generate_v4(),
  'Digital Marketing Mastery Program',
  'Complete digital marketing: SEO, content strategy, social media marketing, Google Ads, email marketing. Grow any business online with proven strategies.',
  10000, 'Digital Marketing', 'Intermediate', '30 hours', 'Emeka Chukwu'
),
(
  uuid_generate_v4(),
  'AI Tools for Modern Professionals',
  'Harness the power of ChatGPT, Midjourney, Copilot and 20+ AI tools. Automate workflows, create content 10x faster, and stay ahead in your career.',
  8000, 'AI Tools', 'Beginner', '15 hours', 'Dr. Fatima Hassan'
),
(
  uuid_generate_v4(),
  'Business Growth & Entrepreneurship',
  'Build, launch and scale a profitable business. Market research, business models, funding strategies, operations, and scaling in the Nigerian/African market.',
  18000, 'Business Growth', 'Intermediate', '35 hours', 'Tunde Bakare'
),
(
  uuid_generate_v4(),
  'Ethical Hacking & Cybersecurity',
  'Start a high-paying cybersecurity career. Learn penetration testing, network security, vulnerability assessment, and ethical hacking with hands-on labs.',
  20000, 'Cybersecurity', 'Advanced', '45 hours', 'Chisom Nwachukwu'
);

-- Welcome announcement
INSERT INTO announcements (id, title, message) VALUES (
  uuid_generate_v4(),
  '🎉 Welcome to SkillRise Academy!',
  'We are excited to have you here! Browse our premium courses, share your referral link to earn ₦500 per friend, and start your journey to digital mastery today.'
);
