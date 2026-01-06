# Hướng dẫn Deploy lên Vercel

## Cấu hình Environment Variables trên Vercel

Trên Vercel Dashboard, vào Settings > Environment Variables và thêm các biến sau:

### Database Configuration
```
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
```

### Server Configuration
```
NODE_ENV=production
PORT=3000
FRONTEND_ORIGIN=https://web-banhang-online.vercel.app
PUBLIC_BASE_URL=https://your-backend-url.vercel.app
```

### Frontend Configuration (cho build - tùy chọn)
```
# Nếu backend và frontend cùng domain trên Vercel, không cần set biến này
# Nếu backend và frontend khác domain, set như sau:
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
```

### Momo Payment (nếu có)
```
MOMO_PARTNER_CODE=your-partner-code
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
```

## Chạy Local

1. Tạo file `.env` trong thư mục `source code web-ban-hang`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=banhang

PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000/api
```

2. Chạy lệnh:
```bash
npm install
npm run dev
```

## Deploy lên Vercel

1. Đảm bảo đã cấu hình tất cả Environment Variables trên Vercel
2. Push code lên GitHub
3. Kết nối repository với Vercel
4. Vercel sẽ tự động build và deploy

## Lưu ý

- Backend sẽ tự động detect environment (local vs production)
- CORS đã được cấu hình để hỗ trợ cả local và production
- File uploads sẽ được lưu trong `/server/uploads` trên local và trên Vercel
- Trên Vercel, bạn có thể cần sử dụng Vercel Blob Storage hoặc Cloudinary cho file uploads thay vì local storage

