@echo off
echo ========================================
echo FINAL COMMIT - S3 Proxy Fix
echo ========================================
echo.
echo Adding all files...
git add -A
echo.
echo Committing...
git commit -m "Fix S3 URLs with proxy API and migration endpoint"
echo.
echo Pushing...
git push
echo.
echo ========================================
echo SUCCESS!
echo.
echo NEXT STEPS:
echo 1. Redeploy on Vercel with cache cleared
echo 2. Open: /api/fix-urls to update old records
echo 3. Refresh main page - should work!
echo ========================================
pause
