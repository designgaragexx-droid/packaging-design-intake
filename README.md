# Design Garage — Packaging Design Intake

Upload every file in this folder to the root of the GitHub repo, keeping the folder structure (`api/`, `assets/`, `fonts/`).

## Vercel setup
- Environment variable: `RESEND_API_KEY` (required)
- Optional: `TO_EMAIL` (defaults to design.garage.xx@gmail.com), `FROM_EMAIL`

## Editing
All questions, options, and copy live in `PK_CONFIG` at the top of the script in `index.html`.
Submissions POST to `/api/packaging`, which emails the brief via Resend.
