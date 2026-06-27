-- Migration: Vector Similarity Search
-- Date: 2026-03-08

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Ensure ideas_v2 has embedding column (already added in previous migration, but safe to repeat)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ideas_v2' AND column_name='embedding') THEN
        ALTER TABLE ideas_v2 ADD COLUMN embedding vector(1536);
    END IF;
END $$;

-- 3. Create a vector index for performance (using hnsw)
CREATE INDEX IF NOT EXISTS idx_ideas_v2_embedding ON ideas_v2 USING hnsw (embedding vector_cosine_ops);

-- 4. Create the similarity match function
CREATE OR REPLACE FUNCTION match_ideas (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ideas_v2.id,
    ideas_v2.title,
    1 - (ideas_v2.embedding <=> query_embedding) AS similarity
  FROM ideas_v2
  WHERE 1 - (ideas_v2.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
