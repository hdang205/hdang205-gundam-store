# Setup Backend Server

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

Server sẽ chạy tại `http://localhost:5000`

## API Endpoints

### GET /api/images/products
Lấy danh sách ảnh có sẵn trong thư mục `images/products/`

**Response:**
```json
{
  "images": ["p1-1234567890.jpg", "p2-1234567890.jpg"]
}
```

### POST /api/images/upload
Upload ảnh mới (multipart/form-data)

**Request Body:**
- `image`: File (image file)
- `productId`: String (product ID)

**Response:**
```json
{
  "filename": "p1-1234567890.jpg",
  "path": "images/products/p1-1234567890.jpg"
}
```

## Usage in Admin

1. Admin page sẽ tự động load danh sách ảnh từ API
2. Admin có thể chọn ảnh có sẵn từ dropdown hoặc upload ảnh mới
3. Khi upload, file sẽ được lưu vào `images/products/`
4. Đường dẫn ảnh (tương đối) sẽ được lưu vào `products.json`

## Notes

- Backend chạy trên port 5000 (mặc định)
- Frontend vẫn chạy trên port khác (hoặc static files)
- Ảnh được lưu trực tiếp trên file system
