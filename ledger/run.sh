#!/bin/sh
# Start solana-test-validator in the background
solana-test-validator --reset > /dev/null &

# Wait for the validator to be ready (optional but recommended)
sleep 5  # Give the validator some time to start

# Run solana logs in the foreground
solana logs