#!/bin/bash

# Week 5-6 Test Runner (Simple with Progress)
# Uses background process monitoring for clear progress indication

PROJECT_PATH="QualityControl/QualityControl.xcodeproj"
SCHEME="QualityControl"
DESTINATION="platform=iOS Simulator,name=iPhone 16"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Spinner frames
SPINNER=( '⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏' )

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Week 5-6 Test Suite Runner${NC}"
echo -e "${BLUE}========================================${NC}"
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

    LOG_FILE="/tmp/${TEST}_output.txt"
    rm -f "$LOG_FILE"

    START_TIME=$(date +%s)

    # Start xcodebuild in background
    xcodebuild test \
        -project "$PROJECT_PATH" \
        -scheme "$SCHEME" \
        -destination "$DESTINATION" \
        -only-testing:"QualityControlTests/$TEST" \
        > "$LOG_FILE" 2>&1 &

    XCODEBUILD_PID=$!

    # Monitor progress
    SPINNER_IDX=0
    PHASE="building"
    LAST_SIZE=0

    echo ""

    while kill -0 $XCODEBUILD_PID 2>/dev/null; do
        CURRENT_SIZE=$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)

        # Check phase
        if [ "$PHASE" = "building" ] && grep -q "Test Suite.*started" "$LOG_FILE" 2>/dev/null; then
            echo -e "\r${GREEN}  ✓ Build complete${NC}                    "
            echo -e "${CYAN}  🧪 Running tests...${NC}"
            PHASE="testing"
        fi

        # Show spinner with file size
        SIZE_KB=$((CURRENT_SIZE / 1024))
        if [ "$PHASE" = "building" ]; then
            printf "\r${CYAN}  ${SPINNER[$SPINNER_IDX]} Building... (${SIZE_KB}KB written)${NC}   "
        else
            printf "\r${CYAN}  ${SPINNER[$SPINNER_IDX]} Testing...${NC}   "
        fi

        SPINNER_IDX=$(( (SPINNER_IDX + 1) % ${#SPINNER[@]} ))
        LAST_SIZE=$CURRENT_SIZE

        sleep 0.5
    done

    # Wait for process to finish
    wait $XCODEBUILD_PID
    EXIT_CODE=$?

    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))

    # Clear spinner line
    printf "\r                                                   \r"

    # Show results
    if [ $EXIT_CODE -eq 0 ]; then
        # Extract test count from log
        TEST_COUNT=$(grep -oE "Executed [0-9]+ tests" "$LOG_FILE" | head -1 | grep -oE "[0-9]+")

        # Show test summary
        echo -e "${GREEN}  ✓ Tests completed${NC}"
        if [ ! -z "$TEST_COUNT" ]; then
            PASSED_COUNT=$(grep -c "passed (" "$LOG_FILE" 2>/dev/null || echo 0)
            echo -e "${GREEN}     ${TEST_COUNT} tests, ${PASSED_COUNT} passed${NC}"
        fi
        echo ""
        echo -e "${GREEN}  ✓✓✓ $TEST PASSED ✓✓✓${NC}"
        echo -e "${GREEN}      (${ELAPSED}s)${NC}"
        ((PASSED++))
    else
        echo -e "${RED}  ✗ Tests failed${NC}"
        echo ""
        echo -e "${RED}  ✗✗✗ $TEST FAILED ✗✗✗${NC}"
        echo -e "${RED}      (${ELAPSED}s)${NC}"
        echo -e "${RED}      Full log: $LOG_FILE${NC}"

        # Show last few errors
        echo -e "${YELLOW}      Last errors:${NC}"
        grep -E "error:|failed" "$LOG_FILE" | tail -3 | sed 's/^/        /'
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
    echo "Full logs in /tmp/*_output.txt"
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
