import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Product } from './src/types/product.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limit to support image & short video uploads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

// Persistent Storage Directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded media statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Database Interface
interface DatabaseSchema {
  products: Product[];
  categories: string[];
  admin: {
    email: string;
    passwordHash: string;
    salt: string;
  };
}

// Password hashing helper
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Initialize Database if missing
function initDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      return data;
    } catch (e) {
      console.error('Error reading database, creating new one', e);
    }
  }

  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'EliteAdmin2026!';
  const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@elitefabrics.online').toLowerCase();

  const newDb: DatabaseSchema = {
    products: [],
    categories: ['Summer', 'Winter'],
    admin: {
      email: defaultAdminEmail,
      passwordHash: hashPassword(defaultAdminPassword, defaultSalt),
      salt: defaultSalt,
    },
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(newDb, null, 2), 'utf-8');
  return newDb;
}

let db = initDatabase();

function saveDatabase() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Active session tokens
const activeSessions = new Set<string>();

// Admin Auth Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!activeSessions.has(token)) {
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired session' });
    return;
  }

  next();
}

// ========================
// 1. ADMIN AUTHENTICATION
// ========================

// POST /api/admin/login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== db.admin.email) {
    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    return;
  }

  const computedHash = hashPassword(password, db.admin.salt);
  if (computedHash !== db.admin.passwordHash) {
    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    return;
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.add(token);

  res.json({
    success: true,
    message: 'Authentication successful',
    token,
    user: { email: db.admin.email },
  });
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/admin/me
app.get('/api/admin/me', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, user: { email: db.admin.email } });
});

// ========================
// 2. ADMIN MEDIA UPLOAD
// ========================

// POST /api/admin/upload-media
// Receives data URL / base64 string and file name, stores permanently to disk
app.post('/api/admin/upload-media', requireAdmin, (req: Request, res: Response) => {
  try {
    const { dataUrl, filename, mediaType } = req.body;
    if (!dataUrl) {
      res.status(400).json({ success: false, message: 'No media data provided' });
      return;
    }

    // Format: "data:image/jpeg;base64,/9j/4AAQSk..."
    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ success: false, message: 'Invalid data URL format' });
      return;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Extension from mimeType or filename
    let ext = mimeType.split('/')[1] || 'bin';
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'quicktime') ext = 'mov';

    const safeName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    res.json({
      success: true,
      url: publicUrl,
      filename: safeName,
      sizeBytes: buffer.length,
      mimeType,
    });
  } catch (err: any) {
    console.error('Media upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Media upload failed' });
  }
});

// ========================
// 3. ADMIN PRODUCT MANAGEMENT
// ========================

