# Periphery - Unused Code Detection

Periphery identifies unused code in the QualityControl iOS project, helping keep the codebase clean and maintainable.

## Quick Start

**Run a scan to find unused code:**
```bash
./run_periphery.sh
```

The first scan takes 2-3 minutes as it builds the project. Subsequent scans are faster (~30-60 seconds) thanks to caching.

## What Periphery Finds

Periphery detects:
- **Unused declarations**: Functions, properties, classes that are never called
- **Unused imports**: Import statements that aren't needed
- **Unused parameters**: Function parameters that aren't used
- **Unused protocol conformances**: Protocols implemented but not used
- **Dead code paths**: Code that can never be reached

## Configuration

The project configuration is in `.periphery.yml`:

### Current Settings

- **Target**: QualityControl main app
- **Scheme**: QualityControl
- **Excludes**:
  - Mock data generators (needed for SwiftUI previews)
  - Preview helpers
  - Asset catalogs

### Retention Rules

The configuration retains:
- Public APIs (`retain-public: true`)
- `@objc` annotated code (`retain-objc-accessible: true`)
- Codable synthesized properties (`retain-codable-properties: true`)

## Interpreting Results

### Example Output

```
warning: Unused declaration 'oldFunction' (QuickControlApp:5:15)
/path/to/File.swift:5:15
    func oldFunction() { }  // ← Unused, safe to remove

warning: Unused import 'Combine' (QuickControlApp:1:1)
/path/to/File.swift:1:1
    import Combine  // ← Not needed, can be removed
```

### What To Do With Findings

1. **Unused declarations**: Remove if truly not needed
2. **Unused imports**: Safe to delete
3. **Intentionally unused code**:
   - Add `// periphery:ignore` comment above the declaration
   - Or make it `public` if it's part of an API
   - Or add to exclusions in `.periphery.yml`

### False Positives

Common false positives (and how to handle them):

**SwiftUI Views**
- Views used in SwiftUI hierarchies may appear unused
- Add `// periphery:ignore` if needed

**Protocol Requirements**
- Protocol methods that must be implemented but aren't called directly
- These are retained by `retain-unused-protocol-func-params`

**`@main` Entry Points**
- App entry points are automatically retained

## Advanced Usage

### Scan Specific Files

```bash
periphery scan --config .periphery.yml --only-files "QualityControl/Models/**"
```

### Different Output Formats

```bash
# JSON output
periphery scan --config .periphery.yml --format json

# CSV output
periphery scan --config .periphery.yml --format csv

# Checkstyle (for CI integration)
periphery scan --config .periphery.yml --format checkstyle
```

### Strict Mode

To fail the build on any unused code:

```bash
periphery scan --config .periphery.yml --strict
```

Or update `.periphery.yml`:
```yaml
strict: true
```

## CI Integration

Add to your CI workflow (GitHub Actions example):

```yaml
- name: Scan for Unused Code
  run: |
    brew install peripheryapp/periphery/periphery
    ./run_periphery.sh
```

## Common Patterns

### Intentionally Unused Code

For code you want to keep (future use, examples, etc.):

```swift
// periphery:ignore
func futureFeature() {
    // Will be used in next sprint
}

// periphery:ignore:all
class ExampleCode {
    // Entire class ignored
}
```

### Protocol Conformances

If a protocol conformance appears unused but is required:

```swift
// periphery:ignore
extension MyView: Equatable {
    static func == (lhs: MyView, rhs: MyView) -> Bool {
        // Required for Equatable but may appear unused
    }
}
```

## Performance Tips

1. **Index Store**: The first scan builds an index in `.build/index-store`
   - Keep this directory for faster subsequent scans
   - Add `.build/` to `.gitignore`

2. **Clean Build**: Set `clean-build: false` in config for faster scans
   - Trade-off: May miss some unused code
   - Use `true` for weekly comprehensive scans

3. **Targeted Scans**: Scan only changed files during development
   ```bash
   periphery scan --config .periphery.yml --skip-build
   ```

## Workflow Recommendations

### Weekly Cleanup

Run a comprehensive scan weekly:
```bash
./run_periphery.sh > periphery_report.txt
```

Review the report and create cleanup tasks.

### Pre-Release Scan

Before major releases, run a strict scan:
```bash
periphery scan --config .periphery.yml --strict
```

Fix all findings before releasing.

### Daily Development

During active development, use faster scans:
```bash
periphery scan --config .periphery.yml --skip-build
```

## Troubleshooting

### "Build failed" Error

Ensure the project builds successfully first:
```bash
xcodebuild build -project QualityControl/QualityControl.xcodeproj -scheme QualityControl
```

### "No such scheme" Error

Verify the scheme name:
```bash
xcodebuild -list -project QualityControl/QualityControl.xcodeproj
```

### Too Many False Positives

Adjust retention rules in `.periphery.yml`:
```yaml
retain-public: true
retain-objc-accessible: true
retain-codable-properties: true
```

Or add specific exclusions:
```yaml
exclude:
  - "*/Path/To/File.swift"
  - "**/SpecificPattern/**"
```

## Resources

- **Official Docs**: https://github.com/peripheryapp/periphery
- **Configuration Guide**: https://github.com/peripheryapp/periphery#configuration
- **Issue Tracker**: https://github.com/peripheryapp/periphery/issues

## Project-Specific Notes

### MockDataGenerator

The `MockDataGenerator.swift` file is excluded because it's used in SwiftUI previews, which Periphery may not detect.

### Preview Helpers

`PreviewContainer.swift` is excluded for the same reason - it's essential for development but may appear unused.

### SwiftData Models

SwiftData `@Model` macro-generated code is automatically retained by Periphery's swift analysis.

## Integration with Development Workflow

1. **Before Committing**: Run a quick scan on changed files
2. **Weekly**: Run full scan and create cleanup issues
3. **Before Releases**: Run strict scan and address all findings
4. **After Major Refactors**: Scan to catch orphaned code

---

**Need help?** Check the official Periphery documentation or open an issue in the repository.
