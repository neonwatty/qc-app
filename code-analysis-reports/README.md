# Code Analysis Reports

This directory contains automated code analysis reports for the QC application.

## 📊 What's Analyzed

- **Backend (Rails API)**: Uses [Debride](https://github.com/seattlerb/debride) to find unused methods
- **Frontend (React)**: Uses [Knip](https://github.com/webpro/knip) to find unused files, dependencies, exports, and types

## 📁 Report Files

Each analysis run generates:
- `debride_[timestamp].txt` - Backend unused methods report
- `knip_[timestamp].txt` - Frontend unused code report (human-readable)
- `knip_[timestamp].json` - Frontend unused code report (machine-readable)
- `summary_[timestamp].md` - Combined summary with statistics and recommendations
- `latest_summary.md` - Always points to the most recent summary

## 🚀 Running Analysis

```bash
# From qc-app root directory
./analyze-code.sh
```

The script will:
1. ✅ Check prerequisites (tools installed)
2. 🔍 Run Debride on Rails backend
3. 🔍 Run Knip on React frontend
4. 📄 Generate timestamped reports
5. 📊 Create summary with statistics
6. 📋 Output structured JSON data to console
7. 📑 Display top issues breakdown

### Console Output

The script outputs structured data in two formats:

1. **JSON Output** - Machine-readable summary:
```json
{
  "timestamp": "20251010_080627",
  "backend": {
    "results": {
      "unused_methods": 322,
      "suspect_loc": 3516
    }
  },
  "frontend": {
    "results": {
      "unused_files": 148,
      "unused_dependencies": 12
    }
  },
  "summary": {
    "total_issues": 654
  }
}
```

2. **Top Issues Breakdown** - Human-readable highlights:
   - Top 10 classes with unused methods
   - All unused production dependencies
   - Sample of unused files (first 20)

## 📖 Reading the Reports

### Latest Summary
```bash
cat latest_summary.md
```

### Individual Reports
```bash
# View backend report
cat debride_[timestamp].txt

# View frontend report
cat knip_[timestamp].txt

# View frontend JSON (for programmatic analysis)
cat knip_[timestamp].json
```

## ⚠️ Important Notes

### Backend (Debride)
- Shows methods that are **potentially** unused
- May flag methods called via:
  - Metaprogramming (`send`, `method_missing`)
  - Rails callbacks (`before_action`, `after_save`)
  - Dynamic routes
  - Background jobs
- **Always verify** before removing code

### Frontend (Knip)
- Shows files/deps that are **likely** unused
- May miss:
  - Dynamic imports
  - String-based imports
  - Build tool dependencies
  - Type-only imports
- **Review carefully** before removing

## 🎯 Common Patterns

### Safe to Remove
✅ Unused utility functions with no references
✅ Duplicate components or files
✅ Deprecated code marked as unused
✅ Dependencies with 0 imports across entire codebase

### Investigate Further
⚠️ Controller actions (may have routes)
⚠️ Background job methods (called by scheduler)
⚠️ Type definitions (may be needed for compilation)
⚠️ DevDependencies (may be used by build tools)

## 📈 Tracking Over Time

Compare reports from different dates to track:
- Code cleanup progress
- New unused code added
- Dependency bloat trends

```bash
# List all summaries by date
ls -lht summary_*.md

# Compare two reports
diff summary_20250101_120000.md summary_20250201_120000.md
```

## 🔧 Customizing Analysis

### Backend (Debride)
Edit `.debride.yml` in `qc-api/`:
- Add paths to analyze
- Exclude patterns
- Whitelist methods to ignore

### Frontend (Knip)
Edit `knip.ts` in `qc-frontend/`:
- Configure entry points
- Adjust ignore patterns
- Set dependency whitelist

## 📚 Resources

- [Debride Documentation](https://github.com/seattlerb/debride)
- [Knip Documentation](https://knip.dev/)
- [QC App Code Analysis Script](../analyze-code.sh)

---

*Reports generated automatically by `analyze-code.sh`*
