#!/bin/bash

# Week 5-6 Test Runner (Real-Time Output)
# Shows COMPLETE xcodebuild output in real-time - no filtering, no hiding

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
echo -e "${BLUE}(Real-Time Full Output)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Boot simulator if not already running
echo -e "${YELLOW}Checking simulator status...${NC}"
SIMULATOR_STATUS=$(xcrun simctl list devices | grep "iPhone 16 " | grep -v "Pro" | head -1)
if echo "$SIMULATOR_STATUS" | grep -q "Booted"; then
    echo -e "${GREEN}✓ iPhone 16 simulator already booted${NC}"
else
    echo -e "${YELLOW}Booting iPhone 16 simulator...${NC}"
    xcrun simctl boot "iPhone 16" 2>/dev/null || echo -e "${YELLOW}Note: Simulator may already be booting${NC}"
    echo -e "${GREEN}✓ Simulator boot initiated${NC}"
    sleep 3  # Give simulator a moment to stabilize
fi
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
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}▶ Running: $TEST${NC}"
    echo -e "${YELLOW}   (Showing full xcodebuild output...)${NC}"
    echo ""
    START_TIME=$(date +%s)

    # Run xcodebuild with FULL output, save to log too
    if xcodebuild test \
        -project "$PROJECT_PATH" \
        -scheme "$SCHEME" \
        -destination "$DESTINATION" \
        -only-testing:"QualityControlTests/$TEST" \
        2>&1 | tee /tmp/${TEST}_output.txt; then

        END_TIME=$(date +%s)
        ELAPSED=$((END_TIME - START_TIME))

        # Extract test count
        TEST_COUNT=$(grep -E "Executed [0-9]+ test" /tmp/${TEST}_output.txt | head -1 | grep -oE "[0-9]+ test" | grep -oE "[0-9]+")

        echo ""
        echo -e "${GREEN}  ✓✓✓ $TEST PASSED ✓✓✓${NC}"
        if [ ! -z "$TEST_COUNT" ]; then
            echo -e "${GREEN}      ($TEST_COUNT tests in ${ELAPSED}s)${NC}"
        else
            echo -e "${GREEN}      (Completed in ${ELAPSED}s)${NC}"
        fi
        ((PASSED++))
    else
        END_TIME=$(date +%s)
        ELAPSED=$((END_TIME - START_TIME))

        echo ""
        echo -e "${RED}  ✗✗✗ $TEST FAILED ✗✗✗${NC}"
        echo -e "${RED}      (Failed after ${ELAPSED}s)${NC}"
        echo -e "${RED}      Full log: /tmp/${TEST}_output.txt${NC}"
        ((FAILED++))
    fi
    echo ""
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Final Results${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed: $PASSED / ${#TESTS[@]}${NC}"
echo -e "${RED}Failed: $FAILED / ${#TESTS[@]}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All Week 5-6 tests passed! 🎉${NC}"
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo "Full logs saved to /tmp/*_output.txt"
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
