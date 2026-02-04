@echo off
echo Setting up Git environment...
set "PATH=%PATH%;C:\Program Files\Git\cmd"

echo ---------------------------------------------------
echo DEEP CLEANING GIT (Starting Fresh to Remove Large File)
echo ---------------------------------------------------

echo 1. Removing old Git history...
rmdir /s /q .git

echo 2. Initializing new repository...
git init

echo 3. Configuring .gitignore...
echo *.keras >> .gitignore
echo node_modules/ >> .gitignore
echo .env >> .gitignore

echo 4. Adding files (ignoring large models)...
git add .

echo 5. Committing files...
git commit -m "Deployment: Production Release (PostgreSQL + ML Fixes)"

echo 6. Setting remote and pushing...
git remote add origin https://github.com/moditejas2005/smart-crop-aid.git
git branch -M main
git push -u origin main --force

echo.
echo DONE! If successful, your code is now on GitHub.
pause
