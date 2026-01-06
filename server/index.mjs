import express from 'express';
import cors from 'cors';
import { ping, pool } from './db.mjs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { buildCreatePaymentPayload, verifyMomoIpnSignature } from './momo.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Cấu hình CORS: hỗ trợ cả local và production
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://web-banhang-online.vercel.app',
  FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({ 
  origin: function (origin, callback) {
    // Cho phép requests không có origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Cho phép nếu origin trong danh sách allowed hoặc match với FRONTEND_ORIGIN
    if (allowedOrigins.includes(origin) || origin === FRONTEND_ORIGIN) {
      callback(null, true);
    } else {
      // Trong production, chỉ cho phép origins đã được cấu hình
      if (process.env.NODE_ENV === 'production') {
        callback(new Error('Not allowed by CORS'));
      } else {
        // Trong development, cho phép tất cả
        callback(null, true);
      }
    }
  },
  credentials: true 
}));
app.use(express.json());

// Helper: fetch JSON với timeout (Node 18+)
async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} ${res.statusText}`);
      err.detail = data;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(t);
  }
}

// Helper: build absolute URL cho các đường dẫn ảnh (tránh hard-code localhost)
function buildFullUrl(req, url) {
  if (!url) return null;
  const str = String(url);
  if (str.startsWith('http')) return str;

  // Ưu tiên PUBLIC_BASE_URL nếu có (dùng cho deploy)
  const origin =
    process.env.PUBLIC_BASE_URL ||
    `${req.protocol}://${req.get('host')}`;

  return origin + (str.startsWith('/') ? str : `/${str}`);
}

// method override via _method in body
app.use((req, res, next) => {
  console.log('Method override middleware:', {
    method: req.method,
    hasBody: !!req.body,
    bodyType: typeof req.body,
    _method: req.body?._method
  });
  
  if (req.method === 'POST' && req.body && typeof req.body === 'object' && req.body._method) {
    const oldMethod = req.method;
    req.method = String(req.body._method).toUpperCase();
    console.log(`Method override: ${oldMethod} -> ${req.method}`);
    delete req.body._method;
  }
  next();
});

// Middleware logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình multer để upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
  },
  fileFilter: function (req, file, cb) {
    // Chỉ cho phép file ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
  }
});

// Serve static files từ thư mục uploads
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', async (req, res) => {
  try {
    await ping();
    res.json({ ok: true });
  } catch (e) {
    console.error('Health check error:', e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, slug, parent_id, sort_order, created_at FROM categories ORDER BY sort_order ASC, name ASC`
    );
    res.json({ data: rows });
  } catch (e) {
    console.error('Categories list error:', e);
    res.status(500).json({ error: 'Failed to fetch categories', detail: String(e) });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const { name, slug, parent_id, sort_order } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Thiếu name hoặc slug' });

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, parent_id, sort_order) VALUES (?, ?, ?, ?)',
      [name, slug, parent_id ?? null, Number.isFinite(sort_order) ? sort_order : 0]
    );
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    console.error('Create category error:', e);
    res.status(500).json({ error: 'Tạo danh mục thất bại', detail: String(e) });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });
    const id = Number(req.params.id);
    const { name, slug, parent_id, sort_order } = req.body;
    await pool.query(
      'UPDATE categories SET name = COALESCE(?, name), slug = COALESCE(?, slug), parent_id = ?, sort_order = COALESCE(?, sort_order) WHERE id = ?',
      [name ?? null, slug ?? null, parent_id ?? null, Number.isFinite(sort_order) ? sort_order : null, id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error('Update category error:', e);
    res.status(500).json({ error: 'Cập nhật danh mục thất bại', detail: String(e) });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });
    const id = Number(req.params.id);
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    console.error('Delete category error:', e);
    res.status(500).json({ error: 'Xóa danh mục thất bại', detail: String(e) });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    }

    console.log('Attempting login for email:', email);
    
    // Test database connection first
    try {
      await ping();
      console.log('Database connection OK');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(500).json({ error: 'Không thể kết nối database', detail: String(dbError) });
    }

    // Kiểm tra và thêm cột avatar nếu chưa có
    try {
      await pool.query('SELECT avatar FROM users LIMIT 1');
    } catch (e) {
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        console.log('Adding avatar column to users table...');
        await pool.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL');
        console.log('Avatar column added successfully');
      }
    }

    // Build SELECT query động dựa trên các cột có sẵn
    let selectColumns = ['id', 'email', 'full_name', 'phone', 'role', 'status'];
    try {
      const [cols] = await pool.query('DESCRIBE users');
      const existingColumns = cols.map((c) => c.Field);
      if (existingColumns.includes('avatar')) {
        selectColumns.push('COALESCE(avatar, NULL) as avatar');
      }
    } catch {}

    const [users] = await pool.query(
      `SELECT ${selectColumns.join(', ')} FROM users WHERE email = ? AND password_hash = ? LIMIT 1`,
      [email, password]
    );

    console.log('Query result:', users);

    if (users.length === 0) {
      console.log('No user found with email:', email);
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const user = users[0];
    if (user.status !== 'active') {
      console.log('User account not active:', user.status);
      return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
    }

    console.log('Login successful for user:', user.email);
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        full_name: user.full_name, 
        phone: user.phone || null, 
        avatar: user.avatar || null,
        role: user.role 
      },
      message: 'Đăng nhập thành công'
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Lỗi server', detail: String(e) });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, mật khẩu và họ tên là bắt buộc' });
    }

    // Kiểm tra email đã tồn tại
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email đã được sử dụng' });
    }

    // Tạo user mới
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password, full_name, phone || null, 'user', 'active']
    );

    res.json({ 
      success: true, 
      user: { id: result.insertId, email, full_name, phone: phone || null, avatar: null, role: 'user' },
      message: 'Đăng ký thành công'
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Lỗi server', detail: String(e) });
  }
});

// Users (admin)
app.post('/api/users', async (req, res) => {
  try {
    // Tạm thời bỏ qua kiểm tra admin để test
    // if (req.query.admin !== '1') return res.status(403).json({ error: 'Yêu cầu quyền admin' });
    const { email, password, full_name, phone, role = 'user', status = 'active' } = req.body;
    if (!email || !full_name) return res.status(400).json({ error: 'Thiếu email hoặc họ tên' });
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password || null, full_name, phone || null, role, status]
    );
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    console.error('Create user error:', e);
    res.status(500).json({ error: 'Tạo user thất bại', detail: String(e) });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    // Tạm thời bỏ qua kiểm tra admin để test
    // if (req.query.admin !== '1') return res.status(403).json({ error: 'Yêu cầu quyền admin' });
    const id = Number(req.params.id);
    const { password, full_name, phone, role, status, avatar } = req.body;
    
    console.log('Update user request:', { id, body: req.body, avatar });
    
    // Kiểm tra xem có cột avatar không và tự động tạo nếu cần
    let hasAvatarColumn = false;
    try {
      const [columns] = await pool.query('DESCRIBE users');
      hasAvatarColumn = columns.some(col => col.Field === 'avatar');
      
      // Nếu cần update avatar nhưng cột chưa có, tự động tạo
      if (avatar !== undefined && !hasAvatarColumn) {
        console.log('Adding missing column: avatar');
        await pool.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(512) DEFAULT NULL');
        hasAvatarColumn = true;
      }
    } catch (e) {
      console.error('Error checking/creating avatar column:', e);
    }
    
    // Xây dựng query động
    const updates = [];
    const values = [];
    
    if (password !== undefined) {
      updates.push('password_hash = COALESCE(?, password_hash)');
      values.push(password || null);
    }
    if (full_name !== undefined) {
      updates.push('full_name = COALESCE(?, full_name)');
      values.push(full_name || null);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone || null);
    }
    if (role !== undefined) {
      updates.push('role = COALESCE(?, role)');
      values.push(role || null);
    }
    if (status !== undefined) {
      updates.push('status = COALESCE(?, status)');
      values.push(status || null);
    }
    if (avatar !== undefined && hasAvatarColumn) {
      updates.push('avatar = ?');
      values.push(avatar || null);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
    }
    
    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    await pool.query(query, values);
    res.json({ success: true });
  } catch (e) {
    console.error('Update user error:', e);
    res.status(500).json({ error: 'Cập nhật user thất bại', detail: String(e) });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    // Tạm thời bỏ qua kiểm tra admin để test
    // if (req.query.admin !== '1') return res.status(403).json({ error: 'Yêu cầu quyền admin' });
    const id = Number(req.params.id);
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    console.error('Delete user error:', e);
    res.status(500).json({ error: 'Xóa user thất bại', detail: String(e) });
  }
});



app.put('/api/vouchers/:id', async (req, res) => {
  try {
    // Tạm thời bỏ qua kiểm tra admin để test
    // if (req.query.admin !== '1') return res.status(403).json({ error: 'Yêu cầu quyền admin' });
    const id = Number(req.params.id);
            const { name, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, valid_from, valid_until, is_active } = req.body;
    await pool.query(
      `UPDATE vouchers SET
         name = COALESCE(?, name),
         description = ?,
         discount_type = COALESCE(?, discount_type),
         discount_value = COALESCE(?, discount_value),
         min_order_amount = COALESCE(?, min_order_amount),
         max_discount = ?,
         usage_limit = COALESCE(?, usage_limit),
         valid_from = COALESCE(?, valid_from),
         valid_until = COALESCE(?, valid_until),
         is_active = COALESCE(?, is_active)
       WHERE id = ?`,
              [name ?? null, description ?? null, discount_type ?? null, discount_value ?? null, min_order_amount ?? null, max_discount ?? null, usage_limit ?? null, valid_from ?? null, valid_until ?? null, typeof is_active === 'boolean' ? (is_active ? 1 : 0) : null, id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error('Update voucher error:', e);
    res.status(500).json({ error: 'Cập nhật voucher thất bại', detail: String(e) });
  }
});

app.delete('/api/vouchers/:id', async (req, res) => {
  try {
    // Tạm thời bỏ qua kiểm tra admin để test
    // if (req.query.admin !== '1') return res.status(403).json({ error: 'Yêu cầu quyền admin' });
    
    const { id } = req.params;
    
    // Kiểm tra voucher có đang được sử dụng không
    const [usage] = await pool.query('SELECT COUNT(*) as count FROM user_vouchers WHERE voucher_id = ?', [id]);
    if (usage[0].count > 0) {
      return res.status(400).json({ error: 'Không thể xóa voucher đang được sử dụng' });
    }
    
    await pool.query('DELETE FROM vouchers WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Xóa voucher thành công' });
  } catch (e) {
    console.error('Delete voucher error:', e);
    res.status(500).json({ error: 'Xóa voucher thất bại', detail: String(e) });
  }
});

// User Vouchers APIs
app.post('/api/user-vouchers', async (req, res) => {
  try {
    // Tạm thời bỏ qua kiểm tra admin để test
    // if (req.query.admin !== '1') return res.status(403).json({ error: 'Yêu cầu quyền admin' });
    
    const { user_id, voucher_id, assign_to_all } = req.body;
    
    // Validation
    if (!voucher_id) {
      return res.status(400).json({ error: 'Thiếu voucher_id' });
    }
    
    if (!assign_to_all && !user_id) {
      return res.status(400).json({ error: 'Thiếu user_id hoặc assign_to_all phải là true' });
    }
    
    // Kiểm tra và tạo bảng user_vouchers nếu chưa có
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_vouchers (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          voucher_id INT NOT NULL,
          assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_used BOOLEAN NOT NULL DEFAULT FALSE,
          used_at TIMESTAMP NULL,
          UNIQUE KEY unique_user_voucher (user_id, voucher_id)
        )
      `);
    } catch (createError) {
      console.error('Error creating user_vouchers table:', createError);
      return res.status(500).json({ error: 'Không thể tạo bảng user_vouchers', detail: String(createError) });
    }
    
    // Kiểm tra voucher có tồn tại và hoạt động không
    const [vouchers] = await pool.query('SELECT * FROM vouchers WHERE id = ? AND is_active = 1', [voucher_id]);
    if (vouchers.length === 0) {
      return res.status(400).json({ error: 'Voucher không tồn tại hoặc không hoạt động' });
    }
    
    const voucher = vouchers[0];
    
    // Kiểm tra voucher còn hạn sử dụng không
    const now = new Date();
    if (new Date(voucher.valid_from) > now || new Date(voucher.valid_until) < now) {
      return res.status(400).json({ error: 'Voucher đã hết hạn hoặc chưa có hiệu lực' });
    }
    
    // Kiểm tra voucher còn lượt sử dụng không
    if (voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ error: 'Voucher đã hết lượt sử dụng' });
    }
    
    if (assign_to_all) {
      // Gán voucher cho tất cả users
      const [users] = await pool.query('SELECT id FROM users WHERE status = "active"');
      
      let assignedCount = 0;
      for (const user of users) {
        try {
          // Kiểm tra user đã có voucher này chưa
          const [existing] = await pool.query('SELECT id FROM user_vouchers WHERE user_id = ? AND voucher_id = ?', [user.id, voucher_id]);
          if (existing.length === 0) {
            await pool.query(`
              INSERT INTO user_vouchers (user_id, voucher_id, assigned_at, is_used, used_at)
              VALUES (?, ?, NOW(), 0, NULL)
            `, [user.id, voucher_id]);
            assignedCount++;
          }
        } catch (error) {
          console.error(`Error assigning voucher to user ${user.id}:`, error);
        }
      }
      
      res.json({ 
        success: true, 
        message: `Gán voucher thành công cho ${assignedCount} người dùng`,
        assigned_count: assignedCount
      });
    } else {
      // Gán voucher cho user cụ thể
      if (!user_id) {
        return res.status(400).json({ error: 'Thiếu user_id' });
      }
      
      // Kiểm tra user đã có voucher này chưa
      const [existing] = await pool.query('SELECT id FROM user_vouchers WHERE user_id = ? AND voucher_id = ?', [user_id, voucher_id]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Người dùng đã có voucher này' });
      }
      
      // Gán voucher cho user
      await pool.query(`
        INSERT INTO user_vouchers (user_id, voucher_id, assigned_at, is_used, used_at)
        VALUES (?, ?, NOW(), 0, NULL)
      `, [user_id, voucher_id]);
      
      res.json({ success: true, message: 'Gán voucher thành công' });
    }
  } catch (e) {
    console.error('Assign voucher error:', e);
    res.status(500).json({ error: 'Gán voucher thất bại', detail: String(e) });
  }
});

