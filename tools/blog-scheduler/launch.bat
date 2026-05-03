@echo off
cd /d "%~dp0"
echo Starting InnerZero blog scheduler at http://localhost:7878
echo Close this window to stop the server.
echo.
start "" "http://localhost:7878"
python server.py
