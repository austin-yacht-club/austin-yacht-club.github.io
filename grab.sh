#!/bin/bash

# Define API endpoint and payload
API_URL="https://data.sagecontinuum.org/api/v1/query"
PAYLOAD='{"start":"-80h","filter":{"vsn":"W017","task":"imagesampler-bottom"}}'

# Make POST request and extract image URL from the first result's "value" field
IMAGE_URL=$(curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d "$PAYLOAD" | jq -r '.results[0].value')

# Check if an image URL was extracted
if [[ -n "$IMAGE_URL" && "$IMAGE_URL" != "null" ]]; then
  echo "Image URL: $IMAGE_URL"

  # Extract filename from URL and download the image
  FILENAME=$(basename "$IMAGE_URL")
  wget -q "$IMAGE_URL" -O "$FILENAME"

  echo "Image saved as $FILENAME"
else
  echo "No image URL found in response."
  exit 1
fi
