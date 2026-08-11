# Schedow Deployment

This repository supports two Docker Compose modes from the same source tree:

* local development without DuckDNS or Caddy
* EC2 production with Caddy, DuckDNS, automatic HTTPS, and internal Docker service networking

Do not commit real `.env` files or secrets.

## Local Development

Create a local environment file:

```bash
cp .env.dev.example .env.dev
```

On Windows PowerShell:

```powershell
Copy-Item .env.dev.example .env.dev
```

Set `GEMINI_API_KEY` in `.env.dev`, then run:

```bash
docker compose --env-file .env.dev up --build
```

Local URLs:

* Frontend: `http://localhost:3000`
* Gateway API: `http://localhost:8088`
* Gateway health: `http://localhost:8088/actuator/health`
* Users PostgreSQL: `localhost:5432`
* Schedule PostgreSQL: `localhost:5433`

Caddy and DuckDNS are not required for local development. The frontend container serves the Vite build with nginx and proxies `/api/*` to `gateway-service:8088` on the Docker network.

## EC2 Production

Prerequisites:

* Docker Engine and Docker Compose v2 installed
* EC2 security group allows inbound TCP `80` and `443`
* SSH port `22` restricted to administrator IPs where possible
* `schedowai.duckdns.org` points to the EC2 public IPv4 address

Create the production environment file on EC2:

```bash
cp .env.prod.example .env.prod
```

Edit `.env.prod` and replace all secret placeholders. Then deploy:

```bash
docker compose --env-file .env.prod --profile production up -d --build
```

Useful verification commands:

```bash
docker compose --env-file .env.prod --profile production config
docker compose --env-file .env.prod --profile production ps
docker compose --env-file .env.prod --profile production logs -f caddy
docker compose --env-file .env.prod --profile production logs -f gateway-service
docker compose --env-file .env.prod --profile production logs -f ai-service
```

Production public URL:

* `https://schedowai.duckdns.org`

Production routing:

```text
Browser
  -> https://schedowai.duckdns.org
  -> Caddy
  -> /api/* to gateway-service:8088
  -> everything else to frontend:80
```

The gateway uses Docker service names for internal routing:

* `http://user-service:8082`
* `http://schedule-service:8084`
* `http://ai-service:8066`

PostgreSQL is not publicly exposed. In production `.env.prod`, `FRONTEND_HOST_BIND` and `GATEWAY_HOST_BIND` are set to `127.0.0.1`, and the database ports are already bound to `127.0.0.1` in Compose.

## Required Secrets

Set these manually in `.env.prod`:

* `GEMINI_API_KEY`
* `POSTGRES_PASSWORD`
* `USER_SERVICE_DB_PASSWORD`
* `SCHEDULE_SERVICE_DB_PASSWORD`

Use the same PostgreSQL password values where appropriate unless you intentionally split credentials and update the database/user configuration to match.

## Production Checklist

* `schedowai.duckdns.org` resolves to the EC2 public IP
* Caddy starts and obtains a Let's Encrypt certificate
* `https://schedowai.duckdns.org` loads the frontend
* `/api/*` reaches the gateway
* `POST /api/v1/ai/chat` reaches the AI service and Gemini
* Gateway CORS allows `https://schedowai.duckdns.org`
* PostgreSQL containers are healthy and named volumes persist data
