#Welcome
 - 🌐 API Documentation: http://localhost:3000/docs
  - ❤️ Health Check: http://localhost:3000/health
  - ✅ Readiness Check: http://localhost:3000/ready
  - 📊 Metrics: http://localhost:3000/metrics
  - 🔐 OTP Request: POST http://localhost:3000/otp/request
  - ✔️ OTP Verify: POST http://localhost:3000/otp/verify


  How to Run the Service:

  Option 1: With Docker (Recommended)
  docker-compose -f docker-compose.dev.yml up --build

  Option 2: Local Development
  # Start Redis first
  docker run -d -p 6379:6379 redis:7.2-alpine

  # Then start the service
  pnpm run dev
