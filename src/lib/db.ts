import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  search_console_meta_tag: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  meta_description: string;
  image_url: string;
  about: string;
  rating: number;
  review_count: number;
  shop_url: string;
  slug: string;
  created_at: string;
}

export const isUsingNeon = true;

let schemaInitialized = false;

export async function ensureDbInitialized() {
  if (schemaInitialized) return;

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL is required. \nAdd it to .env.local or Vercel Environment Variables. \nGet it from neon.tech"
    );
  }

  try {
    const sql = neon(dbUrl);

    // Bootstrap Users table
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
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Bootstrap Posts table
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        meta_description VARCHAR(160),
        image_url TEXT,
        about TEXT,
        rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),
        review_count INTEGER DEFAULT 0,
        shop_url TEXT,
        slug VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, slug)
      );
    `;

    // Check if demo user exists
    const rows = await sql`SELECT id FROM users WHERE LOWER(username) = LOWER(${"techcurator"}) LIMIT 1`;
    if (rows.length === 0) {
      console.log("Seeding beautiful sample data...");
      const passwordHash = await bcrypt.hash("password123", 10);

      const demoUser = {
        id: "d3b07384-d113-4ec4-a14f-83679c53641b",
        username: "techcurator",
        email: "tech@curator.com",
        password_hash: passwordHash,
        display_name: "Tech Curator",
        bio: "Curating high-quality tech gear & productivity tools for minimalists.",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        search_console_meta_tag: `<meta name="google-site-verification" content="trodex-sample-verification-code-12345"/>`,
        created_at: new Date().toISOString()
      };

      await sql`
        INSERT INTO users (id, username, email, password_hash, display_name, bio, avatar_url, search_console_meta_tag, created_at)
        VALUES (
          ${demoUser.id}, 
          ${demoUser.username.toLowerCase()}, 
          ${demoUser.email.toLowerCase()}, 
          ${demoUser.password_hash}, 
          ${demoUser.display_name}, 
          ${demoUser.bio}, 
          ${demoUser.avatar_url}, 
          ${demoUser.search_console_meta_tag}, 
          ${demoUser.created_at}
        )
      `;
      console.log("Seeding complete!");
    }

    schemaInitialized = true;
  } catch (err) {
    console.error("Error bootstrapping Neon schema during runtime:", err);
  }
}

function getSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL is required. \nAdd it to .env.local or Vercel Environment Variables. \nGet it from neon.tech"
    );
  }
  return neon(dbUrl);
}

export const db = {
  // --- USERS ---
  async getUserByEmail(email: string): Promise<User | null> {
    await ensureDbInitialized();
    const sql = getSql();
    const rows = await sql`SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
    return rows[0] ? (rows[0] as User) : null;
  },

  async getUserByUsername(username: string): Promise<User | null> {
    await ensureDbInitialized();
    const sql = getSql();
    const rows = await sql`SELECT * FROM users WHERE LOWER(username) = LOWER(${username}) LIMIT 1`;
    return rows[0] ? (rows[0] as User) : null;
  },

  async getUserById(id: string): Promise<User | null> {
    await ensureDbInitialized();
    const sql = getSql();
    const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
    return rows[0] ? (rows[0] as User) : null;
  },

  async createUser(user: User): Promise<User> {
    await ensureDbInitialized();
    const sql = getSql();
    await sql`
      INSERT INTO users (id, username, email, password_hash, display_name, bio, avatar_url, search_console_meta_tag, created_at)
      VALUES (
        ${user.id}, 
        ${user.username.toLowerCase()}, 
        ${user.email.toLowerCase()}, 
        ${user.password_hash}, 
        ${user.display_name}, 
        ${user.bio}, 
        ${user.avatar_url}, 
        ${user.search_console_meta_tag}, 
        ${user.created_at}
      )
    `;
    return user;
  },

  async updateUser(
    id: string,
    updates: Partial<Omit<User, "id" | "created_at">>
  ): Promise<User> {
    await ensureDbInitialized();
    const sql = getSql();
    
    const currentUser = await this.getUserById(id);
    if (!currentUser) throw new Error("User not found");

    const merged = {
      username: updates.username !== undefined ? updates.username : currentUser.username,
      email: updates.email !== undefined ? updates.email : currentUser.email,
      password_hash: updates.password_hash !== undefined ? updates.password_hash : currentUser.password_hash,
      display_name: updates.display_name !== undefined ? updates.display_name : currentUser.display_name,
      bio: updates.bio !== undefined ? updates.bio : currentUser.bio,
      avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : currentUser.avatar_url,
      search_console_meta_tag: updates.search_console_meta_tag !== undefined ? updates.search_console_meta_tag : currentUser.search_console_meta_tag,
    };

    const rows = await sql`
      UPDATE users 
      SET 
        username = ${merged.username.toLowerCase()}, 
        email = ${merged.email.toLowerCase()}, 
        password_hash = ${merged.password_hash}, 
        display_name = ${merged.display_name}, 
        bio = ${merged.bio}, 
        avatar_url = ${merged.avatar_url}, 
        search_console_meta_tag = ${merged.search_console_meta_tag}
      WHERE id = ${id} 
      RETURNING *
    `;
    return rows[0] as User;
  },

  // --- POSTS ---
  async getPosts(options?: { search?: string; userId?: string }): Promise<Post[]> {
    await ensureDbInitialized();
    const sql = getSql();
    
    const userId = options?.userId;
    const search = options?.search ? `%${options.search.toLowerCase()}%` : null;

    let rows;
    if (userId && search) {
      rows = await sql`SELECT * FROM posts WHERE user_id = ${userId} AND LOWER(title) LIKE ${search} ORDER BY created_at DESC`;
    } else if (userId) {
      rows = await sql`SELECT * FROM posts WHERE user_id = ${userId} ORDER BY created_at DESC`;
    } else if (search) {
      rows = await sql`SELECT * FROM posts WHERE LOWER(title) LIKE ${search} ORDER BY created_at DESC`;
    } else {
      rows = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
    }
    return rows as Post[];
  },

  async getPostBySlugAndUser(userId: string, slug: string): Promise<Post | null> {
    await ensureDbInitialized();
    const sql = getSql();
    const rows = await sql`SELECT * FROM posts WHERE user_id = ${userId} AND slug = ${slug} LIMIT 1`;
    return rows[0] ? (rows[0] as Post) : null;
  },

  async createPost(post: Post): Promise<Post> {
    await ensureDbInitialized();
    const sql = getSql();
    await sql`
      INSERT INTO posts (id, user_id, title, meta_description, image_url, about, rating, review_count, shop_url, slug, created_at)
      VALUES (
        ${post.id}, 
        ${post.user_id}, 
        ${post.title}, 
        ${post.meta_description}, 
        ${post.image_url}, 
        ${post.about}, 
        ${post.rating}, 
        ${post.review_count}, 
        ${post.shop_url}, 
        ${post.slug}, 
        ${post.created_at}
      )
    `;
    return post;
  }
};
