#!/bin/bash

# Week 5-6 Test Runner
# Quick test runner for newly created Week 5-6 tests

PROJECT_PATH="QualityControl/QualityControl.xcodeproj"
SCHEME="QualityControl"
DESTINATION="platform=iOS Simulator,name=iPhone 16"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Week 5-6 Test Suite Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Week 5-6 tests only
TESTS=(
    "NotificationServiceTests"
    "AddMilestoneSheetTests"
    "RemindersCardTests"
    "AppRootViewTests"
)

PASSED=0
FAILED=0

for TEST in "${TESTS[@]}"; do
    echo -e "${YELLOW}▶ Running $TEST...${NC}"

    if xcodebuild test \
        -project "$PROJECT_PATH" \
        -scheme "$SCHEME" \
        -destination "$DESTINATION" \
        -only-testing:"QualityControlTests/$TEST" \
        > /tmp/${TEST}_output.txt 2>&1; then

        # Extract test count
        TEST_COUNT=$(grep -E "Test Suite.*passed" /tmp/${TEST}_output.txt | grep -oE "[0-9]+ test" | grep -oE "[0-9]+" | head -1)
        echo -e "${GREEN}  ✓ $TEST PASSED ($TEST_COUNT tests)${NC}"
        ((PASSED++))
    else
        echo -e "${RED}  ✗ $TEST FAILED${NC}"
        echo "    See /tmp/${TEST}_output.txt for details"
        ((FAILED++))
    fi
done

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed: $PASSED${NC} | ${RED}Failed: $FAILED${NC}"
echo -e "${BLUE}========================================${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All Week 5-6 tests passed! 🎉${NC}"
else
    echo -e "${RED}Some tests failed. Check /tmp/*_output.txt for details${NC}"
fi

# Shutdown simulator
echo ""
echo -e "${YELLOW}Shutting down simulator...${NC}"
xcrun simctl shutdown "iPhone 16" 2>/dev/null || true
echo -e "${GREEN}✓ Simulator shutdown complete${NC}"

if [ $FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
