# School Management Portal

A comprehensive School Management System built with Next.js App Router, featuring role-based access for Students, Teachers, and Admins.

## Features

### 👨‍🎓 Student
- View timetable (SSR)
- View grades (SSG + ISR)
- Download report cards (PDF generation)
- Attendance history (server component)

### 👩‍🏫 Teacher
- Upload grades (Server Actions)
- Mark attendance (Optimistic UI)
- View class analytics (Charts via Client Component)

### 👩‍💼 Admin
- Manage users (students/teachers)
- Role-based access (Middleware)
- Bulk upload via CSV

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **PDF:** jsPDF
- **CSV:** PapaParse

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd school_management
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your MySQL credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_management
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### 3. Set Up Database

**Option A: Using the setup script (Recommended)**

```bash
npm run setup-db
```

This will automatically:
- Create the database
- Import the schema
- Set up all tables and sample data

**Option B: Manual setup**

```bash
mysql -u root -p < database/schema.sql
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access the Application

Open http://localhost:3000 in your browser.

**Default Login Credentials:**
- **Admin:** `admin@school.com` / `password123`
- **Teacher:** `teacher1@school.com` / `password123`
- **Student:** `student1@school.com` / `password123`

## Database Schema

The system uses MySQL with tables for:
- Users (students, teachers, admins)
- Classes
- Subjects
- Timetables
- Grades
- Attendance
- Enrollments

## Features Implementation Details

### Next.js Features Used:
- **SSR (Server-Side Rendering):** Student timetable page
- **SSG + ISR (Static Site Generation + Incremental Static Regeneration):** Student grades page (revalidates every hour)
- **Server Components:** Student attendance history
- **Server Actions:** Teacher grade upload
- **Optimistic UI:** Teacher attendance marking
- **Client Components:** Teacher analytics with charts
- **Middleware:** Role-based route protection
- **API Routes:** Authentication, data operations, PDF generation

### Security:
- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Middleware route protection
- SQL injection protection via parameterized queries

## Project Structure

```
school_management/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── student/           # Student pages
│   ├── teacher/           # Teacher pages
│   ├── admin/             # Admin pages
│   └── login/             # Login page
├── components/            # React components
├── lib/                   # Utilities (db, auth)
├── database/              # Database schema
├── scripts/               # Setup scripts
└── middleware.ts          # Route protection
```

