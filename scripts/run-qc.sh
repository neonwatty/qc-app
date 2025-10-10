#!/bin/bash

# Get the directory where this script is located and the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Create logs directory first
mkdir -p "$PROJECT_ROOT/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[QC]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    if port_in_use $1; then
        print_warning "Port $1 is in use. Killing existing process..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null
        sleep 2
    fi
}

# Cleanup function
cleanup() {
    print_status "Shutting down services..."

    # Kill Rails server
    if [ ! -z "$RAILS_PID" ]; then
        kill $RAILS_PID 2>/dev/null
        print_status "Rails server stopped"
    fi

    # Kill Vite server
    if [ ! -z "$VITE_PID" ]; then
        kill $VITE_PID 2>/dev/null
        print_status "Vite server stopped"
    fi

    # Clean up any remaining processes on the ports
    kill_port 3000
    kill_port 5173

    exit 0
}

# Trap CTRL+C and cleanup
trap cleanup INT TERM

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists ruby; then
    print_error "Ruby is not installed. Please install Ruby 3.2+"
    exit 1
fi

if ! command_exists bundle; then
    print_error "Bundler is not installed. Please run: gem install bundler"
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm"
    exit 1
fi

# Check and kill existing processes on required ports
print_status "Checking ports..."
kill_port 3000
kill_port 5173

# Setup Rails API
print_status "Setting up Rails API..."
cd "$PROJECT_ROOT/qc-api"

# Remove stale PID file if it exists
if [ -f "tmp/pids/server.pid" ]; then
    print_warning "Removing stale Rails PID file..."
    rm -f tmp/pids/server.pid
fi

# Check if dependencies need to be installed
if [ ! -d "vendor/bundle" ] && [ ! -f "Gemfile.lock" ]; then
    print_status "Installing Ruby dependencies..."
    bundle install
fi

# Check if database needs setup
if ! rails db:version >/dev/null 2>&1; then
    print_status "Setting up database..."
    rails db:create
    rails db:migrate
    rails db:seed
else
    # Just run migrations in case there are pending ones
    print_status "Running database migrations..."
    rails db:migrate 2>/dev/null
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env.development" ] && [ -f ".env.example" ]; then
    print_status "Creating environment configuration..."
    cp .env.example .env.development
fi

# Start Rails server in background
print_status "Starting Rails API server on port 3000..."
rails server -p 3000 > ../logs/rails.log 2>&1 &
RAILS_PID=$!

# Wait for Rails to start
sleep 3
if ! port_in_use 3000; then
    print_error "Failed to start Rails server. Check logs/rails.log for details"
    exit 1
fi

print_status "Rails API server started successfully on port 3000"

# Setup React Frontend
cd "$PROJECT_ROOT/qc-frontend"

# Check if dependencies need to be installed
if [ ! -d "node_modules" ]; then
    print_status "Installing Node dependencies..."
    npm install
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    print_status "Creating frontend environment configuration..."
    cp .env.example .env
fi

# Start Vite server
print_status "Starting React frontend on port 5173..."
npm run dev > ../logs/vite.log 2>&1 &
VITE_PID=$!

# Wait for Vite to start
sleep 5
if ! port_in_use 5173; then
    print_error "Failed to start Vite server. Check logs/vite.log for details"
    cleanup
    exit 1
fi

# Success message
echo ""
print_status "🎉 QC Application is running!"
echo ""
echo -e "${GREEN}Frontend:${NC} http://localhost:5173"
echo -e "${GREEN}API:${NC}      http://localhost:3000/api"
echo ""
echo "Press CTRL+C to stop all services"
echo ""

# Keep script running and show logs
tail -f "$PROJECT_ROOT/logs/rails.log" "$PROJECT_ROOT/logs/vite.log" 2>/dev/null &

# Wait for background processes
wait $RAILS_PID $VITE_PID