app.get('/api/user-vouchers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [rows] = await pool.query(`
      SELECT 
        uv.id, uv.assigned_at, uv.is_used, uv.used_at,
        v.code, v.name, v.description, v.discount_type, v.discount_value,
        v.min_order_amount, v.max_discount, v.valid_from, v.valid_until
      FROM user_vouchers uv
      JOIN vouchers v ON uv.voucher_id = v.id
      WHERE uv.user_id = ? AND v.is_active = 1
      ORDER BY uv.assigned_at DESC
    `, [userId]);
    
    res.json({ data: rows });
  } catch (e) {
    console.error('User vouchers error:', e);
    res.status(500).json({ error: 'Tải voucher của user thất bại', detail: String(e) });
  }
});

// Cart APIs - GET /api/cart
app.get('/api/cart', async (req, res) => {
  try {
    // TODO: Implement proper cart logic with user/session
    // For now, use a fixed session ID for demo
    const sessionId = 'demo-session';
    
    // Lấy giỏ hàng
    const [carts] = await pool.query(
      'SELECT * FROM carts WHERE session_id = ? LIMIT 1',
      [sessionId]
    );
    
    if (carts.length === 0) {
      // Trả về giỏ hàng rỗng nếu chưa có
      res.json({
        id: 0,
        user_id: null,
        session_id: sessionId,
        expires_at: null,
        items: [],
        total_amount: 0,
        created_at: new Date().toISOString()
      });
      return;
    }
    
    const cart = carts[0];
    
    // Lấy items trong giỏ hàng với thông tin variant và product
    const [items] = await pool.query(`
      SELECT 
        ci.id,
        ci.cart_id,
        ci.variant_id,
        ci.quantity,
        ci.unit_price,
        ci.created_at,
        pv.variant_sku,
        pv.color,
        pv.size,
        pv.price as variant_price,
        p.name as product_name,
        p.product_img,
        p.product_img_alt,
        p.product_img_title
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at DESC
    `, [cart.id]);
    
    // Tính tổng tiền
    const totalAmount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    
    res.json({
      ...cart,
      items,
      total_amount: totalAmount
    });
  } catch (e) {
    console.error('Get cart error:', e);
    res.status(500).json({ error: 'Tải giỏ hàng thất bại', detail: String(e) });
  }
});

// POST /api/cart - tạo giỏ hàng mới
app.post('/api/cart', async (req, res) => {
  try {
    const sessionId = 'demo-session';
    
    // Kiểm tra xem đã có giỏ hàng chưa
    const [existingCarts] = await pool.query(
      'SELECT id FROM carts WHERE session_id = ? LIMIT 1',
      [sessionId]
    );
    
    if (existingCarts.length > 0) {
      // Nếu đã có giỏ hàng, trả về thông tin giỏ hàng hiện tại
      const cartId = existingCarts[0].id;
      const [cart] = await pool.query(
        'SELECT * FROM carts WHERE id = ?',
        [cartId]
      );
      res.json(cart[0]);
    } else {
      // Tạo giỏ hàng mới
      const [result] = await pool.query(
        'INSERT INTO carts (session_id, expires_at) VALUES (?, DATE_ADD(NOW(), INTERVAL 30 DAY))',
        [sessionId]
      );
      
      const [newCart] = await pool.query(
        'SELECT * FROM carts WHERE id = ?',
        [result.insertId]
      );
      
      res.json(newCart[0]);
    }
  } catch (e) {
    console.error('Create cart error:', e);
    res.status(500).json({ error: 'Tạo giỏ hàng thất bại', detail: String(e) });
  }
});

app.post('/api/cart/items', async (req, res) => {
  try {
    const { variant_id, quantity, unit_price } = req.body;
    if (!variant_id || !quantity || !unit_price) {
      return res.status(400).json({ error: 'Thiếu thông tin variant_id, quantity hoặc unit_price' });
    }

    // Tạo hoặc lấy giỏ hàng hiện tại (sử dụng session_id cố định cho demo)
    const sessionId = 'demo-session';
    
    let [carts] = await pool.query(
      'SELECT id FROM carts WHERE session_id = ? LIMIT 1',
      [sessionId]
    );
    
    let cartId;
    if (carts.length === 0) {
      // Tạo giỏ hàng mới
      const [result] = await pool.query(
        'INSERT INTO carts (session_id, expires_at) VALUES (?, DATE_ADD(NOW(), INTERVAL 30 DAY))',
        [sessionId]
      );
      cartId = result.insertId;
    } else {
      cartId = carts[0].id;
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const [existingItems] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ? LIMIT 1',
      [cartId, variant_id]
    );

    if (existingItems.length > 0) {
      // Cập nhật số lượng nếu đã có
      const newQuantity = existingItems[0].quantity + quantity;
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
      
      // Lấy item đã cập nhật
      const [updatedItems] = await pool.query(
        'SELECT * FROM cart_items WHERE id = ?',
        [existingItems[0].id]
      );
      
      res.json(updatedItems[0]);
    } else {
      // Thêm item mới
      const [result] = await pool.query(
        'INSERT INTO cart_items (cart_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [cartId, variant_id, quantity, unit_price]
      );
      
      // Lấy item vừa tạo
      const [newItems] = await pool.query(
        'SELECT * FROM cart_items WHERE id = ?',
        [result.insertId]
      );
      
      res.json(newItems[0]);
    }
  } catch (e) {
    console.error('Add cart item error:', e);
    res.status(500).json({ error: 'Thêm sản phẩm vào giỏ hàng thất bại', detail: String(e) });
  }
});

app.post('/api/cart/items/:id', async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const { quantity } = req.body;

    // Update quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Số lượng không hợp lệ' });
    }

    // Cập nhật số lượng trong database
    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, itemId]
    );
    
    // Lấy item đã cập nhật
    const [updatedItems] = await pool.query(
      'SELECT * FROM cart_items WHERE id = ?',
      [itemId]
    );
    
    if (updatedItems.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy item' });
    }
    
    res.json(updatedItems[0]);
  } catch (e) {
    console.error('Cart item update error:', e);
    res.status(500).json({ error: 'Cập nhật số lượng thất bại', detail: String(e) });
  }
});

app.put('/api/cart/items/:id', async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const { quantity } = req.body;

    // Update quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Số lượng không hợp lệ' });
    }

    // Cập nhật số lượng trong database
    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, itemId]
    );
    
    // Lấy item đã cập nhật
    const [updatedItems] = await pool.query(
      'SELECT * FROM cart_items WHERE id = ?',
      [itemId]
    );
    
    if (updatedItems.length === 0) {
      return res.status(500).json({ error: 'Không tìm thấy item' });
    }
    
    res.json(updatedItems[0]);
  } catch (e) {
    console.error('Cart item update error:', e);
    res.status(500).json({ error: 'Cập nhật số lượng thất bại', detail: String(e) });
  }
});

app.delete('/api/cart/items/:id', async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    
    // Delete item
    await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
    res.json({ success: true });
  } catch (e) {
    console.error('Cart item delete error:', e);
    res.status(500).json({ error: 'Xóa sản phẩm thất bại', detail: String(e) });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    // Clear cart - xóa tất cả items trong giỏ hàng demo
    const sessionId = 'demo-session';
    
    // Lấy cart ID
    const [carts] = await pool.query(
      'SELECT id FROM carts WHERE session_id = ? LIMIT 1',
      [sessionId]
    );
    
    if (carts.length > 0) {
      // Xóa tất cả items
      await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
    }
    
    res.json({ success: true });
  } catch (e) {
    console.error('Clear cart error:', e);
    res.status(500).json({ error: 'Xóa giỏ hàng thất bại', detail: String(e) });
  }
});

// Upload file ảnh
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file nào được upload' });
    }

    // Tạo URL để truy cập file
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload file thất bại', detail: String(error) });
  }
});

// Upload multiple files cho ảnh con
app.post('/api/upload-multiple', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Không có file nào được upload' });
    }

    const uploadedFiles = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload multiple error:', error);
    res.status(500).json({ error: 'Upload files thất bại', detail: String(error) });
  }
});

// Products API endpoints
// GET /api/products (danh sách sản phẩm)
app.get('/api/products', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '12', 10) || 12, 1), 100);
    const offset = (page - 1) * pageSize;
    const categorySlug = req.query.category || null;

    // Xây dựng query với filter category nếu có
    let categoryFilter = '';
    let categoryParams = [];
    
    if (categorySlug) {
      // Tìm category_id từ slug
      const [categoryRows] = await pool.query(
        'SELECT id FROM categories WHERE slug = ? LIMIT 1',
        [categorySlug]
      );
      
      if (categoryRows.length > 0) {
        const categoryId = categoryRows[0].id;
        categoryFilter = `
          INNER JOIN product_category pc ON p.id = pc.product_id AND pc.category_id = ?
        `;
        categoryParams = [categoryId];
      } else {
        // Nếu không tìm thấy category, trả về danh sách rỗng
        return res.json({ data: [], total: 0, page, pageSize });
      }
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.sku, p.description, p.brand, p.is_active, p.created_at, p.updated_at,
              p.product_img, p.product_img_alt, p.product_img_title, p.has_images,
              MIN(pv.price) as min_price,
              MAX(pv.price) as max_price,
              MIN(pv.compare_price) as min_compare_price,
              MAX(pv.compare_price) as max_compare_price
       FROM products p
       ${categoryFilter}
       LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = 1
       GROUP BY p.id
       ORDER BY p.id DESC
       LIMIT ? OFFSET ?`,
      [...categoryParams, pageSize, offset]
    );

    // Thêm đường dẫn đầy đủ cho ảnh và xử lý giá
    const productsWithFullImageUrl = rows.map(product => ({
      ...product,
      product_img: buildFullUrl(req, product.product_img),
      // Xử lý giá: nếu có variant thì lấy giá, không thì để null
      price: product.min_price ? {
        min: product.min_price,
        max: product.max_price,
        compare_min: product.min_compare_price,
        compare_max: product.max_compare_price,
        has_discount: product.min_compare_price && product.min_compare_price > product.min_price
      } : null
    }));

    // Đếm tổng số sản phẩm với filter category
    let countQuery = 'SELECT COUNT(DISTINCT p.id) as total FROM products p';
    let countParams = [];
    
    if (categorySlug && categoryFilter) {
      countQuery += categoryFilter;
      countParams = categoryParams;
    }
    
    const [countRows] = await pool.query(countQuery, countParams);
    const total = countRows[0]?.total || 0;

    res.json({ data: productsWithFullImageUrl, total, page, pageSize });
  } catch (e) {
    console.error('Products error:', e);
    res.status(500).json({ error: 'Failed to fetch products', detail: String(e) });
  }
});

