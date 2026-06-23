# StudyFlow Frontend

![Frontend CI](https://github.com/Snufkin4U/studyflow-frontend/actions/workflows/ci.yml/badge.svg)

StudyFlow Frontend is a React/Vite application for managing academic courses, study tasks, progress tracking and academic workload planning.

The project is part of a full-stack portfolio application built with a Spring Boot backend and a React frontend.

---

## Live Demo

Frontend:

```text
https://studyflow-frontend-rust.vercel.app
```

Backend API:

```text
https://studyflow-production-1e15.up.railway.app
```

Swagger API Documentation:

```text
https://studyflow-production-1e15.up.railway.app/swagger-ui.html
```

Example API endpoints:

```text
https://studyflow-production-1e15.up.railway.app/api/courses
https://studyflow-production-1e15.up.railway.app/api/tasks
https://studyflow-production-1e15.up.railway.app/api/dashboard/summary
```

---

## Project Overview

StudyFlow helps students organize their academic workload in one modern dashboard.

The frontend allows users to manage courses and tasks, track course progress, filter and sort tasks, view smart task insights, and monitor study workload through a responsive UI.

---

## Technologies Used

* React
* Vite
* JavaScript
* CSS
* Fetch API
* Vercel
* GitHub Actions CI

---

## Main Features

* Live dashboard summary with total courses, total tasks, open tasks and open study hours
* Course progress tracking with completion percentage and remaining estimated hours
* Full Course CRUD from the UI:

    * Create course
    * View courses
    * Edit course
    * Delete course
* Full Task CRUD from the UI:

    * Create task
    * View tasks
    * Edit task
    * Mark task as done
    * Delete task
* Task filtering by:

    * Search text
    * Status
    * Course
* Task sorting by:

    * Deadline
    * Priority
    * Estimated hours
    * Title
* Sort direction control:

    * Ascending
    * Descending
* Task pagination controls
* Smart Insights section:

    * Recommended task
    * Due soon task
    * Overdue task
* Status, priority and due date badges
* Polished empty states
* Loading states for dashboard, tasks and insights
* Success and error messages
* Responsive glassmorphism UI
* Portfolio links to GitHub, Swagger and Live API
* Professional footer with technology stack

---

## Dashboard Summary

The top dashboard cards display:

* Total courses
* Total tasks
* Open tasks
* Total estimated study hours for open tasks

Data is loaded from:

```http
GET /api/dashboard/summary
```

---

## Course Progress

The Course Progress section displays progress for each course.

Each course card includes:

* Total tasks
* Open tasks
* Done tasks
* Remaining estimated hours
* Completion percentage
* Visual progress bar

Data is loaded from:

```http
GET /api/dashboard/courses
```

---

## Course Management

Users can fully manage academic courses from the UI.

Course fields:

* Course name
* Semester
* Difficulty

Supported actions:

```http
GET    /api/courses
POST   /api/courses
PUT    /api/courses/{id}
DELETE /api/courses/{id}
```

After creating, editing or deleting a course, the dashboard, course list, course progress and task-related data are refreshed.

---

## Task Management

Users can fully manage academic tasks from the UI.

Task fields:

* Title
* Description
* Deadline
* Estimated hours
* Priority
* Status
* Course

Supported actions:

```http
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/{id}
PUT    /api/tasks/{id}/status?status=DONE
DELETE /api/tasks/{id}
```

After creating, editing, completing or deleting a task, the dashboard, course progress, task list and smart insights are refreshed.

---

## Task Search, Filter, Sort and Pagination

The frontend supports task search, filtering, sorting and pagination through the backend API.

Users can:

* Search tasks by text
* Filter tasks by status
* Filter tasks by course
* Sort tasks by deadline
* Sort tasks by priority
* Sort tasks by estimated hours
* Sort tasks by title
* Change sort direction
* Navigate between pages
* Change page size

Data is loaded from:

```http
GET /api/tasks
```

Example request:

```http
GET /api/tasks?status=TODO&courseId=1&search=exam&sortBy=deadline&direction=asc&page=0&size=10
```

---

## Smart Insights

The Smart Insights section highlights important tasks from the backend.

It displays:

* Recommended task
* Due soon task
* Overdue task

Data is loaded from:

```http
GET /api/tasks/recommended
GET /api/tasks/due-soon?days=7
GET /api/tasks/overdue
```

---

## UI and User Experience

The frontend includes several UI improvements:

* Modern glassmorphism layout
* Responsive design for desktop and mobile
* Hero section with project badges
* Project links section
* Smart insights cards
* Status badges
* Priority badges
* Due date badges
* Polished empty states
* Professional footer with technology stack
* Clear loading, success and error states

---

## Backend Dependency

This frontend communicates with the StudyFlow backend.

Backend repository:

```text
https://github.com/Snufkin4U/studyflow
```

Backend production URL:

```text
https://studyflow-production-1e15.up.railway.app
```

Backend local URL:

```text
http://localhost:8080
```

The frontend uses an environment-based API URL:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
```

For local development with the production backend, create a `.env` file:

```env
VITE_API_BASE_URL=https://studyflow-production-1e15.up.railway.app/api
```

For local development with a local backend, no `.env` file is required as long as the backend runs on:

```text
http://localhost:8080
```

---

## Running Locally

Clone the repository:

```bash
git clone https://github.com/Snufkin4U/studyflow-frontend.git
```

Enter the project folder:

```bash
cd studyflow-frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

On Windows PowerShell:

```powershell
npm.cmd run dev
```

The application usually runs on:

```text
http://localhost:5173
```

If port `5173` is already in use, Vite may use another port such as:

```text
http://localhost:5174
http://localhost:5175
```

---

## Available Scripts

### Start development server

```bash
npm run dev
```

### Build production version

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

## GitHub Actions CI

This repository includes a GitHub Actions workflow that runs automatically on push and pull request.

The CI pipeline runs:

* `npm ci`
* `npm run build`

This verifies that the frontend builds successfully after each change.

---

## Deployment

The frontend is deployed on Vercel.

Production frontend:

```text
https://studyflow-frontend-rust.vercel.app
```

The production frontend connects to the Railway backend using:

```env
VITE_API_BASE_URL=https://studyflow-production-1e15.up.railway.app/api
```

---

## Related Repository

Backend repository:

```text
https://github.com/Snufkin4U/studyflow
```

---

## Current Project Status

Completed frontend features:

* Dashboard summary cards
* Course progress cards
* Progress bar per course
* Full Course CRUD
* Full Task CRUD
* Task search
* Task status filter
* Task course filter
* Task sorting
* Task pagination
* Smart Insights section
* Status badges
* Priority badges
* Due date badges
* Loading states
* Success and error messages
* Polished empty states
* Responsive glassmorphism UI
* Project links
* Professional footer
* GitHub Actions CI
* Vercel deployment

---

## Future Improvements

Possible future improvements:

* Authentication and user accounts
* Dark/light theme toggle
* Task categories or labels
* Calendar view for deadlines
* Drag-and-drop task board
* Better analytics charts
* Export tasks to CSV
* Custom domain
* End-to-end tests

---

## Author

Maor Cohen

GitHub:

```text
https://github.com/Snufkin4U
```
