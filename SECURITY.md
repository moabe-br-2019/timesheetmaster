# Security Configuration

## JWT Secret Setup

### For Local Development

1. Copy the `.dev.vars.example` file to `.dev.vars`:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. Generate a secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. Replace `your_generated_secret_key_here` in `.dev.vars` with your generated key

4. **NEVER commit `.dev.vars` to git** - it's already in `.gitignore`

### For Cloudflare Pages Production

1. Go to your Cloudflare Pages project dashboard

2. Navigate to **Settings** → **Environment Variables**

3. Add a new environment variable:
   - **Variable name:** `JWT_SECRET`
   - **Value:** Generate a NEW secure key (different from dev):
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   - **Environment:** Select both **Production** and **Preview**

4. Click **Save**

5. Redeploy your application for changes to take effect

## Important Security Notes

- **NEVER** use the same JWT secret in development and production
- **NEVER** commit secrets to git
- The JWT secret should be at least 128 characters (64 bytes in hex)
- Rotate the JWT secret periodically for enhanced security
- If the secret is ever compromised, generate a new one immediately

## Additional Security Configuration

After setting up JWT_SECRET, also configure in Cloudflare Pages Settings:

1. **Enable Cloudflare WAF** (Web Application Firewall)
2. **Enable Bot Protection**
3. **Configure Rate Limiting** for `/api/auth/*` endpoints
4. **Force HTTPS** (should be enabled by default)

## Testing

After configuration, test that the environment variable is working:

```bash
npm run dev
```

If you see an error "JWT_SECRET environment variable is not set", check that:
1. `.dev.vars` file exists in the `app/` directory
2. The file contains the `JWT_SECRET` variable
3. You're running `wrangler dev` (which automatically loads `.dev.vars`)
