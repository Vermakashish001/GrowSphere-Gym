# 🧪 GrowSphere API Testing with Postman

## Quick Start

### Import the Collection
1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop `GrowSphere-Auth-Postman-Collection.json`
4. Click **Import**

---

## 📋 Available Endpoints

### 1️⃣ **Signup (Create Account)**
**Endpoint:** `POST http://localhost:3000/api/auth/signup`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "gymName": "Fitness Pro Gym"
}
```

**Success Response (201):**
```json
{
  "message": "Account created successfully. You can now sign in.",
  "user": {
    "id": "clxxxxxxxxxxxxxx",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "gymId": "clxxxxxxxxxxxxxx",
    "createdAt": "2025-10-04T...",
    "gym": {
      "id": "clxxxxxxxxxxxxxx",
      "name": "Fitness Pro Gym"
    }
  }
}
```

---

### 2️⃣ **Login (Sign In)**
**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "clxxxxxxxxxxxxxx",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "gymId": "clxxxxxxxxxxxxxx",
    "gym": {
      "id": "clxxxxxxxxxxxxxx",
      "name": "Fitness Pro Gym"
    }
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

---

### 3️⃣ **Get Session**
**Endpoint:** `GET http://localhost:3000/api/auth/session`

**Response (if authenticated via browser):**
```json
{
  "user": {
    "id": "clxxxxxxxxxxxxxx",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "gymId": "clxxxxxxxxxxxxxx",
    "gymName": "Fitness Pro Gym"
  },
  "expires": "2025-11-04T..."
}
```

---

## 🧪 Testing Flow

### **Happy Path:**
1. **Run "Signup"** → Should create account successfully (201)
2. **Run "Login"** → Should return user data (200)
3. **Try "Login" again** → Should still work (200)

### **Validation Tests:**
4. **Run "Invalid Email Format"** → Should return 400 error
5. **Run "Short Password"** → Should return 400 error
6. **Run "Duplicate Email"** → Should return 409 error (if using same email from step 1)

### **Authentication Tests:**
7. **Run "Wrong Password"** → Should return 401 error

---

## 🔑 API Endpoint Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/auth/signup` | Create new gym owner account |
| `POST` | `/api/auth/login` | Authenticate user (JSON response) |
| `GET` | `/api/auth/session` | Get current NextAuth session |
| `POST` | `/api/auth/callback/credentials` | NextAuth signin (redirects) |

---

## 💡 Pro Tips

1. **Use the `/login` endpoint** for API testing (returns JSON)
2. **Use NextAuth endpoints** for browser-based authentication
3. **Check response status codes:**
   - `200` = Success
   - `201` = Created
   - `400` = Bad Request (validation error)
   - `401` = Unauthorized (wrong credentials)
   - `409` = Conflict (duplicate email)
   - `500` = Server Error

4. **Environment Variables:**
   - Create a Postman environment with `baseUrl = http://localhost:3000`
   - Then use `{{baseUrl}}/api/auth/signup` in your requests

---

## 🚀 Next Steps

After testing authentication, you can:
- Build the dashboard UI
- Create member management endpoints
- Add class scheduling features
- Implement billing system

---

**Happy Testing! 🎉**
