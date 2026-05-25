# mern-mysql-hybrid

Hybrid database architecture coding test. Products are stored in MongoDB (schemaless catalog) and Users/Orders are stored in MySQL (relational transactions), with real-time weather analytics.

## Tech Stack
- Frontend: React + Redux Toolkit + CSS (glassmorphism)
- Backend: Express + Mongoose + Sequelize (CommonJS)
- Optimizations & Security: Cluster, Helmet, Compression, Winston, rate limiter, Docker Compose

## Quick Start

### 1. Run Databases (Docker Compose)
Starts local MongoDB (27017) and MySQL (3306):
```bash
docker-compose up -d
```

- **MySQL:** localhost:3306 (DB name: `interview_db`, user: `root`, password: `rootpassword`)
- **MongoDB:** localhost:27017

### 2. Backend Server
Create `backend/.env` (or use defaults):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/interview_db
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=rootpassword
MYSQL_DATABASE=interview_db
JWT_SECRET=supersecretkey_interview
```

Run:
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend App
Run:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000`.

