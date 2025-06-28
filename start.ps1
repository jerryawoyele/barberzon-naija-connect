# PowerShell script to start both frontend and backend
Write-Host "Starting Barberzon Development Environment..." -ForegroundColor Green

# Start backend in a new window
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Jerry A\work\barberzon-naija-connect\backend'; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in current window
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Set-Location "C:\Users\Jerry A\work\barberzon-naija-connect"
npm run dev
