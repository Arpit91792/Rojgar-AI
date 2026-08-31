@echo off
echo ========================================
echo   Rojgar AI - Career Portal
echo ========================================
echo.

echo Checking dependencies...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js v18 or higher
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

echo.
echo ========================================
echo   Starting Application
echo ========================================
echo.

echo 📁 Working directory: %CD%
echo.

REM Start backend server in a new window
echo 🔧 Starting Backend Server (port 5000)...
start "Rojgar AI Backend" cmd /k "cd server && npm run dev"

timeout /t 3 >nul

REM Start frontend server in a new window
echo 🎨 Starting Frontend Server (port 3000)...
start "Rojgar AI Frontend" cmd /k "cd client && npm run dev"

timeout /t 5 >nul

echo.
echo ========================================
echo   Application URLs
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔗 Backend API: http://localhost:5000
echo 📊 Health Check: http://localhost:5000/health
echo 🗄️  DB Status: http://localhost:5000/db-status
echo.
echo ========================================
echo   Setup Instructions
echo ========================================
echo.
echo If you see database errors:
echo 1. Check backend console for instructions
echo 2. Run: cd server && npm run prisma:generate
echo 3. Run: cd server && npm run setup
echo 4. Restart the backend server
echo.
echo Default login credentials:
echo 👑 Admin: admin@rojgarai.com / admin123
echo 👤 User: user@example.com / user123
echo.
echo ========================================
echo   Press any key to stop all servers...
echo ========================================
pause >nul

REM Kill all node processes
taskkill /F /IM node.exe >nul 2>&1
echo.
echo ✅ All servers stopped.
timeout /t 2 >nul