// GET /api/products/:id (chi tiết sản phẩm)
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    const [products] = await pool.query(
      `SELECT id, name, slug, sku, description, brand, is_active, created_at, updated_at,
              product_img, product_img_alt, product_img_title, has_images
       FROM products WHERE id = ? LIMIT 1`,
      [id]
    );
    const product = products[0];
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Thêm đường dẫn đầy đủ cho ảnh
    const productWithFullImageUrl = {
      ...product,
      product_img: buildFullUrl(req, product.product_img)
    };

    const [variants] = await pool.query(
      `SELECT id, product_id, variant_sku, color, size, price, compare_price, weight, is_active, created_at
       FROM product_variants WHERE product_id = ? ORDER BY id`,
      [id]
    );

    const [images] = await pool.query(
      `SELECT id, product_id, url, is_primary, sort_order, created_at
       FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC, id ASC`,
      [id]
    );

    // Thêm đường dẫn đầy đủ cho ảnh con
    const imagesWithFullUrl = images.map(image => ({
      ...image,
      url: buildFullUrl(req, image.url)
    }));

    // Lấy category_id từ bảng product_category (lấy category_id đầu tiên nếu có nhiều)
    let categoryId = null;
    try {
      const [categories] = await pool.query(
        'SELECT category_id FROM product_category WHERE product_id = ? LIMIT 1',
        [id]
      );
      if (categories.length > 0) {
        categoryId = categories[0].category_id;
      }
    } catch (catErr) {
      console.error('Error fetching category_id:', catErr);
      // Không fail toàn bộ request nếu category_id lỗi
    }

    const productWithCategory = {
      ...productWithFullImageUrl,
      category_id: categoryId
    };

    res.json({ product: productWithCategory, variants, images: imagesWithFullUrl });
  } catch (e) {
    console.error('Product detail error:', e);
    res.status(500).json({ error: 'Failed to fetch product detail', detail: String(e) });
  }
});

// Product Variants API endpoints
// Lấy danh sách product variants (admin)
app.get('/api/product-variants', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const [rows] = await pool.query(`
      SELECT pv.*, p.name as product_name, p.product_img
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      ORDER BY pv.product_id, pv.id
    `);

    // Thêm đường dẫn đầy đủ cho ảnh
    const variantsWithFullImageUrl = rows.map(variant => ({
      ...variant,
      product_img: buildFullUrl(req, variant.product_img)
    }));

    res.json({ data: variantsWithFullImageUrl });
  } catch (e) {
    console.error('Get product variants error:', e);
    res.status(500).json({ error: 'Lấy danh sách product variants thất bại', detail: String(e) });
  }
});

// Lấy variants của sản phẩm cụ thể
app.get('/api/products/:id/variants', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isFinite(productId)) return res.status(400).json({ error: 'Invalid product id' });

    const [rows] = await pool.query(`
      SELECT pv.*, p.name as product_name
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.product_id = ? AND pv.is_active = 1
      ORDER BY pv.id
    `, [productId]);

    res.json({ data: rows });
  } catch (e) {
    console.error('Get product variants error:', e);
    res.status(500).json({ error: 'Lấy variants sản phẩm thất bại', detail: String(e) });
  }
});

// Tạo product variant mới
app.post('/api/product-variants', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const {
      product_id, variant_sku, color, size, price, compare_price, weight, is_active
    } = req.body;

    if (!product_id || !variant_sku || !price) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Kiểm tra product có tồn tại không
    const [productCheck] = await pool.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (productCheck.length === 0) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    const [result] = await pool.query(`
      INSERT INTO product_variants (product_id, variant_sku, color, size, price, compare_price, weight, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [product_id, variant_sku, color || null, size || null, price, compare_price || null, weight || null, is_active !== false]);

    res.json({
      success: true,
      message: 'Tạo product variant thành công',
      id: result.insertId
    });
  } catch (e) {
    console.error('Create product variant error:', e);
    res.status(500).json({ error: 'Tạo product variant thất bại', detail: String(e) });
  }
});

// Cập nhật product variant
app.put('/api/product-variants/:id', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid variant id' });

    const {
      variant_sku, color, size, price, compare_price, weight, is_active
    } = req.body;

    if (!variant_sku || !price) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    await pool.query(`
      UPDATE product_variants 
      SET variant_sku = ?, color = ?, size = ?, price = ?, compare_price = ?, weight = ?, is_active = ?
      WHERE id = ?
    `, [variant_sku, color || null, size || null, price, compare_price || null, weight || null, is_active !== false, id]);

    res.json({ success: true, message: 'Cập nhật product variant thành công' });
  } catch (e) {
    console.error('Update product variant error:', e);
    res.status(500).json({ error: 'Cập nhật product variant thất bại', detail: String(e) });
  }
});

// Toggle trạng thái product variant
app.post('/api/product-variants/:id/toggle-status', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid variant id' });

    const { is_active } = req.body;
    await pool.query('UPDATE product_variants SET is_active = ? WHERE id = ?', [is_active, id]);

    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (e) {
    console.error('Toggle product variant status error:', e);
    res.status(500).json({ error: 'Cập nhật trạng thái thất bại', detail: String(e) });
  }
});

// Xóa product variant
app.delete('/api/product-variants/:id', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid variant id' });

    await pool.query('DELETE FROM product_variants WHERE id = ?', [id]);
    res.json({ success: true, message: 'Xóa product variant thành công' });
  } catch (e) {
    console.error('Delete product variant error:', e);
    res.status(500).json({ error: 'Xóa product variant thất bại', detail: String(e) });
  }
});

// Orders API endpoints
// Lấy danh sách orders (admin)
app.get('/api/orders', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const [rows] = await pool.query(`
      SELECT o.*, u.full_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    res.json({ data: rows });
  } catch (e) {
    console.error('Get orders error:', e);
    res.status(500).json({ error: 'Lấy danh sách orders thất bại', detail: String(e) });
  }
});

