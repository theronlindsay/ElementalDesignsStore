# Admin Authentication System

## Overview

This project includes a secure, password-protected admin panel with server-side authentication.

## Security Features

✅ **Server-side protection** - All auth checks happen in `.server.ts` files
✅ **HTTP-only cookies** - Cannot be accessed by client-side JavaScript  
✅ **Layout guard** - `+layout.server.ts` protects all `/admin/*` routes
✅ **Session-based** - Cookie expires after 24 hours (or 30 days with "Remember me")
✅ **Form actions** - SvelteKit's built-in CSRF protection

## Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Set your credentials in `.env`:**
   ```
   VITE_ADMIN_USERNAME=your_username
   VITE_ADMIN_PASSWORD=your_secure_password
   ```

3. **Restart dev server** (to load new env vars):
   ```bash
   npm run dev
   ```

## Usage

### Login
- Navigate to `/login`
- Enter credentials from `.env`
- Click "Sign In"

### Admin Dashboard
- Access at `/admin`
- Automatically redirected to `/login` if not authenticated
- All routes under `/admin/*` are protected

### Logout
- Click "Logout" button in admin dashboard
- Clears session cookie
- Redirects to login page

## File Structure

```
src/
├── lib/
│   ├── Input.svelte          # Reusable input component
│   ├── Label.svelte          # Form label component
│   └── FormGroup.svelte      # Form group wrapper
├── routes/
│   ├── login/
│   │   ├── +page.svelte          # Login UI
│   │   └── +page.server.ts       # Login authentication logic
│   └── admin/
│       ├── +layout.server.ts     # Guards all admin routes
│       ├── +page.svelte          # Admin dashboard UI
│       └── +page.server.ts       # Logout action
```

## How It Works

### 1. Login Flow
```
User → /login → Enter credentials → POST to server
→ Server validates → Set HTTP-only cookie → Redirect to /admin
```

### 2. Protection Flow
```
User visits /admin/* → +layout.server.ts checks cookie
→ Valid: Load page
→ Invalid: Redirect to /login
```

### 3. Logout Flow
```
User clicks logout → POST to ?/logout → Server clears cookie
→ Redirect to /login
```

## Security Notes

### ⚠️ Current Implementation (Development)
- Credentials stored in `.env` (not secure for production)
- Simple string comparison for password check
- Static session token

### 🔒 Production Recommendations
1. **Hash passwords** - Use bcrypt or argon2
2. **Database storage** - Store users in a database
3. **Secure tokens** - Generate random session tokens
4. **Token rotation** - Regenerate tokens on login
5. **Rate limiting** - Prevent brute force attacks
6. **2FA** - Add two-factor authentication
7. **Audit logs** - Track admin actions

## Production Upgrade Path

```typescript
// Example: Hash password check
import bcrypt from 'bcrypt';

const user = await db.users.findOne({ username });
if (user && await bcrypt.compare(password, user.hashedPassword)) {
  // Generate secure session token
  const sessionToken = crypto.randomUUID();
  await db.sessions.create({ userId: user.id, token: sessionToken });
  
  cookies.set('admin_session', sessionToken, { /* ... */ });
}
```

## Default Credentials

**⚠️ CHANGE THESE IMMEDIATELY!**

- Username: `admin`
- Password: `admin123`

## Components

### Input Component
```svelte
<Input 
  type="text"
  name="username"
  placeholder="Enter username"
  required
/>
```

### Label Component
```svelte
<Label htmlFor="username" required>
  Username
</Label>
```

### FormGroup Component
```svelte
<FormGroup>
  <Label htmlFor="email">Email</Label>
  <Input type="email" name="email" />
</FormGroup>
```

## Testing

1. Navigate to `http://localhost:5173/login`
2. Enter: `admin` / `admin123`
3. Should redirect to `/admin` dashboard
4. Try accessing `/admin` directly (should redirect to login)
5. Click logout (should clear session and redirect to login)

## Extending

To add new protected admin pages:

```typescript
// src/routes/admin/products/+page.svelte
<script>
  // Your UI code
</script>

// src/routes/admin/products/+page.server.ts
export const load = async () => {
  // Already authenticated by +layout.server.ts
  return { products: [] };
};

export const actions = {
  create: async ({ request }) => {
    // Handle product creation
  }
};
```

All routes under `/admin/*` are automatically protected by the layout server guard!
