#!/bin/bash

IDL_FILE="compressed_aa_poc.json"
TYPES_FILE="compressed_aa_poc.ts"

# Source dirs
IDL_DIR="target/idl"
TYPES_DIR="target/types"

# Destination dirs
SDK_IDL_DIR="../sdk/src/idls"

# Check if the source files exist
if [[ ! -f "$IDL_DIR/$IDL_FILE" ]]; then
  echo "Source idl file ($IDL_FILE) does not exist."
  exit 1
fi

if [[ ! -f "$TYPES_DIR/$TYPES_FILE" ]]; then
  echo "Source types file ($TYPES_FILE) does not exist."
  exit 1
fi

# Make frontend destination dir if it does not exist
if [[ ! -d "$SDK_IDL_DIR" ]]; then
  echo "Destination directory ($SDK_IDL_DIR) does not exist. Creating directory..."
  mkdir $SDK_IDL_DIR
fi

# Copy the contents of the source files to frontend idl dir
cp "$IDL_DIR/$IDL_FILE" "$SDK_IDL_DIR/$IDL_FILE"
cp "$TYPES_DIR/$TYPES_FILE" "$SDK_IDL_DIR/$TYPES_FILE"

echo "Contents of $IDL_DIR/$IDL_FILE have been copied to $SDK_IDL_DIR/$IDL_FILE"
echo "Contents of $TYPES_DIR/$TYPES_FILE have been copied to $SDK_IDL_DIR/$TYPES_FILE"

echo "---------------------------------------------------"
