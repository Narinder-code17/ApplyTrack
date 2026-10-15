# ApplyTrack — Intelligent Job Management System

ApplyTrack is a full-stack web application designed to help users organize job applications and track their recruitment progress in one place. It provides a centralized dashboard for managing applications, interviews, assessments, tasks, reminders, resume tools, and job-search insights.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Project Structure](#project-structure)
6. [Installation and Setup](#installation-and-setup)
7. [API Endpoints](#api-endpoints)
8. [Verification and Testing](#verification-and-testing)
9. [Security](#security)
10. [Future Enhancements](#future-enhancements)
11. [Conclusion](#conclusion)

## 1. Overview

ApplyTrack helps users manage their job-search activities efficiently by keeping application details and recruitment progress organized in a single system.

The application uses a React frontend, a Java Spring Boot backend, and a PostgreSQL database. Docker Compose is used to run the frontend, backend, and database as separate services.

### Project Objectives

- Centralize job application records.
- Track application status and recruitment progress.
- Organize interviews, assessments, and tasks.
- Display job-search statistics through a dashboard.
- Provide authentication and password-reset functionality.
- Support resume-related tools and smart insights.
- Simplify local deployment through Docker Compose.

## 2. Features

### Dashboard

- Total application, interview, assessment, and offer statistics.
- Application pipeline with recruitment status.
- Upcoming interview and assessment reminders.
- Smart insights and latest application records.
- Responsive layout for desktop and mobile screens.

### Job Application Management

- View job application records.
- Track companies, job roles, application sources, and statuses.
- Update application status.
- Monitor applications through different recruitment stages.

### Interview and Assessment Management

- Associate interviews with job applications.
- Create and view interview records.
- Create, view, update, and delete assessment records.
- Track recruitment activities associated with applications.

### Task Management

- Create and view tasks.
- Update task details.
- Toggle task completion.
- Delete tasks when they are no longer needed.

### Authentication

- User registration.
- User login.
- Forgot-password workflow.
- Password-reset workflow.

### Resume Tools and Smart Insights

- Resume parsing endpoint.
- Resume matching endpoint.
- Smart insights endpoint for job-search information.

### Responsive Navigation

- Desktop sidebar navigation.
- Mobile navigation menu.
- Navigation between dashboard modules.

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Frontend Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Java 21, Spring Boot |
| Data Access | Spring Data JPA, Hibernate |
| Authentication | Spring Security |
| Database | PostgreSQL 18 |
| Web Server | Nginx |
| Containerization | Docker |
| Multi-container Management | Docker Compose |
| Build Tools | npm and Maven |

## 4. System Architecture

The application follows a frontend-backend-database architecture.

```text
                    User Browser
                         |
                         v
                React Frontend
                  Nginx Server
                localhost:5173
                         |
                         v
                Spring Boot API
                localhost:8082
               Container Port 8081
                         |
                         v
                  PostgreSQL
                Host Port 5433
             Container Port 5432
```

### Architecture Components

**Frontend:** Provides the user interface for the dashboard, applications, interviews, assessments, tasks, insights, and resume tools.

**Backend:** Provides REST API endpoints and handles application logic, authentication, and database operations.

**Database:** Stores application data in PostgreSQL.

**Docker Compose:** Coordinates the frontend, backend, and database containers.

Inside the Docker Compose network, the backend connects to PostgreSQL using the service hostname `db` and container port `5432`.

## 5. Project Structure

```text
ApplyTrack/
├── backend/
│   ├── src/
│   │   └── main/
│   │       └── java/
│   │           └── com/
│   │               └── applytrack/
│   │                   └── controller/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── backups/
├── docker-compose.yml
├── project-structure.txt
├── .gitignore
├── .env
└── README.md
```

This is a simplified overview of the project. Refer to the actual source directories for the complete structure.

## 6. Installation and Setup

### Prerequisites

- Docker Desktop or Docker Engine.
- Docker Compose.
- Project source code.
- A privately configured `.env` file containing the environment variables required by the application.

### Step 1: Open the Project Directory

Open PowerShell in the ApplyTrack project root.

### Step 2: Start the Application

Run:

```powershell
docker compose up -d
```

### Step 3: Verify the Containers

Run:

```powershell
docker compose ps
```

Confirm that the frontend and backend are running and PostgreSQL is healthy.

### Step 4: Open the Application

Open the frontend in your browser:

http://localhost:5173

The local service ports are:

- Frontend: `5173`
- Backend: `8082`
- PostgreSQL: `5433`

### Viewing Container Logs

Frontend:

```powershell
docker logs --tail 80 applytrack-frontend
```

Backend:

```powershell
docker logs --tail 80 applytrack-backend
```

Database:

```powershell
docker logs --tail 80 applytrack-db
```

### Rebuilding the Frontend

After making frontend source-code changes:

```powershell
docker build -t applytrack-frontend:latest .\frontend
docker compose up -d --no-deps --force-recreate frontend
```

### Rebuilding the Backend

After making backend source-code changes:

```powershell
docker build -t applytrack-backend:latest .\backend
docker compose up -d --no-deps backend
```

**Important:** Do not run `docker compose down -v` if you need to preserve the existing PostgreSQL data. Removing volumes can permanently delete persisted database data.

## 7. API Endpoints

The following endpoints were identified in the project's controller source files.

| Module | Base Route | Operations |
|---|---|---|
| Authentication | `/api/auth` | Register, login, forgot password, reset password |
| Applications | `/api/applications` | Create, list, update application status |
| Application Events | `/api/applications` | Create and list application events |
| Interviews | `/api/applications` | Create, list, update, delete interviews |
| Assessments | `/api/applications` | Create, list, update, delete assessments |
| Companies | `/api/companies` | Create and list companies |
| Dashboard | `/api/dashboard` | Retrieve dashboard data |
| Tasks | `/api/tasks` | Create, list, edit, toggle, delete tasks |
| Resume Tools | `/api/resume` | Resume parsing and matching |
| Smart Insights | `/api/insights` | Retrieve insights |

Refer to the backend controller and request DTO files for exact request bodies, validation rules, and response formats.

## 8. Verification and Testing

The following checks were performed in the local development environment:

- Docker Compose showed the frontend and backend containers running.
- PostgreSQL reported a healthy status.
- Spring Boot started successfully.
- Backend logs confirmed a successful PostgreSQL connection.
- The dashboard displayed the existing SLK and TCS application records.
- Mobile navigation was tested successfully.
- The application pages were checked during final verification.

These results describe the observed local setup. They do not imply that the application has been deployed to a public production server or undergone an independent security audit.

## 9. Security

- Keep `.env` private and never publish real credentials.
- Do not include database backups in a public repository or shared archive unless explicitly required and safely sanitized.
- Exclude `node_modules` and generated build files from source-code submissions when they are not required.
- Use HTTPS for public deployment.
- Store production credentials securely.
- Configure appropriate CORS and allowed origins.
- Update password-reset URLs to use the deployed HTTPS frontend address before public release.
- Review authentication, authorization, and database access settings before exposing the application publicly.

## 10. Future Enhancements

- Deploy the application to a production hosting environment.
- Add automated frontend and backend tests.
- Integrate a CI/CD pipeline.
- Improve monitoring and error reporting.
- Add application export and reporting features.
- Add screenshots demonstrating the main application modules.
- Improve production deployment documentation.

## 11. Conclusion

ApplyTrack provides a centralized platform for managing job applications and recruitment activities. Its React frontend, Spring Boot backend, PostgreSQL database, and Docker Compose architecture provide a foundation for further development and deployment.

The local application environment and mobile navigation have been verified. Before a public release, the project should undergo a final production-configuration and security review.
