# API Documentation - Gundam Store Backend

## Tổng quan các API mới được thêm

### 1. QUẢN LÝ YÊU THÍCH (FAVORITES)

#### Thêm sản phẩm vào yêu thích

```
POST /api/users/favorites/:productId
Headers: Authorization: Bearer {token}
```

#### Lấy danh sách yêu thích

```
GET /api/users/favorites
Headers: Authorization: Bearer {token}
Response: Array of Product objects
```

#### Xóa khỏi yêu thích

```
DELETE /api/users/favorites/:productId
Headers: Authorization: Bearer {token}
```

---

### 2. QUẢN LÝ ĐÁNH GIÁ MỞ RỘNG (REVIEWS)

#### Chỉnh sửa đánh giá (User)

```
PUT /api/products/:id/reviews/:reviewId
Headers: Authorization: Bearer {token}
Body: {
  "rating": 5,
  "comment": "Updated review"
}
```

#### Xóa đánh giá (User/Admin)

```
DELETE /api/products/:id/reviews/:reviewId
Headers: Authorization: Bearer {token}
```

#### Duyệt đánh giá (Staff/Admin)

```
PUT /api/products/:id/reviews/:reviewId/approve
Headers: Authorization: Bearer {token}
```

#### Xem tất cả đánh giá (Staff/Admin)

```
GET /api/products/reviews/all
Headers: Authorization: Bearer {token}
Response: Array of reviews with product info
```

---

### 3. QUẢN LÝ KHÁCH HÀNG (ADMIN)

#### Lấy danh sách tất cả khách hàng

```
GET /api/admin/users
Headers: Authorization: Bearer {admin_token}
Response: Array of users (without passwords)
```

#### Xem chi tiết khách hàng

```
GET /api/admin/users/:id
Headers: Authorization: Bearer {admin_token}
```

#### Khóa tài khoản khách hàng

```
PUT /api/admin/users/:id/lock
Headers: Authorization: Bearer {admin_token}
```

#### Mở khóa tài khoản

```
PUT /api/admin/users/:id/unlock
Headers: Authorization: Bearer {admin_token}
```

#### Xóa khách hàng

```
DELETE /api/admin/users/:id
Headers: Authorization: Bearer {admin_token}
Note: Không thể xóa tài khoản admin
```

---

### 4. QUẢN LÝ NHÂN VIÊN (ADMIN)

#### Lấy danh sách nhân viên

```
GET /api/admin/staff
Headers: Authorization: Bearer {admin_token}
Response: Array of staff and admin users
```

#### Tạo nhân viên mới

```
POST /api/admin/staff
Headers: Authorization: Bearer {admin_token}
Body: {
  "name": "Staff Name",
  "email": "staff@example.com",
  "password": "password123",
  "phoneNumber": "0123456789",
  "role": "staff" // or "admin"
}
```

#### Cập nhật thông tin nhân viên

```
PUT /api/admin/staff/:id
Headers: Authorization: Bearer {admin_token}
Body: {
  "name": "Updated Name",
  "phoneNumber": "0987654321",
  "address": "New Address",
  "password": "newPassword" // optional
}
```

#### Phân quyền nhân viên

```
PUT /api/admin/staff/:id/role
Headers: Authorization: Bearer {admin_token}
Body: {
  "role": "admin" // or "staff" or "user"
}
```

#### Khóa nhân viên

```
PUT /api/admin/staff/:id/lock
Headers: Authorization: Bearer {admin_token}
```

#### Mở khóa nhân viên

```
PUT /api/admin/staff/:id/unlock
Headers: Authorization: Bearer {admin_token}
```

#### Xóa nhân viên

```
DELETE /api/admin/staff/:id
Headers: Authorization: Bearer {admin_token}
Note: Không thể xóa tài khoản admin
```

---

### 5. QUẢN LÝ SẢN PHẨM (STAFF/ADMIN)

#### Lấy danh sách sản phẩm (Public)

```
GET /api/products
```

#### Thêm sản phẩm (Staff/Admin)

```
POST /api/products
Headers: Authorization: Bearer {token}
Body: {
  "name": "MGEX Strike Freedom",
  "category": "MG",
  "price": 2500000,
  "oldPrice": 2800000,
  "image": "images/products/mgex-sf.jpg",
  "description": "...",
  "badge": "New",
  "stock": 10
}
```

#### Sửa sản phẩm (Staff/Admin)

```
PUT /api/products/:id
Headers: Authorization: Bearer {token}
Body: { ... fields to update ... }
```

#### Xóa sản phẩm (Staff/Admin)

```
DELETE /api/products/:id
Headers: Authorization: Bearer {token}
```

---

### 6. QUẢN LÝ KHO HÀNG (STAFF/ADMIN)

#### Xem tồn kho

```
GET /api/inventory/status
Headers: Authorization: Bearer {token}
Response: Array of products with stock info
```

#### Nhập/xuất kho

