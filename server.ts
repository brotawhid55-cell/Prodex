import express from "express";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { db, isUsingNeon, User, Post } from "./src/lib/db.js";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "trodex-super-secret-key-123";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- SEED SAMPLE DATA ON STARTUP ---
async function seedSampleData() {
  try {
    const existingDemoUser = await db.getUserByUsername("techcurator");
    if (!existingDemoUser) {
      console.log("Seeding beautiful sample data...");
      const passwordHash = await bcrypt.hash("password123", 10);
      
      const demoUser: User = {
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
      
      await db.createUser(demoUser);

      // Seed sample posts
      const posts: Post[] = [];

      for (const p of posts) {
        await db.createPost(p);
      }
      console.log("Seeding complete!");
    }
  } catch (err) {
    console.error("Error during sample data seeding:", err);
  }
}
seedSampleData();

// --- HELPER TO GET SUBDOMAIN ---
function getSubdomain(req: express.Request) {
  // Query param is priority (for preview in iframe)
  if (req.query.subdomain && typeof req.query.subdomain === "string") {
    return req.query.subdomain.toLowerCase();
  }
  // Cookie fallback (for persistent navigation inside iframe)
  if (req.cookies && req.cookies.simulated_subdomain) {
    return req.cookies.simulated_subdomain.toLowerCase();
  }

  const host = req.headers.host || "";
  const hostname = host.split(":")[0];
  const domainParts = hostname.split(".");

  // e.g. username.localhost
  if (hostname.endsWith("localhost") && domainParts.length > 1) {
    return domainParts[0].toLowerCase();
  }

  // e.g. username.trodex.com
  if (hostname.endsWith("trodex.com") && domainParts.length > 2) {
    return domainParts[0].toLowerCase();
  }

  // General subdomain detection if not a local dev environment or standard cloud run domains
  if (domainParts.length > 2 && !hostname.endsWith("run.app") && !hostname.endsWith("web.app")) {
    return domainParts[0].toLowerCase();
  }

  return null;
}

// --- AUTHENTICATION MIDDLEWARE ---
export function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.status(401).json({ error: "Invalid token session. Please log in again." });
  }
}

// --- API ENDPOINTS ---

// Get active configuration/subdomain context
app.get("/api/context", async (req, res) => {
  const subdomain = getSubdomain(req);
  let subdomainUser: User | null = null;
  
  if (subdomain) {
    subdomainUser = await db.getUserByUsername(subdomain);
  }

  // Check auth user
  let currentUser: User | null = null;
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      currentUser = await db.getUserById(decoded.userId);
    } catch {
      // Ignore invalid cookie
    }
  }

  res.json({
    subdomain,
    subdomainUser: subdomainUser ? {
      id: subdomainUser.id,
      username: subdomainUser.username,
      display_name: subdomainUser.display_name,
      bio: subdomainUser.bio,
      avatar_url: subdomainUser.avatar_url,
      search_console_meta_tag: subdomainUser.search_console_meta_tag
    } : null,
    currentUser: currentUser ? {
      id: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      display_name: currentUser.display_name,
      bio: currentUser.bio,
      avatar_url: currentUser.avatar_url,
    } : null,
    isUsingNeon
  });
});

// Set simulated subdomain cookie for testing
app.post("/api/simulate-subdomain", (req, res) => {
  const { subdomain } = req.body;
  if (subdomain) {
    res.cookie("simulated_subdomain", subdomain.toLowerCase(), {
      httpOnly: false,
      maxAge: 30 * 24 * 3600 * 1000, // 30 days
      path: "/"
    });
  } else {
    res.clearCookie("simulated_subdomain");
  }
  res.json({ success: true, subdomain });
});

