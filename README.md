# PrepFlow.ai Backend

The Express and MongoDB API for PrepFlow.ai. It researches company pages, extracts role requirements, generates a complete interview kit, and stores user-owned kits and practice progress.

## Features

- Cookie-based authentication and protected kit access
- Company crawling, role extraction, question, flashcard, and schedule generation
- Persistent interview practice progress
- Targeted regeneration endpoints
- Batch evaluation CLI that uses the same generation service as the API

## Prerequisites

- Node.js 20 or newer
- pnpm 10 or newer
- MongoDB
- A Gemini API key

## Setup

```bash
pnpm install
```

Create `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/prepflow
JWT_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.6-flash
FRONTEND_URL=http://localhost:3000
```

## Commands

```bash
pnpm dev       # Start with nodemon
pnpm start     # Start the API
pnpm evaluate  # Process samples/input/*.json into samples/output
pnpm exec prettier --write . # Format source files
```

## API overview

All `/api/kits` endpoints require authentication.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/kits/generate` | Generate and save a complete interview kit |
| GET | `/api/kits` | List the current user’s kits |
| GET | `/api/kits/:id` | Get one kit |
| DELETE | `/api/kits/:id` | Delete one kit |
| POST | `/api/kits/:id/regenerate/questions` | Replace questions and coverage |
| POST | `/api/kits/:id/regenerate/flashcards` | Replace flashcards |
| POST | `/api/kits/:id/regenerate/schedule` | Replace schedule |
| GET | `/api/kits/:id/practice` | Read practice progress |
| POST | `/api/kits/:id/practice/complete` | Mark a question complete |
| POST | `/api/kits/:id/practice/reset` | Reset practice progress |

Errors use a consistent structure:

```json
{ "success": false, "message": "Human-readable message", "code": "GENERATION_FAILED" }
```

## Batch evaluation inputs

Place any number of JSON files in `samples/input`. Each file must contain:

```json
{
  "companyUrl": "https://example.com",
  "days": 7,
  "jobDescription": "A job description with at least thirty characters."
}
```

Each successful result is saved to `samples/output` using the same filename. One failed sample does not stop the rest of the batch.

## Project structure

```text
src/controllers/  HTTP handlers
src/services/     Independent generation and research services
src/models/       MongoDB models
src/routes/       Express routes
scripts/          Batch evaluation CLI
samples/          Batch input and output directories
```
