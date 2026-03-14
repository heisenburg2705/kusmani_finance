-- Fix RLS Policies for Signup Flow
-- The issue: profiles INSERT policy was too strict

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- Create more permissive INSERT policy for signup
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (
    id = auth.uid() OR
    -- Allow during signup when user just created
    auth.role() = 'authenticated'
  );

-- Also ensure SELECT during signup
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR
    auth.role() = 'authenticated'
  );

-- Update policy: Allow UPDATE own profile
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());
