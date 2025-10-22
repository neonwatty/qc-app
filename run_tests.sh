#!/bin/bash

# Quality Control Test Runner
# Runs all test suites sequentially and reports results

set -e

PROJECT_PATH="QualityControl/QualityControl.xcodeproj"
SCHEME="QualityControl"
DESTINATION="platform=iOS Simulator,name=iPhone 16"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test suites to run
TEST_SUITES=(
    # Week 5-6 New Tests
    "NotificationServiceTests"
    "AddMilestoneSheetTests"
    "RemindersCardTests"
    "AppRootViewTests"

    # ViewModels
    "CheckInViewModelTests"
    "DashboardViewModelTests"
    "GrowthViewModelTests"
    "LoveLanguagesViewModelTests"
    "NotesViewModelTests"
    "OnboardingViewModelTests"
    "RemindersViewModelTests"
    "RequestsViewModelTests"
    "SettingsViewModelTests"

    # Models
    "UserTests"
    "CoupleTests"
    "CheckInSessionTests"
    "CategoryTests"
    "ActionItemTests"
    "NoteTests"
    "ReminderTests"
    "MilestoneTests"
    "LoveLanguageTests"
    "RelationshipRequestTests"

    # Services
    "CheckInServiceTests"
    "DashboardServiceTests"

    # Integration
    "CheckInFlowIntegrationTests"
    "NavigationIntegrationTests"

    # Performance
    "NotesPerformanceTests"

    # Components
    "QCButtonTests"
    "QCCardTests"
    "QCEmptyStateTests"
    "QCLoadingViewTests"
    "QCTextFieldTests"

    # Design System
    "AnimationPresetsTests"
    "ColorSystemTests"
    "SpacingSystemTests"
    "TypographyTests"
)

# Summary variables
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
PASSED_WITH_SKIPS=0
TOTAL_SKIPPED_TESTS=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Quality Control Test Suite Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Running ${#TEST_SUITES[@]} test suites sequentially..."
echo ""

# Run each test suite
for TEST_SUITE in "${TEST_SUITES[@]}"; do
    echo -e "${YELLOW}Running: ${TEST_SUITE}${NC}"

    # Run the test suite and capture result
    xcodebuild test \
        -project "$PROJECT_PATH" \
        -scheme "$SCHEME" \
        -destination "$DESTINATION" \
        -only-testing:"QualityControlTests/$TEST_SUITE" \
        2>&1 | tee /tmp/test_output.txt | grep -E "Test Suite|Test Case|passed|failed|skipped" | tail -5

    # Check if build succeeded or failed
    if grep -q "\*\* TEST SUCCEEDED \*\*" /tmp/test_output.txt; then
        # Count skipped tests in this suite
        SKIPPED_COUNT=$(grep -c "skipped on" /tmp/test_output.txt || echo "0")

        if [ "$SKIPPED_COUNT" -gt 0 ]; then
            echo -e "${YELLOW}⏭  $TEST_SUITE PASSED ($SKIPPED_COUNT tests skipped)${NC}"
            ((PASSED_WITH_SKIPS++))
            ((TOTAL_SKIPPED_TESTS+=SKIPPED_COUNT))
        else
            echo -e "${GREEN}✓ $TEST_SUITE PASSED${NC}"
            ((PASSED_TESTS++))
        fi
    elif grep -q "\*\* TEST FAILED \*\*" /tmp/test_output.txt; then
        echo -e "${RED}✗ $TEST_SUITE FAILED${NC}"
        ((FAILED_TESTS++))
    else
        echo -e "${RED}✗ $TEST_SUITE FAILED TO RUN${NC}"
        ((FAILED_TESTS++))
    fi

    echo ""
done

# Print summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Total Test Suites: ${#TEST_SUITES[@]}"
echo -e "${GREEN}✓ Passed: $PASSED_TESTS${NC}"

if [ $PASSED_WITH_SKIPS -gt 0 ]; then
    echo -e "${YELLOW}⏭  Passed with Skips: $PASSED_WITH_SKIPS ($TOTAL_SKIPPED_TESTS total skipped tests)${NC}"
fi

echo -e "${RED}✗ Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    if [ $TOTAL_SKIPPED_TESTS -gt 0 ]; then
        echo -e "${GREEN}All tests passed! 🎉${NC}"
        echo -e "${YELLOW}Note: $TOTAL_SKIPPED_TESTS tests skipped (run on physical device for full coverage)${NC}"
    else
        echo -e "${GREEN}All tests passed! 🎉${NC}"
    fi
    exit 0
else
    echo -e "${RED}Some tests failed. Review output above for details.${NC}"
    exit 1
fi
