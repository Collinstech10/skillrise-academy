@echo off
echo ========================================
echo  SkillRise Academy - Setup ^& Start
echo ========================================

echo.
echo [1/2] Installing Backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
  echo ERROR: Backend install failed
  pause
  exit /b 1
)
cd ..

echo.
echo [2/2] Installing Frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
  echo ERROR: Frontend install failed
  pause
  exit /b 1
)
cd ..

echo.
echo ========================================
echo  Installation complete!
echo  Starting both servers...
echo ========================================
echo.

start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"

echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:3000/auth/login
echo.
pause
