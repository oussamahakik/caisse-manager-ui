@echo off
title Nettoyage Cache Frontend
color 0C

echo ===================================================
echo   NETTOYAGE DU CACHE FRONTEND
echo ===================================================
echo.

echo [1/3] Suppression du dossier build...
if exist build rmdir /s /q build
echo ✓ Build supprime

echo [2/3] Suppression du cache node_modules...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo ✓ Cache node_modules supprime

echo [3/3] Suppression du cache npm...
call npm cache clean --force
echo ✓ Cache npm nettoye

echo.
echo ===================================================
echo   NETTOYAGE TERMINE !
echo ===================================================
echo.
echo Instructions:
echo 1. Fermez votre navigateur
echo 2. Ouvrez les DevTools (F12)
echo 3. Clic droit sur le bouton Actualiser
echo 4. Selectionnez "Vider le cache et actualiser force"
echo 5. Redemarrez le serveur avec: npm start
echo.
pause

