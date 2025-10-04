#!/bin/bash

echo "Starting AgriFinance Development Environment..."
echo

# Function to start service in background
start_service() {
    local service_name=$1
    local command=$2
    local port=$3
    
    echo "Starting $service_name..."
    gnome-terminal --title="$service_name" -- bash -c "$command; exec bash" 2>/dev/null || \
    xterm -title "$service_name" -e "$command" 2>/dev/null || \
    echo "Could not start $service_name in new terminal. Please run manually: $command"
}

# Start services
start_service "Backend Server" "cd backend && npm run dev" "5000"
start_service "AI Server" "cd ai && python app.py" "5001"
start_service "Frontend Server" "cd frontend && npm run dev" "5173"
start_service "Hardhat Network" "npx hardhat node" "8545"

echo
echo "All services are starting..."
echo "- Backend API: http://localhost:5000"
echo "- AI Service: http://localhost:5001"
echo "- Frontend: http://localhost:5173"
echo "- Hardhat Network: http://localhost:8545"
echo
echo "Press Enter to exit..."
read
