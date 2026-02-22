Push-Location $PSScriptRoot
git add -A
git commit -m "Fix: Switch to S3 storage for Vercel deployment"
git push
Pop-Location
