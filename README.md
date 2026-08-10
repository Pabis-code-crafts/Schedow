# Schedow Ã¢â‚¬â€ Intelligent Shift Scheduling Platform

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

### Prerequisites

* Docker Desktop or Docker Engine with Docker Compose v2
* A Gemini API key for the AI service
* Ports `3000`, `8088`, `5432`, and `5433` available on your machine, or override the host ports in `.env`

### Environment setup

Create a root `.env` file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set `GEMINI_API_KEY`. The example file contains safe placeholders only; do not commit real secrets.

### Build and run

From the repository root:

```bash
docker compose up --build
```

This starts the frontend, gateway, user service, schedule service, AI service, and two PostgreSQL databases.

### URLs

* Frontend: http://localhost:3000
* Gateway API: http://localhost:8088
* Gateway health: http://localhost:8088/actuator/health
* User service, schedule service, and AI service are internal Docker services and are not exposed directly to the host.
* PostgreSQL is bound to localhost for development only:
  * Users DB: `localhost:5432`
  * Schedule DB: `localhost:5433`

### Service overview

* `frontend` builds the Vite app and serves it with nginx. Browser API calls go to `/api`, which nginx proxies to the gateway.
* `gateway-service` is the main backend entry point and routes `/api/v1/users/**`, `/api/v1/schedules/**`, and `/api/v1/ai/**`.
* `user-service` uses `postgres-users`.
* `schedule-service` uses `postgres-schedule`.
* `ai-service` receives AI chat requests through the gateway and calls the schedule service through the Docker network.

### Architecture

```text
Frontend
   |
   v
Gateway
   |
   v
User Service
Schedule Service
AI Service
   |
   v
Database
```

### Stop the application

```bash
docker compose down
```

To stop and remove persisted database volumes:

```bash
docker compose down -v
```

### Rebuild

```bash
docker compose build --no-cache
docker compose up
```

### Database persistence

Docker Compose creates two named volumes:

* `postgres_users_data`
* `postgres_schedule_data`

Data survives normal `docker compose down` runs. Use `docker compose down -v` only when you want a clean database reset.

### Local development outside Docker

The existing local defaults are preserved:

* User service expects `jdbc:postgresql://localhost:5432/users_db`
* Schedule service expects `jdbc:postgresql://localhost:5433/schedule_db`
* Gateway expects services on `localhost:8082`, `localhost:8084`, and `localhost:8066`
* Frontend development can continue with Vite on `5173`

You can run only the database containers for local backend development:

```bash
docker compose up postgres-users postgres-schedule
```

### Single-container deployment strategy

Some free-tier hosts accept only one web container and do not run Docker Compose. The root `Dockerfile` builds one image containing the frontend nginx server plus the gateway, user service, schedule service, and AI service.

That mode should use managed or external PostgreSQL databases. Set these environment variables on the host:

* `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` for services that share the host-level names
* Prefer service-specific database variables if your platform supports them: `USER_SERVICE_DB_URL`, `SCHEDULE_SERVICE_DB_URL`, and matching usernames/passwords
* `GEMINI_API_KEY`
* `SCHEDULE_SERVICE_BASE_URL=http://localhost:8084/api/v1/schedules`
* `USER_SERVICE_URL=http://localhost:8082`
* `SCHEDULE_SERVICE_URL=http://localhost:8084`
* `AI_SERVICE_URL=http://localhost:8066`
* `VITE_API_BASE_URL=/`

Build it with:

```bash
docker build -t schedow-all-in-one .
```

Run it with your real environment variables and expose port `80` from the container.

### Troubleshooting

* If the AI service is unhealthy or Compose reports `Set GEMINI_API_KEY`, add a real Gemini API key to the root `.env` file. The AI service cannot start without it because Spring AI creates the Gemini client during application startup.
* If backend services cannot connect to PostgreSQL, check `docker compose ps` and confirm both database health checks are passing.
* If the frontend loads but API calls fail, confirm `VITE_API_BASE_URL=/` and that the `gateway-service` container is healthy.
* If a port is already in use, override `FRONTEND_PORT`, `GATEWAY_PORT`, `USER_DB_PORT`, or `SCHEDULE_DB_PORT` in `.env`. `GATEWAY_PORT` is the host port; the gateway still listens on `8088` inside Docker.
* If you need a clean database, run `docker compose down -v` and then `docker compose up --build`.
