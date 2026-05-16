# 💕 Dating App Backend

Backend API cho ứng dụng dating được xây dựng với Node.js 22, Express, PostgreSQL.

## 📋 Yêu cầu

- Node.js >= 22.0.0
- PostgreSQL (local hoặc Docker)
- npm hoặc yarn

## 🚀 Cài đặt

### 1. Clone và cài đặt dependencies

```bash
cd dating-app-backend
npm install
```

### 2. Thiết lập environment variables

```bash
cp .env.example .env
```

Chỉnh sửa `.env` với thông tin của bạn:

```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dating_app_db
DB_USER=dating_user
DB_PASSWORD=dating_password
DB_DIALECT=postgres
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### 3. Chạy server

**Development mode (với auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server sẽ chạy tại `http://localhost:5000`

### 4. Chạy PostgreSQL bằng Docker

```bash
docker compose up -d postgres
```

Nếu bạn muốn reset dữ liệu để script trong `db/init.sql` chạy lại, hãy xóa volume `postgres_data` trước khi khởi động lại container.

## 📁 Cấu trúc Dự Án

```
dating-app-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   └── AuthController.js    # Auth logic
│   ├── middlewares/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   └── User.js              # User schema
│   ├── repositories/
│   │   └── UserRepository.js    # Database layer
│   ├── routes/
│   │   └── authRoutes.js        # Auth endpoints
│   ├── services/
│   │   └── AuthService.js       # Business logic
│   ├── utils/
│   │   ├── jwtUtil.js           # JWT utilities
│   │   ├── responseUtil.js      # Response formatting
│   │   └── validationUtil.js    # Input validation
│   └── index.js                 # Main server file
├── .env.example                 # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication

#### 1. Register (Đăng ký)

```bash
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "xxx",
      "fullName": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-05-08T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 2. Login (Đăng nhập)

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "xxx",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 3. Refresh Token

```bash
POST /api/auth/refresh-token
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 4. Health Check

```bash
GET /api/health
```

## 📚 Architecture

### Layers

1. **Routes**: Định nghĩa endpoints
2. **Controllers**: Xử lý HTTP requests/responses
3. **Services**: Business logic
4. **Repositories**: Database interactions
5. **Models**: Data schemas (MongoDB)
6. **Middlewares**: Request processing
7. **Utils**: Helper functions

### Authentication Flow

```
Register Request
    ↓
Validation
    ↓
Check Email Exists
    ↓
Hash Password
    ↓
Save to Database
    ↓
Generate JWT
    ↓
Return User + Token
```

## 🔑 JWT Token

Tokens được tạo với:

- **Expiry**: 7 ngày (có thể chỉnh sửa)
- **Secret**: Từ environment variable
- **Payload**: User ID

## 🛡️ Security Features

- ✅ Password hashing với bcrypt
- ✅ JWT authentication
- ✅ Input validation
- ✅ CORS protection
- ✅ Password never exposed in responses

## 🚀 Tiếp theo

Các features có thể thêm:

- [ ] User profile endpoints
- [ ] Email verification
- [ ] Password reset
- [ ] User search and filtering
- [ ] Like/match system
- [ ] Messaging
- [ ] Image upload
- [ ] Rate limiting
- [ ] Logging
- [ ] Tests

## 🧪 Curl test luồng match

### 1. Đăng ký 2 tài khoản

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usera@example.com",
    "password": "123456",
    "full_name": "User A"
  }'

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userb@example.com",
    "password": "123456",
    "full_name": "User B"
  }'
```

### 2. Login để lấy token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usera@example.com",
    "password": "123456"
  }'

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userb@example.com",
    "password": "123456"
  }'
```

Lưu `token` của 2 user vào biến môi trường:

```bash
TOKEN_A="paste_token_user_a_here"
TOKEN_B="paste_token_user_b_here"
```

### 3. User A gửi like cho User B

> Thay `2` bằng `userId` thật của User B.

```bash
curl -X POST http://localhost:5000/api/interactions/request/2 \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "LIKE",
    "interaction_mode": "traditional"
  }'
```

### 4. User B xem danh sách request nhận được

```bash
curl -X GET "http://localhost:5000/api/interactions/requests/received?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN_B"
```

API sẽ trả về `requests`. Lấy `interaction_id` của request từ User A.

### 5. User B accept request để tạo match

> Thay `1` bằng `interactionId` thật lấy từ bước trên.

```bash
curl -X POST http://localhost:5000/api/interactions/1/accept \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "interaction_mode": "traditional"
  }'
```

Nếu thành công, response sẽ có `data.match`.

### 6. Lấy danh sách match của từng user

```bash
curl -X GET "http://localhost:5000/api/matches?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN_A"

curl -X GET "http://localhost:5000/api/matches?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN_B"
```

Lấy `match_id` từ response.

### 7. Xem chi tiết match và tin nhắn

> Thay `1` bằng `matchId` thật.

```bash
curl -X GET "http://localhost:5000/api/matches/1?page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN_A"
```

### 8. Gửi tin nhắn trong match

```bash
curl -X POST http://localhost:5000/api/matches/1/messages \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Chào bạn, rất vui được match nhé!"
  }'
```

### 9. User B đọc lại tin nhắn trong match

```bash
curl -X GET "http://localhost:5000/api/matches/1?page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN_B"
```

### 10. Unmatch

```bash
curl -X DELETE http://localhost:5000/api/matches/1 \
  -H "Authorization: Bearer $TOKEN_A"
```

### Ghi chú

- Luồng tạo match hiện tại là: `LIKE` từ user A -> user B `accept` -> tạo `match`.
- Cũng có thể tạo match tự động nếu 2 phía đều gửi `LIKE` cho nhau.
- Các endpoint match đều yêu cầu `Authorization: Bearer <token>`.
- Nếu cần test nhanh, nên lấy `userId`, `interactionId`, `matchId` trực tiếp từ response mỗi bước.

## 📝 Notes

- Hãy chắc chắn MongoDB đang chạy trước khi start server
- Thay đổi JWT_SECRET trong production
- Sử dụng HTTPS trong production

## 👨‍💻 Author

Dating App Team

## 📄 License

MIT
