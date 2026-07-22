# Security Policy

## Secret Protection & Environment Isolation

NeoFlow is designed to be fully open-source and safe for public deployment. To ensure credentials are never exposed:

1. **No Hardcoded Secrets**: All API keys, tokens, and private identifiers are stored in environment variables (`.env.local`).
2. **Ignored Files**: All `.env*.local` files and credential configs are strictly excluded in `.gitignore`.
3. **Environment Template**: Use `.env.example` as a template for configuring your environment.

## Configuring Environment Variables

To set up your environment locally:

```bash
cp .env.example .env.local
```

Populate `.env.local` with your valid Firebase and Gemini API credentials:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Reporting Vulnerabilities

If you discover any security vulnerability in this project, please submit a private issue or contact the repository maintainers directly. Do not create public issues containing secret keys or security exploit details.
