#  Task Queue System

A NestJS-based API for task management using MongoDB, Bull (Redis) for job queues.

---

## 🚀 Features

-  Create and queue tasks (e.g., "Send an email")
-  Retrieve task details by ID
-  Background worker using Bull for async task processing
-  WebSocket support to get real-time task status updates
-  Automatic retry and rate limiting for background jobs
-  Task priority support (e.g., high-priority tasks are processed earlier)
-  RESTful APIs with input validation
-  Unit tests for service methods

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/chris-121/task_management_system-.git
cd task_management_system-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure .env
```bash
MONGODB_URI=mongodb+srv://testing123:Test123456@cluster0.cnvs8vb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=3000
```

## 💻 Running the App

### Start API Server
```bash
npm run start:dev
```

## ⚙️ Worker Implementation
We use Bull with Redis to queue background jobs.

### Why Bull?

- 🔁 **Automatic Retries**: Failed jobs can be retried based on configuration.
- 📊 **Rate Limiting**: Allows setting max jobs per unit time (e.g., max X tasks per minute).
- 📥 **Persistence**: Jobs are stored in Redis, surviving restarts and crashes.

### How it works:

1. When a task is created via the API, it's immediately enqueued in the `task-queue`.
3. Jobs are processed asynchronously — ideal for tasks like sending emails, generating reports, etc.

All logic is in task.processor.ts

## 🔌 WebSocket Integration

The app supports **real-time task updates** via WebSockets.

### ✅ What It Does

- Clients can subscribe to task updates using WebSocket connections.(ws://localhost:3000 or wss://taskmanagementsystem-production-8609.up.railway.app)
- As a task progresses (e.g., pending, processing, completed, failed), updates are emitted to the subscribed clients.
- Enables seamless real-time updates to clients.


## 🧪 Run Tests
```bash
npm run test
```

## 📘 Swagger API Documentation

This project includes interactive API documentation using [Swagger](https://swagger.io/).

### 🔗 Access

Once the app is running, you can access the Swagger UI at: http://localhost:3000/api or https://taskmanagementsystem-production-8609.up.railway.app/api

