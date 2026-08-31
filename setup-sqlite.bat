@echo off
echo ========================================
echo   Rojgar AI - SQLite Setup
echo ========================================
echo.

echo Switching to SQLite database...
echo.

REM Backup original schema
if exist "server\prisma\schema.prisma" (
    copy "server\prisma\schema.prisma" "server\prisma\schema.backup.prisma" >nul
)

REM Copy SQLite schema
copy "server\prisma\sqlite-schema.prisma" "server\prisma\schema.prisma" >nul

REM Update .env for SQLite
echo DATABASE_URL="file:./dev.db" > "server\.env"
echo JWT_SECRET="your-super-secret-jwt-key-change-this-in-production" >> "server\.env"
echo JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production" >> "server\.env"
echo PORT=5000 >> "server\.env"
echo NODE_ENV="development" >> "server\.env"
echo CLIENT_URL="http://localhost:3000" >> "server\.env"
echo BCRYPT_SALT_ROUNDS=12 >> "server\.env"
echo SESSION_COOKIE_NAME="rojgar_ai_session" >> "server\.env"
echo SESSION_COOKIE_SECURE="false" >> "server\.env"
echo SESSION_COOKIE_HTTPONLY="true" >> "server\.env"
echo SESSION_COOKIE_SAMESITE="Lax" >> "server\.env"
echo RATE_LIMIT_WINDOW_MS=900000 >> "server\.env"
echo RATE_LIMIT_MAX_REQUESTS=100 >> "server\.env"

echo ✅ SQLite configuration applied
echo.

echo Generating Prisma client...
cd server
call npx prisma generate

echo.
echo Creating database and sample data...
call npm run setup

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo ✅ Database: SQLite (dev.db)
echo ✅ Prisma client generated
echo ✅ Sample data created
echo.
echo Login credentials:
echo 👑 Admin: admin@rojgarai.com / admin123
echo 👤 User: user@example.com / user123
echo.
echo To start the application:
echo 1. Run start-application.bat
echo 2. Or manually:
echo    - Backend: cd server && npm run dev
echo    - Frontend: cd client && npm run dev
echo.
pause