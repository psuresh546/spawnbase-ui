# SpawnBase UI

**React admin dashboard for the SpawnBase database provisioning platform**

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Router](https://img.shields.io/badge/Router-React%20Router%20v6-informational)](https://reactrouter.com/)
[![HTTP](https://img.shields.io/badge/HTTP-Axios-purple)](https://axios-http.com/)
[![Served](https://img.shields.io/badge/Served-nginx%3Aalpine-lightgrey)](https://nginx.org/)

> ⚠️ Educational project. Not intended for production use.

SpawnBase UI is the admin frontend for [SpawnBase](https://github.com/psuresh546/spawnbase). It gives developers a dashboard to provision database containers, inspect instance state, retrieve encrypted connection credentials, and trigger lifecycle operations — all backed by the SpawnBase microservices API.

## Table of Contents

- [Why SpawnBase UI](#why-spawnbase-ui)
- [Backend Repository](#backend-repository)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Connection String Format](#connection-string-format)
- [Project Structure](#project-structure)
- [Future Scope](#future-scope)

---

## Why SpawnBase UI

Rather than expose raw API endpoints and leave the developer to `curl` their way through provisioning, SpawnBase UI gives a single place to:

- Watch a container move through its lifecycle states in real time
- Read masked credentials with one-click reveal and copy
- Trigger operations like Stop, Start, Restart, and Recover with confirmation guards
- See a live breakdown of instance counts by state and database type

Auto-refresh every 10 seconds means the dashboard stays current without a page reload.

---

## Backend Repository

Start the backend before running the UI: [spawnbase](https://github.com/psuresh546/spawnbase)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (Create React App) |
| HTTP client | Axios |
| Routing | React Router v6 |
| Served in Docker | nginx:alpine |

---

## Features

- Login with JWT token via the dev auth endpoint
- Dashboard with stat cards — total, running, provisioning, stopped counts
- DB type breakdown — PostgreSQL, MySQL, MongoDB instance counts
- Instance list with state badges, DB type badges, port, and owner
- Create instance modal — name, DB type, owner, database name, username, password
- Instance detail — state timeline, event log, and connection strings
- Operations — Stop, Start, Restart, Delete (with confirmation dialog), Recover
- Credentials panel — masked password with show/hide/copy, `psql`/`mysql`/`mongosh` CLI strings, JDBC URL
- Auto-refresh every 10 seconds
- Sign out button on all pages

---

## Getting Started

### Prerequisites

- Node 20+
- SpawnBase backend running on port 8080

### Development server

```bash
npm install
npm start
# Opens http://localhost:3000
```

### Docker (via spawnbase compose)

```bash
# From the spawnbase/ directory (sibling of spawnbase-ui/)
docker-compose build spawnbase-ui
docker-compose up -d spawnbase-ui
```

---

## Connection String Format

**PostgreSQL**
```bash
psql -h localhost -p <hostPort> -U <username> -d <dbName>
```

**MySQL**
```bash
mysql -h 127.0.0.1 -P <hostPort> -u <username> -p<password> <dbName>
```

**MongoDB**
```bash
mongosh "mongodb://<username>:<url-encoded-password>@localhost:<hostPort>/<dbName>"
```

> Note: URL-encode special characters in passwords — `@` → `%40`, `#` → `%23`.

---

## Project Structure

```
spawnbase-ui/
└── src/
    ├── api/
    │   └── client.js              API client + token management
    ├── components/
    │   ├── StatCard.js
    │   ├── StateBadge.js
    │   ├── DbTypeBadge.js
    │   ├── InstanceTable.js
    │   ├── EventLog.js
    │   └── CreateInstanceModal.js
    └── pages/
        ├── Login.js
        ├── Dashboard.js
        └── InstanceDetail.js
```

### Directory Guide

#### `src/api/`

Axios client with base URL configuration and JWT token injection. Token management utilities live here so all HTTP calls go through one consistent layer.

#### `src/components/`

Reusable UI pieces: stat cards for the dashboard summary, colored state and DB type badges, the instance table, the event log timeline, and the create instance modal with its form fields.

#### `src/pages/`

Top-level route components. `Login.js` handles token acquisition. `Dashboard.js` renders the summary cards and instance table with auto-refresh. `InstanceDetail.js` shows the state timeline, event log, operations panel, and credentials panel for a single instance.

---

## Future Scope

- Real-time updates via WebSocket
- Dark/light theme toggle
- Bulk operations (delete all failed, stop all)
- Instance search and advanced filtering
- Usage metrics per instance