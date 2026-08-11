# Schedow - Intelligent Shift Scheduling Platform

## Overview

Schedow is a distributed workforce scheduling and shift marketplace platform designed to solve real-world operational scheduling problems.

The platform enables supervisors to manage student or employee schedules efficiently through intelligent scheduling, availability management, real-time shift coordination, and concurrency-safe workforce operations.

For detailed architecture, system design decisions, workflows, and engineering documentation, refer to the /docs directory in this repository.

* intelligent shift assignment
* availability tracking
* real-time shift marketplaces
* fairness-aware scheduling
* concurrent shift claiming
* live notifications

This project is designed as a backend engineering focused system demonstrating:

* microservices architecture
* distributed systems concepts
* concurrency handling
* event-driven communication
* real-time updates
* scheduling algorithms
* scalable backend design

---

# Core Features

## Authentication & Authorization

* JWT-based authentication
* Role-based access control
* API Gateway security

## Scheduling Engine

* Shift creation
* Availability management
* Conflict detection
* Fair workload distribution
* Scheduling constraint validation

## Shift Marketplace

* Open shift publishing
* Real-time shift claiming
* Shift swaps
* Concurrent claim protection

## Real-Time Communication

* WebSocket live updates
* Instant shift notifications
* Live marketplace synchronization

---

# Architecture

Schedow follows a microservices-based architecture.

## Services

### API Gateway

Handles:

* routing
* JWT validation
* request forwarding

### User Service

Handles:

* authentication
* user profiles
* roles and permissions

### Scheduling Service

Handles:

* schedules
* availability
* scheduling algorithms
* validation rules

### Marketplace Service

Handles:

* open shifts
* shift claims
* shift swaps
* concurrency management

---

# Tech Stack

## Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Cloud Gateway

## Database

* PostgreSQL

## Messaging

* Apache Kafka

## Realtime

* WebSockets

## Infrastructure

* Docker
* Docker Compose

---

# Engineering Concepts Demonstrated

* Microservices architecture
* API Gateway pattern
* Database-per-service design
* Event-driven systems
* Distributed transactions
* Optimistic locking
* Real-time communication
* Scheduling algorithms
* Fairness optimization

---

# Project Goals

The goal of this project is not simply CRUD functionality, but building a production-style backend system that resembles real-world workforce management platforms.

This project is intended to demonstrate:

* backend engineering skills
* system design understanding
* distributed systems concepts
* scalability thinking
* operational problem solving

---

# Status

Currently in active development.


---

## Running Schedow with Docker

Schedow runs from the same Compose file in two modes:

* local development: no DuckDNS, no Caddy, local frontend/API access
* EC2 production: Caddy reverse proxy, `schedowai.duckdns.org`, automatic HTTPS, production CORS, and internal Docker service networking

Full deployment details are in [docs/deployment.md](docs/deployment.md).

### Local Development

Create a local env file and set `GEMINI_API_KEY`:

```bash
cp .env.dev.example .env.dev
docker compose --env-file .env.dev up --build
```

On Windows PowerShell:

```powershell
Copy-Item .env.dev.example .env.dev
docker compose --env-file .env.dev up --build
```

Local URLs:

* Frontend: `http://localhost:3000`
* Gateway API: `http://localhost:8088`
* Gateway health: `http://localhost:8088/actuator/health`
* Users DB: `localhost:5432`
* Schedule DB: `localhost:5433`

### EC2 Production

On EC2, make sure `schedowai.duckdns.org` points to the instance public IPv4 address and the security group allows inbound TCP `80` and `443`.

Create the production env file and replace secret placeholders:

```bash
cp .env.prod.example .env.prod
```

Deploy with:

```bash
docker compose --env-file .env.prod --profile production up -d --build
```

Production URL:

* `https://schedowai.duckdns.org`

Useful checks:

```bash
docker compose --env-file .env.prod --profile production config
docker compose --env-file .env.prod --profile production ps
docker compose --env-file .env.prod --profile production logs -f caddy
```

### Service Overview

* `caddy` is enabled only with the `production` profile and routes public HTTPS traffic.
* `frontend` builds the Vite app with `VITE_API_BASE_URL=/` and serves it with nginx.
* `gateway-service` routes `/api/v1/users/**`, `/api/v1/schedules/**`, and `/api/v1/ai/**`.
* `user-service` uses `postgres-users`.
* `schedule-service` uses `postgres-schedule`.
* `ai-service` receives chat requests through the gateway and calls Gemini with `GEMINI_API_KEY`.

PostgreSQL is bound to localhost on the host and persists data in named Docker volumes. In production, `FRONTEND_HOST_BIND` and `GATEWAY_HOST_BIND` should stay set to `127.0.0.1` so Caddy is the only public web entry point.

### Stop and Rebuild

```bash
docker compose --env-file .env.dev down
docker compose --env-file .env.dev build --no-cache
docker compose --env-file .env.dev up
```

To remove persisted database data during local development:

```bash
docker compose --env-file .env.dev down -v
```

### Required Secrets

Set these manually in `.env.prod`:

* `GEMINI_API_KEY`
* `POSTGRES_PASSWORD`
* `USER_SERVICE_DB_PASSWORD`
* `SCHEDULE_SERVICE_DB_PASSWORD`

Do not commit `.env`, `.env.dev`, `.env.prod`, or frontend-local env files.

### Troubleshooting

* If the AI service is unhealthy or Compose reports `Set GEMINI_API_KEY`, add a real Gemini API key to your env file.
* If backend services cannot connect to PostgreSQL, check `docker compose ps` and confirm both database health checks are passing.
* If the frontend loads but API calls fail, confirm `VITE_API_BASE_URL=/` and that `gateway-service` is healthy.
* If production browser calls fail with CORS errors, confirm `FRONTEND_PRODUCTION_ORIGIN=https://schedowai.duckdns.org` is present in `.env.prod`.
* If Caddy cannot obtain a certificate, confirm DuckDNS resolves to the EC2 public IP and ports `80` and `443` are open.
