# Authentication Testing Guide

## Overview
This guide covers testing the complete authentication flow for the MPK School App:
- Frontend: React (Vite) running on `http://localhost:5173`
- Backend: Fastify + TypeScript running on `http://localhost:5000`

## Authentication Flow

### 1. Regular Signup Flow
```
User → Signup Form → Backend Creates User → Email Verification → Login
```

### 2. Google OAuth Signup Flow  
```
User → "Continue with Google" → Google Auth → Backend Creates User → Email Verification → Login
```

### 3. Login Flow (Post-Verification)
```
User → Login Form → JWT Tokens → Dashboard
User → "Continue with Google" → JWT Tokens → Dashboard
```

## Testing with Frontend (Recommended)

### Start Both Servers
```bash
# Terminal 1 - Backend (from your backend directory)
npm run dev

# Terminal 2 - Frontend (from client directory) 
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Test Regular Signup
1. Go to `http://localhost:5173/signup`
2. Fill out the form with:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "Password123"
   - Role: "Student"
   - Grade: "Grade 1"
3. Submit form
4. Should redirect to `/verify/check-email`
5. Check your email for verification link
6. Click verification link
7. Should redirect to login page
8. Login with credentials

### Test Google OAuth Signup
1. Go to `http://localhost:5173/signup`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Should redirect to `/verify/check-email` 
5. Check email for verification
6. Click verification link
7. Login normally

## Testing with curl/Postman

### 1. User Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com", 
    "password": "Password123",
    "role": "Student",
    "grade": "1"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "User created successfully. Please check your email for verification."
}
```

### 2. Email Verification
After receiving email, extract token from the verification URL and:
```bash
curl -X GET http://localhost:5000/api/auth/verify/{VERIFICATION_TOKEN}
```

Expected Response:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 3. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "fullName": "Test User",
    "email": "test@example.com",
    "role": "Student",
    "isVerified": true
  }
}
```

### 4. Protected Route Access
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Google OAuth Flow
Visit in browser:
```
http://localhost:5000/api/auth/google?redirect=http://localhost:5173/auth/callback
```

### 6. Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 7. Forgot Password
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### 8. Reset Password
```bash
curl -X POST "http://localhost:5000/api/auth/reset-password?token=RESET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewPassword123"
  }'
```

## Expected Backend Routes
Make sure your backend has these routes implemented:

- `POST /api/auth/signup` - User registration
- `GET /api/auth/verify/:token` - Email verification  
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/google` - Start Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback

## Frontend Routes
- `/` - Home page
- `/signup` - Registration form
- `/login` - Login form  
- `/auth/callback` - OAuth callback handler
- `/verify/check-email` - Email verification notice
- `/verify/:token` - Email verification processor
- `/forgot-password` - Forgot password form
- `/forgot-password/:token` - Reset password form
- `/dashboard` - Protected dashboard (requires auth)

## Troubleshooting

### CORS Issues
Make sure your backend includes CORS configuration for `http://localhost:5173`:
```typescript
await fastify.register(cors, {
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
})
```

### JWT Token Issues
- Check token expiry times match between frontend and backend
- Ensure `Authorization: Bearer {token}` header format
- Verify JWT secret is consistent

### OAuth Issues  
- Check Google OAuth credentials in backend `.env`
- Verify redirect URLs match exactly
- Ensure `credentials: 'include'` in all frontend requests

### Email Verification Issues
- Check email service configuration in backend
- Verify email templates are working
- Test with a real email service (not just console logs)

## Success Indicators

✅ **Signup works**: User can register and receives verification email
✅ **Email verification works**: Clicking email link verifies account  
✅ **Login works**: Verified users can login and receive JWT tokens
✅ **Protected routes work**: Dashboard requires authentication
✅ **Google OAuth works**: Users can signup/login with Google and go through verification
✅ **Token refresh works**: Expired tokens can be refreshed
✅ **Password reset works**: Users can reset forgotten passwords

## Error Handling

The frontend includes proper error handling for:
- Network errors
- Invalid credentials  
- Expired tokens
- Missing verification
- OAuth failures
- Server errors

All errors are displayed to users with clear messaging and appropriate UI feedback.
