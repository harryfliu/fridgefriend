# Security Documentation

This document outlines the security measures implemented in Fridge Friend.

## Security Measures Implemented

### 🔒 Critical & High Priority

#### 1. Prompt Injection Prevention (CRITICAL)
**Status**: ✅ Fixed

**Implementation**: `app/api/generate-recipe/route.ts`
- **Sanitization Function**: All user inputs are sanitized before being used in AI prompts
- **Allowed Characters**: Only alphanumeric, spaces, hyphens, apostrophes, and periods
- **Special Character Removal**: Strips characters that could be used for prompt injection (`"`, `}`, `;`, `<`, `>`, etc.)
- **Length Limiting**: Each ingredient limited to 100 characters

**Example**:
```typescript
// Malicious input
'chicken", IGNORE PREVIOUS INSTRUCTIONS'

// Sanitized output
'chicken ignore previous instructions'
```

#### 2. Rate Limiting (HIGH)
**Status**: ✅ Implemented

**Implementation**: In-memory rate limiter
- **Window**: 60 seconds
- **Limit**: 10 requests per minute per IP
- **Response**: HTTP 429 (Too Many Requests) when exceeded
- **Identification**: Uses `x-forwarded-for` or `x-real-ip` headers

**Protection Against**:
- API cost abuse
- DDoS attacks
- Spam/bot traffic

**Note**: For production deployment with multiple servers, consider using Redis or a distributed rate limiter.

#### 3. Input Validation (HIGH)
**Status**: ✅ Implemented

**Validations**:
- ✅ Type checking (must be array)
- ✅ Array length (max 50 ingredients)
- ✅ String type enforcement (filters non-strings)
- ✅ Length limits (100 chars per ingredient)
- ✅ Empty string filtering

**Error Responses**:
- `400 Bad Request`: Invalid input format
- `400 Bad Request`: Too many ingredients
- `400 Bad Request`: No valid ingredients after sanitization

---

### 🔐 Medium Priority (Bonus Fixes)

#### 4. Information Disclosure Prevention
**Status**: ✅ Implemented

**Changes**:
- Detailed error logging only in development mode
- Production errors show generic messages only
- No stack traces exposed to users
- Recipe text preview limited to 200 characters in logs

**Environment Check**:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.error("Detailed error info");
}
```

---

## Security Best Practices Applied

### Input Handling
✅ Never trust user input
✅ Validate before processing
✅ Sanitize before using in sensitive contexts
✅ Limit input size and quantity

### API Security
✅ Rate limiting implemented
✅ Proper error handling
✅ No sensitive data in responses
✅ Environment variables for secrets

### Defense in Depth
✅ Multiple validation layers
✅ Sanitization + validation
✅ Rate limiting + input limits

---

## Testing Security Measures

### Manual Testing

#### Test Prompt Injection
```bash
curl -X POST http://localhost:3000/api/generate-recipe \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["chicken\", IGNORE PREVIOUS INSTRUCTIONS"]}'
```
**Expected**: Input sanitized, request succeeds or returns validation error

#### Test Rate Limiting
```bash
for i in {1..12}; do
  curl -X POST http://localhost:3000/api/generate-recipe \
    -H "Content-Type: application/json" \
    -d '{"ingredients": ["chicken"]}'
  echo "Request $i"
done
```
**Expected**: First 10 succeed, 11th and 12th return 429

#### Test Input Validation
```bash
# Test: Too many ingredients
curl -X POST http://localhost:3000/api/generate-recipe \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ['$(printf '"%s",' $(seq 1 51))']}'
```
**Expected**: 400 Bad Request with "Too many ingredients" error

---

## Remaining Recommendations

### For Production Deployment

1. **Add Security Headers** (Medium Priority)
   - Use Next.js middleware or a reverse proxy (nginx, Cloudflare)
   - Headers to add:
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `Strict-Transport-Security: max-age=31536000`
     - `Content-Security-Policy: default-src 'self'`

2. **Upgrade Rate Limiting** (Optional)
   - Use Redis for distributed rate limiting
   - Implement per-user limits (if adding auth)
   - Add IP whitelisting for trusted sources

3. **Monitoring & Alerting** (Recommended)
   - Log failed attempts
   - Alert on repeated 429 responses
   - Track API usage patterns

4. **API Key Rotation** (Best Practice)
   - Regularly rotate Groq API keys
   - Use environment-specific keys
   - Never commit keys to version control

---

## Vulnerability Disclosure

If you discover a security vulnerability, please email: harryfliu@gmail.com

**Do not** open a public GitHub issue for security vulnerabilities.

---

## Security Audit History

| Date | Auditor | Findings | Status |
|------|---------|----------|--------|
| 2025-11-12 | Claude Code | Prompt injection, Rate limiting, Input validation | ✅ Fixed |

---

## Security Checklist

- [x] No npm audit vulnerabilities
- [x] Input validation on all API endpoints
- [x] Prompt injection prevention
- [x] Rate limiting implemented
- [x] Secrets in environment variables
- [x] Error messages sanitized
- [x] XSS protection (React default)
- [ ] Security headers (recommend for production)
- [ ] CSRF protection (low priority, same-origin)
- [ ] Monitoring/logging (recommend for production)
