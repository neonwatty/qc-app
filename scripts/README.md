# Scripts Directory

All scripts in this directory can be run from the project root using `./scripts/<script-name>`.

## Available Scripts

### `analyze-code.sh`
Runs code analysis on both Rails API (Debride) and React frontend (Knip) to find unused code.

```bash
./scripts/analyze-code.sh
```

Reports are saved to `code-analysis-reports/`.

### `qc.sh`
Simple start/stop script for the QC application services.

```bash
./scripts/qc.sh start    # Start Rails API and React frontend
./scripts/qc.sh stop     # Stop all services
./scripts/qc.sh restart  # Restart all services
```

Logs are saved to `logs/rails.log` and `logs/vite.log`.

### `run-qc.sh`
Comprehensive setup and launch script that handles:
- Dependency installation (bundle install, npm install)
- Database setup (create, migrate, seed)
- Environment configuration
- Service startup

```bash
./scripts/run-qc.sh
```

Good for first-time setup or when dependencies change.

### `test-auth.sh`
Quick authentication flow test script that verifies the login endpoint.

```bash
./scripts/test-auth.sh
```

Requires Rails API to be running on port 3000.

### `workhorse.sh`
Task automation script that integrates with todoq and tfq for task management.

```bash
./scripts/workhorse.sh [num_tasks]
```

Example:
```bash
./scripts/workhorse.sh 3  # Process 3 tasks
```

## Path Resolution

All scripts use dynamic path resolution based on the script location:
- `SCRIPT_DIR` - The directory containing the script
- `PROJECT_ROOT` - The project root (`SCRIPT_DIR/..`)

This allows scripts to be run from anywhere without path issues.
