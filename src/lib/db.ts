import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is required. Add it to .env.local or Vercel Environment Variables. Get it from neon.tech'
    );
  }
  return url;
};

const getSQL = () => neon(getDatabaseUrl());

let dbInitialized = false;

export async function ensureDbInitialized() {
  if (dbInitialized) return;
  const sql = getSQL();
  try {
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name VARCHAR(100),
        bio VARCHAR(160),
        avatar_url TEXT,
        search_console_meta_tag TEXT,
        google_verification TEXT,
        bing_verification TEXT,
        yandex_verification TEXT,
        baidu_verification TEXT,
        pinterest_verification TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Posts table
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        meta_description VARCHAR(160),
        image_url TEXT,
        about TEXT,
        rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 5.0),
        review_count INTEGER DEFAULT 0,
        shop_url TEXT,
        slug VARCHAR(200) NOT NULL,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, slug)
      )
    `;

    // Add missing columns if they don't exist (for older deployments)
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_verification TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bing_verification TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS yandex_verification TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS baidu_verification TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pinterest_verification TEXT`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0`;

    dbInitialized = true;
  } catch (error) {
    console.error('Error bootstrapping Neon schema during runtime:', error);
    throw error;
  }
}

// ─── USER QUERIES ────────────────────────────────────────────

export async function getUserByUsername(username: string) {
  await ensureDbInitialized();
  const sql = getSQL();
  const rows = await sql`
    SELECT * FROM users WHERE username = ${username} LIMIT 1
  `;
  return rows[0] || null;
}

export async function getUserByEmail(email: string) {
  await ensureDbInitialized();
  const sql = getSQL();
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;
  return rows[0] || null;
}

export async function getUserByIdentifier(identifier: string) {
  await ensureDbInitialized();
  const sql = getSQL();
  const rows = await sql`
    SELECT * FROM users 
    WHERE email = ${identifier} OR username = ${identifier}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getUserById(id: string) {
  await ensureDbInitialized();
  const sql = getSQL();
  const rows = await sql`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `;
  return rows[0] || null;
}

export async function createUser(user: {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}) {
  await ensureDbInitialized();
  const sql = getSQL();
  const password_hash = await bcrypt.hash(user.password, 10);
  const display_name = user.display_name || user.username;
  const rows = await sql`
    INSERT INTO users (username, email, password_hash, display_name)
    VALUES (${user.username}, ${user.email}, ${password_hash}, ${display_name})
    RETURNING *
  `;
  return rows[0];
}

export async function updateUser(id: string, updates: {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  search_console_meta_tag?: string;
  google_verification?: string;
  bing_verification?: string;
  yandex_verification?: string;
  baidu_verification?: string;
  pinterest_verification?: string;
}) {
  await ensureDbInitialized();
  const sql = getSQL();
  const rows = await sql`
    UPDATE users SET
      display_name = COALESCE(${updates.display_name ?? null}, display_name),
      bio = COALESCE(${updates.bio ?? null}, bio),
      avatar_url = COALESCE(${updates.avatar_url ?? null}, avatar_url),
      search_console_meta_tag = COALESCE(${updates.search_console_meta_tag ?? null}, search_console_meta_tag),
      google_verification = COALESCE(${updates.google_verification ?? null}, google_verification),
      bing_verification = COALESCE(${updates.bing_verification ?? null}, bing_verification),
      yandex_verification = COALESCE(${updates.yandex_verification ?? null}, yandex_verification),
      baidu_verification = COALESCE(${updates.baidu_verification ?? null}, baidu_verification),
      pinterest_verification = COALESCE(${updates.pinterest_verification ?? null}, pinterest_verification)
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function verifyPassword(plainPassword: string, hash: string) {
  return bcrypt.compare(plainPassword, hash);
}

// ─── POST QUERIES ────────────────────────────────────────────

export async function getPosts(options: {
  username?: string;
  search?: string;
  limit?: number;
} = {}) {
  await ensureDbInitialized();
  const sql = getSQL();
  const limit = options.limit || 50;

  if (options.search) {
    const term = `%${options.search}%`;
    return sql`
      SELECT p.*, u.username, u.display_name, u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.title ILIKE ${term} OR p.about ILIKE ${term}
      ORDER BY p.created_at DESC
      LIMIT ${limit}
    `;
  }

  if (options.username) {
    return sql`
      SELECT p.*, u.username, u.display_name, u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE u.username = ${options.username}
      ORDER BY p.created_at DESC
      LIMIT ${limit}
    `;
  }

  return sql`
    SELECT p.*, u.username, u.display_name, u.avatar_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT ${limit}
  `;
}

export async function getPostById(id: string) {
  await ensureDbInitialized();
  const sql = getSQL();
  const rows = await sql`
    SELECT p.*, u.username, u.display_name, u.avatar_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ${id}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getPostBySlugAndUser(userId: string, slug: string) {
  await ensureDbInitialized();
  const sql = getSQL();
  const rows = await sql`
    SELECT p.*, u.username, u.display_name, u.avatar_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ${userId} AND p.slug = ${slug}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getPostByUsernameAndSlug(username: string, slug: string) {
  await ensureDbInitialized();
  const sql = getSQL();
  const rows = await sql`
    SELECT p.*, u.username, u.display_name, u.avatar_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE u.username = ${username} AND p.slug = ${slug}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function createPost(post: {
  user_id: string;
  title: string;
  meta_description?: string;
  image_url?: string;
  about?: string;
  rating?: number;
  review_count?: number;
  shop_url?: string;
  slug: string;
}) {
  await ensureDbInitialized();
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO posts (
      user_id, title, meta_description, image_url, 
      about, rating, review_count, shop_url, slug
    )
    VALUES (
      ${post.user_id}, ${post.title}, ${post.meta_description || null},
      ${post.image_url || null}, ${post.about || null},
      ${post.rating || null}, ${post.review_count || 0},
      ${post.shop_url || null}, ${post.slug}
    )
    RETURNING *
  `;
  return rows[0];
}

export async function deletePost(id: string) {
  await ensureDbInitialized();
  const sql = getSQL();
  await sql`DELETE FROM posts WHERE id = ${id}`;
}

export async function incrementViewCount(postId: string) {
  await ensureDbInitialized();
  const sql = getSQL();
  await sql`
    UPDATE posts SET view_count = view_count + 1 WHERE id = ${postId}
  `;
}

// ─── SEARCH ────────────────────────────────────────────────

export async function searchPosts(query: string) {
  await ensureDbInitialized();
  const sql = getSQL();
  const term = `%${query}%`;
  return sql`
    SELECT p.*, u.username, u.display_name, u.avatar_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.title ILIKE ${term} 
       OR p.about ILIKE ${term}
       OR p.meta_description ILIKE ${term}
    ORDER BY p.created_at DESC
    LIMIT 20
  `;
}

// Default export for backward compat
const db = {
  ensureDbInitialized,
  getUserByUsername,
  getUserByEmail,
  getUserById,
  getUserByIdentifier,
  createUser,
  updateUser,
  verifyPassword,
  getPosts,
  getPostById,
  getPostBySlugAndUser,
  getPostByUsernameAndSlug,
  createPost,
  deletePost,
  incrementViewCount,
  searchPosts,
};

export default db;
