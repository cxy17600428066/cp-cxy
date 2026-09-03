@echo off
title TGX Website Preview
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0preview-server.ps1"
if errorlevel 1 (
  echo.
  echo Preview failed to start. Please extract the complete ZIP and try again.
  pause
)
