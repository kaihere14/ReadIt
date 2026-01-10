# AI README Generator Setup

## Required Environment Variables

Add to your `.env` file:

```env
# Groq API (FREE - Get from console.groq.com)
GROQ_API_KEY=gsk_your_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Other required variables
PORT=3000
MONGODB_URI=mongodb://localhost:27017/readit
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_char_key
REDIS_HOST=localhost
REDIS_PORT=6379
README_FILE_NAME=README.md
```

## Get Groq API Key (FREE)

1. Go to [console.groq.com](https://console.groq.com/)
2. Sign up/login
3. Go to API Keys section
4. Create new API key
5. Copy and paste into `.env`

## Groq Free Tier Limits

- ✅ 30 requests per minute
- ✅ 14,400 requests per day
- ✅ 6,000 tokens per minute
- ✅ 500,000 tokens per day
- ✅ 100% FREE

## Available Models

- `llama-3.3-70b-versatile` (recommended - fast & capable)
- `llama-3.1-70b-versatile`
- `mixtral-8x7b-32768`

## How It Works

1. You push a commit to GitHub
2. GitHub webhook triggers the server
3. AI worker fetches commit data
4. Groq API generates README
5. README is committed back to repo
6. Loop prevention stops infinite commits

## Loop Prevention

The system automatically ignores commits with:
- `[skip ci]` in commit message
- `auto-update README` in commit message

This prevents infinite loops!

