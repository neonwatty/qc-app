#!/bin/bash

# Quality Control Parallel Test Runner
# Runs all tests in parallel for maximum speed

set -e

PROJECT_PATH="QualityControl/QualityControl.xcodeproj"
SCHEME="QualityControl"
DESTINATION="platform=iOS Simulator,name=iPhone 16"
OUTPUT_FILE="/tmp/parallel_test_output.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Quality Control Parallel Test Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Running all tests in parallel with 4 workers..."
echo ""

# Record start time
START_TIME=$(date +%s)

# Run all tests in parallel
xcodebuild test \
    -project "$PROJECT_PATH" \
    -scheme "$SCHEME" \
    -destination "$DESTINATION" \
    -parallel-testing-enabled YES \
    -parallel-testing-worker-count 4 \
    2>&1 | tee "$OUTPUT_FILE"

# Record end time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# Parse results
if grep -q "** TEST SUCCEEDED **" "$OUTPUT_FILE"; then
    TEST_RESULT="PASSED"
else
    TEST_RESULT="FAILED"
fi

# Count totals from xcodebuild summary
TOTAL_TESTS=$(grep -E "Test Suite .* passed" "$OUTPUT_FILE" | tail -1 | grep -oE '[0-9]+ tests?' | head -1 | grep -oE '[0-9]+' || echo "0")
SKIPPED_TESTS=$(grep -c "skipped on" "$OUTPUT_FILE" || echo "0")
FAILED_TESTS=$(grep -c "Test Case.*failed" "$OUTPUT_FILE" || echo "0")
PASSED_TESTS=$((TOTAL_TESTS - FAILED_TESTS))

# Print summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Execution Time: ${MINUTES}m ${SECONDS}s"
echo ""

if [ "$TEST_RESULT" = "PASSED" ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo ""
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}✓ Passed: $PASSED_TESTS${NC}"

    if [ "$SKIPPED_TESTS" -gt 0 ]; then
        echo -e "${YELLOW}⏭  Skipped: $SKIPPED_TESTS${NC}"
        echo -e "${YELLOW}Note: Skipped tests require physical device (UNUserNotificationCenter)${NC}"
    fi

    echo ""
    exit 0
else
    echo -e "${RED}✗ TESTS FAILED${NC}"
    echo ""
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}✓ Passed: $PASSED_TESTS${NC}"

    if [ "$SKIPPED_TESTS" -gt 0 ]; then
        echo -e "${YELLOW}⏭  Skipped: $SKIPPED_TESTS${NC}"
    fi

    echo -e "${RED}✗ Failed: $FAILED_TESTS${NC}"
    echo ""
    echo "Review output above or check: $OUTPUT_FILE"
    echo ""
    exit 1
fi
