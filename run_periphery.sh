#!/bin/bash

# Periphery Scanner - Identifies Unused Code
# Scans the QualityControl iOS project for dead code

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Periphery - Unused Code Scanner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Periphery is installed
if ! command -v periphery &> /dev/null; then
    echo -e "${RED}Error: Periphery is not installed${NC}"
    echo ""
    echo "Install via Homebrew:"
    echo "  brew install peripheryapp/periphery/periphery"
    echo ""
    echo "Or visit: https://github.com/peripheryapp/periphery"
    exit 1
fi

echo -e "${CYAN}Periphery version: $(periphery version)${NC}"
echo ""

# Run Periphery scan
echo -e "${YELLOW}Starting code scan...${NC}"
echo -e "${YELLOW}This may take 2-3 minutes for the first run${NC}"
echo ""

START_TIME=$(date +%s)

# Run periphery with the configuration file
if periphery scan --config .periphery.yml; then
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))

    echo ""
    echo -e "${GREEN}✓ Scan completed successfully in ${ELAPSED}s${NC}"
    echo ""
    echo -e "${CYAN}Review the output above for unused code${NC}"
    exit 0
else
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))

    echo ""
    echo -e "${YELLOW}⚠ Scan completed with findings in ${ELAPSED}s${NC}"
    echo ""
    echo -e "${CYAN}Review the warnings above and consider removing unused code${NC}"
    echo ""
    echo "Common fixes:"
    echo "  • Remove unused imports"
    echo "  • Delete dead functions/properties"
    echo "  • Clean up old/experimental code"
    echo "  • Add @available or public if intentionally kept"
    exit 0  # Don't fail CI on findings, just report them
fi
