@echo off
title Caisse Manager Launcher
color 0A

echo ===================================================
echo   DEMARRAGE DE L'ARCHITECTURE FULLSTACK
echo ===================================================
echo.

:: 1. Lancement du Backend (Spring Boot)
echo [1/2] Lancement du serveur Backend (Port 8080)...
:: Le chemin ../../caisse/caisse est relatif a caisse-manager-ui
start "BACKEND - Spring Boot" cmd /k "cd ..\..\caisse\caisse && gradlew.bat bootRun"

:: Petite pause pour laisser le temps a Java de demarrer
echo Attente de l'initialisation du Backend...
timeout /t 5 /nobreak >nul

:: 2. Lancement du Frontend (React)
echo [2/2] Lancement du serveur Frontend (Port 3000)...
start "FRONTEND - React" cmd /k "npm start"

echo.
echo ===================================================
echo   SUCCES ! L'application va s'ouvrir.
echo   - Backend : http://localhost:8080
echo   - Frontend : http://localhost:3000
echo ===================================================
pause

