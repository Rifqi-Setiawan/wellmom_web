# Check Commit - Pre-push verification script (PowerShell)
# This script helps you review what will be committed to GitHub

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📦 WellMom - Pre-Push Verification" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check 1: Git Status
Write-Host "📋 1. Files that will be committed:" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────"
git status --short
Write-Host ""

# Check 2: Ignored Files
Write-Host "🚫 2. Files that will be IGNORED:" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────"
git status --ignored --short | Select-String "^!!"
Write-Host ""

# Check 3: Environment Files Check
Write-Host "🔒 3. Checking for sensitive files..." -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────"
$envFiles = git ls-files | Select-String "\.env"
if ($null -eq $envFiles -or $envFiles.Count -eq 0) {
    Write-Host "✅ No .env files in commit (GOOD)" -ForegroundColor Green
} else {
    Write-Host "❌ WARNING: .env files found in commit:" -ForegroundColor Red
    $envFiles
}
Write-Host ""

# Check 4: Large Files Check
Write-Host "📦 4. Checking for large files (>1MB)..." -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────"
Write-Host "⏭️  Skipped (manual check recommended)" -ForegroundColor Gray
Write-Host ""

# Check 5: Build Test
Write-Host "🔨 5. Running build test..." -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────"
$buildResult = npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed - fix errors before pushing" -ForegroundColor Red
}
Write-Host ""

# Check 6: Lint Test
Write-Host "🧹 6. Running linter..." -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────"
$lintResult = npm run lint 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ No linting errors" -ForegroundColor Green
} else {
    Write-Host "⚠️  Linting warnings found (run 'npm run lint' for details)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ Pre-Push Checklist" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "[ ] Reviewed files to be committed"
Write-Host "[ ] No .env or sensitive files"
Write-Host "[ ] Build passes"
Write-Host "[ ] Linter passes (or warnings are acceptable)"
Write-Host "[ ] Commit message is descriptive"
Write-Host ""
Write-Host "Ready to push? Run: git push origin main" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