// Lấy chi tiết order (admin)
app.get('/api/orders/:id', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const orderId = Number(req.params.id);
    if (!Number.isFinite(orderId)) return res.status(400).json({ error: 'Invalid order id' });

    const [orders] = await pool.query(`
      SELECT o.*, u.full_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order không tồn tại' });
    }

    const order = orders[0];

    // Lấy order items
    const [orderItems] = await pool.query(`
      SELECT oi.*, p.name as product_name, p.product_img, pv.variant_sku, pv.color, pv.size
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      WHERE oi.order_id = ?
    `, [orderId]);

    res.json({ 
      order: {
        ...order,
        items: orderItems
      }
    });
  } catch (e) {
    console.error('Get order detail error:', e);
    res.status(500).json({ error: 'Lấy chi tiết order thất bại', detail: String(e) });
  }
});

// Cập nhật trạng thái order (admin)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const orderId = Number(req.params.id);
    if (!Number.isFinite(orderId)) return res.status(400).json({ error: 'Invalid order id' });

    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Thiếu trạng thái' });

    await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, orderId]);

    res.json({ success: true, message: 'Cập nhật trạng thái order thành công' });
  } catch (e) {
    console.error('Update order status error:', e);
    res.status(500).json({ error: 'Cập nhật trạng thái order thất bại', detail: String(e) });
  }
});

// Cập nhật trạng thái order (admin) - POST endpoint để tương thích
app.post('/api/orders/:id/status', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const orderId = Number(req.params.id);
    if (!Number.isFinite(orderId)) return res.status(400).json({ error: 'Invalid order id' });

    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Thiếu trạng thái' });

    await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, orderId]);

    res.json({ success: true, message: 'Cập nhật trạng thái order thành công' });
  } catch (e) {
    console.error('Update order status error:', e);
    res.status(500).json({ error: 'Cập nhật trạng thái order thất bại', detail: String(e) });
  }
});

// Cập nhật trạng thái thanh toán (admin)
app.post('/api/orders/:id/payment-status', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const orderId = Number(req.params.id);
    if (!Number.isFinite(orderId)) return res.status(400).json({ error: 'Invalid order id' });

    const { payment_status } = req.body;
    if (!payment_status) return res.status(400).json({ error: 'Thiếu trạng thái thanh toán' });

    const validStatuses = ['pending', 'success', 'failed', 'refunded'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({ error: 'Trạng thái thanh toán không hợp lệ' });
    }

    await pool.query('UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?', [payment_status, orderId]);

    res.json({ success: true, message: 'Cập nhật trạng thái thanh toán thành công' });
  } catch (e) {
    console.error('Update payment status error:', e);
    res.status(500).json({ error: 'Cập nhật trạng thái thanh toán thất bại', detail: String(e) });
  }
});

// Cập nhật trạng thái vận chuyển (admin)
app.post('/api/orders/:id/shipping-status', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const orderId = Number(req.params.id);
    if (!Number.isFinite(orderId)) return res.status(400).json({ error: 'Invalid order id' });

    const { shipping_status } = req.body;
    if (!shipping_status) return res.status(400).json({ error: 'Thiếu trạng thái vận chuyển' });

    const validStatuses = ['pending', 'picked_up', 'in_transit', 'delivered', 'failed'];
    if (!validStatuses.includes(shipping_status)) {
      return res.status(400).json({ error: 'Trạng thái vận chuyển không hợp lệ' });
    }

    await pool.query('UPDATE orders SET shipping_status = ?, updated_at = NOW() WHERE id = ?', [shipping_status, orderId]);

    res.json({ success: true, message: 'Cập nhật trạng thái vận chuyển thành công' });
  } catch (e) {
    console.error('Update shipping status error:', e);
    res.status(500).json({ error: 'Cập nhật trạng thái vận chuyển thất bại', detail: String(e) });
  }
});

// Users API endpoints
// Lấy danh sách users (admin)
app.get('/api/users', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    // Kiểm tra bảng users có tồn tại không
    let usersTableExists = false;
    try {
      await pool.query('SELECT 1 FROM users LIMIT 1');
      usersTableExists = true;
      console.log('Users table exists');
    } catch (tableError) {
      console.error('Users table does not exist:', tableError);
      usersTableExists = false;
    }

    // Nếu bảng users không tồn tại, tạo bảng cơ bản
    if (!usersTableExists) {
      try {
        console.log('Creating users table...');
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id BIGINT PRIMARY KEY AUTO_INCREMENT,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            role ENUM('user', 'admin') DEFAULT 'user',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        // Thêm dữ liệu mẫu
        await pool.query(`
          INSERT INTO users (email, password, full_name, role, is_active) VALUES
          ('admin@example.com', '$2b$10$example_hash', 'Admin User', 'admin', TRUE),
          ('user1@example.com', '$2b$10$example_hash', 'User One', 'user', TRUE),
          ('user2@example.com', '$2b$10$example_hash', 'User Two', 'user', TRUE)
        `);
        
        console.log('Users table created successfully with sample data');
      } catch (createError) {
        console.error('Error creating users table:', createError);
        return res.status(500).json({ 
          error: 'Không thể tạo bảng users', 
          detail: String(createError),
          suggestion: 'Kiểm tra quyền database và chạy script create-users-table.sql thủ công'
        });
      }
    } else {
      // Kiểm tra và thêm cột is_active nếu thiếu
      try {
        const [columns] = await pool.query('DESCRIBE users');
        const columnNames = columns.map(col => col.Field);
        
        if (!columnNames.includes('is_active')) {
          console.log('Adding missing column: is_active');
          await pool.query('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
        }
        
        if (!columnNames.includes('role')) {
          console.log('Adding missing column: role');
          await pool.query('ALTER TABLE users ADD COLUMN role ENUM("user", "admin") DEFAULT "user"');
        }
        
        if (!columnNames.includes('created_at')) {
          console.log('Adding missing column: created_at');
          await pool.query('ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        }
        
        if (!columnNames.includes('updated_at')) {
          console.log('Adding missing column: updated_at');
          await pool.query('ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
        }
        
        if (!columnNames.includes('avatar')) {
          console.log('Adding missing column: avatar');
          await pool.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(512) DEFAULT NULL');
        }
        
        console.log('Users table structure updated');
      } catch (alterError) {
        console.error('Error updating users table structure:', alterError);
        // Tiếp tục nếu không thể alter table
      }
    }

    // Lấy danh sách users với xử lý cột thiếu
    try {
      // Kiểm tra xem có cột status không
      let hasStatusColumn = false;
      let hasPhoneColumn = false;
      let hasAvatarColumn = false;
      try {
        const [columns] = await pool.query('DESCRIBE users');
        const columnNames = columns.map(col => col.Field);
        hasStatusColumn = columnNames.includes('status');
        hasPhoneColumn = columnNames.includes('phone');
        hasAvatarColumn = columnNames.includes('avatar');
      } catch (e) {
        console.log('Could not check columns:', e);
      }

      let query = `
        SELECT id, email, full_name, 
               COALESCE(role, 'user') as role,
               COALESCE(created_at, NOW()) as created_at, 
               COALESCE(updated_at, NOW()) as updated_at
      `;
      
      if (hasPhoneColumn) {
        query += `, phone`;
      }
      
      if (hasAvatarColumn) {
        query += `, avatar`;
      }
      
      if (hasStatusColumn) {
        query += `, COALESCE(status, 'active') as status`;
      } else {
        // Map is_active thành status
        query += `, CASE WHEN COALESCE(is_active, TRUE) = TRUE THEN 'active' ELSE 'inactive' END as status`;
      }
      
      query += `
        FROM users
        ORDER BY COALESCE(created_at, NOW()) DESC
      `;

      const [rows] = await pool.query(query);

      // Đảm bảo tất cả users có status
      const rowsWithStatus = rows.map(user => ({
        ...user,
        status: user.status || 'active',
        phone: user.phone || null
      }));

      console.log(`Found ${rowsWithStatus.length} users`);
      res.json({ 
        data: rowsWithStatus,
        message: usersTableExists ? 'Bảng users đã tồn tại' : 'Bảng users vừa được tạo mới'
      });
    } catch (queryError) {
      console.error('Error querying users:', queryError);
      
      // Fallback: query với cột cơ bản
      try {
        const [basicRows] = await pool.query(`
          SELECT id, email, full_name
          FROM users
          ORDER BY id DESC
        `);
        
        // Thêm giá trị mặc định cho các cột thiếu
        const rowsWithDefaults = basicRows.map(user => ({
          ...user,
          role: 'user',
          status: 'active',
          phone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        console.log(`Found ${rowsWithDefaults.length} users (with default values)`);
        res.json({ 
          data: rowsWithDefaults,
          message: 'Bảng users thiếu một số cột, sử dụng giá trị mặc định',
          suggestion: 'Chạy /api/database/setup để cập nhật cấu trúc bảng'
        });
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        res.status(500).json({ 
          error: 'Không thể truy vấn bảng users', 
          detail: String(fallbackError),
          suggestion: 'Kiểm tra cấu trúc bảng users và chạy /api/database/setup'
        });
      }
    }
  } catch (e) {
    console.error('Get users error:', e);
    res.status(500).json({ 
      error: 'Lấy danh sách users thất bại', 
      detail: String(e),
      suggestion: 'Kiểm tra database connection và chạy /api/database/setup'
    });
  }
});

// Vouchers API endpoints
// Lấy danh sách vouchers (admin)
app.get('/api/vouchers', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    // Kiểm tra bảng vouchers có tồn tại không
    try {
      await pool.query('SELECT 1 FROM vouchers LIMIT 1');
    } catch (tableError) {
      console.error('Vouchers table does not exist:', tableError);
      return res.json({ 
        data: [],
        message: 'Bảng vouchers chưa được tạo. Sử dụng dữ liệu mẫu.',
        suggestion: 'Chạy script create-vouchers-tables.sql để tạo bảng vouchers'
      });
    }

    const [rows] = await pool.query(`
      SELECT * FROM vouchers ORDER BY created_at DESC
    `);

    res.json({ data: rows });
  } catch (e) {
    console.error('Get vouchers error:', e);
    res.status(500).json({ error: 'Lấy danh sách vouchers thất bại', detail: String(e) });
  }
});

// Tạo voucher mới
app.post('/api/vouchers', async (req, res) => {
  try {
    const {
      code, name, description, discount_type, discount_value,
      min_order_amount, max_discount, usage_limit, valid_from, valid_until, is_active
    } = req.body;

    if (!code || !name || !discount_type || !discount_value || !min_order_amount || !usage_limit || !valid_from || !valid_until) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const [result] = await pool.query(`
      INSERT INTO vouchers (code, name, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, valid_from, valid_until, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [code, name, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, valid_from, valid_until, is_active]);

    res.json({
      success: true,
      message: 'Tạo voucher thành công',
      id: result.insertId
    });
  } catch (e) {
    console.error('Create voucher error:', e);
    res.status(500).json({ error: 'Tạo voucher thất bại', detail: String(e) });
  }
});

// Cập nhật voucher
app.put('/api/vouchers/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid voucher id' });

    const {
      code, name, description, discount_type, discount_value,
      min_order_amount, max_discount, usage_limit, valid_from, valid_until, is_active
    } = req.body;

    await pool.query(`
      UPDATE vouchers 
      SET code = ?, name = ?, description = ?, discount_type = ?, discount_value = ?, 
          min_order_amount = ?, max_discount = ?, usage_limit = ?, valid_from = ?, valid_until = ?, is_active = ?
      WHERE id = ?
    `, [code, name, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, valid_from, valid_until, is_active, id]);

    res.json({ success: true, message: 'Cập nhật voucher thành công' });
  } catch (e) {
    console.error('Update voucher error:', e);
    res.status(500).json({ error: 'Cập nhật voucher thất bại', detail: String(e) });
  }
});

// Toggle trạng thái voucher
app.post('/api/vouchers/:id/toggle-status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid voucher id' });

    const { is_active } = req.body;
    await pool.query('UPDATE vouchers SET is_active = ? WHERE id = ?', [is_active, id]);

    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (e) {
    console.error('Toggle voucher status error:', e);
    res.status(500).json({ error: 'Cập nhật trạng thái thất bại', detail: String(e) });
  }
});

// Xóa voucher
app.delete('/api/vouchers/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid voucher id' });

    await pool.query('DELETE FROM vouchers WHERE id = ?', [id]);
    res.json({ success: true, message: 'Xóa voucher thành công' });
  } catch (e) {
    console.error('Delete voucher error:', e);
    res.status(500).json({ error: 'Xóa voucher thất bại', detail: String(e) });
  }
});

// User-Vouchers API endpoints
// Gán voucher cho user
app.post('/api/user-vouchers', async (req, res) => {
  try {
    const { user_id, voucher_id, assign_to_all } = req.body;

    if (!voucher_id) {
      return res.status(400).json({ error: 'Thiếu voucher_id' });
    }

    if (assign_to_all) {
      // Gán cho tất cả users
      const [users] = await pool.query('SELECT id FROM users WHERE is_active = 1');
      
      for (const user of users) {
        try {
          await pool.query(`
            INSERT IGNORE INTO user_vouchers (user_id, voucher_id, assigned_at)
            VALUES (?, ?, NOW())
          `, [user.id, voucher_id]);
        } catch (e) {
          console.error(`Error assigning voucher to user ${user.id}:`, e);
        }
      }

      res.json({
        success: true,
        message: `Đã gán voucher cho ${users.length} người dùng`
      });
    } else {
      // Gán cho user cụ thể
      if (!user_id) {
        return res.status(400).json({ error: 'Thiếu user_id' });
      }

      await pool.query(`
        INSERT IGNORE INTO user_vouchers (user_id, voucher_id, assigned_at)
        VALUES (?, ?, NOW())
      `, [user_id, voucher_id]);

      res.json({
        success: true,
        message: 'Gán voucher thành công'
      });
    }
  } catch (e) {
    console.error('Assign voucher error:', e);
    res.status(500).json({ error: 'Gán voucher thất bại', detail: String(e) });
  }
});

// Lấy vouchers của user
app.get('/api/users/:id/vouchers', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isFinite(userId)) return res.status(400).json({ error: 'Invalid user id' });

    const [rows] = await pool.query(`
      SELECT v.*, uv.assigned_at, uv.used_at
      FROM user_vouchers uv
      JOIN vouchers v ON uv.voucher_id = v.id
      WHERE uv.user_id = ? AND v.is_active = 1
      ORDER BY uv.assigned_at DESC
    `, [userId]);

    res.json({ data: rows });
  } catch (e) {
    console.error('Get user vouchers error:', e);
    res.status(500).json({ error: 'Lấy vouchers của user thất bại', detail: String(e) });
  }
});

