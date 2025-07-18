#!/bin/bash

# Create a placeholder image for w017.png if it doesn't exist
# This script uses ImageMagick to create a simple placeholder

set -e

OUTPUT_FILE="w017.png"
WIDTH=640
HEIGHT=480

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Please install it to create placeholder images."
    echo "On macOS: brew install imagemagick"
    echo "On Ubuntu/Debian: sudo apt-get install imagemagick"
    exit 1
fi

# Create placeholder image if w017.png doesn't exist
if [ ! -f "$OUTPUT_FILE" ]; then
    echo "Creating placeholder image: $OUTPUT_FILE"
    
    convert -size ${WIDTH}x${HEIGHT} \
        gradient:#667eea-#764ba2 \
        -gravity center \
        -fill white \
        -font Arial \
        -pointsize 48 \
        -annotate +0-50 "W017 Sensor" \
        -pointsize 24 \
        -annotate +0-10 "Environmental Monitoring Station" \
        -pointsize 18 \
        -annotate +0+20 "Sage Continuum Network" \
        -pointsize 16 \
        -annotate +0+50 "Image will update automatically" \
        -pointsize 12 \
        -annotate +0+80 "$(date '+%Y-%m-%d %H:%M:%S UTC')" \
        "$OUTPUT_FILE"
    
    echo "Placeholder image created: $OUTPUT_FILE"
    echo "Size: $(identify -format '%wx%h' "$OUTPUT_FILE") pixels"
    echo "File size: $(du -h "$OUTPUT_FILE" | cut -f1)"
else
    echo "Image already exists: $OUTPUT_FILE"
fi
