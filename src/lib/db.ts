import { neon } from '@neondatabase/serverless';

// ─── CONNECTION ──────────────────────────────────────────────

export const isUsingNeon = !!(process.env.DATABASE_URL);

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is required. Add it to .env.local or Vercel Environment Variables. Get it from neon.tech'
    );
  }
  return neon(url);
}

// ─── INITIALIZATION ──────────────────────────────────────────

let dbInitialized = false;

export async function ensureDbInitialized() {
  if (dbInitialized) return;
  const sql = getSql();
  try {
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

    // Add missing columns for older deployments
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

// ─── USER FUNCTIONS ──────────────────────────────────────────

async function getUserByUsername(username: string) {
  await ensureDbInitialized();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM users WHERE username = ${username} LIMIT 1
  `;
  return rows[0] || null;
}

async function getUserByEmail(email: string) {
  await ensureDbInitialized();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;
  return rows[0] || null;
}

async function getUserById(id: string) {
  await ensureDbInitialized();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `;
  return rows[0] || null;
}

async function createUser(user: {
  id?: string;
  username: string;
  email: string;
  password_hash: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  search_console_meta_tag?: string;
  created_at?: string;
}) {
  await ensureDbInitialized();
  const sql = getSql();
  const display_name = user.display_name || user.username;
  const avatar_url = user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`;
  
  const rows = await sql`
    INSERT INTO users (username, email, password_hash, display_name, bio, avatar_url)
    VALUES (
      ${user.username},
      ${user.email},
      ${user.password_hash},
      ${display_name},
      ${user.bio || ''},
      ${avatar_url}
    )
    RETURNING *
  `;
  return rows[0];
}

async function updateUser(id: string, updates: {
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
  const sql = getSql();
  const rows = await sql`
    UPDATE users SET
      display_name = CASE WHEN ${updates.display_name ?? null} IS NOT NULL 
                    THEN ${updates.display_name ?? null} ELSE display_name END,
      bio = CASE WHEN ${updates.bio ?? null} IS NOT NULL 
            THEN ${updates.bio ?? null} ELSE bio END,
      avatar_url = CASE WHEN ${updates.avatar_url ?? null} IS NOT NULL 
                  THEN ${updates.avatar_url ?? null} ELSE avatar_url END,
      search_console_meta_tag = CASE WHEN ${updates.search_console_meta_tag ?? null} IS NOT NULL 
                                THEN ${updates.search_console_meta_tag ?? null} 
                                ELSE search_console_meta_tag END,
      google_verification = CASE WHEN ${updates.google_verification ?? null} IS NOT NULL 
                           THEN ${updates.google_verification ?? null} 
                           ELSE google_verification END,
      bing_verification = CASE WHEN ${updates.bing_verification ?? null} IS NOT NULL 
                         THEN ${updates.bing_verification ?? null} 
                         ELSE bing_verification END,
      yandex_verification = CASE WHEN ${updates.yandex_verification ?? null} IS NOT NULL 
                           THEN ${updates.yandex_verification ?? null} 
                           ELSE yandex_verification END,
      baidu_verification = CASE WHEN ${updates.baidu_verification ?? null} IS NOT NULL 
                          THEN ${updates.baidu_verification ?? null} 
                          ELSE baidu_verification END,
      pinterest_verification = CASE WHEN ${updates.pinterest_verification ?? null} IS NOT NULL 
                              THEN ${updates.pinterest_verification ?? null} 
                              ELSE pinterest_verification END
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

// ─── POST FUNCTIONS ──────────────────────────────────────────

async function getPosts(options: {
  userId?: string;
  search?: string;
  limit?: number;
} = {}) {
  await ensureDbInitialized();
  const sql = getSql();
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

  if (options.userId) {
    return sql`
      SELECT p.*, u.username, u.display_name, u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ${options.userId}
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

async function getPostById(id: string) {
  await ensureDbInitialized();
  const sql = getSql();
  const rows = await sql`
    SELECT p.*, u.username, u.display_name, u.avatar_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ${id}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function getPostBySlugAndUser(userId: string, slug: string) {
  await ensureDbInitialized();
  const sql = getSql();
  const rows = await sql`
    SELECT p.*, u.username, u.display_name, u.avatar_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ${userId} AND p.slug = ${slug}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function createPost(post: {
  id?: string;
  user_id: string;
  title: string;
  meta_description?: string;
  image_url?: string;
  about?: string;
  rating?: number;
  review_count?: number;
  shop_url?: string;
  slug: string;
  created_at?: string;
}) {
  await ensureDbInitialized();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO posts (
      user_id, title, meta_description, image_url,
      about, rating, review_count, shop_url, slug
    )
    VALUES (
      ${post.user_id},
      ${post.title},
      ${post.meta_description || null},
      ${post.image_url || null},
      ${post.about || null},
      ${post.rating || null},
      ${post.review_count || 0},
      ${post.shop_url || null},
      ${post.slug}
    )
    RETURNING *
  `;
  return rows[0];
}

async function deletePost(id: string) {
  await ensureDbInitialized();
  const sql = getSql();
  await sql`DELETE FROM posts WHERE id = ${id}`;
}

async function incrementViewCount(postId: string) {
  await ensureDbInitialized();
  const sql = getSql();
  await sql`
    UPDATE posts SET view_count = view_count + 1 WHERE id = ${postId}
  `;
}

// ─── NAMED EXPORT (what routes import as { db }) ─────────────

export const db = {
  getUserByUsername,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  getPosts,
  getPostById,
  getPostBySlugAndUser,
  createPost,
  deletePost,
  incrementViewCount,
};

export default db;