// Reviews API endpoints
// Kiểm tra trạng thái hệ thống reviews
app.get('/api/reviews/status', async (req, res) => {
  try {
    const status = {
      reviews_table_exists: false,
      products_table_exists: false,
      users_table_exists: false,
      sample_data_available: false,
      message: ''
    };

    // Kiểm tra bảng product_reviews (thay vì reviews)
    try {
      await pool.query('SELECT 1 FROM product_reviews LIMIT 1');
      status.reviews_table_exists = true;
    } catch (e) {
      status.message += 'Bảng product_reviews chưa được tạo. ';
    }

    // Kiểm tra bảng products
    try {
      await pool.query('SELECT 1 FROM products LIMIT 1');
      status.products_table_exists = true;
    } catch (e) {
      status.message += 'Bảng products không tồn tại. ';
    }

    // Kiểm tra bảng users
    try {
      await pool.query('SELECT 1 FROM users LIMIT 1');
      status.users_table_exists = true;
    } catch (e) {
      status.message += 'Bảng users không tồn tại. ';
    }

    // Kiểm tra dữ liệu mẫu
    if (status.reviews_table_exists) {
      try {
        const [count] = await pool.query('SELECT COUNT(*) as count FROM product_reviews');
        status.sample_data_available = count[0].count > 0;
      } catch (e) {
        status.message += 'Không thể đếm product_reviews. ';
      }
    }

    if (!status.message) {
      status.message = 'Hệ thống reviews hoạt động bình thường';
    }

    res.json(status);
  } catch (e) {
    console.error('Reviews status check error:', e);
    res.status(500).json({ error: 'Không thể kiểm tra trạng thái', detail: String(e) });
  }
});