// GET /api/admin/products (Returns all products: Published + Drafts)
app.get('/api/admin/products', requireAdmin, (_req: Request, res: Response) => {
  const sorted = [...db.products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const stats = {
    total: db.products.length,
    published: db.products.filter((p) => p.status === 'published').length,
    drafts: db.products.filter((p) => p.status === 'draft').length,
  };

  res.json({
    success: true,
    stats,
    products: sorted,
    categories: db.categories,
  });
});

// POST /api/admin/products (Create Product)
app.post('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      title,
      category,
      image,
      images,
      video,
      description,
      regularPrice,
      salePrice,
      brand,
      sizes,
      colours,
      amazonAffiliateLink,
      status,
      seoTitle,
      metaDescription,
      slug: customSlug,
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Product title is required' });
      return;
    }
    if (!image || !image.trim()) {
      res.status(400).json({ success: false, message: 'Product image is required' });
      return;
    }
    if (!amazonAffiliateLink || !amazonAffiliateLink.trim()) {
      res.status(400).json({ success: false, message: 'Amazon affiliate link is required' });
      return;
    }

    // Generate unique slug
    let baseSlug = (customSlug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!baseSlug) baseSlug = `item-${Date.now()}`;

    let slug = baseSlug;
    let counter = 1;
    while (db.products.some((p) => p.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Calculate discount
    const reg = parseFloat(regularPrice) || 0;
    const sale = salePrice ? parseFloat(salePrice) : undefined;
    let discount = 0;
    if (reg > 0 && sale && sale < reg) {
      discount = Math.round(((reg - sale) / reg) * 100);
    }

    // Generate unique Product ID
    const count = db.products.length + 1;
    const pad = count < 100 ? (count < 10 ? `00${count}` : `0${count}`) : `${count}`;
    const productId = `EF-${new Date().getFullYear()}-${pad}`;

    const galleryImages: string[] = Array.isArray(images) && images.length > 0
      ? images
      : [image.trim()];

    const newProduct: Product = {
      id: productId,
      title: title.trim(),
      slug,
      category: category ? category.trim() : 'Summer',
      image: image.trim(),
      images: galleryImages,
      video: video && video.trim() ? video.trim() : undefined,
      description: description ? description.trim() : '',
      regularPrice: reg,
      salePrice: sale,
      discount: discount > 0 ? discount : undefined,
      brand: brand && brand.trim() ? brand.trim() : undefined,
      sizes: Array.isArray(sizes) ? sizes : [],
      colours: Array.isArray(colours) ? colours : [],
      amazonAffiliateLink: amazonAffiliateLink.trim(),
      status: status === 'draft' ? 'draft' : 'published',
      seoTitle: seoTitle && seoTitle.trim() ? seoTitle.trim() : `${title} | Elite Fabrics`,
      metaDescription: metaDescription && metaDescription.trim() ? metaDescription.trim() : description.slice(0, 155),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Auto-add category if new
    if (newProduct.category && !db.categories.includes(newProduct.category)) {
      db.categories.push(newProduct.category);
    }

    db.products.push(newProduct);
    saveDatabase();

    res.json({
      success: true,
      message: newProduct.status === 'published' ? 'Product published successfully!' : 'Product saved as draft!',
      product: newProduct,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create product' });
  }
});

// PUT /api/admin/products/:id (Update Product)
app.put('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  const existing = db.products[index];
  const body = req.body;

  // Calculate discount if prices updated
  const reg = body.regularPrice !== undefined ? parseFloat(body.regularPrice) : existing.regularPrice;
  const sale = body.salePrice !== undefined ? (body.salePrice ? parseFloat(body.salePrice) : undefined) : existing.salePrice;
  let discount: number | undefined = undefined;
  if (reg > 0 && sale && sale < reg) {
    discount = Math.round(((reg - sale) / reg) * 100);
  }

  const updated: Product = {
    ...existing,
    ...body,
    id: existing.id, // ID remains permanent
    regularPrice: reg,
    salePrice: sale,
    discount,
    updatedAt: new Date().toISOString(),
  };

  if (updated.category && !db.categories.includes(updated.category)) {
    db.categories.push(updated.category);
  }

  db.products[index] = updated;
  saveDatabase();

  res.json({ success: true, message: 'Product updated successfully', product: updated });
});

// DELETE /api/admin/products/:id (Delete Product)
app.delete('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);

  if (db.products.length === initialLength) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  saveDatabase();
  res.json({ success: true, message: 'Product deleted permanently' });
});

// GET /api/admin/categories & POST /api/admin/categories
app.get('/api/admin/categories', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, categories: db.categories });
});

app.post('/api/admin/categories', requireAdmin, (req: Request, res: Response) => {
  const { category } = req.body;
  if (!category || !category.trim()) {
    res.status(400).json({ success: false, message: 'Category name is required' });
    return;
  }
  const clean = category.trim();
  if (!db.categories.includes(clean)) {
    db.categories.push(clean);
    saveDatabase();
  }
  res.json({ success: true, categories: db.categories });
});

// ========================
// 4. PUBLIC STORE APIS (NO CUSTOMER AUTH)
// ========================

// GET /api/products (Only published products)
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, sort } = req.query;

  let results = db.products.filter((p) => p.status === 'published');

  if (category && category !== 'All') {
    results = results.filter((p) => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        (p.colours && p.colours.some((c) => c.toLowerCase().includes(q)))
    );
  }

  if (sort === 'price-asc') {
    results.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
  } else if (sort === 'price-desc') {
    results.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
  } else {
    // newest first
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({
    success: true,
    count: results.length,
    products: results,
  });
});

// GET /api/products/:identifier (slug or ID)
app.get('/api/products/:identifier', (req: Request, res: Response) => {
  const key = req.params.identifier.toLowerCase();
  const product = db.products.find(
    (p) => (p.slug.toLowerCase() === key || p.id.toLowerCase() === key) && p.status === 'published'
  );

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found or currently unavailable' });
    return;
  }

  // Related products from same category (excluding current product, published only)
  const related = db.products
    .filter(
      (p) =>
        p.category &&
        p.category.trim().toLowerCase() === product.category.trim().toLowerCase() &&
        p.id !== product.id &&
        p.status === 'published'
    )
    .slice(0, 8);

  res.json({ success: true, product, related });
});

// GET /api/categories (Public categories)
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json({ success: true, categories: db.categories });
});

// ========================
// 5. TECHNICAL SEO: SITEMAP & ROBOTS
// ========================

// GET /sitemap.xml
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://elitefabrics.online';
  const currentDate = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/shop`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/about`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/affiliate-disclosure`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/privacy-policy`, priority: '0.4', changefreq: 'yearly' },
    { loc: `${baseUrl}/terms`, priority: '0.4', changefreq: 'yearly' },
  ];

  const productUrls = db.products
    .filter((p) => p.status === 'published')
    .map((p) => ({
      loc: `${baseUrl}/product/${p.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: p.updatedAt ? p.updatedAt.split('T')[0] : currentDate,
    }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
${productUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// GET /robots.txt
app.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://elitefabrics.online';
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// Mount Vite or serve static dist
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Elite Fabrics Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
