#!/bin/bash

# Check Commit - Pre-push verification script
# This script helps you review what will be committed to GitHub

echo "═══════════════════════════════════════════════════════════════"
echo "  📦 WellMom - Pre-Push Verification"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Git Status
echo "📋 1. Files that will be committed:"
echo "───────────────────────────────────────────────────────────────"
git status --short
echo ""

# Check 2: Ignored Files
echo "🚫 2. Files that will be IGNORED:"
echo "───────────────────────────────────────────────────────────────"
git status --ignored --short | grep "^!!"
echo ""

# Check 3: Environment Files Check
echo "🔒 3. Checking for sensitive files..."
echo "───────────────────────────────────────────────────────────────"
ENV_FILES=$(git ls-files | grep -i "\.env" || echo "")
if [ -z "$ENV_FILES" ]; then
    echo -e "${GREEN}✅ No .env files in commit (GOOD)${NC}"
else
    echo -e "${RED}❌ WARNING: .env files found in commit:${NC}"
    echo "$ENV_FILES"
fi
echo ""

# Check 4: Large Files Check
echo "📦 4. Checking for large files (>1MB)..."
echo "───────────────────────────────────────────────────────────────"
LARGE_FILES=$(git ls-files -s | awk '$4 > 1048576 {print $4, $2}' || echo "")
if [ -z "$LARGE_FILES" ]; then
    echo -e "${GREEN}✅ No large files found (GOOD)${NC}"
else
    echo -e "${YELLOW}⚠️  Large files found:${NC}"
    echo "$LARGE_FILES"
fi
echo ""

# Check 5: Build Test
echo "🔨 5. Running build test..."
echo "───────────────────────────────────────────────────────────────"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed - fix errors before pushing${NC}"
fi
echo ""

# Check 6: Lint Test
echo "🧹 6. Running linter..."
echo "───────────────────────────────────────────────────────────────"
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ No linting errors${NC}"
else
    echo -e "${YELLOW}⚠️  Linting warnings found (run 'npm run lint' for details)${NC}"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ Pre-Push Checklist"
echo "═══════════════════════════════════════════════════════════════"
echo "[ ] Reviewed files to be committed"
echo "[ ] No .env or sensitive files"
echo "[ ] Build passes"
echo "[ ] Linter passes (or warnings are acceptable)"
echo "[ ] Commit message is descriptive"
echo ""
echo "Ready to push? Run: git push origin main"
echo "═══════════════════════════════════════════════════════════════"
