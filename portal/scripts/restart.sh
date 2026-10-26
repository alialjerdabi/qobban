#!/usr/bin/env bash
# Restart the local portal. pkill does not reach a Windows node process from Git Bash,
# so find whatever holds the port and stop it by PID.
PORT="${PORT:-3100}"
PID=$(netstat -ano 2>/dev/null | grep ":$PORT .*LISTENING" | awk '{print $5}' | head -1)
[ -n "$PID" ] && powershell.exe -NoProfile -Command "Stop-Process -Id $PID -Force -ErrorAction SilentlyContinue" 2>/dev/null
sleep 2
PORT="$PORT" node src/start.cjs > /tmp/qobban-portal.log 2>&1 &
sleep 5
tail -2 /tmp/qobban-portal.log
