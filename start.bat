@echo off
echo ========================================================
echo  Agri to Harvest - Launching Application
echo  "Turning Vegetable Waste into Farming Wealth"
echo ========================================================
echo.

echo Starting backend server on http://localhost:5000 ...
start "Agri to Harvest - Backend Server" cmd /k "cd server && npm start"

echo Waiting 3 seconds for server initialization...
timeout /t 3 /nobreak >nul

echo Starting frontend client on http://localhost:5173 ...
start "Agri to Harvest - Frontend Client" cmd /k "cd client && npm run dev"

echo.
echo ========================================================
echo  All services launched successfully!
echo  Frontend URL: http://localhost:5173
echo  Backend API:  http://localhost:5000/api/health
echo ========================================================
pause
