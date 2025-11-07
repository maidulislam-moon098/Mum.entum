# Mum.entum

Mum.entum is a supportive web experience for pregnant women featuring a gentle onboarding flow, a personalised dashboard, and an AI companion. The stack uses a React (Vite) frontend, an Express backend, and Supabase (PostgreSQL) for data and authentication.

## Project structure

```
backend/            # Express API
frontend/           # React app (Vite)
supabase/schema.sql # Database objects and seed content
```

## Requirements

- Node.js 18+
- Supabase project (PostgreSQL)
- Optional: OpenAI API key for chat assistant

## Getting started

### Backend

```bash
cd backend
npm install
cp .env.example .env
# populate SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY (optional)
npm run dev
```

The Express server listens on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# populate VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```

Vite runs on `http://localhost:5173` and proxies `/api` calls to the backend.

## Database setup

Apply the SQL in `supabase/schema.sql` to your Supabase project (via SQL editor or CLI). It creates onboarding questions, profile tables, and seeds default data.

## Environment variables

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side operations |
| `OPENAI_API_KEY` | Optional key enabling the AI assistant |
| `VITE_SUPABASE_URL` | Supabase URL (browser safe) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

## Available scripts

### Backend

- `npm run dev` - Start Express with nodemon
- `npm start` - Start Express in production

### Frontend

- `npm run dev` - Run Vite dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Next steps

- Configure Supabase Auth email templates to match brand voice.
- Extend onboarding question set in `supabase/schema.sql` to cover provider-specific requirements.
- Connect the AI chat endpoint to your preferred model or disable it in production if no key is supplied.
