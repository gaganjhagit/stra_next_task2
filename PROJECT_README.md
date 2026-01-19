# School Management Portal - JavaScript Version

A full-featured School Management System built with **Next.js 14**, **React 18**, **MySQL**, and **JavaScript** (no TypeScript).

## ✅ Features Implemented

### 👨‍🎓 Student Features
- ✅ **Dashboard** - View stats, grades, attendance, timetable
- ✅ **View Grades** - See all grades by subject
- ✅ **Attendance History** - Track attendance records
- ✅ **Timetable** - View class schedule
- ✅ **Report Card** - Download PDF report cards

### 👩‍🏫 Teacher Features
- ✅ **Dashboard** - Overview of classes and students
- ✅ **Mark Attendance** - Record student attendance
- ✅ **Upload Grades** - Enter student grades
- ✅ **Class Analytics** - View class performance metrics

### 👩‍💼 Admin Features
- ✅ **Dashboard** - System overview and statistics
- ✅ **User Management** - Add, edit, delete users
- ✅ **Bulk Upload** - Import users via CSV
- ✅ **Role-Based Access** - Restrict access by role

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **MySQL Server** (MariaDB also works)
- **Git** (optional)

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Database**
Create a `.env.local` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=school_management
JWT_SECRET=your-secret-key
NODE_ENV=development
```

3. **Setup Database**
```bash
npm run setup-db
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Access Application**
Open http://localhost:3000 in your browser

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | password123 |
| Teacher | teacher1@school.com | password123 |
| Student | student1@school.com | password123 |
| Test User | test@school.com | password123 |

## 📁 Project Structure

```
school_management/
├── app/
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── student/      # Student APIs
│   │   ├── teacher/      # Teacher APIs
│   │   └── admin/        # Admin APIs
│   ├── admin/            # Admin pages
│   ├── student/          # Student pages
│   ├── teacher/          # Teacher pages
│   ├── login/            # Login page
│   ├── layout.jsx        # Root layout
│   ├── page.jsx          # Home page
│   └── globals.css       # Global styles
├── components/           # Reusable components
├── lib/
│   ├── auth.js          # Authentication utilities
│   └── db.js            # Database connection
├── database/
│   └── schema.sql       # Database schema
├── scripts/
│   └── setup-database.js # Database setup script
├── public/              # Static files
├── .env.local          # Environment variables
├── jsconfig.json       # JavaScript config
├── next.config.js      # Next.js config
├── package.json        # Dependencies
├── postcss.config.js   # PostCSS config
├── tailwind.config.js  # Tailwind CSS config
└── middleware.js       # Authentication middleware
```

## 🗄️ Database Schema

### Tables
- **users** - Student, teacher, admin accounts
- **classes** - Class definitions
- **subjects** - Subject definitions
- **enrollments** - Student-class enrollments
- **timetable** - Class schedule
- **grades** - Student grades
- **attendance** - Attendance records

## 🔑 Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Middleware for protected routes
- Secure cookie management

### Database
- MySQL with connection pooling
- Prepared statements for SQL injection prevention
- Automatic schema setup

### Security
- Password hashing with bcryptjs
- HTTP-only secure cookies
- Environment variable configuration
- Input validation

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Student APIs
- `GET /api/student/report-card` - Download PDF report card

### Teacher APIs
- `POST /api/teacher/mark-attendance` - Mark student attendance
- `POST /api/teacher/upload-grade` - Upload grades

### Admin APIs
- `POST /api/admin/users` - Manage users
- `POST /api/admin/bulk-upload` - Bulk import users

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Setup/reset database
npm run setup-db
```

## 🎨 Technology Stack

- **Frontend**: React 18, Tailwind CSS
- **Backend**: Next.js 14 App Router, Node.js
- **Database**: MySQL / MariaDB
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **PDF Generation**: jsPDF
- **Charts**: Recharts
- **Language**: JavaScript (no TypeScript)

## 📝 Migration from TypeScript

This project has been completely migrated from TypeScript to JavaScript:
- ✅ Removed `tsconfig.json` 
- ✅ Added `jsconfig.json` for path aliases
- ✅ Removed all `*.ts` and `*.tsx` files
- ✅ Created equivalent `*.js` and `*.jsx` files
- ✅ Removed TypeScript-related dependencies
- ✅ Cleaned up type annotations

## 🐛 Troubleshooting

### Database Connection Error
- Ensure MySQL/MariaDB is running
- Check `.env.local` credentials
- Verify database exists: `npm run setup-db`

### Login Issues
- Clear browser cookies and cache
- Verify user exists: Check `users` table in MySQL
- Check password hash is correct

### Port Already in Use
```bash
# Change port
npm run dev -- -p 3001
```

## 📦 Dependencies

### Production
- next@14.0.4
- react@18.2.0
- react-dom@18.2.0
- mysql2@3.6.5
- bcryptjs@2.4.3
- jsonwebtoken@9.0.2
- jspdf@2.5.1
- papaparse@5.4.1
- recharts@2.10.3

### Development
- tailwindcss@3.4.0
- postcss@8.4.32
- autoprefixer@10.4.16

## 📄 License

This project is provided as-is for educational purposes.

## 🤝 Support

For issues or questions, please check:
1. Database connection and credentials
2. MySQL/MariaDB is running
3. Environment variables in `.env.local`
4. Browser console for errors
5. Server logs in terminal

---

**Last Updated**: January 18, 2026
**Status**: ✅ Fully Functional JavaScript Version
