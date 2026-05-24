-- Dating App Database Schema
-- PostgreSQL 12+

-- Create ENUM types
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');
CREATE TYPE match_mode_enum AS ENUM ('traditional', 'anonymous');
CREATE TYPE action_type_enum AS ENUM ('LIKE', 'PASS');

-- Users Table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  birth_date DATE,
  gender gender_enum,
  bio TEXT,
  default_mode match_mode_enum DEFAULT 'traditional',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- User Photos Table
CREATE TABLE user_photos (
  photo_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_photos_user_id ON user_photos(user_id);
CREATE INDEX idx_user_photos_primary ON user_photos(user_id, is_primary);

-- User Preferences Table
CREATE TABLE user_preferences (
  preference_id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  target_gender gender_enum,
  min_age INT DEFAULT 18,
  max_age INT DEFAULT 99,
  max_distance_km INT DEFAULT 50,
  anonymous_interests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Interactions Table (Likes/Passes)
CREATE TABLE interactions (
  interaction_id SERIAL PRIMARY KEY,
  actor_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  target_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  action_type action_type_enum NOT NULL,
  interaction_mode match_mode_enum DEFAULT 'traditional',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_interaction UNIQUE(actor_id, target_id),
  CONSTRAINT no_self_interaction CHECK (actor_id != target_id)
);

CREATE INDEX idx_interactions_actor_id ON interactions(actor_id);
CREATE INDEX idx_interactions_target_id ON interactions(target_id);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);

-- Matches Table
CREATE TABLE matches (
  match_id SERIAL PRIMARY KEY,
  user1_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  user2_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  match_mode match_mode_enum DEFAULT 'traditional',
  matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT unique_match UNIQUE(user1_id, user2_id),
  CONSTRAINT no_self_match CHECK (user1_id != user2_id),
  CONSTRAINT user1_less_than_user2 CHECK (user1_id < user2_id)
);

CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_matches_active ON matches(is_active);
CREATE INDEX idx_matches_matched_at ON matches(matched_at);

-- Messages Table
-- Messages Table
CREATE TABLE messages (
  message_id SERIAL PRIMARY KEY,
  match_id INT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  sender_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT false
);

CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
CREATE INDEX idx_messages_is_read ON messages(match_id, is_read);

-- Device Tokens Table
CREATE TABLE device_tokens (
  token_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  device_token VARCHAR(500) UNIQUE NOT NULL,
  device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_active ON device_tokens(is_active);
CREATE INDEX idx_device_tokens_created_at ON device_tokens(created_at);

CREATE TABLE anonymous_matching_queue (
    queue_id SERIAL PRIMARY KEY,

    actor_id INT NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    expires_at TIMESTAMP DEFAULT (
        CURRENT_TIMESTAMP + INTERVAL '30 seconds'
    )
);

CREATE INDEX idx_anonymous_queue_active
ON anonymous_matching_queue(is_active);

CREATE INDEX idx_anonymous_queue_actor
ON anonymous_matching_queue(actor_id);

CREATE INDEX idx_anonymous_queue_expires
ON anonymous_matching_queue(expires_at);

-- Validate sender belongs to the match
CREATE OR REPLACE FUNCTION check_valid_sender()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM matches
    WHERE match_id = NEW.match_id
      AND (
        user1_id = NEW.sender_id OR
        user2_id = NEW.sender_id
      )
  ) THEN
    RAISE EXCEPTION 'Sender is not part of this match';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_valid_sender
BEFORE INSERT OR UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION check_valid_sender();

-- Trigger to update updated_at timestamp for users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE users IS 'Main users table for dating app';
COMMENT ON TABLE user_photos IS 'User profile photos';
COMMENT ON TABLE user_preferences IS 'User dating preferences and filtering criteria';
COMMENT ON TABLE interactions IS 'User interactions (likes/passes)';
COMMENT ON TABLE matches IS 'Mutual matches between users';
COMMENT ON TABLE messages IS 'Messages between matched users';
COMMENT ON TABLE device_tokens IS 'Push notification device tokens for mobile/web clients';

COMMENT ON COLUMN users.default_mode IS 'Default matching mode: traditional or anonymous';
COMMENT ON COLUMN interactions.interaction_mode IS 'Mode in which interaction occurred';
COMMENT ON COLUMN matches.match_mode IS 'Mode in which match occurred';


-- =========================
-- FAKE DATA FOR TESTING
-- =========================

-- USERS
INSERT INTO users (
  email,
  password_hash,
  full_name,
  birth_date,
  gender,
  bio,
  default_mode
)
VALUES
-- Main user
(
  'mainuser@gmail.com',
  '$2a$10$P/1KFJ1d2mYf0UghQY3HIu3wgDwF/OkeaI55oNJubjRXzO7MM90Nm',
  'Main User',
  '2005-02-08',
  'male',
  'I love music and coffee',
  'traditional'
),

-- Other users
(
  'alice@gmail.com',
  '$2a$10$P/1KFJ1d2mYf0UghQY3HIu3wgDwF/OkeaI55oNJubjRXzO7MM90Nm',
  'Alice Johnson',
  '2003-06-12',
  'female',
  'Travel lover ✈️',
  'traditional'
),
(
  'emma@gmail.com',
  '$2a$10$P/1KFJ1d2mYf0UghQY3HIu3wgDwF/OkeaI55oNJubjRXzO7MM90Nm',
  'Emma Wilson',
  '2001-09-21',
  'female',
  'Dog mom 🐶',
  'traditional'
),
(
  'olivia@gmail.com',
  '$2a$10$P/1KFJ1d2mYf0UghQY3HIu3wgDwF/OkeaI55oNJubjRXzO7MM90Nm',
  'Olivia Brown',
  '1999-11-30',
  'female',
  'Photographer',
  'anonymous'
),
(
  'lucas@gmail.com',
  '$2a$10$P/1KFJ1d2mYf0UghQY3HIu3wgDwF/OkeaI55oNJubjRXzO7MM90Nm',
  'Lucas Smith',
  '2000-03-14',
  'male',
  'Gym and coding',
  'traditional'
),
(
  'mia@gmail.com',
  '$2a$10$P/1KFJ1d2mYf0UghQY3HIu3wgDwF/OkeaI55oNJubjRXzO7MM90Nm',
  'Mia Davis',
  '2004-01-18',
  'female',
  'Netflix addict',
  'traditional'
),
(
  'sophia@gmail.com',
  '$2a$10$P/1KFJ1d2mYf0UghQY3HIu3wgDwF/OkeaI55oNJubjRXzO7MM90Nm',
  'Sophia Miller',
  '2002-08-05',
  'female',
  'Coffee first ☕',
  'anonymous'
),
(
  'ethan@gmail.com',
  '$2a$10$P/1KFJ1d2mYf0UghQY3HIu3wgDwF/OkeaI55oNJubjRXzO7MM90Nm',
  'Ethan Taylor',
  '1998-12-22',
  'male',
  'Basketball player',
  'traditional'
),
(
  'ava@gmail.com',
  '$2a$10$P/1KFJ1d2mYf0UghQY3HIu3wgDwF/OkeaI55oNJubjRXzO7MM90Nm',
  'Ava Martinez',
  '2003-04-09',
  'female',
  'Foodie 🍜',
  'traditional'
),
(
  'noah@gmail.com',
  '$2a$10$P/1KFJ1d2mYf0UghQY3HIu3wgDwF/OkeaI55oNJubjRXzO7MM90Nm',
  'Noah Anderson',
  '2001-07-01',
  'male',
  'Movie enthusiast',
  'traditional'
);

-- =========================
-- USER PHOTOS
-- =========================

INSERT INTO user_photos (
  user_id,
  image_url,
  is_primary,
  display_order
)
VALUES
(1, 'https://picsum.photos/400/400?random=1', true, 1),
(2, 'https://picsum.photos/400/400?random=2', true, 1),
(3, 'https://picsum.photos/400/400?random=3', true, 1),
(4, 'https://picsum.photos/400/400?random=4', true, 1),
(5, 'https://picsum.photos/400/400?random=5', true, 1),
(6, 'https://picsum.photos/400/400?random=6', true, 1),
(7, 'https://picsum.photos/400/400?random=7', true, 1),
(8, 'https://picsum.photos/400/400?random=8', true, 1),
(9, 'https://picsum.photos/400/400?random=9', true, 1),
(10, 'https://picsum.photos/400/400?random=10', true, 1);

-- =========================
-- USER PREFERENCES
-- =========================

INSERT INTO user_preferences (
  user_id,
  target_gender,
  min_age,
  max_age,
  max_distance_km,
  anonymous_interests
)
VALUES
(1, 'female', 18, 30, 50, 'music, coffee, gaming'),
(2, 'male', 20, 35, 20, 'travel'),
(3, 'male', 20, 35, 30, 'pets'),
(4, 'male', 21, 40, 50, 'photography'),
(5, 'female', 18, 30, 40, 'fitness'),
(6, 'male', 18, 28, 25, 'movies'),
(7, 'male', 22, 35, 50, 'coffee'),
(8, 'female', 18, 30, 35, 'sports'),
(9, 'male', 20, 32, 60, 'food'),
(10, 'female', 18, 30, 45, 'cinema');

-- =========================
-- INTERACTIONS
-- =========================

INSERT INTO interactions (
  actor_id,
  target_id,
  action_type,
  interaction_mode
)
VALUES

-- Main user likes
(1, 2, 'LIKE', 'traditional'),
(1, 3, 'LIKE', 'traditional'),
(1, 4, 'PASS', 'traditional'),
(1, 6, 'LIKE', 'anonymous'),

-- Mutual likes for matches
(2, 1, 'LIKE', 'traditional'),
(3, 1, 'LIKE', 'traditional'),

-- Other random interactions
(5, 1, 'PASS', 'traditional'),
(6, 1, 'LIKE', 'anonymous'),
(7, 1, 'PASS', 'traditional'),
(8, 1, 'LIKE', 'traditional');

-- =========================
-- MATCHES
-- IMPORTANT:
-- user1_id MUST < user2_id
-- =========================

INSERT INTO matches (
  user1_id,
  user2_id,
  match_mode,
  is_active
)
VALUES
(1, 2, 'traditional', true),
(1, 3, 'traditional', true);

-- =========================
-- MESSAGES
-- =========================

INSERT INTO messages (
  match_id,
  sender_id,
  content,
  is_read
)
VALUES

-- Match 1 (Main user + Alice)
(1, 1, 'Hey Alice 👋', true),
(1, 2, 'Hi! Nice to meet you 😊', true),
(1, 1, 'How was your day?', false),

-- Match 2 (Main user + Emma)
(2, 3, 'Hello Main User!', true),
(2, 1, 'Hey Emma 😄', true),
(2, 3, 'Do you like dogs?', false);