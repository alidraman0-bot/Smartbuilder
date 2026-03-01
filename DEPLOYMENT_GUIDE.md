# DEPLOYMENT INSTRUCTIONS FOR GLOBAL IDEA GENERATION SYSTEM

## Step 1: Open Supabase SQL Editor

1. **Open your browser** and go to:
   ```
   https://supabase.com/dashboard/project/gdpauggdddompzigbptho
   ```

2. **Log in** to your Supabase account if prompted

3. **Click on "SQL Editor"** in the left sidebar (it has a terminal icon)

4. **Click "New query"** or the "+ New Query" button

---

## Step 2: Copy the SQL Script

1. **Open the file**: `deploy_idea_generation.sql` in your code editor

2. **Select all** (Ctrl+A or Cmd+A)

3. **Copy** (Ctrl+C or Cmd+C)

---

## Step 3: Execute in Supabase

1. **Paste** the SQL script into the query editor in Supabase

2. **Click "Run"** or press Ctrl+Enter / Cmd+Enter

3. **Wait** for execution (should take 5-10 seconds)

4. **Verify success**: You should see messages like:
   - "Success. No rows returned"
   - Or a confirmation that tables were created

---

## Step 4: Verify Deployment

After running the SQL, verify the tables were created:

### 4.1 Check Dimension Tables
Run this query in the SQL Editor:
```sql
SELECT 
    'idea_dimensions_geography' as table_name, 
    COUNT(*) as row_count 
FROM idea_dimensions_geography
UNION ALL
SELECT 
    'idea_dimensions_industry', 
    COUNT(*) 
FROM idea_dimensions_industry
UNION ALL
SELECT 
    'idea_dimensions_problem', 
    COUNT(*) 
FROM idea_dimensions_problem;
```

**Expected output**: Should show ~15-60 records per table

### 4.2 Check Core Tables
Run this query:
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'idea_seeds', 
    'ideas_v2', 
    'rate_limit_config', 
    'idea_generation_usage'
)
ORDER BY tablename;
```

**Expected output**: All 4 tables should be listed

### 4.3 Check Partitions
Run this query:
```sql
SELECT 
    parent.relname AS parent_table,
    child.relname AS partition_name
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname IN ('idea_seeds', 'ideas_v2', 'idea_generation_usage')
ORDER BY parent_table, partition_name;
```

**Expected output**: Should show partitions for each table (e.g., idea_seeds_p0, idea_seeds_p1, etc.)

---

## Step 5: Test the System

1. **Restart your backend server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   cd "C:\Users\ANNHENMICH TECHNOLOG\Desktop\Smartbuilder"
   python -m uvicorn app.main:app --reload
   ```

2. **Run the test suite**:
   ```bash
   python test_idea_generation_system.py
   ```

3. **Test via API**:
   - Open your frontend in the browser
   - Try generating ideas by clicking the "Generate Ideas" button
   - Check the backend logs for messages like:
     - "Reserving 5 seeds for project..."
     - "Batch generation SUCCESS: 5 ideas with 5 seeds"

---

## Troubleshooting

### Error: "relation already exists"
**Solution**: The tables already exist. This is fine - the script uses `IF NOT EXISTS` to avoid conflicts.

### Error: "permission denied"
**Solution**: Make sure you're using the service role key, not the anon key.

### Error: "foreign key constraint"
**Solution**: Run the SQL script in the correct order (it's already ordered correctly in deploy_idea_generation.sql)

### No data in dimension tables
**Solution**: Re-run just the INSERT statements from the SQL script:
```sql
-- Find the section starting with "INSERT INTO idea_dimensions_geography..."
-- and run all INSERT statements again
```

---

## What Gets Created

- ✅ **7 Dimension Tables** with starter data (195+ combinations)
- ✅ **Partitioned idea_seeds table** (4 partitions, supports billions of seeds)
- ✅ **Partitioned ideas_v2 table** (4 partitions, new generation system)
- ✅ **rate_limit_config table** (plan-based rate limits)
- ✅ **idea_generation_usage table** (usage tracking for billing)
- ✅ **Indexes** for fast queries
- ✅ **Row Level Security (RLS)** policies

---

## After Deployment

Your system will now use:
- **Seed-based generation** (no duplicates within projects)
- **Batch AI calls** (80% cost reduction)
- **Rate limiting** (plan-based tiers)
- **Usage tracking** (ready for billing)

The old `ideas` table is untouched and still works alongside the new system.

---

## Quick Start Command

If you have the Supabase CLI installed:
```bash
supabase db push --db-url "your_db_connection_string" < deploy_idea_generation.sql
```

Get your connection string from:
Project Settings → Database → Connection String → URI

---

## Need Help?

If you encounter any issues:
1. Check the Supabase SQL Editor logs for error details
2. Verify your database connection in the .env file
3. Ensure the `projects` table exists (required for foreign keys)
4. Run the verification queries above to diagnose the issue
