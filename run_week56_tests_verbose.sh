#!/bin/bash

# Week 5-6 Test Runner (Verbose with Build Progress)
# Shows real-time build and test execution progress

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
echo -e "${BLUE}Week 5-6 Test Suite Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  Note: First build may take 60-90 seconds${NC}"
echo -e "${CYAN}    You'll see build progress indicators below${NC}"
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
    echo -e "${YELLOW}▶ Starting: $TEST${NC}"
    START_TIME=$(date +%s)

    # Run with live output, showing build AND test progress
    xcodebuild test \
        -project "$PROJECT_PATH" \
        -scheme "$SCHEME" \
        -destination "$DESTINATION" \
        -only-testing:"QualityControlTests/$TEST" 2>&1 | \
        tee /tmp/${TEST}_output.txt | \
        grep --line-buffered -E "BUILD|Build |Compiling|Linking|CodeSign|Test Suite|Test Case.*started|Test Case.*passed|Test Case.*failed|Testing failed|Executed [0-9]+ test" | \
        while IFS= read -r line; do
            case "$line" in
                *"BUILD TARGET"*)
                    echo -e "${CYAN}  📦 Building target...${NC}"
                    ;;
                *"Compiling"*".swift"*)
                    # Show occasional compile messages (every 10th file)
                    if [ $((RANDOM % 10)) -eq 0 ]; then
                        echo -e "${CYAN}  ⚙️  Compiling Swift files...${NC}"
                    fi
                    ;;
                *"Linking"*)
                    echo -e "${CYAN}  🔗 Linking...${NC}"
                    ;;
                *"CodeSign"*)
                    echo -e "${CYAN}  ✍️  Code signing...${NC}"
                    ;;
                *"BUILD SUCCEEDED"*)
                    echo -e "${GREEN}  ✓ Build completed${NC}"
                    echo -e "${MAGENTA}  🧪 Running tests...${NC}"
                    ;;
                *"Test Suite"*"started"*)
                    echo -e "${MAGENTA}  $line${NC}" | sed 's/^/    /'
                    ;;
                *"Test Case"*"started"*)
                    # Show test names starting
                    echo -e "${CYAN}  $line${NC}" | sed 's/^/    /'
                    ;;
                *"Test Case"*"passed"*)
                    # Show passed tests in green
                    echo -e "${GREEN}  $line${NC}" | sed 's/^/    /'
                    ;;
                *"Test Case"*"failed"*)
                    # Show failed tests in red
                    echo -e "${RED}  $line${NC}" | sed 's/^/    /'
                    ;;
                *"Executed"*"test"*)
                    echo -e "${MAGENTA}  $line${NC}" | sed 's/^/    /'
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
