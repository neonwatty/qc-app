# Test Runner Scripts

## Quick Start (Recommended)

**Run Week 5-6 tests with FULL real-time output:**
```bash
./run_week56_tests_realtime.sh
```

This tests the 4 new test files we created:
- NotificationServiceTests (14 tests)
- AddMilestoneSheetTests (21 tests)
- RemindersCardTests (15 tests)
- AppRootViewTests (14 tests)

**Total: 64 new tests**

### Why this is the best option:
- ✅ **Never hangs** - Automatically boots simulator before running tests
- ✅ **Transparent** - Shows ALL output immediately, no filtering
- ✅ **Reliable** - No grep buffering or missing output
- ✅ **Saves full log** - Everything saved to `/tmp/*_output.txt`

⚠️ **Note**: This script is verbose - you'll see full build commands and paths. If you prefer cleaner output, try `./run_week56_tests_clean.sh` instead.

### What you'll see:
- Complete build output (every compile, link, code sign step)
- All xcodebuild messages
- Test execution with pass/fail for every test
- Final summary with timing

The output is verbose but **never hangs** - you always know what's happening.

## Full Test Suite (Slower)

**Run all 37 test suites:**
```bash
./run_tests.sh
```

⚠️ **Warning:** This script runs ALL test suites sequentially and can take 10-15 minutes to complete. It's more comprehensive but much slower.

## All Available Scripts

1. **`./run_week56_tests_realtime.sh`** ⭐ **(RECOMMENDED)**
   - Shows EVERYTHING from xcodebuild
   - No filtering = never hangs
   - Very verbose (includes full command lines and paths)
   - Week 5-6 tests only (~2-3 min)
   - **Most reliable option**

2. **`./run_week56_tests_clean.sh`** (Filtered Output)
   - Clean, readable output - no long paths
   - Shows only: linking, code signing, test execution
   - Colored output (green ✓, red ✗, cyan build progress)
   - ⚠️ **May pause 10-30s** during simulator boot (grep filters block non-matching output)

3. **`./run_week56_tests_verbose.sh`** (Filtered with Emojis)
   - Similar to clean script but with more build details
   - Shows compilation progress with emojis
   - May show occasional verbose commands

4. **`./run_week56_tests_simple.sh`** (Background Monitor)
   - Animated spinner + file size monitoring
   - Background process tracking
   - May not show output in all environments

5. **`./run_week56_tests.sh`** (Quiet)
   - Minimal console output
   - Saves full logs to /tmp
   - Good when you just want pass/fail

6. **`./run_tests.sh`** (Complete Suite)
   - All 37 test suites
   - ~10-15 minutes

## Troubleshooting

**Simulator Boot Issues (FIXED):**
- ✅ All scripts now automatically boot the simulator before running tests
- ✅ No more hanging due to simulator not starting

**If ANY script still appears stuck:**
- **First**: Check the log file is growing: `ls -lh /tmp/*_output.txt`
- If the log is growing, tests ARE running - grep-filtered scripts just have output gaps during simulator operations
- **Best solution**: Use `./run_week56_tests_realtime.sh` for guaranteed continuous output
- Builds take 60-90 seconds the first time
- Simulator boot is now automatic and takes ~5-10 seconds

## Test Output

Both scripts save detailed output to `/tmp/`:
- Week 5-6 script: `/tmp/[TestName]_output.txt`
- Full script: `/tmp/test_output.txt`

## Manual Testing

To run a single test suite manually:
```bash
xcodebuild test \
  -project QualityControl/QualityControl.xcodeproj \
  -scheme QualityControl \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -only-testing:QualityControlTests/NotificationServiceTests
```

## Test Coverage Summary

### Week 5-6 New Tests (✅ Complete - 64 tests)
- ✅ NotificationServiceTests (14 tests) - Permission, scheduling, all frequencies
- ✅ AddMilestoneSheetTests (21 tests) - Form validation, persistence, categories
- ✅ RemindersCardTests (15 tests) - Display logic, filtering, data loading
- ✅ AppRootViewTests (14 tests) - Onboarding routing, lifecycle, state management

### Pre-existing Tests
- ViewModels: 9 test suites
- Models: 10 test suites
- Services: 2 test suites
- Integration: 2 test suites
- Performance: 1 test suite
- Components: 5 test suites
- Design System: 4 test suites

**Total: 37 test suites across the entire project**
