# Gundam Store - Gundam Model E-commerce Project

## Giới thiệu (Introduction)
**Gundam Store** là một dự án website thương mại điện tử chuyên biệt dành cho những người yêu thích mô hình Gundam (Gunpla). Website cung cấp trải nghiệm mua sắm hiện đại, mượt mà với giao diện lấy cảm hứng từ phong cách tương lai (futuristic) và các tính năng đầy đủ của một cửa hàng trực tuyến chuyên nghiệp.

## Công nghệ sử dụng (Tech Stack)

### Frontend
- **HTML5 & CSS3**: Sử dụng các kỹ thuật hiện đại như Flexbox, Grid, và CSS Variables.
- **JavaScript (Vanilla JS)**: Xử lý logic phía client, tương tác DOM và gọi API.
- **Orbitron Font**: Mang lại cảm giác công nghệ và tương lai.
- **Responsive Design**: Tối ưu hóa hiển thị trên nhiều thiết bị (Desktop, Tablet, Mobile).

### Backend
- **Node.js & Express**: Xây dựng RESTful API mạnh mẽ và linh hoạt.
- **MongoDB & Mongoose**: Cơ sở dữ liệu NoSQL để lưu trữ thông tin sản phẩm, người dùng và đơn hàng.
- **JWT (JSON Web Token)**: Xử lý xác thực và phân quyền người dùng.
- **Bcryptjs**: Mã hóa mật khẩu bảo mật.
- **Multer**: Xử lý tải lên hình ảnh sản phẩm.

## Các tính năng chính (Key Features)

### Người dùng (Customer)
- **Trang chủ ấn tượng**: Hero section với video background full-screen và hiệu ứng chuyển động mượt mà.
- **Danh mục sản phẩm đa dạng**: Phân loại theo dòng (HG, MG, RG, PG, SD) và phụ kiện.
- **Tìm kiếm & Lọc**: Tìm kiếm sản phẩm nhanh chóng và lọc theo các tiêu chí.
- **Giỏ hàng & Thanh toán**: Quy trình thêm sản phẩm vào giỏ và thanh toán trực quan.
- **Tài khoản người dùng**: Đăng ký, đăng nhập và quản lý thông tin cá nhân.
- **Chế độ Sáng/Tối (Dark/Light Mode)**: Tùy chỉnh giao diện theo sở thích.

### Quản trị viên (Admin)
- **Bảng điều khiển (Dashboard)**: Thống kê doanh thu và đơn hàng.
- **Quản lý sản phẩm**: Thêm, sửa, xóa các mẫu Gundam.
- **Quản lý đơn hàng**: Theo dõi và cập nhật trạng thái đơn hàng của khách hàng.

## Cấu trúc thư mục (Project Structure)
- `backend/`: Chứa mã nguồn server, models, routes và controllers.
- `css/`: Các tệp tin định dạng giao diện (style.css, admin.css).
- `js/`: Logic xử lý phía frontend và kết nối API.
- `images/`: Kho lưu trữ hình ảnh sản phẩm và giao diện.
- `partials/`: Các thành phần HTML dùng chung (Header, Footer).
- `tools/`: Các công cụ hỗ trợ đồng bộ và cập nhật dữ liệu.

## Hướng dẫn cài đặt (Installation)

1. **Clone dự án**:
   ```bash
   git clone https://github.com/hdang205/hdang205-gundam-store.git
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Cấu hình môi trường**:
   Tạo file `.env` trong thư mục gốc và cấu hình các biến môi trường cần thiết (PORT, MONGODB_URI, JWT_SECRET).

4. **Chạy dự án**:
   - Chế độ phát triển: `npm run dev`
   - Chế độ production: `npm start`

---
*Dự án được thực hiện bởi Nguyễn Hải Đăng.*
