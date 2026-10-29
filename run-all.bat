@echo off
title BloodConnect launcher
cd /d "%~dp0"

if not exist backend\.env (
  echo.
  echo ERROR: backend\.env file nei.
  echo backend\.env.example copy kore backend\.env banan, tarpor real MONGO_URI ar JWT_SECRET boshan.
  echo Ei duto team lead er kache private e chan. Sobar value ek hote hobe.
  echo.
  pause
  exit /b 1
)

if not exist backend\node_modules (
  echo Installing main backend packages...
  pushd backend
  call npm install
  popd
)
if not exist backend\member2-donor\node_modules (
  echo Installing donor backend packages...
  pushd backend\member2-donor
  call npm install
  popd
)
if not exist frontend\node_modules (
  echo Installing frontend packages...
  pushd frontend
  call npm install
  popd
)

start "Main backend - port 5000" cmd /k "cd /d %~dp0backend && npm run dev"
start "Donor backend - port 5001" cmd /k "cd /d %~dp0backend\member2-donor && npm run dev"
start "Frontend - port 5173" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo 3 ta window khulbe. Browser e http://localhost:5173 open korun.
echo Bondho korte oi window gulo te Ctrl+C chapun.
pause
