# Development Setup Instructions

## The Error You're Seeing

The `pnpm dev` command is failing because required environment variables are missing. This is **expected behavior** - the service needs proper configuration.

## Quick Fix

1. **Environment variables are now set** (I created `.env` file)
2. **Start Redis** (required dependency):

```bash
# Option 1: Using Docker (recommended)
docker run -d --name whatsapp-otp-redis -p 6379:6379 redis:7.2-alpine

# Option 2: Using Homebrew (if you have Redis installed)
redis-server

# Option 3: Using docker-compose (starts both Redis and the app)
docker-compose up
```

3. **Then run the development server**:

```bash
pnpm run dev
```

## What I Fixed

✅ Created `.env` file with all required environment variables
✅ Set development-safe values for WhatsApp API credentials
✅ Configured proper HMAC secret for development

## Expected Behavior

Once Redis is running, the dev server will:
- ✅ Start on http://localhost:3000
- ✅ Connect to Redis successfully
- ✅ Show API documentation at http://localhost:3000/docs
- ✅ Accept API requests (though WhatsApp sending will fail without real credentials)

## Testing Without Redis

If you want to test that the build works without Redis, you can run:

```bash
# This tests the basic build and module loading
node test-build.js
```

The error you saw is actually **good** - it means our validation is working correctly and preventing the service from starting with missing configuration!