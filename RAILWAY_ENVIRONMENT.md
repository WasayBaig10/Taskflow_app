# Railway Deployment Environment Variables

## Required Environment Variables

Copy these variables into your Railway service environment variables:

### Authentication
```
BETTER_AUTH_SECRET=f8aK3mP9nQ2xL5vR7sT4uW8yZ1bC6dF3gH5jK8
```

### Database
```
DATABASE_URL=postgresql://neondb_owner:npg_9JbD1XyhjtcW@ep-square-leaf-ahck7bj0-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
NEON_DATABASE_URL=postgresql://neondb_owner:npg_9JbD1XyhjtcW@ep-square-leaf-ahck7bj0-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### OpenAI (Required for Chatbot)
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Email Configuration (Optional)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=TaskFlow
EMAILS_ENABLED=true
```

### API Configuration
```
API_PORT=8000
API_HOST=0.0.0.0
DEBUG=true
```

## Notes

- **PORT** is automatically set by Railway, don't set it manually
- **OPENAI_API_KEY** is required for the chatbot feature to work
- **DATABASE_URL** should point to your production database (Neon PostgreSQL)
- For email, use Gmail App Password if 2FA is enabled
