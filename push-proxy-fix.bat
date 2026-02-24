@echo off
echo ========================================
echo Adding S3 Proxy Fix
echo ========================================
echo.
git add -A
git commit -m "Add S3 proxy to fix file access issues"
git push
echo.
echo ========================================
echo DONE! Redeploy on Vercel with cache cleared
echo ========================================
pause
