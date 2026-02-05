#!/bin/bash
cd ~/.openclaw/workspace
nohup node followup-checker.js > followup-checker.log 2> followup-checker-error.log &
echo $! > followup-checker.pid
echo "Follow-up checker started (PID: $(cat followup-checker.pid))"