// Register
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate username
  const usernameRegex = /^[a-z0-9]+$/;
  const lowerUsername = username.toLowerCase().trim();
  if (!usernameRegex.test(lowerUsername)) {
    return res.status(400).json({ error: "Username must be lowercase and alphanumeric only (no spaces or special characters)." });
  }

  try {
    const existingEmail = await db.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const existingUsername = await db.getUserByUsername(lowerUsername);
    if (existingUsername) {
      return res.status(400).json({ error: "This username is already taken." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    const newUser: User = {
      id,
      username: lowerUsername,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      display_name: username, // default to username
      bio: "",
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${lowerUsername}`,
      search_console_meta_tag: null,
      created_at: new Date().toISOString()
    };

    await db.createUser(newUser);

    // Create session token
    const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET, {
      expiresIn: "30d"
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 3600 * 1000 // 30 days
    });

    res.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        display_name: newUser.display_name
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Internal server error registration: " + err.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { identifier, password } = req.body; // identifier can be username or email

  if (!identifier || !password) {
    return res.status(400).json({ error: "Identifier and password are required" });
  }

  try {
    let user = await db.getUserByEmail(identifier);
    if (!user) {
      user = await db.getUserByUsername(identifier);
    }

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "30d"
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 3600 * 1000
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Internal server error on login: " + err.message });
  }
});

// Get current logged-in profile
app.get("/api/auth/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await db.getUserById(decoded.userId);
    if (!user) return res.status(401).json({ error: "User not found" });

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      search_console_meta_tag: user.search_console_meta_tag
    });
  } catch {
    res.clearCookie("token");
    res.status(401).json({ error: "Session expired" });
  }
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// Get Posts (main feed or user's feed)
app.get("/api/posts", async (req, res) => {
  const search = req.query.search as string | undefined;
  const username = req.query.username as string | undefined;

  try {
    let userId: string | undefined;
    if (username) {
      const user = await db.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "User profile not found" });
      }
      userId = user.id;
    }

    const posts = await db.getPosts({ search, userId });
    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Post
app.post("/api/posts", authenticateToken, async (req, res) => {
  const { title, meta_description, image_url, about, rating, review_count, shop_url } = req.body;
  const user = (req as any).user;

  if (!title || !meta_description || !image_url || !about || rating === undefined || review_count === undefined || !shop_url) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (title.length > 100) {
    return res.status(400).json({ error: "Title must be under 100 characters." });
  }

  if (meta_description.length > 160) {
    return res.status(400).json({ error: "Meta description must be under 160 characters." });
  }

  if (about.length > 1000) {
    return res.status(400).json({ error: "About text must be under 1000 characters." });
  }

  const numRating = parseFloat(rating);
  if (isNaN(numRating) || numRating < 1.0 || numRating > 5.0) {
    return res.status(400).json({ error: "Rating must be a decimal between 1.0 and 5.0" });
  }

  const numReviewCount = parseInt(review_count);
  if (isNaN(numReviewCount) || numReviewCount < 0) {
    return res.status(400).json({ error: "Review count must be a non-negative integer" });
  }

  try {
    // Generate slug from title: lowercase, alphanumeric and hyphens
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    
    if (!slug) {
      slug = `product-${Date.now()}`;
    }

    // Verify uniqueness for user
    const existing = await db.getPostBySlugAndUser(user.userId, slug);
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const newPost: Post = {
      id: crypto.randomUUID(),
      user_id: user.userId,
      title,
      meta_description,
      image_url,
      about,
      rating: numRating,
      review_count: numReviewCount,
      shop_url,
      slug,
      created_at: new Date().toISOString()
    };

    const saved = await db.createPost(newPost);
    res.json({ success: true, post: saved });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create post: " + err.message });
  }
});

// Update settings
app.put("/api/user/settings", authenticateToken, async (req, res) => {
  const { display_name, bio, avatar_url, search_console_meta_tag } = req.body;
  const user = (req as any).user;

  try {
    const updates: Partial<User> = {};
    if (display_name !== undefined) updates.display_name = display_name;
    if (bio !== undefined) {
      if (bio.length > 160) {
        return res.status(400).json({ error: "Bio must be under 160 characters." });
      }
      updates.bio = bio;
    }
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (search_console_meta_tag !== undefined) {
      updates.search_console_meta_tag = search_console_meta_tag;
    }

    const updatedUser = await db.updateUser(user.userId, updates);
    res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update settings: " + err.message });
  }
});


// --- PER-PROFILE ROBOTS.TXT ROUTE ---
app.get("/robots.txt", async (req, res, next) => {
  const subdomain = getSubdomain(req);
  if (!subdomain) {
    return next(); // pass to static serving
  }

  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Sitemap: https://${subdomain}.trodex.com/sitemap.xml
`);
});

// --- PER-PROFILE SITEMAP.XML ROUTE ---
app.get("/sitemap.xml", async (req, res, next) => {
  const subdomain = getSubdomain(req);
  if (!subdomain) {
    return next(); // pass to static serving
  }

  try {
    const user = await db.getUserByUsername(subdomain);
    if (!user) {
      return res.status(404).send("Profile not found");
    }

    const posts = await db.getPosts({ userId: user.id });
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${subdomain}.trodex.com/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    for (const post of posts) {
      xml += `
  <url>
    <loc>https://${subdomain}.trodex.com/post/${post.slug}</loc>
    <lastmod>${new Date(post.created_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    xml += `\n</urlset>`;

    res.type("application/xml");
    res.send(xml);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});


// --- SEO AND WILD-CARD ROUTE PAGE INJECTOR ---
async function handlePageSeoAndServing(req: express.Request, res: express.Response, htmlTransformer: (html: string) => Promise<string> | string) {
  try {
    const subdomain = getSubdomain(req);
    const urlPath = req.path;
    
    let title = "Trodex | Curated Products & Reviews";
    let metaDesc = "Discover and shop highly curated, real user product recommendations, verified reviews, and top affiliate gear.";
    let imageUrl = "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800";
    let canonicalUrl = `https://trodex.com${urlPath}`;
    let jsonLd: string | undefined;
    let searchConsoleMeta = "";

    // Load initial HTML content
    let rawHtml = "";
    if (process.env.NODE_ENV !== "production") {
      rawHtml = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
    } else {
      rawHtml = fs.readFileSync(path.join(process.cwd(), "dist", "index.html"), "utf8");
    }

    let transformedHtml = await htmlTransformer(rawHtml);

    if (subdomain) {
      const user = await db.getUserByUsername(subdomain);
      if (user) {
        // Inject Search Console Tag if defined
        if (user.search_console_meta_tag) {
          searchConsoleMeta = user.search_console_meta_tag;
        }

        // Detect if this is a Single Post route: e.g. /post/slug
        const postMatch = urlPath.match(/^\/post\/([a-zA-Z0-9-]+)$/);
        
        if (postMatch) {
          const slug = postMatch[1];
          const post = await db.getPostBySlugAndUser(user.id, slug);
          if (post) {
            title = `${post.title} - ${post.rating}★ | trodex`;
            metaDesc = post.meta_description;
            imageUrl = post.image_url;
            canonicalUrl = `https://${subdomain}.trodex.com/post/${post.slug}`;
            
            // Build dynamic JSON-LD Product schema
            jsonLd = JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": post.title,
              "description": post.meta_description,
              "image": post.image_url,
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": post.rating.toString(),
                "reviewCount": post.review_count.toString()
              }
            });
          }
        } else {
          // Standard Profile page: /
          title = `${user.display_name}'s Products | trodex`;
          metaDesc = user.bio || `Explore handpicked products, custom reviews, and affiliate items curated by ${user.display_name} on Trodex.`;
          imageUrl = user.avatar_url;
          canonicalUrl = `https://${subdomain}.trodex.com/`;
        }
      }
    }

    // Build the fully decorated SEO html
    let headAdditions = "";
    transformedHtml = transformedHtml.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    
    headAdditions += `\n  <meta name="description" content="${metaDesc}" />`;
    
    if (searchConsoleMeta) {
      headAdditions += `\n  ${searchConsoleMeta}`;
    }
    
    headAdditions += `\n  <link rel="canonical" href="${canonicalUrl}" />`;
    
    // Open Graph
    headAdditions += `\n  <meta property="og:title" content="${title}" />`;
    headAdditions += `\n  <meta property="og:description" content="${metaDesc}" />`;
    headAdditions += `\n  <meta property="og:image" content="${imageUrl}" />`;
    headAdditions += `\n  <meta property="og:url" content="${canonicalUrl}" />`;
    headAdditions += `\n  <meta property="og:type" content="${jsonLd ? "product" : "website"}" />`;
    
    if (jsonLd) {
      headAdditions += `\n  <script type="application/ld+json">${jsonLd}</script>`;
    }

    const finalHtml = transformedHtml.replace("</head>", `${headAdditions}\n</head>`);
    res.setHeader("Content-Type", "text/html");
    res.send(finalHtml);

  } catch (err: any) {
    console.error("SEO Injector error:", err);
    res.status(500).send("Internal server error: " + err.message);
  }
}

// Setup Vite & Static Assets
async function startServer() {
  let vite: any;

  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the static files from /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false }));
  }

  // Handle all wildcard navigation routes with the SEO metadata server engine!
  app.get("*", async (req, res, next) => {
    // Skip api requests
    if (req.path.startsWith("/api/")) {
      return next();
    }

    if (process.env.NODE_ENV !== "production") {
      // In dev mode, let Vite transform the template index.html, then inject SEO tags
      handlePageSeoAndServing(req, res, async (html) => {
        return await vite.transformIndexHtml(req.originalUrl || req.url, html);
      });
    } else {
      // In prod mode, inject SEO tags directly to the pre-built index.html
      handlePageSeoAndServing(req, res, (html) => html);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Trodex full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
