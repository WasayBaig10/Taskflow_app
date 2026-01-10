# Email Configuration for Password Reset

This document explains how to configure email sending for the password reset functionality in TaskFlow.

## Overview

The password reset feature can send emails in two modes:

1. **Demo Mode** (Default): Emails are not actually sent, but reset tokens are logged to the console and included in the API response for testing purposes.

2. **Production Mode**: Real emails are sent using SMTP.

## Demo Mode (Current Configuration)

By default, the application runs in **demo mode** because email credentials are not configured. In this mode:

- No emails are actually sent
- Reset tokens are logged to the backend console
- Reset tokens are included in the API response
- The frontend shows the token with a direct link to reset

This is perfect for development and testing.

## Production Setup (Gmail SMTP)

To enable real email sending in production, follow these steps:

### Step 1: Generate a Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable **2-Step Verification** if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Create a new app password:
   - Select "Mail" and "Other (Custom name)"
   - Name it "TaskFlow"
   - Click "Generate"
   - Copy the 16-character password (you won't see it again!)

### Step 2: Configure Environment Variables

Add the following to your `.env` file:

```bash
# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USERNAME="your-email@gmail.com"
EMAIL_PASSWORD="your-16-char-app-password"
EMAIL_FROM="your-email@gmail.com"
EMAIL_FROM_NAME="TaskFlow"
EMAILS_ENABLED="true"
```

### Step 3: Restart the Backend

After updating the `.env` file, restart the backend server:

```bash
cd backend
python -m uvicorn src.main:app --reload --port 8000
```

## Alternative Email Providers

### SendGrid (Recommended for Production)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Update configuration:

```bash
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT=587
EMAIL_USERNAME="apikey"
EMAIL_PASSWORD="YOUR_SENDGRID_API_KEY"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="TaskFlow"
EMAILS_ENABLED="true"
```

### Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Get your SMTP credentials
3. Update configuration:

```bash
EMAIL_HOST="smtp.mailgun.org"
EMAIL_PORT=587
EMAIL_USERNAME="YOUR_MAILGUN_USERNAME"
EMAIL_PASSWORD="YOUR_MAILGUN_PASSWORD"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="TaskFlow"
EMAILS_ENABLED="true"
```

### AWS SES (Amazon Simple Email Service)

1. Set up AWS SES
2. Verify your sender email
3. Get SMTP credentials from AWS console
4. Update configuration:

```bash
EMAIL_HOST="email-smtp.us-east-1.amazonaws.com"
EMAIL_PORT=587
EMAIL_USERNAME="YOUR_SES_SMTP_USERNAME"
EMAIL_PASSWORD="YOUR_SES_SMTP_PASSWORD"
EMAIL_FROM="verified-email@yourdomain.com"
EMAIL_FROM_NAME="TaskFlow"
EMAILS_ENABLED="true"
```

## Testing Email Configuration

### Test in Demo Mode

1. Start the backend without email credentials
2. Make a request to `/forgot-password`:
   ```bash
   curl -X POST http://localhost:8000/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```
3. Check the response includes `"demo_mode": true`
4. Check backend console logs for the reset token

### Test in Production Mode

1. Configure email credentials in `.env`
2. Restart the backend
3. Make a request to `/forgot-password`
4. Check the email inbox for the reset link
5. The response should NOT include the reset token (security)

## Email Template

The password reset email includes:

- Professional HTML design with TaskFlow branding
- Clear call-to-action button to reset password
- Fallback link if button doesn't work
- Security notice about link expiration (1 hour)
- Warning if the user didn't request the reset

## Troubleshooting

### Gmail Authentication Errors

If you get authentication errors:

1. **Enable 2-Step Verification**: Required for app passwords
2. **Use App Password**: Don't use your regular Gmail password
3. **Check "Less Secure Apps"**: If you're not using 2FA, you may need to enable less secure apps (not recommended)

### Port Issues

- **Port 587**: Standard TLS/STARTTLS port (recommended)
- **Port 465**: SSL port (use with `start_tls=False`)
- **Port 25**: Often blocked by ISPs

### Email Not Sending

1. Check backend console logs for error messages
2. Verify email credentials are correct
3. Ensure `EMAILS_ENABLED="true"`
4. Test SMTP connection separately if needed

## Security Best Practices

1. **Never commit `.env` file**: Email credentials should stay secret
2. **Use app passwords**: Don't use your main password
3. **Enable TLS**: Always use secure connections (port 587 with STARTTLS)
4. **Rate limiting**: Consider implementing rate limiting for password reset requests
5. **Token expiration**: Tokens expire after 1 hour by default
6. **Single-use tokens**: Tokens are consumed after successful reset

## Disabling Email Sending

To disable email sending entirely (use demo mode):

```bash
EMAILS_ENABLED="false"
```

Or simply don't set `EMAIL_USERNAME` and `EMAIL_PASSWORD`.

## Current Status

**Demo Mode Active**: The application is currently running in demo mode. Email sending is simulated and tokens are returned in the API response for testing purposes.

To enable real email sending, follow the production setup steps above.
