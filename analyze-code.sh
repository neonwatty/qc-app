#!/bin/bash

# Code Analysis Script for QC App
# Runs Debride (Rails) and Knip (React) to find unused code

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$SCRIPT_DIR/qc-api"
FRONTEND_DIR="$SCRIPT_DIR/qc-frontend"
REPORTS_DIR="$SCRIPT_DIR/code-analysis-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Report files
DEBRIDE_REPORT="$REPORTS_DIR/debride_$TIMESTAMP.txt"
KNIP_REPORT="$REPORTS_DIR/knip_$TIMESTAMP.txt"
KNIP_JSON="$REPORTS_DIR/knip_$TIMESTAMP.json"
SUMMARY_REPORT="$REPORTS_DIR/summary_$TIMESTAMP.md"
LATEST_SUMMARY="$REPORTS_DIR/latest_summary.md"

# Create reports directory
mkdir -p "$REPORTS_DIR"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                                ║${NC}"
echo -e "${CYAN}║           QC App - Code Analysis Runner                        ║${NC}"
echo -e "${CYAN}║           Debride (Rails) + Knip (React)                       ║${NC}"
echo -e "${CYAN}║                                                                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print section header
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
print_header "1. Checking Prerequisites"

if [ ! -d "$API_DIR" ]; then
    print_error "qc-api directory not found at $API_DIR"
    exit 1
fi
print_status "Found qc-api directory"

if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "qc-frontend directory not found at $FRONTEND_DIR"
    exit 1
fi
print_status "Found qc-frontend directory"

# Check if debride is installed
cd "$API_DIR"
if ! bundle exec debride --help >/dev/null 2>&1; then
    print_error "Debride not installed in qc-api. Run 'bundle install' first."
    exit 1
fi
print_status "Debride is installed"

# Check if knip is installed
cd "$FRONTEND_DIR"
if ! npm list knip >/dev/null 2>&1; then
    print_error "Knip not installed in qc-frontend. Run 'npm install' first."
    exit 1
fi
print_status "Knip is installed"

echo ""
echo -e "${CYAN}Starting analysis at: $(date)${NC}"
echo -e "${CYAN}Reports will be saved to: $REPORTS_DIR${NC}"

# Run Debride on Rails API
print_header "2. Running Debride (Rails Backend Analysis)"

cd "$API_DIR"
echo -e "${MAGENTA}Analyzing Ruby/Rails code in qc-api...${NC}"
echo ""

# Run debride and capture output
DEBRIDE_OUTPUT=$(bundle exec debride --rails app/ lib/ 2>&1)
echo "$DEBRIDE_OUTPUT" | tee "$DEBRIDE_REPORT"

# Parse debride results
DEBRIDE_METHODS=$(echo "$DEBRIDE_OUTPUT" | grep -E "^\s+\w+\s+" | wc -l | tr -d ' ')
DEBRIDE_LOC=$(echo "$DEBRIDE_OUTPUT" | grep -oE "Total suspect LOC: ([0-9]+)" | grep -oE "[0-9]+" || echo "0")

echo ""
print_status "Debride analysis complete"
print_status "Found $DEBRIDE_METHODS potentially unused methods"
print_status "Total suspect LOC: $DEBRIDE_LOC"
print_status "Report saved to: $DEBRIDE_REPORT"

# Run Knip on React Frontend
print_header "3. Running Knip (React Frontend Analysis)"

cd "$FRONTEND_DIR"
echo -e "${MAGENTA}Analyzing TypeScript/React code in qc-frontend...${NC}"
echo ""

# Run knip and capture output
KNIP_OUTPUT=$(npm run knip 2>&1 || true)
echo "$KNIP_OUTPUT" | tee "$KNIP_REPORT"

# Run knip JSON for detailed parsing
npm run knip:json > "$KNIP_JSON" 2>&1 || true

# Parse knip results
KNIP_FILES=$(echo "$KNIP_OUTPUT" | grep -oE "Unused files \(([0-9]+)\)" | grep -oE "[0-9]+" || echo "0")
KNIP_DEPS=$(echo "$KNIP_OUTPUT" | grep -oE "Unused dependencies \(([0-9]+)\)" | grep -oE "[0-9]+" || echo "0")
KNIP_DEV_DEPS=$(echo "$KNIP_OUTPUT" | grep -oE "Unused devDependencies \(([0-9]+)\)" | grep -oE "[0-9]+" || echo "0")
KNIP_EXPORTS=$(echo "$KNIP_OUTPUT" | grep -oE "Unused exports \(([0-9]+)\)" | grep -oE "[0-9]+" || echo "0")
KNIP_TYPES=$(echo "$KNIP_OUTPUT" | grep -oE "Unused exported types \(([0-9]+)\)" | grep -oE "[0-9]+" || echo "0")

