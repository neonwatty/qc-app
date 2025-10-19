#!/bin/bash

# Week 5-6 Test Runner (Clean Output)
# Shows filtered, readable output with no long paths or verbose commands

PROJECT_PATH="QualityControl/QualityControl.xcodeproj"
SCHEME="QualityControl"
DESTINATION="platform=iOS Simulator,name=iPhone 16"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Week 5-6 Test Suite Runner (Clean)${NC}"
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

# Week 5-6 tests
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
    echo ""
    START_TIME=$(date +%s)

    # Run with filtered output
    xcodebuild test \
        -project "$PROJECT_PATH" \
        -scheme "$SCHEME" \
        -destination "$DESTINATION" \
        -only-testing:"QualityControlTests/$TEST" 2>&1 | \
        tee /tmp/${TEST}_output.txt | \
        grep --line-buffered -E "^(Ld |CodeSign |Test suite|Test case|Executed |Testing |BUILD )" | \
        while IFS= read -r line; do
            case "$line" in
                BUILD\ SUCCEEDED*)
                    echo -e "${GREEN}  ✓ Build succeeded${NC}"
                    ;;
                Testing*)
                    echo -e "${CYAN}  🚀 $line${NC}"
                    ;;
                Ld\ *)
                    # Extract just the target name from linking line
                    target=$(echo "$line" | sed -n "s|.*(in target '\([^']*\)'.*|\1|p")
                    echo -e "${CYAN}  🔗 Linking $target${NC}"
                    ;;
                CodeSign\ *)
                    # Extract just the target name from code signing line
                    target=$(echo "$line" | sed -n "s|.*(in target '\([^']*\)'.*|\1|p")
                    if [ ! -z "$target" ]; then
                        echo -e "${CYAN}  ✍️  Code signing $target${NC}"
                    fi
                    ;;
                Test\ suite*)
                    # Clean up test suite line
                    suite=$(echo "$line" | sed "s| on '.*'||" | sed "s|Test suite ||")
                    echo -e "${MAGENTA}  🧪 $suite${NC}"
                    ;;
                Test\ case*passed*)
                    # Extract test name and time
                    test_name=$(echo "$line" | sed -n "s|Test case '\([^']*\)' passed.*(\([0-9.]*\) seconds)|\1|p")
                    time=$(echo "$line" | sed -n "s|Test case '\([^']*\)' passed.*(\([0-9.]*\) seconds)|\2|p")
                    # Strip class name prefix for cleaner display
                    short_name=$(echo "$test_name" | sed 's|^[^.]*\.||')
                    echo -e "${GREEN}  ✓ $short_name ${NC}(${time}s)"
                    ;;
                Test\ case*failed*)
                    # Extract test name and time
                    test_name=$(echo "$line" | sed -n "s|Test case '\([^']*\)' failed.*(\([0-9.]*\) seconds)|\1|p")
                    time=$(echo "$line" | sed -n "s|Test case '\([^']*\)' failed.*(\([0-9.]*\) seconds)|\2|p")
                    # Strip class name prefix
                    short_name=$(echo "$test_name" | sed 's|^[^.]*\.||')
                    echo -e "${RED}  ✗ $short_name ${NC}(${time}s)"
                    ;;
                Executed*)
                    # Show final execution count
                    echo -e "${MAGENTA}  $line${NC}"
                    ;;
            esac
        done

    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))

    # Check result
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
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
