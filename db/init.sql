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
CREATE TABLE messages (
  message_id SERIAL PRIMARY KEY,
  match_id INT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  sender_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT false,
  
  CONSTRAINT valid_sender CHECK (sender_id IN (
    SELECT user1_id FROM matches WHERE match_id = messages.match_id
    UNION
    SELECT user2_id FROM matches WHERE match_id = messages.match_id
  ))
);

CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
CREATE INDEX idx_messages_is_read ON messages(match_id, is_read);

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

COMMENT ON COLUMN users.default_mode IS 'Default matching mode: traditional or anonymous';
COMMENT ON COLUMN interactions.interaction_mode IS 'Mode in which interaction occurred';
COMMENT ON COLUMN matches.match_mode IS 'Mode in which match occurred';