echo ""
print_status "Knip analysis complete"
print_status "Found $KNIP_FILES unused files"
print_status "Found $KNIP_DEPS unused dependencies"
print_status "Found $KNIP_DEV_DEPS unused devDependencies"
print_status "Found $KNIP_EXPORTS unused exports"
print_status "Found $KNIP_TYPES unused types"
print_status "Report saved to: $KNIP_REPORT"
print_status "JSON report saved to: $KNIP_JSON"

# Generate Summary Report
print_header "4. Generating Summary Report"

cat > "$SUMMARY_REPORT" << EOF
# Code Analysis Report - QC App

**Generated:** $(date)
**Analysis Duration:** Combined Backend + Frontend Analysis

---

## 🎯 Executive Summary

This report analyzes unused code across the QC application stack:
- **Backend (Rails API):** Analyzed with Debride
- **Frontend (React):** Analyzed with Knip

---

## 📊 Backend Analysis (Rails API - Debride)

### Overview
- **Tool:** Debride v1.13.0
- **Target:** Ruby/Rails code in \`qc-api/\`
- **Analyzed:** \`app/\`, \`lib/\` directories

### Results
| Metric | Count |
|--------|-------|
| **Potentially Unused Methods** | $DEBRIDE_METHODS |
| **Lines of Code (LOC)** | $DEBRIDE_LOC |

### Analysis Details
Debride identifies methods that are defined but not explicitly called in the codebase.

**⚠️ Important Notes:**
- Some methods may be called dynamically (e.g., via \`send\`, metaprogramming)
- Rails callbacks and lifecycle methods are expected to show as "unused"
- Controller actions may be unused if routes don't point to them
- Background job \`perform\` methods may appear unused

### Top Categories of Unused Code
EOF

# Add top 5 classes with most unused methods from debride
echo "$DEBRIDE_OUTPUT" | grep -E "^[A-Z]" | head -5 | while read -r line; do
    echo "- $line" >> "$SUMMARY_REPORT"
done

cat >> "$SUMMARY_REPORT" << EOF

**Full Report:** [debride_$TIMESTAMP.txt](./debride_$TIMESTAMP.txt)

---

## 🎨 Frontend Analysis (React - Knip)

### Overview
- **Tool:** Knip v5.64.3
- **Target:** TypeScript/React code in \`qc-frontend/\`
- **Analyzed:** \`src/\` directory

### Results
| Metric | Count |
|--------|-------|
| **Unused Files** | $KNIP_FILES |
| **Unused Dependencies** | $KNIP_DEPS |
| **Unused DevDependencies** | $KNIP_DEV_DEPS |
| **Unused Exports** | $KNIP_EXPORTS |
| **Unused Types** | $KNIP_TYPES |

### Breakdown

#### 📁 Unused Files ($KNIP_FILES)
Component files, pages, utilities, and other TypeScript/React files that are not imported anywhere in the application.

#### 📦 Unused Dependencies ($KNIP_DEPS)
Production dependencies listed in \`package.json\` but not imported in the code:
EOF

# Extract unused dependencies from knip output
echo "$KNIP_OUTPUT" | sed -n '/Unused dependencies/,/Unused devDependencies/p' | grep -E "^@|^[a-z]" | head -10 | while read -r line; do
    dep=$(echo "$line" | awk '{print $1}')
    echo "- \`$dep\`" >> "$SUMMARY_REPORT"
done

cat >> "$SUMMARY_REPORT" << EOF

#### 🔧 Unused DevDependencies ($KNIP_DEV_DEPS)
Development dependencies that appear unused (note: some may be used by build tools):
EOF

# Extract unused devDependencies
echo "$KNIP_OUTPUT" | sed -n '/Unused devDependencies/,/Unused exports/p' | grep -E "^@|^[a-z]" | head -10 | while read -r line; do
    dep=$(echo "$line" | awk '{print $1}')
    echo "- \`$dep\`" >> "$SUMMARY_REPORT"
done

cat >> "$SUMMARY_REPORT" << EOF

**Full Report:** [knip_$TIMESTAMP.txt](./knip_$TIMESTAMP.txt)
**JSON Data:** [knip_$TIMESTAMP.json](./knip_$TIMESTAMP.json)

---

## 🎯 Recommendations

### Immediate Actions
1. **Review unused dependencies** - Remove packages not used in production
2. **Audit unused files** - Delete or document why they exist
3. **Clean up exports** - Remove unused exports to improve tree-shaking

### Investigation Needed
1. **Backend methods** - Verify if "unused" methods are called dynamically
2. **Frontend components** - Check if files are imported via dynamic imports
3. **Type definitions** - Some may be needed for TypeScript compilation

### Before Removing Code
- ✅ Check if code is called via metaprogramming or dynamic imports
- ✅ Verify code isn't used in tests (which may be excluded from analysis)
- ✅ Confirm code isn't part of planned features
- ✅ Search for string-based references (e.g., \`send(:method_name)\`)

---

## 📁 Report Files

- **Backend Report:** \`debride_$TIMESTAMP.txt\`
- **Frontend Report:** \`knip_$TIMESTAMP.txt\`
- **Frontend JSON:** \`knip_$TIMESTAMP.json\`
- **This Summary:** \`summary_$TIMESTAMP.md\`

---

## 🔄 Running This Analysis Again

\`\`\`bash
# From qc-app root directory
./analyze-code.sh
\`\`\`

Or run individually:

\`\`\`bash
# Backend only
cd qc-api && rake debride

# Frontend only
cd qc-frontend && npm run knip
\`\`\`

---

*Generated by analyze-code.sh*
EOF

# Copy to latest_summary.md for easy access
cp "$SUMMARY_REPORT" "$LATEST_SUMMARY"

print_status "Summary report generated: $SUMMARY_REPORT"
print_status "Latest summary: $LATEST_SUMMARY"

# Final Summary
print_header "5. Analysis Complete!"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                      Summary Statistics                        ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Backend (Rails)                                               ║${NC}"
echo -e "${GREEN}║    • Unused Methods:           ${YELLOW}${DEBRIDE_METHODS}${GREEN}                            ║${NC}"
echo -e "${GREEN}║    • Suspect LOC:              ${YELLOW}${DEBRIDE_LOC}${GREEN}                           ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║  Frontend (React)                                              ║${NC}"
echo -e "${GREEN}║    • Unused Files:             ${YELLOW}${KNIP_FILES}${GREEN}                             ║${NC}"
echo -e "${GREEN}║    • Unused Dependencies:      ${YELLOW}${KNIP_DEPS}${GREEN}                              ║${NC}"
echo -e "${GREEN}║    • Unused DevDependencies:   ${YELLOW}${KNIP_DEV_DEPS}${GREEN}                               ║${NC}"
echo -e "${GREEN}║    • Unused Exports:           ${YELLOW}${KNIP_EXPORTS}${GREEN}                              ║${NC}"
echo -e "${GREEN}║    • Unused Types:             ${YELLOW}${KNIP_TYPES}${GREEN}                              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📁 All reports saved to: ${YELLOW}$REPORTS_DIR${NC}"
echo ""
echo -e "${CYAN}📄 View the summary report:${NC}"
echo -e "   ${YELLOW}cat $LATEST_SUMMARY${NC}"
echo -e "   or open: ${YELLOW}$REPORTS_DIR${NC}"
echo ""
echo -e "${GREEN}✨ Analysis complete at: $(date)${NC}"
echo ""

# Output structured data for programmatic analysis
print_header "6. Structured Output (JSON)"

cat << JSON_OUTPUT
{
  "timestamp": "$TIMESTAMP",
  "analysis_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "backend": {
    "tool": "debride",
    "version": "1.13.0",
    "target": "qc-api",
    "results": {
      "unused_methods": $DEBRIDE_METHODS,
      "suspect_loc": $DEBRIDE_LOC
    },
    "report_file": "$DEBRIDE_REPORT"
  },
  "frontend": {
    "tool": "knip",
    "version": "5.64.3",
    "target": "qc-frontend",
    "results": {
      "unused_files": $KNIP_FILES,
      "unused_dependencies": $KNIP_DEPS,
      "unused_dev_dependencies": $KNIP_DEV_DEPS,
      "unused_exports": $KNIP_EXPORTS,
      "unused_types": $KNIP_TYPES
    },
    "report_file": "$KNIP_REPORT",
    "json_file": "$KNIP_JSON"
  },
  "summary": {
    "total_backend_issues": $DEBRIDE_METHODS,
    "total_frontend_issues": $((KNIP_FILES + KNIP_DEPS + KNIP_DEV_DEPS + KNIP_EXPORTS + KNIP_TYPES)),
    "total_issues": $((DEBRIDE_METHODS + KNIP_FILES + KNIP_DEPS + KNIP_DEV_DEPS + KNIP_EXPORTS + KNIP_TYPES))
  },
  "reports": {
    "summary": "$SUMMARY_REPORT",
    "latest_summary": "$LATEST_SUMMARY"
  }
}
JSON_OUTPUT

echo ""
print_header "7. Top Issues Breakdown"

echo ""
echo -e "${YELLOW}Backend - Top 10 Classes with Unused Methods:${NC}"
echo "$DEBRIDE_OUTPUT" | grep -E "^[A-Z]" | head -10 | nl

echo ""
echo -e "${YELLOW}Frontend - Unused Dependencies (Production):${NC}"
echo "$KNIP_OUTPUT" | sed -n '/Unused dependencies/,/Unused devDependencies/p' | grep -E "^@|^[a-z]" | head -15 | nl

echo ""
echo -e "${YELLOW}Frontend - Sample of Unused Files (First 20):${NC}"
echo "$KNIP_OUTPUT" | sed -n '/Unused files/,/Unused dependencies/p' | grep "^src/" | head -20 | nl

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
