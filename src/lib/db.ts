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
    const sql = neon(dbUrl) as any;

    await sql(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        bio VARCHAR(160),
        avatar_url TEXT,
        search_console_meta_tag TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        meta_description VARCHAR(160) NOT NULL,
        image_url TEXT NOT NULL,
        about VARCHAR(1000) NOT NULL,
        rating DECIMAL(3, 2) NOT NULL,
        review_count INTEGER NOT NULL,
        shop_url TEXT NOT NULL,
        slug VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_post_slug UNIQUE (user_id, slug)
      );
    `);

    // Check if demo user exists
    const rows = await sql("SELECT id FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1", ["techcurator"]);
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

      await sql(
        `INSERT INTO users (id, username, email, password_hash, display_name, bio, avatar_url, search_console_meta_tag, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          demoUser.id,
          demoUser.username.toLowerCase(),
          demoUser.email.toLowerCase(),
          demoUser.password_hash,
          demoUser.display_name,
          demoUser.bio,
          demoUser.avatar_url,
          demoUser.search_console_meta_tag,
          demoUser.created_at
        ]
      );
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
  return neon(dbUrl) as any;
}

export const db = {
  // --- USERS ---
  async getUserByEmail(email: string): Promise<User | null> {
    await ensureDbInitialized();
    const sql = getSql();
    const rows = await sql("SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1", [email]);
    return rows[0] ? (rows[0] as User) : null;
  },

  async getUserByUsername(username: string): Promise<User | null> {
    await ensureDbInitialized();
    const sql = getSql();
    const rows = await sql("SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1", [username]);
    return rows[0] ? (rows[0] as User) : null;
  },

  async getUserById(id: string): Promise<User | null> {
    await ensureDbInitialized();
    const sql = getSql();
    const rows = await sql("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
    return rows[0] ? (rows[0] as User) : null;
  },

  async createUser(user: User): Promise<User> {
    await ensureDbInitialized();
    const sql = getSql();
    await sql(
      `INSERT INTO users (id, username, email, password_hash, display_name, bio, avatar_url, search_console_meta_tag, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        user.id,
        user.username.toLowerCase(),
        user.email.toLowerCase(),
        user.password_hash,
        user.display_name,
        user.bio,
        user.avatar_url,
        user.search_console_meta_tag,
        user.created_at
      ]
    );
    return user;
  },

  async updateUser(
    id: string,
    updates: Partial<Omit<User, "id" | "created_at">>
  ): Promise<User> {
    await ensureDbInitialized();
    const sql = getSql();
    const setStatements: string[] = [];
    const values: any[] = [id];
    let valIndex = 2;

    for (const [key, value] of Object.entries(updates)) {
      setStatements.push(`${key} = $${valIndex}`);
      values.push(value);
      valIndex++;
    }

    if (setStatements.length === 0) {
      const user = await this.getUserById(id);
      if (!user) throw new Error("User not found");
      return user;
    }

    const query = `UPDATE users SET ${setStatements.join(", ")} WHERE id = $1 RETURNING *`;
    const rows = await sql(query, values);
    return rows[0] as User;
  },

  // --- POSTS ---
  async getPosts(options?: { search?: string; userId?: string }): Promise<Post[]> {
    await ensureDbInitialized();
    const sql = getSql();
    let query = "SELECT * FROM posts";
    const conditions: string[] = [];
    const values: any[] = [];
    let valIndex = 1;

    if (options?.userId) {
      conditions.push(`user_id = $${valIndex}`);
      values.push(options.userId);
      valIndex++;
    }

    if (options?.search) {
      conditions.push(`LOWER(title) LIKE $${valIndex}`);
      values.push(`%${options.search.toLowerCase()}%`);
      valIndex++;
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC";
    const rows = await sql(query, values);
    return rows as Post[];
  },

  async getPostBySlugAndUser(userId: string, slug: string): Promise<Post | null> {
    await ensureDbInitialized();
    const sql = getSql();
    const rows = await sql("SELECT * FROM posts WHERE user_id = $1 AND slug = $2 LIMIT 1", [userId, slug]);
    return rows[0] ? (rows[0] as Post) : null;
  },

  async createPost(post: Post): Promise<Post> {
    await ensureDbInitialized();
    const sql = getSql();
    await sql(
      `INSERT INTO posts (id, user_id, title, meta_description, image_url, about, rating, review_count, shop_url, slug, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        post.id,
        post.user_id,
        post.title,
        post.meta_description,
        post.image_url,
        post.about,
        post.rating,
        post.review_count,
        post.shop_url,
        post.slug,
        post.created_at
      ]
    );
    return post;
  }
};
