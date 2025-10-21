/*
  # Lost and Found Application Database Schema

  ## Overview
  This migration creates the complete database schema for a lost and found items tracking application.
  Users can report lost items and found items, search through listings, and connect with each other.

  ## New Tables

  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `phone` (text) - Contact phone number
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `lost_items`
  - `id` (uuid, primary key) - Unique item identifier
  - `user_id` (uuid, foreign key) - Reporter's user ID
  - `title` (text) - Item title/name
  - `description` (text) - Detailed description
  - `category` (text) - Item category (Electronics, Books, ID Cards, Clothing, Others)
  - `lost_date` (date) - Date item was lost
  - `location` (text) - Location where item was lost
  - `contact_info` (text) - Contact information for this item
  - `image_url` (text) - Uploaded image URL
  - `status` (text) - Item status (lost, found, closed)
  - `created_at` (timestamptz) - Report creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `found_items`
  - `id` (uuid, primary key) - Unique item identifier
  - `user_id` (uuid, foreign key) - Reporter's user ID
  - `title` (text) - Item title/name
  - `description` (text) - Detailed description
  - `category` (text) - Item category
  - `found_date` (date) - Date item was found
  - `location` (text) - Location where item was found
  - `contact_info` (text) - Contact information for this item
  - `image_url` (text) - Uploaded image URL
  - `status` (text) - Item status (available, returned, closed)
  - `created_at` (timestamptz) - Report creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:

  #### profiles table
  - Authenticated users can view all profiles
  - Users can only insert their own profile
  - Users can only update their own profile
  - Users cannot delete profiles

  #### lost_items table
  - Anyone can view all lost items (public access for searching)
  - Authenticated users can insert lost items
  - Users can only update their own lost items
  - Users can only delete their own lost items

  #### found_items table
  - Anyone can view all found items (public access for searching)
  - Authenticated users can insert found items
  - Users can only update their own found items
  - Users can only delete their own found items

  ## Notes
  - All timestamps use `timestamptz` for proper timezone handling
  - UUIDs are generated using `gen_random_uuid()`
  - Foreign key constraints ensure data integrity
  - Status fields use text type with application-level validation
  - Public read access enables searching without authentication
  - Only authenticated users can report items
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create lost_items table
CREATE TABLE IF NOT EXISTS lost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  lost_date date NOT NULL,
  location text NOT NULL,
  contact_info text NOT NULL,
  image_url text,
  status text DEFAULT 'lost',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lost items are viewable by everyone"
  ON lost_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert lost items"
  ON lost_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lost items"
  ON lost_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lost items"
  ON lost_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create found_items table
CREATE TABLE IF NOT EXISTS found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  found_date date NOT NULL,
  location text NOT NULL,
  contact_info text NOT NULL,
  image_url text,
  status text DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Found items are viewable by everyone"
  ON found_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert found items"
  ON found_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own found items"
  ON found_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own found items"
  ON found_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS lost_items_user_id_idx ON lost_items(user_id);
CREATE INDEX IF NOT EXISTS lost_items_category_idx ON lost_items(category);
CREATE INDEX IF NOT EXISTS lost_items_status_idx ON lost_items(status);
CREATE INDEX IF NOT EXISTS lost_items_created_at_idx ON lost_items(created_at DESC);

CREATE INDEX IF NOT EXISTS found_items_user_id_idx ON found_items(user_id);
CREATE INDEX IF NOT EXISTS found_items_category_idx ON found_items(category);
CREATE INDEX IF NOT EXISTS found_items_status_idx ON found_items(status);
CREATE INDEX IF NOT EXISTS found_items_created_at_idx ON found_items(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lost_items_updated_at
  BEFORE UPDATE ON lost_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_found_items_updated_at
  BEFORE UPDATE ON found_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