// Lấy tất cả reviews (admin)
app.get('/api/reviews', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const [rows] = await pool.query(`
      SELECT r.*, u.full_name, u.email, p.name as product_name, p.product_img as product_image_url
      FROM product_reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);

    // Chuẩn hoá dữ liệu để tương thích frontend cũ
    const data = rows.map((r) => {
      const imageUrl = buildFullUrl(req, r.product_image_url);
      return {
        ...r,
        // Thêm cấu trúc lồng user/product cho UI cũ
        user: { full_name: r.full_name, email: r.email },
        product: { name: r.product_name, image_url: imageUrl },
        // Thêm comment fallback để UI hiển thị nếu còn dùng review.comment
        comment: r.content || r.title || '',
        // Giữ nguyên title/content để UI mới dùng
        product_image_url: imageUrl,
      };
    });

    res.json({ data });
  } catch (e) {
    console.error('Get reviews error:', e);
    res.status(500).json({ error: 'Lấy danh sách reviews thất bại', detail: String(e) });
  }
});

// Lấy reviews của sản phẩm cụ thể
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isFinite(productId)) return res.status(400).json({ error: 'Invalid product id' });

    // Kiểm tra bảng product_reviews có tồn tại không
    try {
      await pool.query('SELECT 1 FROM product_reviews LIMIT 1');
    } catch (tableError) {
      console.error('Product_reviews table does not exist:', tableError);
      return res.json({ data: [] }); // Trả về mảng rỗng nếu bảng chưa có
    }

    // Kiểm tra sản phẩm có tồn tại không
    const [productCheck] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (productCheck.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const [rows] = await pool.query(`
      SELECT r.*, u.full_name, u.email
      FROM product_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.is_approved = TRUE
      ORDER BY r.created_at DESC
    `, [productId]);
    
    const data = rows.map((r) => ({
      ...r,
      is_approved: r.is_approved === 1 || r.is_approved === true,
      comment: r.content || r.title || ''
    }));
    res.json({ data });
  } catch (e) {
    console.error('Get product reviews error:', e);
    // Trả về mảng rỗng thay vì lỗi 500
    res.json({ data: [], error: 'Không thể tải reviews, sử dụng dữ liệu mẫu' });
  }
});

// Tạo review mới
app.post('/api/reviews', async (req, res) => {
  try {
    const { product_id, rating, title, content } = req.body;
    
    // Kiểm tra từng trường và đưa ra thông báo cụ thể
    const missingFields = [];
    if (!product_id) missingFields.push('product_id');
    if (!rating) missingFields.push('rating');
    if (!content) missingFields.push('content');
    // title có thể là null/undefined
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Thiếu thông tin bắt buộc', 
        detail: `Thiếu các trường: ${missingFields.join(', ')}`,
        required_fields: ['product_id', 'rating', 'content'],
        optional_fields: ['title'],
        received_data: { product_id, rating, title, content }
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating phải từ 1-5' });
    }

    // Kiểm tra bảng product_reviews có tồn tại không
    try {
      await pool.query('SELECT 1 FROM product_reviews LIMIT 1');
    } catch (tableError) {
      console.error('Product_reviews table does not exist:', tableError);
      return res.status(500).json({ error: 'Hệ thống reviews chưa sẵn sàng, vui lòng thử lại sau' });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const [productCheck] = await pool.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (productCheck.length === 0) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    // Lấy user_id từ request body (frontend sẽ gửi kèm)
    const userId = req.body.user_id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Chưa đăng nhập. Vui lòng đăng nhập để đánh giá sản phẩm.' });
    }

    // Kiểm tra user có tồn tại không
    const [userCheck] = await pool.query('SELECT id, status FROM users WHERE id = ?', [userId]);
    if (userCheck.length === 0) {
      return res.status(400).json({ error: 'User không tồn tại' });
    }
    
    // Kiểm tra user có đang active không
    if (userCheck[0].status !== 'active') {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa' });
    }

    // Kiểm tra user đã đánh giá sản phẩm này chưa
    const [existing] = await pool.query(
      'SELECT id FROM product_reviews WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Sản phẩm này bạn đã đánh giá rồi' });
    }

    // Tạo review mới - title có thể là null
    const [result] = await pool.query(
      'INSERT INTO product_reviews (user_id, product_id, rating, title, content, is_approved) VALUES (?, ?, ?, ?, ?, FALSE)',
      [userId, product_id, rating, title || null, content]
    );

    res.json({ 
      success: true, 
      message: 'Đánh giá đã được gửi và chờ duyệt',
      id: result.insertId,
      review_data: {
        product_id,
        rating,
        title: title || null,
        content,
        user_id: userId
      }
    });
  } catch (e) {
    console.error('Create review error:', e);
    res.status(500).json({ error: 'Tạo review thất bại', detail: String(e) });
  }
 });

// Duyệt review
app.post('/api/reviews/:id/approve', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid review id' });

    await pool.query('UPDATE product_reviews SET is_approved = TRUE WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đánh giá đã được duyệt' });
  } catch (e) {
    console.error('Approve review error:', e);
    res.status(500).json({ error: 'Duyệt review thất bại', detail: String(e) });
  }
});

// Từ chối review
app.post('/api/reviews/:id/reject', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid review id' });

    await pool.query('UPDATE product_reviews SET is_approved = FALSE WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đánh giá đã bị từ chối' });
  } catch (e) {
    console.error('Reject review error:', e);
    res.status(500).json({ error: 'Từ chối review thất bại', detail: String(e) });
  }
});

// Xóa review
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid review id' });

    await pool.query('DELETE FROM product_reviews WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đánh giá đã được xóa' });
  } catch (e) {
    console.error('Delete review error:', e);
    res.status(500).json({ error: 'Xóa review thất bại', detail: String(e) });
  }
});

// Product images

// Database Status API endpoints
// Kiểm tra trạng thái database và các bảng
app.get('/api/database/status', async (req, res) => {
  try {
    const status = {
      database_connected: false,
      tables: {},
      suggestions: []
    };

    // Kiểm tra kết nối database
    try {
      await pool.query('SELECT 1');
      status.database_connected = true;
    } catch (e) {
      status.suggestions.push('Database connection failed. Kiểm tra MySQL service và thông tin kết nối.');
      return res.json(status);
    }

    // Kiểm tra các bảng cần thiết
    const requiredTables = [
      'users', 'products', 'product_variants', 'product_images', 
      'vouchers', 'user_vouchers', 'orders', 'order_items', 'product_reviews'
    ];

    for (const tableName of requiredTables) {
      try {
        const [result] = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        status.tables[tableName] = {
          exists: true,
          record_count: result[0].count
        };
      } catch (e) {
        status.tables[tableName] = {
          exists: false,
          error: String(e)
        };
        
        // Đưa ra gợi ý cho từng bảng
        switch (tableName) {
          case 'users':
            status.suggestions.push('Bảng users chưa tồn tại. Cần tạo bảng users với các cột: id, email, full_name, role, is_active, created_at, updated_at');
            break;
          case 'products':
            status.suggestions.push('Bảng products chưa tồn tại. Cần tạo bảng products trước');
            break;
          case 'vouchers':
            status.suggestions.push('Bảng vouchers chưa tồn tại. Cần tạo bảng vouchers trước');
            break;
          case 'orders':
            status.suggestions.push('Bảng orders chưa tồn tại. Cần tạo bảng orders trước');
            break;
          case 'product_reviews':
            status.suggestions.push('Bảng product_reviews chưa tồn tại. Chạy script create-product-reviews-table.sql để tạo');
            break;
        }
      }
    }

    // Kiểm tra cấu trúc bảng users nếu tồn tại
    if (status.tables.users?.exists) {
      try {
        const [columns] = await pool.query('DESCRIBE users');
        const columnNames = columns.map(col => col.Field);
        const requiredColumns = ['id', 'email', 'full_name', 'role', 'is_active', 'created_at', 'updated_at'];
        const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
        
        if (missingColumns.length > 0) {
          status.tables.users.missing_columns = missingColumns;
          status.suggestions.push(`Bảng users thiếu các cột: ${missingColumns.join(', ')}. Cần ALTER TABLE để thêm cột.`);
        }
      } catch (e) {
        status.tables.users.structure_error = String(e);
      }
    }

    res.json(status);
  } catch (e) {
    console.error('Database status check error:', e);
    res.status(500).json({ 
      error: 'Không thể kiểm tra trạng thái database', 
      detail: String(e) 
    });
  }
});

// Tạo tất cả các bảng cần thiết
app.post('/api/database/setup', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const results = {
      created_tables: [],
      errors: [],
      message: ''
    };

    // Tạo bảng users nếu chưa có
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role ENUM('user', 'admin') DEFAULT 'user',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      // Thêm dữ liệu mẫu cho users
      const [existingUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
      if (existingUsers[0].count === 0) {
        await pool.query(`
          INSERT INTO users (email, password, full_name, role, is_active) VALUES
          ('admin@example.com', '$2b$10$example_hash', 'Admin User', 'admin', TRUE),
          ('user1@example.com', '$2b$10$example_hash', 'User One', 'user', TRUE),
          ('user2@example.com', '$2b$10$example_hash', 'User Two', 'user', TRUE)
        `);
      }
      
      results.created_tables.push('users');
    } catch (e) {
      results.errors.push(`users: ${String(e)}`);
    }

    // Tạo bảng vouchers nếu chưa có
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS vouchers (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          code VARCHAR(50) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          discount_type ENUM('percentage', 'fixed') NOT NULL,
          discount_value DECIMAL(10,2) NOT NULL,
          min_order_amount DECIMAL(10,2) NOT NULL,
          max_discount DECIMAL(10,2),
          usage_limit INT NOT NULL DEFAULT 1,
          used_count INT NOT NULL DEFAULT 0,
          valid_from TIMESTAMP NOT NULL,
          valid_until TIMESTAMP NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      results.created_tables.push('vouchers');
    } catch (e) {
      results.errors.push(`vouchers: ${String(e)}`);
    }

    // Tạo bảng user_vouchers nếu chưa có
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_vouchers (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          user_id BIGINT NOT NULL,
          voucher_id BIGINT NOT NULL,
          assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          used_at TIMESTAMP NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_voucher (user_id, voucher_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      results.created_tables.push('user_vouchers');
    } catch (e) {
      results.errors.push(`user_vouchers: ${String(e)}`);
    }

    // Tạo bảng product_reviews nếu chưa có
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS product_reviews (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          product_id BIGINT NOT NULL,
          user_id BIGINT NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          images_json JSON NULL,
          is_approved BOOLEAN DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          
          UNIQUE KEY unique_user_product (user_id, product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      results.created_tables.push('product_reviews');
    } catch (e) {
      results.errors.push(`product_reviews: ${String(e)}`);
    }

    if (results.created_tables.length > 0) {
      results.message = `Đã tạo thành công ${results.created_tables.length} bảng: ${results.created_tables.join(', ')}`;
    }

    if (results.errors.length > 0) {
      results.message += `. Có ${results.errors.length} lỗi: ${results.errors.join('; ')}`;
    }

    res.json(results);
  } catch (e) {
    console.error('Database setup error:', e);
    res.status(500).json({ 
      error: 'Không thể thiết lập database', 
      detail: String(e) 
    });
  }
});

// Test API endpoints
// Tạo review mẫu để test
app.post('/api/reviews/test', async (req, res) => {
  try {
    // Dữ liệu mẫu
    const sampleData = {
      product_id: 1,
      rating: 5,
      title: "Sản phẩm tuyệt vời!",
      content: "Rất hài lòng với chất lượng sản phẩm. Giao hàng nhanh, đóng gói cẩn thận."
    };

    // Kiểm tra bảng product_reviews có tồn tại không
    try {
      await pool.query('SELECT 1 FROM product_reviews LIMIT 1');
    } catch (tableError) {
      console.error('Product_reviews table does not exist:', tableError);
      return res.status(500).json({ 
        error: 'Bảng product_reviews chưa tồn tại',
        suggestion: 'Chạy /api/database/setup để tạo bảng'
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const [productCheck] = await pool.query('SELECT id FROM products WHERE id = ?', [sampleData.product_id]);
    if (productCheck.length === 0) {
      return res.status(404).json({ 
        error: 'Sản phẩm không tồn tại',
        suggestion: 'Tạo sản phẩm trước hoặc thay đổi product_id'
      });
    }

    // Kiểm tra user có tồn tại không
    const userId = 1;
    const [userCheck] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (userCheck.length === 0) {
      return res.status(400).json({ 
        error: 'User không tồn tại',
        suggestion: 'Chạy /api/database/setup để tạo bảng users'
      });
    }

    // Kiểm tra user đã đánh giá sản phẩm này chưa
    const [existing] = await pool.query(
      'SELECT id FROM product_reviews WHERE user_id = ? AND product_id = ?',
      [userId, sampleData.product_id]
    );

    if (existing.length > 0) {
      return res.json({ 
        message: 'User đã đánh giá sản phẩm này rồi',
        existing_review: existing[0],
        sample_data: sampleData
      });
    }

    // Tạo review mẫu
    const [result] = await pool.query(
      'INSERT INTO product_reviews (user_id, product_id, rating, title, content, is_approved) VALUES (?, ?, ?, ?, ?, FALSE)',
      [userId, sampleData.product_id, sampleData.rating, sampleData.title, sampleData.content]
    );

    res.json({ 
      success: true, 
      message: 'Đã tạo review mẫu thành công',
      id: result.insertId,
      review_data: {
        ...sampleData,
        user_id: userId
      },
      note: 'Đây là API test, sử dụng dữ liệu mẫu cố định'
    });
  } catch (e) {
    console.error('Test create review error:', e);
    res.status(500).json({ 
      error: 'Tạo review mẫu thất bại', 
      detail: String(e),
      suggestion: 'Kiểm tra database connection và cấu trúc bảng'
    });
  }
});

// Tạo sản phẩm (admin)
app.post('/api/products', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const { name, slug, sku, description, product_img, product_img_alt, product_img_title, has_images, brand, is_active, category_id } = req.body || {};
    if (!name || !slug) return res.status(400).json({ error: 'Thiếu name hoặc slug' });

    const [result] = await pool.query(
      `INSERT INTO products (name, slug, sku, description, product_img, product_img_alt, product_img_title, has_images, brand, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, FALSE), ?, COALESCE(?, TRUE), NOW(), NOW())`,
      [name, slug, sku || null, description || null, product_img || null, product_img_alt || null, product_img_title || null, has_images ?? false, brand || null, is_active ?? true]
    );

    const productId = result.insertId;

    // Xử lý category_id: lưu vào bảng product_category
    if (category_id && Number.isFinite(Number(category_id))) {
      try {
        await pool.query(
          'INSERT INTO product_category (product_id, category_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE category_id = ?',
          [productId, category_id, category_id]
        );
      } catch (catErr) {
        console.error('Error saving category_id:', catErr);
        // Không fail toàn bộ request nếu category_id lỗi
      }
    }

    res.json({ success: true, id: productId });
  } catch (e) {
    console.error('Create product error:', e);
    res.status(500).json({ error: 'Tạo sản phẩm thất bại', detail: String(e) });
  }
});

// Cập nhật sản phẩm (admin)
app.put('/api/products/:id', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid product id' });

    // Dò cột hiện có của bảng products để cập nhật an toàn
    const [columns] = await pool.query('DESCRIBE products');
    const columnNames = new Set(columns.map((c) => c.Field));

    const payload = req.body || {};

    // Normalize product_img: nếu là absolute http://localhost:3000/..., cắt bỏ host để lưu relative
    if (payload.product_img && typeof payload.product_img === 'string' && payload.product_img.startsWith('http://localhost:3000/')) {
      payload.product_img = payload.product_img.replace('http://localhost:3000', '');
    }

    const allFields = {
      name: payload.name ?? null,
      slug: payload.slug ?? null,
      sku: payload.sku ?? null,
      description: payload.description ?? null,
      product_img: payload.product_img ?? null,
      product_img_alt: payload.product_img_alt ?? null,
      product_img_title: payload.product_img_title ?? null,
      has_images: typeof payload.has_images === 'boolean' ? payload.has_images : null,
      brand: payload.brand ?? null,
      is_active: typeof payload.is_active === 'boolean' ? payload.is_active : null,
    };

    const setClauses = [];
    const values = [];

    for (const [field, value] of Object.entries(allFields)) {
      if (columnNames.has(field)) {
        setClauses.push(`${field} = COALESCE(?, ${field})`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) {
      return res.json({ success: true, message: 'Không có trường hợp lệ để cập nhật' });
    }

    const sql = `UPDATE products SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = ?`;
    values.push(id);
    await pool.query(sql, values);

    // Xử lý category_id: cập nhật bảng product_category
    if (payload.category_id !== undefined) {
      try {
        const categoryId = payload.category_id ? Number(payload.category_id) : null;
        if (categoryId && Number.isFinite(categoryId)) {
          // Xóa các bản ghi cũ và thêm bản ghi mới
          await pool.query('DELETE FROM product_category WHERE product_id = ?', [id]);
          await pool.query(
            'INSERT INTO product_category (product_id, category_id) VALUES (?, ?)',
            [id, categoryId]
          );
        } else {
          // Nếu category_id là null hoặc rỗng, xóa tất cả categories của sản phẩm
          await pool.query('DELETE FROM product_category WHERE product_id = ?', [id]);
        }
      } catch (catErr) {
        console.error('Error updating category_id:', catErr);
        // Không fail toàn bộ request nếu category_id lỗi
      }
    }

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
  } catch (e) {
    console.error('Update product error:', e);
    res.status(500).json({ error: 'Cập nhật sản phẩm thất bại', detail: String(e) });
  }
});

// Xóa sản phẩm (admin)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid product id' });

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Xóa ảnh con nếu có
      try {
        await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
      } catch {}

      // Xóa biến thể nếu có
      try {
        await connection.query('DELETE FROM product_variants WHERE product_id = ?', [id]);
      } catch {}

      // Xóa order_items tham chiếu sản phẩm này (nếu schema có)
      try {
        await connection.query('DELETE FROM order_items WHERE product_id = ?', [id]);
      } catch {}

      // Xóa review tham chiếu sản phẩm (nếu có)
      try {
        await connection.query('DELETE FROM product_reviews WHERE product_id = ?', [id]);
      } catch {}

      // Xóa sản phẩm
      await connection.query('DELETE FROM products WHERE id = ?', [id]);

      await connection.commit();
      res.json({ success: true, message: 'Xóa sản phẩm thành công' });
    } catch (txErr) {
      await connection.rollback();
      console.error('Delete product tx error:', txErr);
      res.status(500).json({ error: 'Xóa sản phẩm thất bại', detail: String(txErr) });
    } finally {
      connection.release();
    }
  } catch (e) {
    console.error('Delete product error:', e);
    res.status(500).json({ error: 'Xóa sản phẩm thất bại', detail: String(e) });
  }
});

// POST override cho update/delete (tương thích AdminService)
app.post('/api/products/:id', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid product id' });

    const method = (req.body && req.body._method || '').toUpperCase();
    if (!method) return res.status(400).json({ error: 'Thiếu _method' });

    if (method === 'PUT') {
      const { name, slug, sku, description, product_img, product_img_alt, product_img_title, has_images, brand, is_active, category_id } = req.body || {};
      await pool.query(
        `UPDATE products SET 
          name = COALESCE(?, name),
          slug = COALESCE(?, slug),
          sku = ?,
          description = ?,
          product_img = ?,
          product_img_alt = ?,
          product_img_title = ?,
          has_images = COALESCE(?, has_images),
          brand = ?,
          is_active = COALESCE(?, is_active),
          updated_at = NOW()
        WHERE id = ?`,
        [name ?? null, slug ?? null, sku ?? null, description ?? null, product_img ?? null, product_img_alt ?? null, product_img_title ?? null, has_images, brand ?? null, is_active, id]
      );

      // Xử lý category_id: cập nhật bảng product_category
      if (category_id !== undefined) {
        try {
          const catId = category_id ? Number(category_id) : null;
          if (catId && Number.isFinite(catId)) {
            // Xóa các bản ghi cũ và thêm bản ghi mới
            await pool.query('DELETE FROM product_category WHERE product_id = ?', [id]);
            await pool.query(
              'INSERT INTO product_category (product_id, category_id) VALUES (?, ?)',
              [id, catId]
            );
          } else {
            // Nếu category_id là null hoặc rỗng, xóa tất cả categories của sản phẩm
            await pool.query('DELETE FROM product_category WHERE product_id = ?', [id]);
          }
        } catch (catErr) {
          console.error('Error updating category_id:', catErr);
          // Không fail toàn bộ request nếu category_id lỗi
        }
      }

      return res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
    }

    if (method === 'DELETE') {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        try { await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]); } catch {}
        try { await connection.query('DELETE FROM product_variants WHERE product_id = ?', [id]); } catch {}
        try { await connection.query('DELETE FROM order_items WHERE product_id = ?', [id]); } catch {}
        try { await connection.query('DELETE FROM product_reviews WHERE product_id = ?', [id]); } catch {}

        await connection.query('DELETE FROM products WHERE id = ?', [id]);

        await connection.commit();
        return res.json({ success: true, message: 'Xóa sản phẩm thành công' });
      } catch (txErr) {
        await connection.rollback();
        console.error('Delete product override tx error:', txErr);
        return res.status(500).json({ error: 'Xóa sản phẩm thất bại', detail: String(txErr) });
      } finally {
        connection.release();
      }
    }

    return res.status(400).json({ error: 'Giá trị _method không hợp lệ' });
  } catch (e) {
    console.error('Products POST override error:', e);
    res.status(500).json({ error: 'Lỗi xử lý override', detail: String(e) });
  }
});

// Product images: danh sách ảnh theo sản phẩm
app.get('/api/products/:id/images', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid product id' });

    try {
      await pool.query('SELECT 1 FROM product_images LIMIT 1');
    } catch {
      return res.json({ data: [] });
    }

    const [rows] = await pool.query('SELECT id, product_id, url, is_primary, sort_order, created_at FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC', [id]);
    res.json({ data: rows });
  } catch (e) {
    console.error('Get product images error:', e);
    res.status(500).json({ error: 'Tải ảnh sản phẩm thất bại', detail: String(e) });
  }
});

// Thêm ảnh cho sản phẩm
app.post('/api/products/:id/images', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid product id' });

    const { url, is_primary, sort_order } = req.body || {};
    if (!url) return res.status(400).json({ error: 'Thiếu url ảnh' });

    const [result] = await pool.query(
      'INSERT INTO product_images (product_id, url, is_primary, sort_order, created_at) VALUES (?, ?, COALESCE(?, FALSE), COALESCE(?, 0), NOW())',
      [id, url, is_primary ?? false, Number(sort_order) || 0]
    );

    res.json({ success: true, id: result.insertId });
  } catch (e) {
    console.error('Create product image error:', e);
    res.status(500).json({ error: 'Thêm ảnh thất bại', detail: String(e) });
  }
});

// Xóa ảnh sản phẩm (DELETE chuẩn)
app.delete('/api/products/:id/images/:imageId', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const productId = Number(req.params.id);
    const imageId = Number(req.params.imageId);
    if (!Number.isFinite(productId) || !Number.isFinite(imageId)) return res.status(400).json({ error: 'Invalid ids' });

    await pool.query('DELETE FROM product_images WHERE id = ? AND product_id = ?', [imageId, productId]);
    res.json({ success: true, message: 'Xóa ảnh thành công' });
  } catch (e) {
    console.error('Delete product image error:', e);
    res.status(500).json({ error: 'Xóa ảnh thất bại', detail: String(e) });
  }
});

// Xóa ảnh - POST override (tương thích AdminService)
app.post('/api/products/:id/images/:imageId', async (req, res, next) => {
  try {
    const method = (req.body && req.body._method || '').toUpperCase();
    if (method === 'DELETE') return app._router.handle(req, { ...res, method: 'DELETE' }, next);
    return res.status(404).json({ error: 'Not Found' });
  } catch (e) {
    console.error('Product image POST override error:', e);
    res.status(500).json({ error: 'Lỗi xử lý override', detail: String(e) });
  }
});

// Cập nhật ảnh theo id (PUT chuẩn)
app.put('/api/product-images/:imageId', async (req, res) => {
  try {
    const isAdmin = req.query.admin === '1';
    if (!isAdmin) return res.status(403).json({ error: 'Yêu cầu quyền admin' });

    const imageId = Number(req.params.imageId);
    if (!Number.isFinite(imageId)) return res.status(400).json({ error: 'Invalid image id' });

    const { url, is_primary, sort_order } = req.body || {};
    await pool.query(
      'UPDATE product_images SET url = COALESCE(?, url), is_primary = COALESCE(?, is_primary), sort_order = COALESCE(?, sort_order) WHERE id = ?',
      [url ?? null, typeof is_primary === 'boolean' ? is_primary : null, typeof sort_order === 'number' ? sort_order : null, imageId]
    );

    res.json({ success: true });
  } catch (e) {
    console.error('Update product image error:', e);
    res.status(500).json({ error: 'Cập nhật ảnh thất bại', detail: String(e) });
  }
});

// Cập nhật ảnh - POST override
app.post('/api/product-images/:imageId', async (req, res, next) => {
  try {
    const method = (req.body && req.body._method || '').toUpperCase();
    if (method === 'PUT') return app._router.handle(req, { ...res, method: 'PUT' }, next);
    return res.status(404).json({ error: 'Not Found' });
  } catch (e) {
    console.error('Product image update override error:', e);
    res.status(500).json({ error: 'Lỗi xử lý override', detail: String(e) });
  }
});

// Lấy danh sách đơn hàng của một user (public)
app.get('/api/orders/user/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isFinite(userId)) return res.status(400).json({ error: 'Invalid user id' });

    const page = Math.max(parseInt(req.query.page || '1', 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10', 10) || 10, 1), 100);
    const offset = (page - 1) * pageSize;

    // Kiểm tra bảng orders tồn tại
    try {
      await pool.query('SELECT 1 FROM orders LIMIT 1');
    } catch {
      return res.json({ data: [], total: 0, page, pageSize });
    }

    // Dò cột hiện có của bảng orders để select an toàn
    let selectColumns = [
      'id','user_id','code','status','subtotal','discount','shipping_fee','tax','total','currency',
      'payment_status','shipping_status','placed_at','created_at','updated_at','note','shipping_address_json'
    ];
    try {
      const [cols] = await pool.query('DESCRIBE orders');
      const existing = new Set(cols.map((c) => c.Field));
      selectColumns = selectColumns.filter((c) => existing.has(c));
    } catch {}

    const sql = `SELECT ${selectColumns.join(', ')} FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(sql, [userId, pageSize, offset]);

    const [countRows] = await pool.query('SELECT COUNT(1) as total FROM orders WHERE user_id = ?', [userId]);
    const total = countRows[0]?.total || 0;

    res.json({ data: rows, total, page, pageSize });
  } catch (e) {
    console.error('Get user orders error:', e);
    res.status(500).json({ error: 'Lấy danh sách đơn hàng thất bại', detail: String(e) });
  }
});

