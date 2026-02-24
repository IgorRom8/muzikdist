@echo off
cd /d "%~dp0"
echo ========================================
echo Git Commit and Push
echo ========================================
echo.
echo Adding all files...
git add -A
echo.
echo Committing changes...
git commit -m "Remove localStorage.ts, force S3 storage, add unique build ID"
echo.
echo Pushing to remote...
git push
echo.
echo ========================================
echo SUCCESS! Changes pushed to GitHub
echo.
echo NEXT STEPS:
echo 1. Go to Vercel Dashboard
echo 2. Deployments - Click last deploy
echo 3. Click ... menu - Redeploy
echo 4. CHECK: "Redeploy with existing Build Cache cleared"
echo ========================================
pause
