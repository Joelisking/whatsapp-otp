# WhatsApp OTP Service

A secure, production-ready microservice for sending and verifying one-time passwords (OTP) via WhatsApp. Built with TypeScript, Express, and Redis.

## Features

- 🚀 **Fast & Secure**: HMAC-SHA256 signature verification for all requests
- 📱 **WhatsApp Integration**: Support for Meta WhatsApp Cloud API and Twilio WhatsApp API
- 🔒 **Security First**: Rate limiting, phone number masking in logs, cooldown periods
- 🔁 **Idempotent**: Support for idempotency keys to prevent duplicate requests
- 📊 **Observability**: Structured logging with Pino, Prometheus metrics
- 🏥 **Health Checks**: Liveness and readiness endpoints for Kubernetes
- 📚 **Documentation**: OpenAPI 3.1 specification with Swagger UI
- 🐳 **Containerized**: Multi-stage Docker build with distroless base image
- ✅ **Tested**: Comprehensive unit and integration tests
- 🔄 **CI/CD Ready**: GitHub Actions workflow for automated testing and building

## Quick Start

### Prerequisites

- Node.js 20+
- Redis
- pnpm (recommended) or npm
- WhatsApp Business API credentials (Meta or Twilio)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/whatsapp-otp-service.git
cd whatsapp-otp-service

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Configuration

Edit `.env` file with your credentials:

```env
# Required
HMAC_SECRET=your-super-secret-hmac-key-here-32-chars-minimum
REDIS_URL=redis://localhost:6379

# WhatsApp Provider (choose one)
WHATSAPP_PROVIDER=meta

# For Meta WhatsApp Cloud API
META_ACCESS_TOKEN=your-meta-access-token
META_PHONE_NUMBER_ID=your-meta-phone-number-id

# For Twilio WhatsApp API
# WHATSAPP_PROVIDER=twilio
# TWILIO_ACCOUNT_SID=your-twilio-account-sid
# TWILIO_AUTH_TOKEN=your-twilio-auth-token
# TWILIO_FROM_NUMBER=your-twilio-whatsapp-number
```

### Running the Service

```bash
# Development mode
pnpm run dev

# Production build
pnpm run build
pnpm start

# Using Docker Compose
docker-compose up
```

The service will be available at:
- API: http://localhost:3000
- Documentation: http://localhost:3000/docs
- Health: http://localhost:3000/health
- Metrics: http://localhost:3000/metrics

## API Usage

### Authentication

All OTP endpoints require HMAC-SHA256 signature verification. Include the signature in the `X-Signature` header:

```javascript
const crypto = require('crypto');

const payload = JSON.stringify(requestBody);
const signature = crypto
  .createHmac('sha256', process.env.HMAC_SECRET)
  .update(payload, 'utf8')
  .digest('hex');

const headers = {
  'Content-Type': 'application/json',
  'X-Signature': `sha256=${signature}`,
};
```

### Request OTP

Send a 6-digit OTP to a phone number:

```bash
# Generate HMAC signature
PAYLOAD='{"phoneNumber":"+1234567890"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "your-hmac-secret" | cut -d' ' -f2)

# Make request
curl -X POST http://localhost:3000/otp/request \
  -H "Content-Type: application/json" \
  -H "X-Signature: sha256=$SIGNATURE" \
  -H "Idempotency-Key: unique-request-id-123" \
  -d "$PAYLOAD"
```

Response:
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "messageId": "wamid.ABC123"
}
```

### Verify OTP

Verify the received OTP code:

```bash
# Generate HMAC signature
PAYLOAD='{"phoneNumber":"+1234567890","code":"123456"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "your-hmac-secret" | cut -d' ' -f2)

# Make request
curl -X POST http://localhost:3000/otp/verify \
  -H "Content-Type: application/json" \
  -H "X-Signature: sha256=$SIGNATURE" \
  -d "$PAYLOAD"
```

Response:
```json
{
  "success": true,
  "message": "Verification successful"
}
```

### Error Responses

```json
{
  "success": false,
  "error": "Invalid verification code.",
  "attemptsRemaining": 4
}
```

## Development

### Scripts

```bash
# Development
pnpm run dev          # Start development server with hot reload
pnpm run build        # Build TypeScript to JavaScript
pnpm start            # Start production server

# Code Quality
pnpm run lint         # Run ESLint with auto-fix
pnpm run lint:check   # Run ESLint without fixing
pnpm run format       # Format code with Prettier
pnpm run format:check # Check Prettier formatting
pnpm run typecheck    # Run TypeScript type checking

