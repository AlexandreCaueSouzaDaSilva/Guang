# Guang Project

App para transcrever texto de fotos usando IA, com suporte a seleção de idioma e salvamento de notas em notebooks.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — JWT signing secret
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI integration

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (jsonwebtoken + bcryptjs)
- OCR + Translation: OpenAI Vision (gpt-5-mini) via Replit AI integration
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — DB schema: users.ts, notebooks.ts, notes.ts
- `artifacts/api-server/src/routes/` — Express route handlers
  - `auth.ts` — login, register, recovery
  - `user.ts` — profile CRUD
  - `notebooks.ts` — notebook CRUD
  - `notes.ts` — notes CRUD
  - `ocr.ts` — AI vision transcription + languages list
  - `health.ts` — healthz
- `artifacts/api-server/src/middlewares/auth.ts` — JWT middleware

## API Endpoints

All endpoints under `/api`:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/login | No | Login (email, password) → token + user |
| POST | /auth/register | No | Register (email, password, name, pin?) |
| POST | /auth/recovery | No | Request password recovery |
| GET | /user/me | Yes | Get current user |
| PATCH | /user/me | Yes | Update user profile |
| DELETE | /user/me | Yes | Delete account |
| GET | /notebooks | Yes | List notebooks (with note count) |
| POST | /notebooks | Yes | Create notebook |
| GET | /notebooks/:id | Yes | Get notebook |
| DELETE | /notebooks/:id | Yes | Delete notebook |
| GET | /notes | Yes | List notes (filter by ?notebookId=) |
| POST | /notes | Yes | Create note |
| GET | /notes/:id | Yes | Get note |
| PATCH | /notes/:id | Yes | Update note |
| DELETE | /notes/:id | Yes | Delete note |
| POST | /ocr/transcribe | Yes | Transcribe image (base64) with optional translation |
| GET | /languages | No | List 15 supported languages |
| GET | /healthz | No | Health check |

## Frontend (Ionic/Angular - Guang)

The frontend is a pre-built Ionic/Angular app in the attached zip. Pages:
- **login** — email/password login
- **register** — register with email, password, pin
- **recovery** — password recovery by email
- **home** — upload image or use camera, see recent transcriptions
- **notebooks** — list/create notebooks
- **resultado** — transcription result with copy/save actions
- **config** — dark mode, notifications, logout, delete account

Frontend must send `Authorization: Bearer <token>` for authenticated requests.
OCR endpoint expects `{ imageBase64: string, targetLanguage?: string, sourceLanguage?: string }`.

## Architecture decisions

- OpenAI Vision (gpt-5-mini) handles OCR + translation in a single prompt — eliminates need for Tesseract or separate translation API.
- Images sent as base64 data URIs directly in the JSON body — no file upload/storage needed.
- JWT with 30-day expiry stored client-side — no server sessions.
- Notebooks soft-delete notes via `ON DELETE SET NULL` (cascade only for notebook itself).
- `requireAuth` middleware is imported per-router, not global, keeping /auth/* and /languages public.

## Product

App mobile de OCR: o usuário tira ou seleciona uma foto com texto, escolhe o idioma de destino, e o servidor usa IA para transcrever e traduzir o texto. O resultado pode ser copiado ou salvo como uma nota em um notebook.

## Gotchas

- Always run codegen after changing `lib/api-spec/openapi.yaml`
- After codegen, run `pnpm --filter @workspace/db run push` if schema changed
- The OpenAI integration env vars are auto-provisioned — don't change them manually
- `multer` is installed but OCR uses JSON/base64, not multipart — kept for future file upload support
