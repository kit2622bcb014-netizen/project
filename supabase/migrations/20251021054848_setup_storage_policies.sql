/*
  # Storage Bucket Policies for Item Images

  ## Overview
  This migration sets up Row Level Security policies for the item-images storage bucket.
  
  ## Security Policies
  
  1. **Public Read Access**
     - Anyone can view/download item images (public access for display)
  
  2. **Authenticated Upload**
     - Only authenticated users can upload images
     - Images are organized in folders by user ID
  
  3. **Owner Update/Delete**
     - Users can only update or delete their own uploaded images
     - Ownership determined by folder structure (user_id/filename)

  ## Notes
  - Bucket 'item-images' must be created first via Supabase dashboard or API
  - Public bucket allows direct URL access to images
  - User-based folder structure ensures proper access control
*/

-- Storage policies for item-images bucket
CREATE POLICY "Anyone can view item images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

CREATE POLICY "Authenticated users can upload item images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "Users can update their own item images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own item images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);
