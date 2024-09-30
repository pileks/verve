#!/bin/bash

# The file to watch (could be a symlink)
FILE_TO_WATCH="/ledger/program/aa_poc.so"  # Change to your symlink path

# Command to run when the file changes
SCRIPT_TO_RUN="/run.sh"

# PID variable to store the script's PID
SCRIPT_PID=0

# Function to run the script
run_script() {
  if [ $SCRIPT_PID -ne 0 ]; then
    echo "Terminating previous instance of run.sh with PID $SCRIPT_PID"
    kill "$SCRIPT_PID" 2>/dev/null
    wait "$SCRIPT_PID" 2>/dev/null
  fi

  echo "Starting new instance of run.sh"
  # Start the script in the background
  $SCRIPT_TO_RUN &
  SCRIPT_PID=$!  # Store the new script's PID
}

# Initial run of the script
run_script

# Use fswatch to monitor the file for modifications
fswatch -o "$FILE_TO_WATCH" | while read -r _; do
  echo "File $FILE_TO_WATCH was modified. Running the script..."
  run_script
done