// Lấy danh sách items của một order kèm chi tiết sản phẩm/biến thể
app.get('/api/orders/:id/items-with-details', async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (!Number.isFinite(orderId)) return res.status(400).json({ error: 'Invalid order id' });

    // Kiểm tra bảng order_items tồn tại
    try {
      await pool.query('SELECT 1 FROM order_items LIMIT 1');
    } catch {
      return res.json({ data: [] });
    }

    // Xây dựng select an toàn theo cột thực tế của order_items
    let itemColumns = [
      'oi.id','oi.order_id','oi.product_id','oi.variant_id','oi.name_snapshot','oi.sku_snapshot','oi.unit_price','oi.quantity','oi.total'
    ];
    try {
      const [cols] = await pool.query('DESCRIBE order_items');
      const existing = new Set(cols.map((c) => c.Field));
      const base = {
        id: 'oi.id', order_id: 'oi.order_id', product_id: 'oi.product_id', variant_id: 'oi.variant_id',
        name_snapshot: 'oi.name_snapshot', sku_snapshot: 'oi.sku_snapshot', unit_price: 'oi.unit_price',
        quantity: 'oi.quantity', total: 'oi.total'
      };
      itemColumns = Object.entries(base).filter(([k]) => existing.has(k)).map(([_, v]) => v);
      if (itemColumns.length === 0) itemColumns = ['oi.id'];
    } catch {}

    const sql = `
      SELECT 
        ${itemColumns.join(', ')},
        p.name AS product_name,
        p.product_img AS product_image,
        pv.color AS variant_color,
        pv.size AS variant_size
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `;

    const [rows] = await pool.query(sql, [orderId]);

    // Chuẩn hoá ảnh sản phẩm nếu là relative
    const normalized = rows.map((r) => ({
      ...r,
      product_image: buildFullUrl(req, r.product_image)
    }));

    res.json({ data: normalized });
  } catch (e) {
    console.error('Get order items with details error:', e);
    res.status(500).json({ error: 'Lấy danh sách items thất bại', detail: String(e) });
  }
});

// Export app để Vercel có thể sử dụng
export default app;

// Chỉ chạy server nếu không phải trên Vercel (Vercel sẽ tự động chạy)
if (process.env.VERCEL !== '1') {
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
  console.log(`Frontend origin: ${FRONTEND_ORIGIN}`);
}); 
} 

// Public: Lấy danh sách voucher khả dụng cho checkout
app.get('/api/vouchers/available', async (req, res) => {
  try {
    // Kiểm tra bảng vouchers tồn tại
    try {
      await pool.query('SELECT 1 FROM vouchers LIMIT 1');
    } catch {
      return res.json({ data: [] });
    }

    const now = new Date();
    const [rows] = await pool.query(
      `SELECT id, code, name, description, discount_type, discount_value,
              min_order_amount, max_discount, usage_limit, used_count,
              valid_from, valid_until, is_active, created_at, updated_at
       FROM vouchers
       WHERE is_active = 1
         AND valid_from <= NOW()
         AND valid_until >= NOW()
         AND (usage_limit IS NULL OR used_count < usage_limit)
       ORDER BY created_at DESC`
    );

    res.json({ data: rows });
  } catch (e) {
    console.error('Get available vouchers error:', e);
    res.status(500).json({ error: 'Lấy danh sách voucher khả dụng thất bại', detail: String(e) });
  }
}); 

// Tạo đơn hàng (public)
app.post('/api/orders', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const body = req.body || {};
    const userId = Number(body.user_id) || null;
    const paymentMethodRaw = String(body.payment_method || '').toLowerCase();
    const paymentMethod = (paymentMethodRaw === 'momo' || paymentMethodRaw === 'cod' || paymentMethodRaw === 'bank_transfer' || paymentMethodRaw === 'bank')
      ? paymentMethodRaw
      : 'cod';
    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'Giỏ hàng trống' });
    }

    // Tính toán tổng tiền cơ bản
    const subtotal = items.reduce((sum, it) => sum + Number(it.unit_price || 0) * Number(it.quantity || 0), 0);
    const discount = Number(body.discount || 0);
    const shipping_fee = Number(body.shipping_fee || 0);
    const tax = Number(body.tax || 0);
    const total = subtotal - discount + shipping_fee + tax;

    const code = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await connection.beginTransaction();

    // DESCRIBE bảng orders để chọn cột hợp lệ
    let orderColumns = [];
    try {
      const [cols] = await connection.query('DESCRIBE orders');
      orderColumns = cols.map(c => c.Field);
    } catch (e) {
      await connection.rollback();
      return res.status(500).json({ error: 'Bảng orders chưa sẵn sàng', detail: String(e) });
    }

    const orderData = {
      user_id: userId,
      code,
      status: body.status || 'pending',
      subtotal,
      discount,
      shipping_fee,
      tax,
      total,
      currency: body.currency || 'VND',
      payment_status: 'pending',
      shipping_status: 'pending',
      placed_at: new Date(),
      note: body.note || null,
      shipping_address_json: body.shipping_address ? JSON.stringify(body.shipping_address) : null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const insertOrderCols = Object.keys(orderData).filter(k => orderColumns.includes(k));
    const orderPlaceholders = insertOrderCols.map(() => '?').join(',');
    const orderSql = `INSERT INTO orders (${insertOrderCols.join(',')}) VALUES (${orderPlaceholders})`;
    const orderValues = insertOrderCols.map(k => orderData[k]);

    const [orderResult] = await connection.query(orderSql, orderValues);
    const orderId = orderResult.insertId;

    // (Optional) tạo bản ghi payment nếu bảng payments tồn tại
    // method trong DB: cod | bank | momo
    try {
      await connection.query('SELECT 1 FROM payments LIMIT 1');
      const methodDb = paymentMethod === 'bank_transfer' ? 'bank' : paymentMethod;
      await connection.query(
        'INSERT INTO payments (order_id, method, amount, status, payload_json) VALUES (?, ?, ?, ?, ?)',
        [orderId, methodDb, total, 'pending', JSON.stringify({ created_from: 'checkout', payment_method: paymentMethod })]
      );
    } catch {
      // ignore nếu chưa có bảng payments / schema khác
    }

    // DESCRIBE order_items
    let itemColumns = [];
    try {
      const [cols] = await connection.query('DESCRIBE order_items');
      itemColumns = cols.map(c => c.Field);
    } catch (e) {
      await connection.rollback();
      return res.status(500).json({ error: 'Bảng order_items chưa sẵn sàng', detail: String(e) });
    }

    // Chèn từng item
    for (const it of items) {
      const row = {
        order_id: orderId,
        product_id: it.product_id || null,
        variant_id: it.variant_id || null,
        name_snapshot: it.name_snapshot || it.product_name || '',
        sku_snapshot: it.sku_snapshot || it.variant_sku || null,
        unit_price: Number(it.unit_price || 0),
        quantity: Number(it.quantity || 1),
        total: Number(it.unit_price || 0) * Number(it.quantity || 0),
        created_at: new Date(),
      };

      // Suy luận product_id từ variant_id nếu thiếu
      if (!row.product_id && row.variant_id) {
        try {
          const [pv] = await connection.query('SELECT product_id FROM product_variants WHERE id = ? LIMIT 1', [row.variant_id]);
          if (pv && pv[0] && pv[0].product_id) {
            row.product_id = pv[0].product_id;
          }
        } catch {}
      }

      // Nếu vẫn không có product_id thì báo lỗi rõ ràng
      if (!row.product_id) {
        await connection.rollback();
        return res.status(400).json({ error: 'Thiếu product_id cho order item', detail: { item: it } });
      }

      const cols = Object.keys(row).filter(k => itemColumns.includes(k));
      const placeholders = cols.map(() => '?').join(',');
      const sql = `INSERT INTO order_items (${cols.join(',')}) VALUES (${placeholders})`;
      const vals = cols.map(k => row[k]);
      await connection.query(sql, vals);
    }

    await connection.commit();

    const responseOrder = {
      id: orderId,
      user_id: userId,
      code,
      status: orderData.status,
      subtotal,
      discount,
      shipping_fee,
      tax,
      total,
      currency: orderData.currency,
      payment_status: orderData.payment_status,
      shipping_status: orderData.shipping_status,
      placed_at: orderData.placed_at,
      created_at: orderData.created_at,
      updated_at: orderData.updated_at,
      note: orderData.note,
      shipping_address_json: orderData.shipping_address_json,
    };

    res.json({ success: true, order: responseOrder, message: 'Tạo đơn hàng thành công' });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    console.error('Create order error:', e);
    res.status(500).json({ error: 'Tạo đơn hàng thất bại', detail: String(e) });
  } finally {
    connection.release();
  }
});

