# Bandai Meeting Room System

This is the consolidated source folder for the Bandai Meeting Room System.

## Project structure

```text
Bandai Meeting Room System/
├── app/                  # React admin, front desk, room display, and public views
│   └── legacy-static/    # Preserved earlier static interface and Docker files
├── api/                  # Node.js REST and Socket.IO service
│   └── ai-service/       # Python AI service
├── package.json          # Shared project commands
└── README.md
```

Generated dependencies and build artifacts are not stored in this folder.
Install them locally when needed.

## Start the application

From this folder:

```powershell
npm run install:all
Copy-Item api/.env.example api/.env
docker-compose up -d mongodb
npm run dev:api
```

Open another terminal in the same folder and run:

```powershell
npm run dev:app
```

The web application uses Vite. The API runs on `http://127.0.0.1:4000`.

MongoDB runs in Docker with a persistent named volume. If Docker is unavailable,
the API automatically uses a temporary in-memory MongoDB instance instead.

## Common commands

- `npm run dev:app` — start the website
- `npm run dev:api` — start the Node API
- `npm run build` — create the production website build
- `npm run test` — run API and end-to-end website tests
- `npm run lint` — check the website source

## AI service

The Python AI service is located in `api/ai-service`. Follow its README for
environment setup and startup instructions.

## Deployment

The active website deployment configuration is stored in
`app/.openai/hosting.json`.
