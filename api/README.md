# Meeting Room API

Node.js REST and Socket.IO service for the Bandai Meeting Room System.

## Run locally

```powershell
npm install
Copy-Item .env.example .env
docker-compose -f ../compose.yaml up -d mongodb
npm run dev
```

The API listens on `http://127.0.0.1:4000`.
Workflow templates and meeting bookings are stored in MongoDB. Meeting creation
and updates return HTTP `409` when the room already has an overlapping booking.
If MongoDB is not configured, the API uses an in-memory database for development.

## Test

```powershell
npm test
```

The optional Python service is located in `ai-service`.
