# SpawnBase UI

React admin dashboard for the SpawnBase database provisioning platform.

> ⚠️ Educational project. Not intended for production use.

---

## Backend Repository

[spawnbase](https://github.com/psuresh546/spawnbase) — Java/Spring Boot microservices backend. Start the backend before running the UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (Create React App) |
| HTTP client | Axios |
| Routing | React Router v6 |
| Served in Docker | nginx:alpine |

---

## Running Locally

### Prerequisites

- Node 20+
- SpawnBase backend running on port 8080

### Development server

```bash
npm install
npm start
# Opens http://localhost:3000
```

### Production build (Docker)

```bash
# From spawnbase/ root (sibling directory):
docker-compose up -d
# UI served at http://localhost:3000 via nginx
```

---

## Features

- **Dashboard** — live instance list with state badges, DB type indicators, auto-refresh every 10 seconds
- **Create instance** — modal form: name, DB type, owner
- **Instance detail** — state timeline, event log, credential reveal, recover button
- **Provisioning flow** — create → transition → provision in 3 sequential API calls

---

## Project Structure

```
spawnbase-ui/
├── public/
└── src/
    ├── api/
    │   └── client.js               API client + token management
    ├── components/
    │   ├── StatCard.js              Dashboard stat card
    │   ├── StateBadge.js            Coloured state pill
    │   ├── DbTypeBadge.js           DB type indicator
    │   ├── InstanceTable.js         Paginated instance list
    │   ├── EventLog.js              State change timeline
    │   └── CreateInstanceModal.js   Provision form
    └── pages/
        ├── Dashboard.js             Main dashboard
        └── InstanceDetail.js        Single instance view
```

---

## Environment

The UI calls the API Gateway at `http://localhost:8080` (hardcoded in `src/api/client.js`). To point at a different host, update `BASE_URL` in that file.

---

## Future Scope

- Login page with token management
- Stop / Start / Restart / Delete actions per instance
- Real-time updates via WebSocket
- Dark / light theme toggle