#!/bin/bash
# AI Project Planner — Startup Script
echo "🚀 Starting AI Project Planner..."

# Start MongoDB if not running
if ! mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null | grep -q "ok: 1"; then
  echo "📦 Starting MongoDB..."
  brew services start mongodb/brew/mongodb-community@7.0
  sleep 3
fi
echo "✅ MongoDB is running"

# Kill any existing processes on our ports
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Start backend
echo "⚙️  Starting Backend (port 3000)..."
cd "$(dirname "$0")/backend" && node index.js &
BACKEND_PID=$!
sleep 3

# Verify backend
if curl -s http://localhost:3000/api/v1/health | grep -q "ok"; then
  echo "✅ Backend running at http://localhost:3000"
else
  echo "❌ Backend failed to start"
fi

# Start frontend
echo "🎨 Starting Frontend (port 5173)..."
cd "$(dirname "$0")/frontend" && npm run dev &
FRONTEND_PID=$!
sleep 4

echo ""
echo "═══════════════════════════════════════════"
echo "  🎯 AI Project Planner is LIVE!"
echo "  Frontend → http://localhost:5173"
echo "  Backend  → http://localhost:3000"
echo "  API Docs → http://localhost:3000/api/v1/health"
echo "═══════════════════════════════════════════"
echo ""
echo "📋 Demo Credentials:"
echo "  Admin:   admin@test.com   / password123"
echo "  Manager: sarah@test.com   / password123"
echo "  Member:  alex@test.com    / password123"
echo ""
echo "Press Ctrl+C to stop both servers."
wait $BACKEND_PID $FRONTEND_PID
