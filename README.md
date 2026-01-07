# Timesheet Master - Setup & Run

## 1. Setup Database
Run this command once (or whenever you change `schema.sql`) to create the tables locally:

```bash
npm run db:setup
```

## 2. Start Development Environment
You need to run **two separate terminals** in parallel.

**Terminal 1 (Backend/Database):**
```bash
npm run dev:backend
```
*This starts the API on port 8788.*

**Terminal 2 (Frontend):**
```bash
npm run dev:frontend
```
*This starts React on port 5173 (which proxies /api to port 8788).*

## 3. Access the App
Open your browser at: **http://localhost:5173**
# Deploy trigger