```
POST /api/inventory/log
Headers: Authorization: Bearer {token}
Body: {
  "productId": "...",
  "type": "in", // or "out"
  "quantity": 10,
  "reason": "Nhập hàng mới"
}
```

#### Xem lịch sử kho

```
GET /api/inventory/logs
Headers: Authorization: Bearer {token}
```

---

### 7. DOANH THU (STAFF/ADMIN)

#### Xem thống kê doanh thu

```
GET /api/reports/revenue?period=daily
Headers: Authorization: Bearer {token}
Query params: period = daily | monthly | yearly
```

---

### 8. QUẢN LÝ KHUYẾN MÃI (STAFF/ADMIN)

#### Xem mã giảm giá (Staff/Admin)

```
GET /api/discounts
Headers: Authorization: Bearer {token}
```

#### Tạo mã giảm giá (Admin)

```
POST /api/discounts
Headers: Authorization: Bearer {admin_token}
Body: {
  "code": "SUMMER30",
  "type": "percentage",
  "value": 30,
  "minOrderValue": 500000,
  "expiresAt": "2026-12-31"
}
```

#### Kiểm tra mã giảm giá (User)

```
POST /api/discounts/validate
Headers: Authorization: Bearer {token}
Body: {
  "code": "GUNPLA10",
  "orderValue": 1000000
}
```

---

### 9. HỦY ĐƠN HÀNG

#### Hủy đơn hàng (User/Admin)

```
PUT /api/orders/:id/cancel
Headers: Authorization: Bearer {token}
Note: Chỉ có thể hủy đơn có status = "pending"
```

---

### 6. QUẢN LÝ LIÊN HỆ/HỖ TRỢ

#### Xem chi tiết liên hệ (Staff/Admin)

```
GET /api/contacts/:id
Headers: Authorization: Bearer {staff_token}
Response: Contact object with repliedBy populated
```

#### Phản hồi liên hệ (Staff/Admin)

```
PUT /api/contacts/:id/reply
Headers: Authorization: Bearer {staff_token}
Body: {
  "reply": "Thank you for contacting us..."
}
```

#### Đánh dấu đã xử lý (Staff/Admin)

```
PUT /api/contacts/:id/resolve
Headers: Authorization: Bearer {staff_token}
```

---

### 7. IN HÓA ĐƠN

#### Lấy thông tin hóa đơn

```
GET /api/orders/:id/invoice
Headers: Authorization: Bearer {token}
Response: {
  "orderId": "...",
  "orderDate": "...",
  "customer": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "address": {...}
  },
  "items": [...],
  "paymentMethod": "...",
  "discountAmount": 0,
  "totalPrice": 1000000,
  "status": "...",
  "paymentStatus": "..."
}
Note: Staff có thể xem tất cả hóa đơn, User chỉ xem hóa đơn của mình
```

---

## Phân quyền

### User (role: "user")

- Quản lý yêu thích của mình
- Thêm/sửa/xóa đánh giá của mình
- Hủy đơn hàng của mình (status = pending)
- Xem hóa đơn của mình

### Staff (role: "staff")

- Tất cả quyền của User
- Quản lý sản phẩm (CRUD)
- Quản lý đơn hàng (xem tất cả, cập nhật trạng thái)
- Quản lý kho hàng (xem tồn kho, nhập/xuất)
- Quản lý khuyến mãi (xem mã giảm giá)
- Xem doanh thu
- Duyệt đánh giá
- Xem tất cả đánh giá, xóa đánh giá bất kỳ
- Quản lý liên hệ/hỗ trợ (xem, phản hồi, đánh dấu đã xử lý)
- Xem tất cả hóa đơn
- Hủy đơn hàng bất kỳ (status = pending)
- Xem thông tin chi tiết khách hàng (thông qua contact/order)

### Admin (role: "admin")

- Tất cả quyền của Staff
- Quản lý khách hàng (CRUD, lock/unlock)
- Quản lý nhân viên (CRUD, phân quyền, lock/unlock)
- Quản lý danh mục (CRUD)
- Quản lý banner (CRUD)
- Tạo mã giảm giá
- Xóa bất kỳ đánh giá nào
- Hủy bất kỳ đơn hàng nào

---

## Error Codes

- `400` - Bad Request (dữ liệu không hợp lệ)
- `401` - Unauthorized (chưa đăng nhập)
- `403` - Forbidden (không có quyền)
- `404` - Not Found (không tìm thấy)
- `500` - Internal Server Error (lỗi server)

---

## Notes

1. Tất cả các endpoint cần authentication đều yêu cầu `Authorization: Bearer {token}` trong header
2. Token được trả về khi đăng nhập/đăng ký
3. Một số endpoint có kiểm tra quyền đặc biệt (staff, admin)
4. Không thể khóa hoặc xóa tài khoản admin
5. Đơn hàng chỉ có thể hủy khi status = "pending"
