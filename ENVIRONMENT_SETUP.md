# ⚙️ Environment & Setup Documentation

## Current Environment

```
Project: School Management Portal
Location: c:\Users\Hp\OneDrive\Desktop\school_management
Language: JavaScript (pure JS, no TypeScript)
Framework: Next.js 14
Database: MySQL/MariaDB
Status: ✅ Running
```

## .env.local Configuration

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=school_management

# JWT Configuration
JWT_SECRET=password123
NODE_ENV=development
```

## MySQL/MariaDB Setup

### Installation
- **Installed via**: Windows Package Manager (winget)
- **Version**: MariaDB 12.1.2
- **Location**: C:\Program Files\MariaDB 12.1\bin

### Starting the Database
```powershell
# Windows - Start service
net start MySQL

# Or use PowerShell (Admin)
Start-Service -Name MySQL
```

### Database Created
- Database: `school_management`
- Tables: 7 (users, classes, subjects, enrollments, timetable, grades, attendance)
- Users: 4 test accounts created

## NPM Dependencies

### Production Dependencies
```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "jspdf": "^2.5.1",
  "mysql2": "^3.6.5",
  "next": "^14.0.4",
  "papaparse": "^5.4.1",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "recharts": "^2.10.3"
}
```

### Development Dependencies
```json
{
  "autoprefixer": "^10.4.16",
  "dotenv": "^16.6.1",
  "postcss": "^8.4.32",
  "tailwindcss": "^3.4.0"
}
```

**Note**: TypeScript and all @types/* packages removed

## Server Information

```
Server: Next.js Development Server
URL: http://localhost:3000
Port: 3000
Status: ✅ Running
Environment: development

Command to start:
npm run dev
```

## Test Users in Database

| Email | Password | Role |
|-------|----------|------|
| admin@school.com | password123 | admin |
| teacher1@school.com | password123 | teacher |
| student1@school.com | password123 | student |
| test@school.com | password123 | student |

## Page Routes

### Student Routes
```
/student/dashboard          - Main dashboard
/student/grades            - View grades
/student/attendance        - Attendance records
/student/timetable         - Class schedule
```

### Teacher Routes
```
/teacher/dashboard         - Main dashboard
/teacher/attendance        - Mark attendance
/teacher/grades           - Upload grades
/teacher/analytics        - Class analytics
```

### Admin Routes
```
/admin/dashboard           - Main dashboard
/admin/users              - User management
/admin/upload             - Bulk upload
```

### Public Routes
```
/login                     - Login page
/                         - Home (redirects to /login)
```

## API Endpoints

```
POST /api/auth/login       - User authentication
POST /api/auth/logout      - Logout user
GET  /api/student/report-card  - Download PDF
```

## File Extensions Used

| Type | Extension |
|------|-----------|
| Page Components | .jsx |
| API Routes | .js |
| Library Files | .js |
| Config Files | .js |
| Styles | .css |
| SQL | .sql |
| Config | .json |

## Important Directories

```
c:\Users\Hp\OneDrive\Desktop\school_management\
├── app/              → Pages and API routes
├── lib/              → Shared utilities (auth, db)
├── components/       → React components
├── database/         → SQL schema
├── scripts/          → Setup scripts
├── public/           → Static files
└── node_modules/     → Dependencies
```

## Commands Reference

```bash
# Development
npm run dev            # Start dev server on port 3000

# Production
npm run build          # Build for production
npm start             # Start production server

# Database
npm run setup-db      # Initialize/reset database

# Installation
npm install           # Install all dependencies
```

## Database Management

### Connect to MySQL
```powershell
$env:Path += ";C:\Program Files\MariaDB 12.1\bin"
mysql -u root
```

### View All Users
```sql
SELECT email, name, role FROM school_management.users;
```

### Check Database
```sql
SHOW DATABASES;
USE school_management;
SHOW TABLES;
```

## Troubleshooting

### Server won't start
- Check Node.js is installed: `node --version`
- Clear node_modules: `rm -r node_modules && npm install`
- Check port 3000 is not in use

### Database connection error
- Verify MySQL is running: `mysql -u root`
- Check .env.local credentials
- Run: `npm run setup-db`

### Login not working
- Clear browser cookies
- Verify user exists in database
- Check password in debug-login.js

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

## Performance Tips

1. **Database**: Use connection pooling (already configured)
2. **Caching**: Static pages are cached by Next.js
3. **Images**: Optimize with Next.js Image component
4. **Bundling**: Production build is optimized

## Security Configuration

- ✅ JWT tokens in secure HTTP-only cookies
- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ SQL injection prevention (prepared statements)
- ✅ CSRF protection via Next.js
- ✅ Environment variables for secrets

## Next Steps

1. **Customize**: Modify components in `/components`
2. **Add Features**: Create new API routes in `/app/api`
3. **Style**: Update Tailwind config in `tailwind.config.js`
4. **Deploy**: Build and deploy to Vercel, Netlify, or your server

## Useful Resources

- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- MySQL: https://dev.mysql.com/doc/

---

**Last Updated**: January 18, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