# Testing
pnpm run test         # Run tests
pnpm run test:watch   # Run tests in watch mode
pnpm run test:coverage # Run tests with coverage report
```

### Project Structure

```
├── src/
│   ├── config/           # Configuration and Redis setup
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── providers/        # WhatsApp provider implementations
│   ├── services/         # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── index.ts         # Application entry point
├── tests/
│   ├── integration/     # Integration tests
│   ├── unit/           # Unit tests
│   └── setup.ts        # Test setup
├── docs/
│   └── openapi.yaml    # OpenAPI specification
├── Dockerfile          # Multi-stage Docker build
├── docker-compose.yml  # Development environment
└── .github/workflows/  # CI/CD pipelines
```

## Security Features

### HMAC Signature Verification
All requests must include a valid HMAC-SHA256 signature to prevent tampering and ensure authenticity.

### Rate Limiting
- **Per IP**: 100 requests per 15-minute window
- **Per Phone**: 5 requests per 15-minute window

### OTP Security
- 6-digit random codes
- 5-minute TTL (configurable)
- Maximum 5 verification attempts
- 60-second cooldown between requests

### Phone Number Privacy
Phone numbers are masked in all log outputs to protect user privacy.

### Timing Attack Protection
HMAC verification uses constant-time comparison to prevent timing attacks.

## Monitoring & Observability

### Health Checks

```bash
# Liveness probe
curl http://localhost:3000/health

# Readiness probe (checks Redis connectivity)
curl http://localhost:3000/ready
```

### Metrics

Prometheus metrics are available at `/metrics`:

- `otp_requests_total` - Total OTP requests
- `otp_verifications_total` - Total verification attempts
- `otp_verification_success_total` - Successful verifications
- `otp_verification_failure_total` - Failed verifications
- `whatsapp_messages_sent_total` - WhatsApp messages sent
- `whatsapp_messages_failure_total` - Failed WhatsApp messages
- `http_request_duration_seconds` - HTTP request duration histogram

### Structured Logging

All logs are structured JSON with:
- Request correlation IDs
- Masked phone numbers
- Error context
- Performance metrics

## Deployment

### Docker

```bash
# Build image
docker build -t whatsapp-otp-service .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whatsapp-otp-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: whatsapp-otp-service
  template:
    metadata:
      labels:
        app: whatsapp-otp-service
    spec:
      containers:
      - name: app
        image: whatsapp-otp-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        - name: HMAC_SECRET
          valueFrom:
            secretKeyRef:
              name: otp-secrets
              key: hmac-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Configuration Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` | No |
| `HMAC_SECRET` | HMAC signing secret (min 32 chars) | - | Yes |
| `OTP_TTL_MINUTES` | OTP expiration time | `5` | No |
| `MAX_OTP_ATTEMPTS` | Max verification attempts | `5` | No |
| `COOLDOWN_SECONDS` | Cooldown between requests | `60` | No |
| `WHATSAPP_PROVIDER` | Provider: `meta` or `twilio` | `meta` | No |
| `META_ACCESS_TOKEN` | Meta access token | - | If using Meta |
| `META_PHONE_NUMBER_ID` | Meta phone number ID | - | If using Meta |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | - | If using Twilio |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | - | If using Twilio |
| `TWILIO_FROM_NUMBER` | Twilio WhatsApp number | - | If using Twilio |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per IP | `100` | No |
| `RATE_LIMIT_MAX_REQUESTS_PER_PHONE` | Max requests per phone | `5` | No |
| `LOG_LEVEL` | Log level | `info` | No |

## WhatsApp Provider Setup

### Meta WhatsApp Cloud API

1. Create a Meta for Business account
2. Set up WhatsApp Business API
3. Get your access token and phone number ID
4. Set `WHATSAPP_PROVIDER=meta`

### Twilio WhatsApp API

1. Create a Twilio account
2. Set up WhatsApp Business API
3. Get your Account SID, Auth Token, and WhatsApp number
4. Set `WHATSAPP_PROVIDER=twilio`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Run linting: `pnpm run lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📚 Documentation: Available at `/docs` endpoint
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/whatsapp-otp-service/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-org/whatsapp-otp-service/discussions)

## Roadmap

- [ ] Support for additional WhatsApp providers
- [ ] SMS fallback option
- [ ] Multi-language OTP messages
- [ ] Advanced analytics dashboard
- [ ] Webhook notifications
- [ ] Rate limiting per customer/tenant