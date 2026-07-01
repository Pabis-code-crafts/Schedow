# Schedule Service

## Overview

Schedule Service is the core workforce scheduling component of Schedow, responsible for managing weekly rota generation, shift assignments, reusable shift structures, and future recommendation-driven scheduling workflows. The service is designed to support operationally complex scheduling environments where staff availability, workload balancing, replacements, and dynamic weekly changes must be handled efficiently.

The project was inspired by real operational scheduling challenges faced while managing part-time student staff, where balancing fairness, availability, academic commitments, and last-minute shift changes became difficult using manual scheduling processes.

---

## Technologies Used

* Java
* Spring Boot
* PostgreSQL
* REST APIs
* Docker
* Microservices Architecture
* Distributed Systems Design

---

## Current Features

* Reusable shift definitions
* Weekly shift assignment management
* Week-based rota retrieval
* Flexible override and replacement handling
* Dynamic assignment APIs
* Distributed service-ready architecture

---

## Recommendation Engine (In Progress)

The service is being designed around a recommendation-driven scheduling model rather than rigid automatic scheduling.

The planned recommendation engine will generate intelligent shift suggestions using:

* Unavailability filtering
* Shift conflict detection
* Last 2-week workload averaging
* Preferred weekly working hours
* Weekend workload balancing
* Fairness-aware ranking logic
* Constraint-based workforce optimization

The goal is to assist managers with operationally intelligent scheduling recommendations while maintaining human oversight and flexibility.

---

## Planned Future Features

* Availability and leave management
* AI/LLM-assisted scheduling workflows
* Natural language schedule operations
* Intelligent replacement recommendations
* Predictive staffing insights
* Automated conflict detection
* Notification and reminder integrations

---

## Author

Pavithran Gurusamy
