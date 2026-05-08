# 💕 Dating App Backend

Backend API cho ứng dụng dating được xây dựng với Node.js 22, Express, MongoDB.

## 📋 Yêu cầu

- Node.js >= 22.0.0
- MongoDB (local hoặc cloud)
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
MONGODB_URI=mongodb://localhost:27017/dating_app_db
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

## 📝 Notes

- Hãy chắc chắn MongoDB đang chạy trước khi start server
- Thay đổi JWT_SECRET trong production
- Sử dụng HTTPS trong production

## 👨‍💻 Author

Dating App Team

## 📄 License

MIT
