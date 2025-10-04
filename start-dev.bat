@echo off
echo Starting AgriFinance Development Environment...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Starting AI Server...
start "AI Server" cmd /k "cd ai && python app.py"

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Starting Hardhat Network...
start "Hardhat Network" cmd /k "npx hardhat node"

echo.
echo All services are starting...
echo - Backend API: http://localhost:5000
echo - AI Service: http://localhost:5001
echo - Frontend: http://localhost:5173
echo - Hardhat Network: http://localhost:8545
echo.
echo Press any key to exit...
pause > nul
