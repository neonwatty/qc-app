#!/bin/bash

# Simple QC App start/stop script
# Usage: ./qc.sh [start|stop|restart]

# Get the directory where this script is located and the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_log() {
    echo -e "${YELLOW}📋${NC} $1"
}

# Cleanup function for Ctrl+C
cleanup() {
    echo ""
    print_info "Shutting down services..."
    stop_services
    exit 0
}

# Kill processes on ports 3000 and 5173
stop_services() {
    # Kill Rails (port 3000)
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -ti:3000 | xargs kill -9 2>/dev/null
        print_status "Rails API stopped"
    fi

    # Kill Vite (port 5173)
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -ti:5173 | xargs kill -9 2>/dev/null
        print_status "Vite frontend stopped"
    fi

    # Clean up Rails PID file
    rm -f "$PROJECT_ROOT/qc-api/tmp/pids/server.pid" 2>/dev/null
}

# Start both services
start_services() {
    print_info "Starting QC services..."

    # Stop any existing services first
    stop_services

    # Create logs directory
    mkdir -p "$PROJECT_ROOT/logs"

    # Start Rails API
    print_info "Starting Rails API on port 3000..."
    cd "$PROJECT_ROOT/qc-api"
    rails server -p 3000 > ../logs/rails.log 2>&1 &
    cd "$PROJECT_ROOT"
    sleep 3

    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_status "Rails API running at http://localhost:3000"
    else
        print_error "Failed to start Rails API (check logs/rails.log)"
        exit 1
    fi

    # Start Vite frontend
    print_info "Starting React frontend on port 5173..."
    cd "$PROJECT_ROOT/qc-frontend"
    npm run dev > ../logs/vite.log 2>&1 &
    cd "$PROJECT_ROOT"
    sleep 3

    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_status "React frontend running at http://localhost:5173"
    else
        print_error "Failed to start Vite (check logs/vite.log)"
        stop_services
        exit 1
    fi

    echo ""
    echo -e "${GREEN}🎉 QC App is running!${NC}"
    echo ""
    echo "  Frontend: http://localhost:5173"
    echo "  API:      http://localhost:3000/api"
    echo ""
    print_log "Streaming logs (Press Ctrl+C to stop)..."
    echo ""

    # Set up trap to handle Ctrl+C
    trap cleanup INT TERM

    # Tail logs from both services
    tail -f "$PROJECT_ROOT/logs/rails.log" "$PROJECT_ROOT/logs/vite.log"
}

# Main script
case "$1" in
    start)
        start_services
        ;;
    stop)
        print_info "Stopping QC services..."
        stop_services
        print_status "All services stopped"
        ;;
    restart)
        stop_services
        sleep 2
        start_services
        ;;
    *)
        echo "Usage: ./qc.sh [start|stop|restart]"
        echo ""
        echo "Commands:"
        echo "  start    - Start Rails API and React frontend"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        exit 1
        ;;
esac