// ===== MoMo Payments APIs =====
// POST /api/payments/momo/create { order_id }
app.post('/api/payments/momo/create', async (req, res) => {
  try {
    const { order_id } = req.body || {};
    const orderId = Number(order_id);
    if (!Number.isFinite(orderId)) return res.status(400).json({ error: 'order_id không hợp lệ' });

    const [orders] = await pool.query('SELECT id, code, total, currency, payment_status, status FROM orders WHERE id = ? LIMIT 1', [orderId]);
    const order = orders?.[0];
    if (!order) return res.status(404).json({ error: 'Order không tồn tại' });

    if (String(order.currency || 'VND').toUpperCase() !== 'VND') {
      return res.status(400).json({ error: 'MoMo chỉ hỗ trợ VND trong demo này' });
    }

    // MoMo yêu cầu amount dạng số nguyên (VND)
    const amount = String(Math.round(Number(order.total || 0)));
    if (Number(amount) <= 0) return res.status(400).json({ error: 'Số tiền không hợp lệ' });

    // Dùng order.code làm orderId bên MoMo để map ngược về DB
    const momoOrderId = String(order.code);
    const orderInfo = `Thanh toán đơn hàng ${momoOrderId}`;
    const extraData = Buffer.from(JSON.stringify({ order_id: order.id })).toString('base64');

    const { endpoint, requestId, payload } = buildCreatePaymentPayload({
      amount,
      orderId: momoOrderId,
      orderInfo,
      extraData,
    });

    // gọi MoMo gateway
    const momoResp = await fetchJsonWithTimeout(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, 30000);

    const payUrl = momoResp?.payUrl || momoResp?.data?.payUrl;
    if (!payUrl) {
      return res.status(500).json({ error: 'Không lấy được payUrl từ MoMo', momo: momoResp });
    }

    // Upsert payment record (nếu có bảng payments)
    try {
      await pool.query('SELECT 1 FROM payments LIMIT 1');
      const [existing] = await pool.query('SELECT id FROM payments WHERE order_id = ? AND method = "momo" ORDER BY id DESC LIMIT 1', [order.id]);
      const payloadJson = {
        momo: momoResp,
        requestId,
        momoOrderId,
        created_at: new Date().toISOString(),
      };
      if (existing?.[0]?.id) {
        await pool.query(
          'UPDATE payments SET status = "pending", amount = ?, payload_json = ? WHERE id = ?',
          [Number(order.total || 0), JSON.stringify(payloadJson), existing[0].id]
        );
      } else {
        await pool.query(
          'INSERT INTO payments (order_id, method, amount, status, transaction_ref, payload_json) VALUES (?, "momo", ?, "pending", ?, ?)',
          [order.id, Number(order.total || 0), momoOrderId, JSON.stringify(payloadJson)]
        );
      }
    } catch {
      // ignore nếu chưa có bảng payments
    }

    return res.json({ success: true, payUrl, momo: momoResp, order: { id: order.id, code: order.code } });
  } catch (e) {
    console.error('Create MoMo payment error:', e?.detail || e);
    return res.status(500).json({ error: 'Tạo thanh toán MoMo thất bại', detail: String(e?.detail || e?.message || e) });
  }
});

// IPN endpoint: MoMo server sẽ POST kết quả thanh toán vào đây
app.post('/api/payments/momo/ipn', async (req, res) => {
  const body = req.body || {};
  try {
    const verify = verifyMomoIpnSignature(body);
    if (!verify.ok) {
      console.warn('MoMo IPN signature mismatch', { expected: verify.expected, actual: verify.actual });
      return res.status(400).json({ status: 'invalid_signature' });
    }

    const momoOrderId = String(body.orderId || '');
    const resultCode = Number(body.resultCode ?? -1);
    const transId = body.transId != null ? String(body.transId) : null;

    // Map order theo code
    const [orders] = await pool.query('SELECT id, code, payment_status, status FROM orders WHERE code = ? LIMIT 1', [momoOrderId]);
    const order = orders?.[0];

    if (order) {
      if (resultCode === 0) {
        await pool.query(
          'UPDATE orders SET payment_status = "success", status = IF(status="pending","paid",status), updated_at = NOW() WHERE id = ?',
          [order.id]
        );
      } else {
        await pool.query(
          'UPDATE orders SET payment_status = "failed", updated_at = NOW() WHERE id = ?',
          [order.id]
        );
      }

      // Update payments nếu có
      try {
        await pool.query('SELECT 1 FROM payments LIMIT 1');
        const status = resultCode === 0 ? 'success' : 'failed';

        // Merge payload_json ở phía Node để tránh phụ thuộc JSON_SET/CAST trong MySQL prepared statement
        const [pays] = await pool.query(
          'SELECT id, payload_json FROM payments WHERE order_id = ? AND method = "momo" ORDER BY id DESC LIMIT 1',
          [order.id]
        );
        const currentPayload = pays?.[0]?.payload_json || null;
        const mergedPayload = {
          ...(currentPayload && typeof currentPayload === 'object' ? currentPayload : {}),
          ipn: body,
        };

        if (pays?.[0]?.id) {
          await pool.query(
            `UPDATE payments
             SET status = ?, transaction_ref = COALESCE(?, transaction_ref),
                 paid_at = CASE WHEN ?="success" THEN NOW() ELSE paid_at END,
                 payload_json = ?
             WHERE id = ?`,
            [status, transId, status, JSON.stringify(mergedPayload), pays[0].id]
          );
        } else {
          // Nếu không có payment momo trước đó, tạo mới để lưu lịch sử
          await pool.query(
            `INSERT INTO payments (order_id, method, amount, status, transaction_ref, paid_at, payload_json)
             VALUES (?, "momo", 0, ?, ?, CASE WHEN ?="success" THEN NOW() ELSE NULL END, ?)`,
            [order.id, status, transId, status, JSON.stringify(mergedPayload)]
          );
        }
      } catch {}
    } else {
      console.warn('MoMo IPN: không tìm thấy order theo code', momoOrderId);
    }

    return res.json({ status: 'OK' });
  } catch (e) {
    console.error('MoMo IPN handler error:', e);
    // MoMo cần HTTP 200; vẫn trả OK để tránh retry storm khi server lỗi tạm
    return res.json({ status: 'OK' });
  }
});

// ===== Addresses (saved shipping address) =====
// GET default address for user
app.get('/api/users/:id/address-default', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isFinite(userId)) return res.status(400).json({ error: 'Invalid user id' });

    // Nếu chưa có bảng addresses thì trả rỗng
    try {
      await pool.query('SELECT 1 FROM addresses LIMIT 1');
    } catch {
      return res.json({ data: null });
    }

    const [rows] = await pool.query(
      `SELECT id, user_id, full_name, phone, line1, ward, district, city, is_default, created_at
       FROM addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, id DESC
       LIMIT 1`,
      [userId]
    );

    return res.json({ data: rows?.[0] || null });
  } catch (e) {
    console.error('Get default address error:', e);
    return res.status(500).json({ error: 'Không thể lấy địa chỉ mặc định', detail: String(e) });
  }
});

// Upsert default address for user
app.post('/api/users/:id/address-default', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = Number(req.params.id);
    if (!Number.isFinite(userId)) return res.status(400).json({ error: 'Invalid user id' });

    const { full_name, phone, line1, ward, district, city } = req.body || {};
    if (!full_name || !phone || !line1) {
      return res.status(400).json({ error: 'Thiếu full_name, phone hoặc line1' });
    }

    // Nếu chưa có bảng addresses thì tạo nhanh theo schema tối thiểu
    try {
      await connection.query('SELECT 1 FROM addresses LIMIT 1');
    } catch {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS addresses (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          user_id BIGINT UNSIGNED NOT NULL,
          full_name VARCHAR(191) NOT NULL,
          phone VARCHAR(32) NOT NULL,
          line1 VARCHAR(255) NOT NULL,
          ward VARCHAR(191) DEFAULT NULL,
          district VARCHAR(191) DEFAULT NULL,
          city VARCHAR(191) DEFAULT NULL,
          is_default TINYINT(1) NOT NULL DEFAULT 0,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY fk_addresses_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
      `);
    }

    await connection.beginTransaction();

    // clear default flag
    await connection.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);

    // update existing default if any (after clearing it won't match), so try latest row
    const [existing] = await connection.query(
      'SELECT id FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [userId]
    );

    if (existing?.[0]?.id) {
      await connection.query(
        `UPDATE addresses
         SET full_name = ?, phone = ?, line1 = ?, ward = ?, district = ?, city = ?, is_default = 1
         WHERE id = ?`,
        [full_name, phone, line1, ward || null, district || null, city || null, existing[0].id]
      );
      await connection.commit();
      return res.json({ success: true, id: existing[0].id });
    }

    const [result] = await connection.query(
      `INSERT INTO addresses (user_id, full_name, phone, line1, ward, district, city, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [userId, full_name, phone, line1, ward || null, district || null, city || null]
    );

    await connection.commit();
    return res.json({ success: true, id: result.insertId });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    console.error('Save default address error:', e);
    return res.status(500).json({ error: 'Không thể lưu địa chỉ mặc định', detail: String(e) });
  } finally {
    connection.release();
  }
});