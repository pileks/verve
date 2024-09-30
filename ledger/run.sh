#!/bin/sh
# Start solana-test-validator in the background
solana-test-validator --reset --bpf-program 7UD7pBcVkw2yJQzdm9eNTfeSC8uo2WhM6MdUzBXK48zv /ledger/program/aa_poc.so > /dev/null &

# Wait for the validator to be ready (optional but recommended)
echo "Wait 5 seconds for Solana ledger to wake up"

sleep 5  # Give the validator some time to start

# Run solana logs in the foreground
solana logs