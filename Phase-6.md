# PrepFlow.ai Backend — Phase 6 (Regeneration + Batch Evaluation + Production Polish)

Continue the existing backend. Do NOT modify authentication or the existing generation pipeline unless necessary.

## Goal

Complete the remaining assignment requirements by adding:

* Regenerate endpoints
* Batch evaluation CLI
* Better error handling
* Production polish

## 1. Regenerate Endpoints

Create protected endpoints:

POST /api/kits/:id/regenerate/questions

POST /api/kits/:id/regenerate/flashcards

POST /api/kits/:id/regenerate/schedule

Behavior:

* Reuse the existing kit data.
* Do NOT crawl the company website again.
* Do NOT regenerate company brief or requirements.
* Replace only the requested section.
* Preserve all other kit data.

## 2. Batch Evaluation CLI

Implement the required CLI.

Project structure:

scripts/
evaluate.js

samples/
input/
output/

Running:

npm run evaluate

Behavior:

* Read every JSON file from samples/input
* Generate a complete interview kit using the same backend services
* Save the generated kit as JSON into samples/output
* Continue processing remaining files even if one fails
* Print a summary:

Processed: 5

Succeeded: 4

Failed: 1

Do not duplicate generation logic. Reuse existing services.

## 3. Shared Generation Service

Extract reusable orchestration into:

services/
kitGenerator.js

This service should expose one function:

generateInterviewKit(input)

Both the API routes and CLI must use this shared service.

## 4. Error Handling

Improve consistency.

Return structured responses:

{
success: false,
message: "...",
code: "GENERATION_FAILED"
}

Handle:

* invalid URLs
* Gemini failures
* crawl failures
* missing kits
* unauthorized access

## 5. Validation

Validate:

* interview days
* job description length
* company URL
* duplicate completion IDs

Use existing middleware where possible.

## 6. Code Quality

* Remove duplicated Gemini prompts into constants.
* Keep services independent.
* Keep controllers thin.
* Add comments only where logic is non-obvious.

Do NOT implement deployment or speech evaluation.
