-- Step 1: Check if session table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'session'
    ) 
    THEN 'Table "session" EXISTS ✓'
    ELSE 'Table "session" DOES NOT EXIST ✗'
  END as table_status;

-- Step 2: If table doesn't exist, create it
-- (Run this only if the check above shows table doesn't exist)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'session'
  ) THEN
    -- Drop any uppercase version first
    DROP TABLE IF EXISTS "Session" CASCADE;
    
    -- Create lowercase session table
    CREATE TABLE session (
      id TEXT PRIMARY KEY,
      shop TEXT NOT NULL,
      state TEXT NOT NULL,
      "isOnline" BOOLEAN DEFAULT false,
      scope TEXT,
      expires TIMESTAMP,
      "accessToken" TEXT NOT NULL,
      "userId" TEXT,
      "firstName" TEXT,
      "lastName" TEXT,
      email TEXT,
      "accountOwner" BOOLEAN DEFAULT false,
      locale TEXT,
      collaborator BOOLEAN DEFAULT false,
      "emailVerified" BOOLEAN DEFAULT false
    );
    
    -- Create index
    CREATE INDEX session_shop_idx ON session (shop);
    
    RAISE NOTICE 'Table "session" created successfully!';
  ELSE
    RAISE NOTICE 'Table "session" already exists.';
  END IF;
END $$;

-- Step 3: Verify table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'session'
ORDER BY ordinal_position;

