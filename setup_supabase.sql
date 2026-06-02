-- 1. Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- 2. Create the disease_embeddings table for vector matching
create table disease_embeddings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  image_url text not null,
  embedding vector(512), -- For CLIP ViT-B/32 embeddings
  description text,
  treatment text,
  created_at timestamp with time zone default now()
);

-- 3. Enable Row Level Security
alter table disease_embeddings enable row level security;

-- 4. Create a policy to allow public read access
create policy "Allow public read access" on disease_embeddings for select using (true);

-- 5. Create a function to search for similar images
create or replace function match_disease_images (
  query_embedding vector(512),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  name text,
  image_url text,
  description text,
  treatment text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    disease_embeddings.id,
    disease_embeddings.name,
    disease_embeddings.image_url,
    disease_embeddings.description,
    disease_embeddings.treatment,
    1 - (disease_embeddings.embedding <=> query_embedding) as similarity
  from disease_embeddings
  where 1 - (disease_embeddings.embedding <=> query_embedding) > match_threshold
  order by disease_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
