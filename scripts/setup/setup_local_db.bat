@echo off
echo Setting up Local PostgreSQL Database for Smart Crop Aid...
echo.

:: Check if psql is installed
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not installed or not in your PATH.
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo During installation, remember the password you set for the 'postgres' user.
    pause
    exit /b 1
)

:: Set default password if not set
if "%PGPASSWORD%"=="" set PGPASSWORD=password
echo Using default password 'password'. If yours is different, set PGPASSWORD environment variable.

echo.
echo 1. Creating Database 'smart_crop_aid'...
psql -U postgres -c "CREATE DATABASE smart_crop_aid;"

echo.
echo 2. Importing Schema...
psql -U postgres -d smart_crop_aid -f backend/schema_postgres.sql

echo.
echo [SUCCESS] Database setup complete!
pause
